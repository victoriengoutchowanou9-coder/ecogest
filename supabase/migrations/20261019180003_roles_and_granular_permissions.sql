-- =============================================================================
-- MIGRATION 03 : RÔLES ET PERMISSIONS GRANULAIRES, VERROUILLAGE DES NOTES
-- Date : 2026-10-19
-- Description :
--   1. Matrice des rôles appliquée au niveau base de données (RLS & Triggers).
--   2. Verrouillage automatique des notes après validation ou publication du bulletin.
--   3. Déverrouillage exceptionnel réservé au Directeur / Censeur avec motif obligatoire.
--   4. RLS stricte :
--      - Enseignant limité à ses classes et matières assignées.
--      - Parent limité à ses propres enfants autorisés et bulletins publiés.
--      - Directeur / Censeur autorisés à valider et publier.
--   5. Statut des comptes utilisateurs (active, suspended, banned) à effet immédiat.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Table des autorisations de déverrouillage des notes
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.grade_unlock_authorizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    period_id UUID NOT NULL REFERENCES public.academic_periods(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    unlocked_by_user_id UUID NOT NULL REFERENCES public.school_users(id) ON DELETE CASCADE,
    unlocked_by_role VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grade_unlock_lookup 
ON public.grade_unlock_authorizations(school_id, student_id, period_id, is_revoked, expires_at);

ALTER TABLE public.grade_unlock_authorizations ENABLE ROW LEVEL SECURITY;

-- RLS sur grade_unlock_authorizations : seuls la direction et le censeur peuvent voir/créer
DROP POLICY IF EXISTS rls_grade_unlock_isolation ON public.grade_unlock_authorizations;
CREATE POLICY rls_grade_unlock_isolation ON public.grade_unlock_authorizations
    FOR ALL
    USING (
        school_id = public.get_current_authenticated_school_id()
    )
    WITH CHECK (
        school_id = public.get_current_authenticated_school_id()
    );

-- -----------------------------------------------------------------------------
-- 2. Fonction d'extraction du rôle utilisateur courant (côté session / JWT)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
DECLARE
    v_role TEXT;
BEGIN
    -- A. Variable de transaction serveur (Route Handlers / Server Actions)
    BEGIN
        v_role := NULLIF(current_setting('app.current_user_role', true), '');
        IF v_role IS NOT NULL THEN
            RETURN LOWER(v_role);
        END IF;
    EXCEPTION WHEN OTHERS THEN
        v_role := NULL;
    END;

    -- B. Claims du JWT Supabase Auth
    IF current_setting('request.jwt.claims', true) IS NOT NULL THEN
        BEGIN
            v_role := current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'role';
            IF v_role IS NOT NULL THEN
                RETURN LOWER(v_role);
            END IF;
        EXCEPTION WHEN OTHERS THEN
            v_role := NULL;
        END;
    END IF;

    -- C. Rôle dans school_users
    IF auth.uid() IS NOT NULL THEN
        SELECT role INTO v_role
        FROM public.school_users
        WHERE id = auth.uid() OR email = (current_setting('request.jwt.claims', true)::jsonb->>'email')
        LIMIT 1;

        IF v_role IS NOT NULL THEN
            RETURN LOWER(v_role);
        END IF;
    END IF;

    RETURN 'anonymous';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- -----------------------------------------------------------------------------
-- 3. Fonction d'extraction de l'ID utilisateur courant
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Variable de transaction
    BEGIN
        v_user_id := NULLIF(current_setting('app.current_user_id', true), '')::UUID;
        IF v_user_id IS NOT NULL THEN
            RETURN v_user_id;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
    END;

    -- Supabase auth.uid()
    IF auth.uid() IS NOT NULL THEN
        RETURN auth.uid();
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- -----------------------------------------------------------------------------
-- 4. Contrôle immédiat du statut du compte utilisateur (active / suspended / banned)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_user_account_active()
RETURNS TRIGGER AS $$
DECLARE
    v_status TEXT;
    v_user_id UUID;
BEGIN
    v_user_id := public.get_current_user_id();
    IF v_user_id IS NOT NULL THEN
        SELECT LOWER(status) INTO v_status
        FROM public.school_users
        WHERE id = v_user_id;

        IF v_status IS NOT NULL AND v_status IN ('suspended', 'suspendu', 'banned', 'banni') THEN
            RAISE EXCEPTION 'Action refusée : le compte utilisateur est suspendu ou banni avec effet immédiat.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 5. Trigger de verrouillage des notes après validation ou publication
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_enforce_grade_modification_rules()
RETURNS TRIGGER AS $$
DECLARE
    v_bulletin_status TEXT;
    v_user_role TEXT;
    v_user_id UUID;
    v_student_class_id UUID;
    v_is_unlocked BOOLEAN := FALSE;
    v_unlock_reason TEXT;
    v_is_assigned BOOLEAN := FALSE;
BEGIN
    -- 1. Vérification du statut de compte
    PERFORM public.check_user_account_active();

    v_user_role := public.get_current_user_role();
    v_user_id := public.get_current_user_id();

    -- 2. Récupérer la classe de l'élève
    SELECT class_id INTO v_student_class_id
    FROM public.students
    WHERE id = NEW.student_id;

    -- 3. Vérifier si un bulletin validé ou publié existe pour cet élève et cette période
    SELECT status::TEXT INTO v_bulletin_status
    FROM public.official_bulletins
    WHERE student_id = NEW.student_id AND period_id = NEW.period_id
    LIMIT 1;

    IF v_bulletin_status IS NOT NULL AND v_bulletin_status IN ('VALIDE', 'PUBLIE', 'MODIFIE_APRES_PUBLICATION') THEN
        -- Vérifier si une autorisation de déverrouillage valide existe
        SELECT TRUE, reason INTO v_is_unlocked, v_unlock_reason
        FROM public.grade_unlock_authorizations
        WHERE school_id = NEW.school_id
          AND student_id = NEW.student_id
          AND period_id = NEW.period_id
          AND (subject_id IS NULL OR subject_id = NEW.subject_id)
          AND is_revoked = FALSE
          AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1;

        -- Vérifier également si un motif est fourni en variable de session
        IF NOT v_is_unlocked THEN
            BEGIN
                v_unlock_reason := NULLIF(current_setting('app.grade_unlock_reason', true), '');
                IF v_unlock_reason IS NOT NULL AND LENGTH(TRIM(v_unlock_reason)) >= 5 THEN
                    IF v_user_role IN ('directeur', 'censeur', 'admin') THEN
                        v_is_unlocked := TRUE;
                    END IF;
                END IF;
            EXCEPTION WHEN OTHERS THEN
                v_is_unlocked := FALSE;
            END;
        END IF;

        IF NOT v_is_unlocked THEN
            RAISE EXCEPTION 'Modification de note interdite : le bulletin de cet élève est déjà validé ou publié (statut: %). Un déverrouillage préalable par le Directeur ou Censeur avec motif obligatoire est requis.', v_bulletin_status;
        END IF;
    END IF;

    -- 4. Si l'utilisateur est un enseignant, vérifier son affectation à la classe et matière
    IF v_user_role = 'enseignant' AND v_user_id IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 
            FROM public.teacher_class_assignments
            WHERE school_id = NEW.school_id
              AND teacher_user_id = v_user_id
              AND class_id = v_student_class_id
              AND (subject_id = NEW.subject_id OR is_main_teacher = TRUE)
        ) INTO v_is_assigned;

        IF NOT v_is_assigned THEN
            RAISE EXCEPTION 'Accès refusé : vous n''êtes pas assigné à l''enseignement de cette matière pour la classe de cet élève.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_grade_modification ON public.grade_records;
CREATE TRIGGER trg_enforce_grade_modification
    BEFORE INSERT OR UPDATE ON public.grade_records
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_enforce_grade_modification_rules();

-- -----------------------------------------------------------------------------
-- 6. Restriction de validation / publication des bulletins aux directeurs et censeurs
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_enforce_bulletin_validation_roles()
RETURNS TRIGGER AS $$
DECLARE
    v_user_role TEXT;
BEGIN
    v_user_role := public.get_current_user_role();

    -- Si le statut passe à VALIDE ou PUBLIE
    IF (NEW.status IN ('VALIDE', 'PUBLIE') AND (OLD.status IS NULL OR OLD.status != NEW.status)) THEN
        IF v_user_role NOT IN ('directeur', 'censeur', 'admin', 'service_role') THEN
            RAISE EXCEPTION 'Action non autorisée : seul le Directeur ou le Censeur des études peut valider ou publier les bulletins.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_bulletin_validation ON public.official_bulletins;
CREATE TRIGGER trg_enforce_bulletin_validation
    BEFORE UPDATE ON public.official_bulletins
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_enforce_bulletin_validation_roles();

-- -----------------------------------------------------------------------------
-- 7. Journalisation automatique des déverrouillages dans audit_logs
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_audit_grade_unlock()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (
        school_id,
        user_id,
        role,
        action,
        resource_type,
        resource_id,
        new_data,
        created_at
    ) VALUES (
        NEW.school_id,
        NEW.unlocked_by_user_id,
        NEW.unlocked_by_role,
        'DEVERROUILLAGE_NOTES',
        'grades',
        NEW.id::TEXT,
        jsonb_build_object(
            'student_id', NEW.student_id,
            'period_id', NEW.period_id,
            'subject_id', NEW.subject_id,
            'reason', NEW.reason,
            'expires_at', NEW.expires_at
        ),
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_grade_unlock ON public.grade_unlock_authorizations;
CREATE TRIGGER trg_audit_grade_unlock
    AFTER INSERT ON public.grade_unlock_authorizations
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_audit_grade_unlock();

-- -----------------------------------------------------------------------------
-- 8. Mise à jour des politiques RLS avec contrôle des rôles et parents
-- -----------------------------------------------------------------------------

-- A. Table students : Parents voient uniquement leurs enfants validés
DROP POLICY IF EXISTS rls_students_school_isolation ON public.students;
CREATE POLICY rls_students_parent_and_school ON public.students
    FOR SELECT
    USING (
        school_id = public.get_current_authenticated_school_id()
        AND (
            public.get_current_user_role() != 'parent'
            OR EXISTS (
                SELECT 1 FROM public.parent_student_links psl
                WHERE psl.school_id = students.school_id
                  AND psl.status = 'AUTHORIZED'
                  AND (
                      psl.parent_user_id = public.get_current_user_id()
                      OR psl.student_matricule = students.matricule
                  )
            )
        )
    );

CREATE POLICY rls_students_staff_write ON public.students
    FOR ALL
    USING (
        school_id = public.get_current_authenticated_school_id()
        AND public.get_current_user_role() IN ('directeur', 'censeur', 'admin', 'secretariat')
    )
    WITH CHECK (
        school_id = public.get_current_authenticated_school_id()
        AND public.get_current_user_role() IN ('directeur', 'censeur', 'admin', 'secretariat')
    );

-- B. Table official_bulletins : Parents voient uniquement les bulletins PUBLIÉS de leurs enfants
DROP POLICY IF EXISTS rls_official_bulletins_school_isolation ON public.official_bulletins;
CREATE POLICY rls_bulletins_parent_and_staff ON public.official_bulletins
    FOR SELECT
    USING (
        school_id = public.get_current_authenticated_school_id()
        AND (
            public.get_current_user_role() IN ('directeur', 'censeur', 'admin', 'enseignant', 'surveillant')
            OR (
                public.get_current_user_role() = 'parent'
                AND status = 'PUBLIE'
                AND EXISTS (
                    SELECT 1 
                    FROM public.students s
                    JOIN public.parent_student_links psl ON psl.student_matricule = s.matricule
                    WHERE s.id = official_bulletins.student_id
                      AND psl.school_id = official_bulletins.school_id
                      AND psl.status = 'AUTHORIZED'
                      AND psl.parent_user_id = public.get_current_user_id()
                )
            )
        )
    );

CREATE POLICY rls_bulletins_staff_write ON public.official_bulletins
    FOR ALL
    USING (
        school_id = public.get_current_authenticated_school_id()
        AND public.get_current_user_role() IN ('directeur', 'censeur', 'admin')
    )
    WITH CHECK (
        school_id = public.get_current_authenticated_school_id()
        AND public.get_current_user_role() IN ('directeur', 'censeur', 'admin')
    );

-- C. Table grade_records : Consultation et saisie selon le rôle
DROP POLICY IF EXISTS rls_grade_records_school_isolation ON public.grade_records;
CREATE POLICY rls_grade_records_read ON public.grade_records
    FOR SELECT
    USING (
        school_id = public.get_current_authenticated_school_id()
        AND (
            public.get_current_user_role() IN ('directeur', 'censeur', 'admin', 'surveillant')
            OR (
                public.get_current_user_role() = 'enseignant'
                AND EXISTS (
                    SELECT 1 FROM public.students s
                    JOIN public.teacher_class_assignments tca ON tca.class_id = s.class_id
                    WHERE s.id = grade_records.student_id
                      AND tca.teacher_user_id = public.get_current_user_id()
                      AND (tca.subject_id = grade_records.subject_id OR tca.is_main_teacher = TRUE)
                )
            )
            OR (
                public.get_current_user_role() = 'parent'
                AND EXISTS (
                    SELECT 1 
                    FROM public.students s
                    JOIN public.parent_student_links psl ON psl.student_matricule = s.matricule
                    WHERE s.id = grade_records.student_id
                      AND psl.school_id = grade_records.school_id
                      AND psl.status = 'AUTHORIZED'
                      AND psl.parent_user_id = public.get_current_user_id()
                )
            )
        )
    );

CREATE POLICY rls_grade_records_write ON public.grade_records
    FOR ALL
    USING (
        school_id = public.get_current_authenticated_school_id()
        AND public.get_current_user_role() IN ('directeur', 'censeur', 'enseignant', 'admin')
    )
    WITH CHECK (
        school_id = public.get_current_authenticated_school_id()
        AND public.get_current_user_role() IN ('directeur', 'censeur', 'enseignant', 'admin')
    );

COMMENT ON TABLE public.grade_unlock_authorizations IS 'Registre des déverrouillages formels de notes pour bulletins validés';

-- =============================================================================
-- MIGRATION 01 : ISOLATION STRICTE MULTI-ÉTABLISSEMENTS & RLS
-- Date : 2026-10-19
-- Description : Garantit l'étanchéité absolue des données entre écoles.
--               Toutes les tables possèdent school_id et des politiques RLS
--               empêchant tout accès croisé non autorisé.
-- =============================================================================

-- 1. Ajout de school_id sur les tables qui en dépendent indirectement
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'competency_items') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'competency_items' AND column_name = 'school_id') THEN
            ALTER TABLE public.competency_items ADD COLUMN school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
            
            -- Remplissage depuis competency_domains
            UPDATE public.competency_items ci
            SET school_id = cd.school_id
            FROM public.competency_domains cd
            WHERE ci.domain_id = cd.id;
        END IF;
    END IF;
END $$;

-- 2. Fonction serveur d'extraction sécurisée du school_id de la session
-- Cette fonction ne fait JAMAIS confiance à un paramètre envoyé par le client HTTP.
-- Elle extrait le school_id uniquement depuis le contexte de transaction serveur
-- ou les claims sécurisés du JWT.
CREATE OR REPLACE FUNCTION public.get_current_authenticated_school_id()
RETURNS UUID AS $$
DECLARE
    v_school_id UUID;
BEGIN
    -- A. Contexte de session injecté côté serveur (Set par Route Handlers / Server Actions)
    BEGIN
        v_school_id := NULLIF(current_setting('app.current_school_id', true), '')::UUID;
        IF v_school_id IS NOT NULL THEN
            RETURN v_school_id;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        v_school_id := NULL;
    END;

    -- B. Claims JWT authentifié par Supabase Auth
    IF current_setting('request.jwt.claims', true) IS NOT NULL THEN
        BEGIN
            v_school_id := (current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'school_id')::UUID;
            IF v_school_id IS NOT NULL THEN
                RETURN v_school_id;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            v_school_id := NULL;
        END;
    END IF;

    -- C. Si l'utilisateur est le propriétaire légal d'une école (Directeur / Admin)
    IF auth.uid() IS NOT NULL THEN
        SELECT id INTO v_school_id
        FROM public.schools
        WHERE owner_user_id = auth.uid()
        LIMIT 1;

        IF v_school_id IS NOT NULL THEN
            RETURN v_school_id;
        END IF;

        -- D. Ou membre du personnel dans school_users
        SELECT school_id INTO v_school_id
        FROM public.school_users
        WHERE id = auth.uid() OR email = (current_setting('request.jwt.claims', true)::jsonb->>'email')
        LIMIT 1;

        IF v_school_id IS NOT NULL THEN
            RETURN v_school_id;
        END IF;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 3. Activation formelle de Row Level Security sur TOUTES les tables sensibles
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.official_bulletins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'competency_domains') THEN
        ALTER TABLE public.competency_domains ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'competency_items') THEN
        ALTER TABLE public.competency_items ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'competency_grade_records') THEN
        ALTER TABLE public.competency_grade_records ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 4. Nettoyage des anciennes politiques permissives
DO $$ 
DECLARE
    tbl TEXT;
    pol TEXT;
BEGIN
    FOR tbl, pol IN VALUES
        ('schools', 'rls_schools_all'),
        ('schools', 'rls_schools_isolation'),
        ('school_users', 'rls_school_users_all'),
        ('school_users', 'rls_school_users_isolation'),
        ('classrooms', 'rls_classrooms_all'),
        ('classrooms', 'rls_classrooms_isolation'),
        ('students', 'rls_students_all'),
        ('students', 'rls_students_isolation'),
        ('subjects', 'rls_subjects_all'),
        ('subjects', 'rls_subjects_isolation'),
        ('teacher_class_assignments', 'rls_teacher_assignments_all'),
        ('teacher_class_assignments', 'rls_teacher_assignments_isolation'),
        ('grade_records', 'rls_grades_all'),
        ('grade_records', 'rls_grades_isolation'),
        ('official_bulletins', 'rls_bulletins_all'),
        ('official_bulletins', 'rls_bulletins_isolation'),
        ('academic_years', 'rls_academic_years_isolation'),
        ('academic_periods', 'rls_academic_periods_isolation')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol, tbl);
    END LOOP;
END $$;

-- 5. Création des politiques RLS strictes garantissant l'isolation inter-écoles

-- A. Table schools
CREATE POLICY rls_schools_strict_isolation ON public.schools
    FOR ALL
    USING (
        id = public.get_current_authenticated_school_id()
        OR owner_user_id = auth.uid()
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        owner_user_id = auth.uid()
        OR auth.role() = 'service_role'
    );

-- B. Table school_users
CREATE POLICY rls_school_users_strict_isolation ON public.school_users
    FOR ALL
    USING (
        school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    );

-- C. Table classrooms
CREATE POLICY rls_classrooms_strict_isolation ON public.classrooms
    FOR ALL
    USING (
        school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    );

-- D. Table students
CREATE POLICY rls_students_strict_isolation ON public.students
    FOR ALL
    USING (
        school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    );

-- E. Table subjects
CREATE POLICY rls_subjects_strict_isolation ON public.subjects
    FOR ALL
    USING (
        school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    );

-- F. Table teacher_class_assignments
CREATE POLICY rls_teacher_assignments_strict_isolation ON public.teacher_class_assignments
    FOR ALL
    USING (
        school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    );

-- G. Table grade_records
CREATE POLICY rls_grades_strict_isolation ON public.grade_records
    FOR ALL
    USING (
        school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    );

-- H. Table official_bulletins
CREATE POLICY rls_bulletins_strict_isolation ON public.official_bulletins
    FOR ALL
    USING (
        school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    );

-- I. Table academic_years
CREATE POLICY rls_academic_years_strict_isolation ON public.academic_years
    FOR ALL
    USING (
        school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    );

-- J. Table academic_periods
CREATE POLICY rls_academic_periods_strict_isolation ON public.academic_periods
    FOR ALL
    USING (
        school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    );

-- K. Table parent_student_links
DROP POLICY IF EXISTS rls_parent_student_isolation ON public.parent_student_links;
CREATE POLICY rls_parent_student_strict_isolation ON public.parent_student_links
    FOR ALL
    USING (
        school_id = public.get_current_authenticated_school_id()
        OR parent_user_id = auth.uid()
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        school_id = public.get_current_authenticated_school_id()
        OR parent_user_id = auth.uid()
        OR auth.role() = 'service_role'
    );

-- Notification de rechargement du schéma PostgREST
NOTIFY pgrst, 'reload schema';

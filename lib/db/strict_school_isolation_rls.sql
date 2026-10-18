-- =============================================================================
-- ECOGEST — ISOLATION STRICTE MULTI-TENANT PAR ÉTABLISSEMENT (RLS)
-- Ce script configure l'étanchéité absolue des données entre établissements scolaires
-- dans Supabase / PostgreSQL.
-- =============================================================================

-- 1. Fonction utilitaire d'extraction de l'établissement actif pour la session courante
CREATE OR REPLACE FUNCTION public.get_current_school_id()
RETURNS UUID AS $$
BEGIN
    -- 1. Priorité au paramètre de contexte de session (injecté par l'API / le client)
    IF current_setting('request.jwt.claims', true) IS NOT NULL THEN
        -- Essayer d'extraire le school_id depuis les métadonnées JWT
        BEGIN
            RETURN (current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'school_id')::UUID;
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END IF;

    -- 2. Paramètre de transaction personnalisé app.current_school_id
    IF current_setting('app.current_school_id', true) IS NOT NULL AND current_setting('app.current_school_id', true) <> '' THEN
        BEGIN
            RETURN current_setting('app.current_school_id', true)::UUID;
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END IF;

    -- 3. Recherche de l'établissement associé à l'utilisateur authentifié
    IF auth.uid() IS NOT NULL THEN
        -- Vérifier si l'utilisateur est propriétaire d'un établissement
        RETURN (
            SELECT id FROM public.schools 
            WHERE owner_user_id = auth.uid() 
            LIMIT 1
        );
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- -----------------------------------------------------------------------------
-- 2. SUPPRESSION DE TOUTES LES ANCIENNES POLITIQUES PERMISSIVES "USING (true)"
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS rls_schools_all ON schools;
DROP POLICY IF EXISTS rls_classrooms_all ON classrooms;
DROP POLICY IF EXISTS rls_students_all ON students;
DROP POLICY IF EXISTS rls_subjects_all ON subjects;
DROP POLICY IF EXISTS rls_grades_all ON grade_records;
DROP POLICY IF EXISTS rls_bulletins_all ON official_bulletins;
DROP POLICY IF EXISTS rls_school_users_all ON school_users;
DROP POLICY IF EXISTS rls_teacher_assignments_all ON teacher_class_assignments;
DROP POLICY IF EXISTS rls_bulletin_logs_all ON bulletin_audit_logs;

-- -----------------------------------------------------------------------------
-- 3. POLITIQUES DE SÉCURITÉ STRICTES PAR ÉTABLISSEMENT (TABLE PAR TABLE)
-- -----------------------------------------------------------------------------

-- A. Table `schools` : Un utilisateur ne peut voir et modifier que son/ses établissements
DROP POLICY IF EXISTS rls_schools_isolation ON schools;
CREATE POLICY rls_schools_isolation ON schools
    FOR ALL
    USING (
        id = public.get_current_school_id()
        OR owner_user_id = auth.uid()
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        owner_user_id = auth.uid()
        OR auth.role() = 'service_role'
    );

-- B. Table `school_users` (Directeur, Censeur, Enseignants, Secrétariat, Comptable, Surveillant)
DROP POLICY IF EXISTS rls_school_users_isolation ON school_users;
CREATE POLICY rls_school_users_isolation ON school_users
    FOR ALL
    USING (
        school_id = public.get_current_school_id()
        OR (school_id IN (SELECT id FROM public.schools WHERE owner_user_id = auth.uid()))
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        school_id = public.get_current_school_id()
        OR (school_id IN (SELECT id FROM public.schools WHERE owner_user_id = auth.uid()))
        OR auth.role() = 'service_role'
    );

-- C. Table `classrooms` (Classes de l'établissement)
DROP POLICY IF EXISTS rls_classrooms_isolation ON classrooms;
CREATE POLICY rls_classrooms_isolation ON classrooms
    FOR ALL
    USING (
        school_id = public.get_current_school_id()
        OR (school_id IN (SELECT id FROM public.schools WHERE owner_user_id = auth.uid()))
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        school_id = public.get_current_school_id()
        OR (school_id IN (SELECT id FROM public.schools WHERE owner_user_id = auth.uid()))
        OR auth.role() = 'service_role'
    );

-- D. Table `students` (Élèves inscrits dans l'établissement)
DROP POLICY IF EXISTS rls_students_isolation ON students;
CREATE POLICY rls_students_isolation ON students
    FOR ALL
    USING (
        school_id = public.get_current_school_id()
        OR (school_id IN (SELECT id FROM public.schools WHERE owner_user_id = auth.uid()))
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        school_id = public.get_current_school_id()
        OR (school_id IN (SELECT id FROM public.schools WHERE owner_user_id = auth.uid()))
        OR auth.role() = 'service_role'
    );

-- E. Table `subjects` (Matières & Coefficients)
DROP POLICY IF EXISTS rls_subjects_isolation ON subjects;
CREATE POLICY rls_subjects_isolation ON subjects
    FOR ALL
    USING (
        school_id = public.get_current_school_id()
        OR (school_id IN (SELECT id FROM public.schools WHERE owner_user_id = auth.uid()))
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        school_id = public.get_current_school_id()
        OR (school_id IN (SELECT id FROM public.schools WHERE owner_user_id = auth.uid()))
        OR auth.role() = 'service_role'
    );

-- F. Table `teacher_class_assignments` (Affectations des enseignants)
DROP POLICY IF EXISTS rls_teacher_assignments_isolation ON teacher_class_assignments;
CREATE POLICY rls_teacher_assignments_isolation ON teacher_class_assignments
    FOR ALL
    USING (
        school_id = public.get_current_school_id()
        OR (school_id IN (SELECT id FROM public.schools WHERE owner_user_id = auth.uid()))
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        school_id = public.get_current_school_id()
        OR (school_id IN (SELECT id FROM public.schools WHERE owner_user_id = auth.uid()))
        OR auth.role() = 'service_role'
    );

-- G. Table `grade_records` (Notes & Évaluations)
DROP POLICY IF EXISTS rls_grades_isolation ON grade_records;
CREATE POLICY rls_grades_isolation ON grade_records
    FOR ALL
    USING (
        school_id = public.get_current_school_id()
        OR (school_id IN (SELECT id FROM public.schools WHERE owner_user_id = auth.uid()))
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        school_id = public.get_current_school_id()
        OR (school_id IN (SELECT id FROM public.schools WHERE owner_user_id = auth.uid()))
        OR auth.role() = 'service_role'
    );

-- H. Table `official_bulletins` (Bulletins officiels)
DROP POLICY IF EXISTS rls_bulletins_isolation ON official_bulletins;
CREATE POLICY rls_bulletins_isolation ON official_bulletins
    FOR ALL
    USING (
        school_id = public.get_current_school_id()
        OR (school_id IN (SELECT id FROM public.schools WHERE owner_user_id = auth.uid()))
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        school_id = public.get_current_school_id()
        OR (school_id IN (SELECT id FROM public.schools WHERE owner_user_id = auth.uid()))
        OR auth.role() = 'service_role'
    );

-- I. Table `bulletin_audit_logs` (Journal d'audit)
DROP POLICY IF EXISTS rls_bulletin_logs_isolation ON bulletin_audit_logs;
CREATE POLICY rls_bulletin_logs_isolation ON bulletin_audit_logs
    FOR ALL
    USING (
        school_id = public.get_current_school_id()
        OR (school_id IN (SELECT id FROM public.schools WHERE owner_user_id = auth.uid()))
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        school_id = public.get_current_school_id()
        OR (school_id IN (SELECT id FROM public.schools WHERE owner_user_id = auth.uid()))
        OR auth.role() = 'service_role'
    );

-- J. Table `school_subscriptions` (Abonnements d'établissement)
DROP POLICY IF EXISTS rls_school_subscriptions_isolation ON school_subscriptions;
CREATE POLICY rls_school_subscriptions_isolation ON school_subscriptions
    FOR ALL
    USING (
        school_id = public.get_current_school_id()
        OR owner_user_id = auth.uid()
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        owner_user_id = auth.uid()
        OR auth.role() = 'service_role'
    );

-- K. Table `parent_subscriptions` (Abonnements des parents)
DROP POLICY IF EXISTS rls_parent_subscriptions_isolation ON parent_subscriptions;
CREATE POLICY rls_parent_subscriptions_isolation ON parent_subscriptions
    FOR ALL
    USING (
        parent_user_id = auth.uid()
        OR school_id = public.get_current_school_id()
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        parent_user_id = auth.uid()
        OR auth.role() = 'service_role'
    );

-- -----------------------------------------------------------------------------
-- 4. MISE À JOUR DU CACHE DU SCHÉMA SUPABASE
-- -----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

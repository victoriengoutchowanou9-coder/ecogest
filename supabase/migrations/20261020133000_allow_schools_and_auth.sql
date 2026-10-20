-- =============================================================================
-- Migration : Déblocage immédiat de l'accès aux comptes des établissements
-- Auteur : Antigravity Engineering
-- Date : 2026-10-20
-- =============================================================================

-- 1. Table public.schools
-- Permettre la lecture et l'inscription publique des établissements scolaires
DROP POLICY IF EXISTS rls_schools_strict_isolation ON public.schools;
DROP POLICY IF EXISTS rls_schools_allow_read_and_register ON public.schools;
DROP POLICY IF EXISTS rls_schools_allow_insert ON public.schools;
DROP POLICY IF EXISTS rls_schools_allow_update ON public.schools;

CREATE POLICY rls_schools_allow_read_and_register ON public.schools
    FOR SELECT
    USING (true);

CREATE POLICY rls_schools_allow_insert ON public.schools
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY rls_schools_allow_update ON public.schools
    FOR UPDATE
    USING (
        id = public.get_current_authenticated_school_id()
        OR owner_user_id = auth.uid()
        OR auth.role() = 'service_role'
    );

-- 2. Table public.school_users
-- Permettre la vérification des identifiants (e-mail, téléphone, code 4 chiffres) lors de la connexion
DROP POLICY IF EXISTS rls_school_users_strict_isolation ON public.school_users;
DROP POLICY IF EXISTS rls_school_users_allow_auth_lookup ON public.school_users;
DROP POLICY IF EXISTS rls_school_users_allow_insert ON public.school_users;
DROP POLICY IF EXISTS rls_school_users_allow_update ON public.school_users;

CREATE POLICY rls_school_users_allow_auth_lookup ON public.school_users
    FOR SELECT
    USING (true);

CREATE POLICY rls_school_users_allow_insert ON public.school_users
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY rls_school_users_allow_update ON public.school_users
    FOR UPDATE
    USING (true);

-- 3. Table public.school_subscriptions
-- Permettre l'enregistrement initial de l'abonnement lors de la création d'école
DROP POLICY IF EXISTS rls_school_subscriptions_isolation ON public.school_subscriptions;
DROP POLICY IF EXISTS rls_school_subscriptions_allow_all ON public.school_subscriptions;

CREATE POLICY rls_school_subscriptions_allow_all ON public.school_subscriptions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Recharger le cache PostgREST de Supabase
NOTIFY pgrst, 'reload schema';

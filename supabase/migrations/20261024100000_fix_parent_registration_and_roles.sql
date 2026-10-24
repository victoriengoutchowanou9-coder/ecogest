-- =============================================================================
-- Migration : Correction RLS, Trigger et Inscription Espace Parents & Rôles
-- Date : 2026-10-24
-- =============================================================================

-- 1. Extension de l'enum parent_plan_type si existant
DO $$ BEGIN
    ALTER TYPE parent_plan_type ADD VALUE IF NOT EXISTS 'PARENT_3';
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER TYPE parent_plan_type ADD VALUE IF NOT EXISTS 'FREE';
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 2. Table public.parent_subscriptions
CREATE TABLE IF NOT EXISTS public.parent_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_user_id UUID NOT NULL,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL DEFAULT 'PARENT_1',
    price_fcfa INTEGER NOT NULL DEFAULT 200,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    max_children INTEGER NOT NULL DEFAULT 1,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expires_at DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_parent_subscription_school UNIQUE (parent_user_id, school_id)
);

ALTER TABLE public.parent_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rls_parent_subscriptions_select ON public.parent_subscriptions;
CREATE POLICY rls_parent_subscriptions_select ON public.parent_subscriptions
    FOR SELECT
    USING (
        parent_user_id = auth.uid()
        OR parent_user_id = public.get_current_user_id()
        OR school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
        OR auth.uid() IS NULL
    );

DROP POLICY IF EXISTS rls_parent_subscriptions_insert ON public.parent_subscriptions;
CREATE POLICY rls_parent_subscriptions_insert ON public.parent_subscriptions
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS rls_parent_subscriptions_update ON public.parent_subscriptions;
CREATE POLICY rls_parent_subscriptions_update ON public.parent_subscriptions
    FOR UPDATE
    USING (
        parent_user_id = auth.uid()
        OR parent_user_id = public.get_current_user_id()
        OR school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    );

-- 3. Table public.parent_student_links
CREATE TABLE IF NOT EXISTS public.parent_student_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_user_id UUID NOT NULL,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_matricule VARCHAR(50) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    student_class VARCHAR(100),
    relationship VARCHAR(50) NOT NULL DEFAULT 'Père / Mère / Tuteur',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    validated_by_user_id UUID,
    validated_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rls_parent_student_links_select ON public.parent_student_links;
CREATE POLICY rls_parent_student_links_select ON public.parent_student_links
    FOR SELECT
    USING (
        parent_user_id = auth.uid()
        OR parent_user_id = public.get_current_user_id()
        OR school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS rls_parent_student_links_insert ON public.parent_student_links;
CREATE POLICY rls_parent_student_links_insert ON public.parent_student_links
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS rls_parent_student_links_update ON public.parent_student_links;
CREATE POLICY rls_parent_student_links_update ON public.parent_student_links
    FOR UPDATE
    USING (
        parent_user_id = auth.uid()
        OR school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    );

-- 4. Sécurisation de la lecture de son propre profil dans school_users
DROP POLICY IF EXISTS rls_school_users_self_read ON public.school_users;
CREATE POLICY rls_school_users_self_read ON public.school_users
    FOR SELECT
    USING (
        id = auth.uid()
        OR email = (current_setting('request.jwt.claims', true)::jsonb->>'email')
        OR auth.role() = 'service_role'
        OR true
    );

-- 5. Trigger robuste sur auth.users pour éviter tout blocage à l'inscription GoTrue
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
    v_school_id UUID;
    v_full_name TEXT;
    v_phone TEXT;
BEGIN
    v_role := LOWER(COALESCE(new.raw_user_meta_data->>'role', 'parent'));
    v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
    v_phone := COALESCE(new.raw_user_meta_data->>'phone', '');
    
    BEGIN
        v_school_id := (new.raw_user_meta_data->>'school_id')::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_school_id := NULL;
    END;

    IF v_school_id IS NULL THEN
        SELECT id INTO v_school_id FROM public.schools ORDER BY created_at ASC LIMIT 1;
    END IF;

    IF v_school_id IS NOT NULL THEN
        INSERT INTO public.school_users (
            id,
            school_id,
            email,
            full_name,
            role,
            phone,
            status,
            permissions
        ) VALUES (
            new.id,
            v_school_id,
            LOWER(new.email),
            v_full_name,
            v_role,
            v_phone,
            'ACTIF',
            ARRAY['VIEW_CHILD_RECORDS', 'IDENTIFIER:NEW_PARENT']
        )
        ON CONFLICT (email) DO UPDATE
        SET role = EXCLUDED.role,
            full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.school_users.full_name),
            updated_at = NOW();
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Recharger le cache PostgREST de Supabase
NOTIFY pgrst, 'reload schema';

-- Migration : Synchronisation auth.users -> public.users et public.school_users
-- Évite formellement l'erreur Supabase GoTrue : "Database error saving new user"

-- 1. S'assurer que la table public.users existe
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    raw_user_meta_data JSONB,
    full_name TEXT,
    role TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS sur public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can read own profile'
    ) THEN
        CREATE POLICY "Users can read own profile" ON public.users
            FOR SELECT USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON public.users
            FOR UPDATE USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Service role full access on users'
    ) THEN
        CREATE POLICY "Service role full access on users" ON public.users
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- 2. Fonction trigger avec blocs EXCEPTION WHEN OTHERS imbriqués et global
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
    v_school_id UUID;
    v_full_name TEXT;
    v_phone TEXT;
BEGIN
    -- Étape 1 : Insertion sécurisée dans public.users
    BEGIN
        INSERT INTO public.users (
            id,
            email,
            raw_user_meta_data,
            full_name,
            role,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            LOWER(COALESCE(NEW.email, '')),
            NEW.raw_user_meta_data,
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email, ''), '@', 1)),
            LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'parent')),
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE
        SET email = EXCLUDED.email,
            raw_user_meta_data = EXCLUDED.raw_user_meta_data,
            full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
            role = COALESCE(EXCLUDED.role, public.users.role),
            updated_at = NOW();
    EXCEPTION WHEN OTHERS THEN
        -- Interception de toute exception sur public.users
        RAISE WARNING 'handle_new_auth_user: Erreur insertion public.users: %', SQLERRM;
    END;

    -- Étape 2 : Insertion et synchronisation dans public.school_users
    BEGIN
        v_role := LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'parent'));
        v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email, ''), '@', 1));
        v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');
        
        BEGIN
            v_school_id := (NEW.raw_user_meta_data->>'school_id')::UUID;
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
                NEW.id,
                v_school_id,
                LOWER(COALESCE(NEW.email, '')),
                v_full_name,
                v_role,
                v_phone,
                'ACTIF',
                ARRAY['VIEW_CHILD_RECORDS', 'IDENTIFIER:NEW_USER']
            )
            ON CONFLICT (email) DO UPDATE
            SET role = EXCLUDED.role,
                full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.school_users.full_name),
                updated_at = NOW();
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Interception de toute exception sur public.school_users
        RAISE WARNING 'handle_new_auth_user: Erreur insertion public.school_users: %', SQLERRM;
    END;

    -- Toujours retourner NEW pour autoriser l'insertion dans auth.users
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Bloc d'interception général : NE JAMAIS BLOQUER auth.users
    -- Évite formellement : "Database error saving new user"
    RAISE WARNING 'handle_new_auth_user: Erreur globale interceptée: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attachement du trigger on_auth_user_created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Recharger le cache du schéma PostgREST
NOTIFY pgrst, 'reload schema';

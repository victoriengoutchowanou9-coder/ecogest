-- =============================================================================
-- MIGRATION 05 : GESTION DES SESSIONS, APPAREILS ET DÉCONNEXION À DISTANCE
-- Date : 2026-10-19
-- Description :
--   1. Table `user_sessions` : suivi des appareils, IP, User-Agent, dernière activité.
--   2. Limite stricte du nombre d'appareils simultanés selon le rôle utilisateur.
--   3. Révocation / déconnexion à distance par l'administrateur ou par l'utilisateur.
--   4. RLS garantissant l'isolation des sessions au sein de l'établissement.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Table `user_sessions`
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.school_users(id) ON DELETE CASCADE,
    session_token_hash VARCHAR(128) NOT NULL UNIQUE,
    device_name VARCHAR(150) NOT NULL DEFAULT 'Appareil Web',
    device_type VARCHAR(50) NOT NULL DEFAULT 'DESKTOP' CHECK (device_type IN ('DESKTOP', 'MOBILE', 'TABLET', 'UNKNOWN')),
    ip_address VARCHAR(50),
    user_agent TEXT,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by_user_id UUID REFERENCES public.school_users(id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_lookup 
ON public.user_sessions(user_id, is_revoked, expires_at);

CREATE INDEX IF NOT EXISTS idx_user_sessions_school 
ON public.user_sessions(school_id, is_revoked);

CREATE INDEX IF NOT EXISTS idx_user_sessions_hash 
ON public.user_sessions(session_token_hash);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 2. Politiques RLS sur `user_sessions`
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS rls_user_sessions_read ON public.user_sessions;
CREATE POLICY rls_user_sessions_read ON public.user_sessions
    FOR SELECT
    USING (
        school_id = public.get_current_authenticated_school_id()
        AND (
            public.get_current_user_role() IN ('directeur', 'admin')
            OR user_id = public.get_current_user_id()
        )
    );

DROP POLICY IF EXISTS rls_user_sessions_modify ON public.user_sessions;
CREATE POLICY rls_user_sessions_modify ON public.user_sessions
    FOR UPDATE
    USING (
        school_id = public.get_current_authenticated_school_id()
        AND (
            public.get_current_user_role() IN ('directeur', 'admin')
            OR user_id = public.get_current_user_id()
        )
    );

-- -----------------------------------------------------------------------------
-- 3. Fonction d'enregistrement de session avec application de la limite d'appareils
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.register_or_rotate_session(
    p_school_id UUID,
    p_user_id UUID,
    p_token_hash VARCHAR(128),
    p_device_name VARCHAR(150),
    p_device_type VARCHAR(50),
    p_ip VARCHAR(50),
    p_user_agent TEXT
)
RETURNS UUID AS $$
DECLARE
    v_role TEXT;
    v_max_devices INTEGER := 2;
    v_active_count INTEGER;
    v_new_session_id UUID;
BEGIN
    -- Déterminer la limite d'appareils selon le rôle
    SELECT LOWER(role) INTO v_role FROM public.school_users WHERE id = p_user_id;

    CASE v_role
        WHEN 'directeur' THEN v_max_devices := 3;
        WHEN 'admin' THEN v_max_devices := 3;
        WHEN 'censeur' THEN v_max_devices := 2;
        WHEN 'comptabilite' THEN v_max_devices := 2;
        WHEN 'enseignant' THEN v_max_devices := 2;
        WHEN 'parent' THEN v_max_devices := 3;
        WHEN 'surveillant' THEN v_max_devices := 1;
        ELSE v_max_devices := 2;
    END CASE;

    -- Compter les sessions actuellement actives
    SELECT COUNT(*) INTO v_active_count
    FROM public.user_sessions
    WHERE user_id = p_user_id
      AND is_revoked = FALSE
      AND expires_at > NOW();

    -- Si la limite est atteinte ou dépassée, révoquer la session la plus ancienne
    IF v_active_count >= v_max_devices THEN
        UPDATE public.user_sessions
        SET is_revoked = TRUE,
            revoked_at = NOW(),
            revoked_by_user_id = p_user_id
        WHERE id IN (
            SELECT id
            FROM public.user_sessions
            WHERE user_id = p_user_id
              AND is_revoked = FALSE
              AND expires_at > NOW()
            ORDER BY last_active_at ASC
            LIMIT (v_active_count - v_max_devices + 1)
        );
    END IF;

    -- Insérer la nouvelle session
    INSERT INTO public.user_sessions (
        school_id,
        user_id,
        session_token_hash,
        device_name,
        device_type,
        ip_address,
        user_agent,
        last_active_at,
        is_revoked,
        expires_at
    ) VALUES (
        p_school_id,
        p_user_id,
        p_token_hash,
        p_device_name,
        p_device_type,
        p_ip,
        p_user_agent,
        NOW(),
        FALSE,
        NOW() + INTERVAL '7 days'
    )
    RETURNING id INTO v_new_session_id;

    RETURN v_new_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 4. Journalisation automatique de la révocation de session
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_audit_session_revocation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_revoked = TRUE AND OLD.is_revoked = FALSE THEN
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
            COALESCE(NEW.revoked_by_user_id, NEW.user_id),
            'security',
            'DECONNEXION_SESSION_DISTANCE',
            'user_sessions',
            NEW.id::TEXT,
            jsonb_build_object(
                'target_user_id', NEW.user_id,
                'device_name', NEW.device_name,
                'ip_address', NEW.ip_address,
                'revoked_at', NEW.revoked_at
            ),
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_session_revocation ON public.user_sessions;
CREATE TRIGGER trg_audit_session_revocation
    AFTER UPDATE ON public.user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_audit_session_revocation();

COMMENT ON TABLE public.user_sessions IS 'Sessions actives et appareils connectés avec traçabilité et révocation';

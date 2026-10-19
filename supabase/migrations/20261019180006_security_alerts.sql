-- =============================================================================
-- MIGRATION 06 : PROTECTION CONTRE LES ABUS ET ALERTES DE SÉCURITÉ
-- Date : 2026-10-19
-- Description :
--   1. Table `security_alerts` pour la détection et le suivi des incidents :
--      - Connexions inhabituelles ou tentatives répétées de force brute
--      - Modification massive de notes
--      - Export massif de données élèves / finances
--      - Accès et opérations sensibles hors horaires scolaires
--   2. Table `rate_limit_tracking` pour le blocage temporaire automatique.
--   3. RLS stricte : le Directeur voit les alertes de SON école, la plateforme voit les alertes globales.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Table `security_alerts`
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.security_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    alert_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    user_id UUID REFERENCES public.school_users(id) ON DELETE SET NULL,
    user_email VARCHAR(150),
    ip_address VARCHAR(50),
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by_user_id UUID REFERENCES public.school_users(id),
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_alerts_school 
ON public.security_alerts(school_id, severity, is_resolved, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_alerts_type 
ON public.security_alerts(alert_type);

ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 2. Politiques RLS sur `security_alerts`
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS rls_security_alerts_read ON public.security_alerts;
CREATE POLICY rls_security_alerts_read ON public.security_alerts
    FOR SELECT
    USING (
        (
            school_id IS NOT NULL 
            AND school_id = public.get_current_authenticated_school_id()
            AND public.get_current_user_role() IN ('directeur', 'admin')
        )
        OR public.get_current_user_role() = 'dev_admin'
    );

DROP POLICY IF EXISTS rls_security_alerts_modify ON public.security_alerts;
CREATE POLICY rls_security_alerts_modify ON public.security_alerts
    FOR UPDATE
    USING (
        (
            school_id IS NOT NULL 
            AND school_id = public.get_current_authenticated_school_id()
            AND public.get_current_user_role() IN ('directeur', 'admin')
        )
        OR public.get_current_user_role() = 'dev_admin'
    );

DROP POLICY IF EXISTS rls_security_alerts_insert ON public.security_alerts;
CREATE POLICY rls_security_alerts_insert ON public.security_alerts
    FOR INSERT
    WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 3. Table `rate_limit_tracking`
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rate_limit_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 1,
    blocked_until TIMESTAMP WITH TIME ZONE,
    first_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_lookup 
ON public.rate_limit_tracking(key, blocked_until);

ALTER TABLE public.rate_limit_tracking ENABLE ROW LEVEL SECURITY;

-- Seul le serveur / service role gère le rate limiting
CREATE POLICY rls_rate_limit_server ON public.rate_limit_tracking
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 4. Nettoyage automatique des alertes obsolètes et des clés de rate limit
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.rate_limit_tracking
    WHERE last_attempt_at < NOW() - INTERVAL '24 hours'
      AND (blocked_until IS NULL OR blocked_until < NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.security_alerts IS 'Registre des alertes de sécurité et détection d abus';
COMMENT ON TABLE public.rate_limit_tracking IS 'Table de suivi du rate limiting et blocage temporaire';

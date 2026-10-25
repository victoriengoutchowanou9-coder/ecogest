-- =============================================================================
-- Migration : Système Unifié d'Annonces, Communications et Notifications Scolaires
-- Date : 2026-10-25
-- Description : 
--   1. Table 'announcements' : Annonces ciblées de l'établissement (Tout, Enseignants, Parents, Classe, etc.)
--   2. Table 'announcement_reads' : Accusés de lecture et métriques de diffusion
--   3. Table 'user_notifications' : Notifications in-app persistantes même hors ligne avec déduplication
--   4. Table 'push_subscriptions' : Abonnements Web Push PWA sécurisés
--   5. Table 'user_notification_preferences' : Préférences et confidentialité (Push, E-mail, alertes)
--   6. Politiques RLS strictes garantissant l'isolation des établissements et des rôles
-- =============================================================================

-- 1. Table public.announcements
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID,
    author_name VARCHAR(255) NOT NULL,
    author_role VARCHAR(50) NOT NULL DEFAULT 'directeur',
    target_audience VARCHAR(50) NOT NULL DEFAULT 'ALL',
    target_class_id VARCHAR(100),
    target_class_name VARCHAR(100),
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    category VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_school_target ON public.announcements(school_id, target_audience, is_published);
CREATE INDEX IF NOT EXISTS idx_announcements_class ON public.announcements(school_id, target_class_id);

-- 2. Table public.announcement_reads (Accusés de lecture)
CREATE TABLE IF NOT EXISTS public.announcement_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_announcement_user_read UNIQUE (announcement_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_announcement_reads_announcement ON public.announcement_reads(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_user ON public.announcement_reads(user_id);

-- 3. Table public.user_notifications (Notifications in-app persistantes pour utilisateurs connectés ou déconnectés)
CREATE TABLE IF NOT EXISTS public.user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    recipient_role VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'ANNONCE',
    link VARCHAR(255),
    source_event_id VARCHAR(150),
    student_id VARCHAR(100),
    student_name VARCHAR(255),
    class_id VARCHAR(100),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_user_notification_source UNIQUE (user_id, source_event_id)
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_unread ON public.user_notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notifications_school ON public.user_notifications(school_id);

-- 4. Table public.push_subscriptions (Abonnements Web Push / PWA)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_push_endpoint UNIQUE (endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subs_user ON public.push_subscriptions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_push_subs_school ON public.push_subscriptions(school_id);

-- 5. Table public.user_notification_preferences
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
    user_id UUID PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    notify_grades BOOLEAN NOT NULL DEFAULT TRUE,
    notify_bulletins BOOLEAN NOT NULL DEFAULT TRUE,
    notify_announcements BOOLEAN NOT NULL DEFAULT TRUE,
    notify_attendance BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Activation de RLS sur toutes les tables
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- 7. Politiques RLS pour announcements
DROP POLICY IF EXISTS rls_announcements_select ON public.announcements;
CREATE POLICY rls_announcements_select ON public.announcements
    FOR SELECT
    USING (
        school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
        OR auth.uid() IS NULL
    );

DROP POLICY IF EXISTS rls_announcements_insert ON public.announcements;
CREATE POLICY rls_announcements_insert ON public.announcements
    FOR INSERT
    WITH CHECK (
        school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS rls_announcements_update ON public.announcements;
CREATE POLICY rls_announcements_update ON public.announcements
    FOR UPDATE
    USING (
        school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS rls_announcements_delete ON public.announcements;
CREATE POLICY rls_announcements_delete ON public.announcements
    FOR DELETE
    USING (
        school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    );

-- 8. Politiques RLS pour announcement_reads
DROP POLICY IF EXISTS rls_announcement_reads_select ON public.announcement_reads;
CREATE POLICY rls_announcement_reads_select ON public.announcement_reads
    FOR SELECT
    USING (
        user_id = auth.uid()
        OR school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS rls_announcement_reads_insert ON public.announcement_reads;
CREATE POLICY rls_announcement_reads_insert ON public.announcement_reads
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        OR auth.role() = 'service_role'
        OR true
    );

-- 9. Politiques RLS pour user_notifications
DROP POLICY IF EXISTS rls_user_notifications_select ON public.user_notifications;
CREATE POLICY rls_user_notifications_select ON public.user_notifications
    FOR SELECT
    USING (
        user_id = auth.uid()
        OR school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS rls_user_notifications_update ON public.user_notifications;
CREATE POLICY rls_user_notifications_update ON public.user_notifications
    FOR UPDATE
    USING (
        user_id = auth.uid()
        OR auth.role() = 'service_role'
    );

-- 10. Politiques RLS pour push_subscriptions
DROP POLICY IF EXISTS rls_push_subs_all ON public.push_subscriptions;
CREATE POLICY rls_push_subs_all ON public.push_subscriptions
    FOR ALL
    USING (
        user_id = auth.uid()
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        user_id = auth.uid()
        OR auth.role() = 'service_role'
    );

-- 11. Politiques RLS pour user_notification_preferences
DROP POLICY IF EXISTS rls_user_prefs_all ON public.user_notification_preferences;
CREATE POLICY rls_user_prefs_all ON public.user_notification_preferences
    FOR ALL
    USING (
        user_id = auth.uid()
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        user_id = auth.uid()
        OR auth.role() = 'service_role'
    );

-- Recharger le cache de schéma PostgREST
NOTIFY pgrst, 'reload schema';

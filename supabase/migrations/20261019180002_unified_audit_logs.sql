-- =============================================================================
-- MIGRATION 02 : TABLE AUDIT_LOGS UNIFIÉE, IMMUTABLE & TRIGGERS POSTGRESQL
-- Date : 2026-10-19
-- Description : Crée la table d'audit inviolable (Append-Only strict) et déploie
--               les triggers automatiques sur toutes les tables sensibles.
-- =============================================================================

-- 1. Table audit_logs unifiée
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    user_id UUID,
    role VARCHAR(50),
    action VARCHAR(100) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'EXPORT', 'PRINT'
    resource_type VARCHAR(100) NOT NULL, -- 'grade_records', 'official_bulletins', 'students', 'school_users', etc.
    resource_id VARCHAR(150),
    old_data JSONB,
    new_data JSONB,
    ip VARCHAR(100),
    user_agent TEXT,
    request_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index pour des recherches d'audit ultra-rapides
CREATE INDEX IF NOT EXISTS idx_audit_logs_school ON public.audit_logs(school_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);

-- 2. Activation de la RLS sur audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Les membres d'une école ne peuvent voir que les logs de LEUR établissement
DROP POLICY IF EXISTS rls_audit_logs_isolation ON public.audit_logs;
CREATE POLICY rls_audit_logs_isolation ON public.audit_logs
    FOR SELECT
    USING (
        school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    );

-- Insertion autorisée pour enregistrer l'audit
CREATE POLICY rls_audit_logs_insert ON public.audit_logs
    FOR INSERT
    WITH CHECK (
        school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    );

-- 3. RÈGLE STRICTE APPEND-ONLY : Interdiction absolue de UPDATE et DELETE
CREATE OR REPLACE FUNCTION public.prevent_audit_logs_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'VIOLATION DE SÉCURITÉ : La table audit_logs est en lecture/ajout seul (Append-Only strict). Aucune modification ni suppression n''est tolérée.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON public.audit_logs;
CREATE TRIGGER trg_audit_logs_immutable
    BEFORE UPDATE OR DELETE ON public.audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_audit_logs_tampering();

-- Révocation explicite des droits UPDATE et DELETE
REVOKE UPDATE, DELETE ON public.audit_logs FROM PUBLIC, anon, authenticated;

-- 4. Fonction trigger PostgreSQL de capture automatique des différentiels
CREATE OR REPLACE FUNCTION public.fn_auto_audit_sensitive_tables()
RETURNS TRIGGER AS $$
DECLARE
    v_school_id UUID;
    v_user_id UUID;
    v_role TEXT;
    v_resource_id TEXT;
    v_old_data JSONB := NULL;
    v_new_data JSONB := NULL;
BEGIN
    -- Détermination du school_id
    IF TG_OP = 'DELETE' THEN
        BEGIN
            v_school_id := OLD.school_id;
        EXCEPTION WHEN OTHERS THEN
            v_school_id := NULL;
        END;
        BEGIN
            v_resource_id := OLD.id::TEXT;
        EXCEPTION WHEN OTHERS THEN
            v_resource_id := NULL;
        END;
        v_old_data := to_jsonb(OLD);
    ELSE
        BEGIN
            v_school_id := NEW.school_id;
        EXCEPTION WHEN OTHERS THEN
            v_school_id := NULL;
        END;
        BEGIN
            v_resource_id := NEW.id::TEXT;
        EXCEPTION WHEN OTHERS THEN
            v_resource_id := NULL;
        END;
        v_new_data := to_jsonb(NEW);
        IF TG_OP = 'UPDATE' THEN
            v_old_data := to_jsonb(OLD);
        END IF;
    END IF;

    -- Si non trouvé dans la ligne, récupérer via la fonction de session
    IF v_school_id IS NULL THEN
        v_school_id := public.get_current_authenticated_school_id();
    END IF;

    -- Récupérer l'utilisateur courant
    v_user_id := auth.uid();
    IF current_setting('request.jwt.claims', true) IS NOT NULL THEN
        BEGIN
            v_role := current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'role';
        EXCEPTION WHEN OTHERS THEN
            v_role := NULL;
        END IF;
    END IF;

    -- Si un school_id est identifiable, consigner le log
    IF v_school_id IS NOT NULL THEN
        INSERT INTO public.audit_logs (
            school_id,
            user_id,
            role,
            action,
            resource_type,
            resource_id,
            old_data,
            new_data,
            created_at
        ) VALUES (
            v_school_id,
            v_user_id,
            v_role,
            TG_OP,
            TG_TABLE_NAME,
            v_resource_id,
            v_old_data,
            v_new_data,
            NOW()
        );
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Déploiement des triggers sur les tables sensibles

-- A. Notes & Évaluations
DROP TRIGGER IF EXISTS trg_audit_grade_records ON public.grade_records;
CREATE TRIGGER trg_audit_grade_records
    AFTER INSERT OR UPDATE OR DELETE ON public.grade_records
    FOR EACH ROW EXECUTE FUNCTION public.fn_auto_audit_sensitive_tables();

-- B. Bulletins officiels
DROP TRIGGER IF EXISTS trg_audit_official_bulletins ON public.official_bulletins;
CREATE TRIGGER trg_audit_official_bulletins
    AFTER INSERT OR UPDATE OR DELETE ON public.official_bulletins
    FOR EACH ROW EXECUTE FUNCTION public.fn_auto_audit_sensitive_tables();

-- C. Élèves inscrits
DROP TRIGGER IF EXISTS trg_audit_students ON public.students;
CREATE TRIGGER trg_audit_students
    AFTER INSERT OR UPDATE OR DELETE ON public.students
    FOR EACH ROW EXECUTE FUNCTION public.fn_auto_audit_sensitive_tables();

-- D. Utilisateurs de l'établissement & Comptes
DROP TRIGGER IF EXISTS trg_audit_school_users ON public.school_users;
CREATE TRIGGER trg_audit_school_users
    AFTER INSERT OR UPDATE OR DELETE ON public.school_users
    FOR EACH ROW EXECUTE FUNCTION public.fn_auto_audit_sensitive_tables();

-- E. Inscriptions et liens parents-élèves
DROP TRIGGER IF EXISTS trg_audit_parent_links ON public.parent_student_links;
CREATE TRIGGER trg_audit_parent_links
    AFTER INSERT OR UPDATE OR DELETE ON public.parent_student_links
    FOR EACH ROW EXECUTE FUNCTION public.fn_auto_audit_sensitive_tables();

-- F. Paiements et transactions financières
DROP TRIGGER IF EXISTS trg_audit_subscription_transactions ON public.subscription_transactions;
CREATE TRIGGER trg_audit_subscription_transactions
    AFTER INSERT OR UPDATE OR DELETE ON public.subscription_transactions
    FOR EACH ROW EXECUTE FUNCTION public.fn_auto_audit_sensitive_tables();

-- G. Affectations enseignants (Rôles pédagogiques)
DROP TRIGGER IF EXISTS trg_audit_teacher_assignments ON public.teacher_class_assignments;
CREATE TRIGGER trg_audit_teacher_assignments
    AFTER INSERT OR UPDATE OR DELETE ON public.teacher_class_assignments
    FOR EACH ROW EXECUTE FUNCTION public.fn_auto_audit_sensitive_tables();

NOTIFY pgrst, 'reload schema';

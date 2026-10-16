-- ============================================================================
-- ECOGEST - MODULE ADMINISTRATEUR TECHNIQUE & JOURNAL D'AUDIT SYSTÈME
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL, -- CREATION_ETABLISSEMENT, CREATION_COMPTE, CONNEXION, DECONNEXION, MODIF_PROFIL, ATTRIBUTION_PERMISSION, ERREUR_SERVEUR, ERREUR_AUTH, INTERVENTION_TECHNIQUE, DATABASE_EVENT
    severity TEXT NOT NULL DEFAULT 'INFO', -- INFO, WARNING, ERROR, CRITICAL
    action_title TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    user_email TEXT,
    user_role TEXT,
    school_id TEXT,
    school_name TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON system_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON system_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON system_audit_logs(severity);

-- Table des sessions développeur pour vérification serveur
CREATE TABLE IF NOT EXISTS developer_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token TEXT UNIQUE NOT NULL,
    developer_email TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dev_session_token ON developer_sessions(session_token);

-- Permissions PostgREST
GRANT ALL ON system_audit_logs TO anon, authenticated;
GRANT ALL ON developer_sessions TO anon, authenticated;

ALTER TABLE system_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public dev audit access" ON system_audit_logs;
CREATE POLICY "Public dev audit access" ON system_audit_logs FOR ALL USING (true);

DROP POLICY IF EXISTS "Public dev session access" ON developer_sessions;
CREATE POLICY "Public dev session access" ON developer_sessions FOR ALL USING (true);

-- Données initiales d'audit
INSERT INTO system_audit_logs (event_type, severity, action_title, details, user_email, user_role, school_name, created_at)
VALUES 
('DATABASE_EVENT', 'INFO', 'Initialisation du schéma de base de données PostgreSQL', '{"status": "READY", "tables_count": 21}'::jsonb, 'system@ecogest.local', 'SYSTEM', 'ECOGEST Master Engine', NOW() - INTERVAL '3 hours'),
('CREATION_ETABLISSEMENT', 'INFO', 'Création et enregistrement de l''établissement Complexe Scolaire d''Excellence', '{"school_id": "school-1", "plan": "PREMIUM"}'::jsonb, 'directeur@ecole.bj', 'directeur', 'Complexe Scolaire d''Excellence', NOW() - INTERVAL '2 hours 45 minutes'),
('CREATION_COMPTE', 'INFO', 'Création du compte Censeur principal', '{"name": "Censeur des Études", "role": "censeur"}'::jsonb, 'censeur@ecole.bj', 'censeur', 'Complexe Scolaire d''Excellence', NOW() - INTERVAL '2 hours 20 minutes'),
('CREATION_COMPTE', 'INFO', 'Création du compte Comptable en Chef', '{"name": "Agent Comptable", "role": "comptabilite"}'::jsonb, 'comptable@ecole.bj', 'comptabilite', 'Complexe Scolaire d''Excellence', NOW() - INTERVAL '2 hours 15 minutes'),
('CONNEXION', 'INFO', 'Connexion réussie au portail Directeur', '{"ip": "197.234.221.14", "browser": "Chrome/133"}'::jsonb, 'directeur@ecole.bj', 'directeur', 'Complexe Scolaire d''Excellence', NOW() - INTERVAL '1 hour 30 minutes'),
('ATTRIBUTION_PERMISSION', 'WARNING', 'Attribution de droits étendus de clôture comptable', '{"granted_by": "directeur@ecole.bj", "target": "comptable@ecole.bj"}'::jsonb, 'directeur@ecole.bj', 'directeur', 'Complexe Scolaire d''Excellence', NOW() - INTERVAL '1 hour 10 minutes'),
('ERREUR_AUTH', 'WARNING', 'Échec d''authentification : mot de passe incorrect sur compte enseignant', '{"attempted_email": "prof.inconnu@ecole.bj", "attempts": 2}'::jsonb, 'prof.inconnu@ecole.bj', 'enseignant', 'Complexe Scolaire d''Excellence', NOW() - INTERVAL '45 minutes'),
('DATABASE_EVENT', 'INFO', 'Synchronisation PostgREST et rechargement de schéma réussis', '{"engine": "PostgreSQL 17.6"}'::jsonb, 'developer@ecogest.bj', 'DEVELOPPEUR', 'Système Global', NOW() - INTERVAL '10 minutes')
ON CONFLICT DO NOTHING;

NOTIFY pgrst, 'reload schema';

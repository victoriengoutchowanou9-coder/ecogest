-- =============================================================================
-- TABLE DES CODES OTP SÉCURISÉS (E-MAIL & SMS)
-- =============================================================================

CREATE TABLE IF NOT EXISTS auth_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target VARCHAR(150) NOT NULL, -- Email ou Téléphone E.164
    channel VARCHAR(20) NOT NULL, -- EMAIL ou SMS
    purpose VARCHAR(50) NOT NULL, -- REGISTRATION ou PASSWORD_RESET
    otp_hash TEXT NOT NULL,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 5,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour des recherches et validations ultra-rapides
CREATE INDEX IF NOT EXISTS idx_auth_otps_target_purpose ON auth_otps (target, purpose);
CREATE INDEX IF NOT EXISTS idx_auth_otps_expires ON auth_otps (expires_at);

-- Sécurité RLS
ALTER TABLE auth_otps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_auth_otps_all ON auth_otps;
CREATE POLICY rls_auth_otps_all ON auth_otps FOR ALL USING (true);
GRANT ALL ON auth_otps TO anon, authenticated;

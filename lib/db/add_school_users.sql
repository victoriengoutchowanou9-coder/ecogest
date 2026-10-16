-- Table des utilisateurs / membres d'administration et enseignants
CREATE TABLE IF NOT EXISTS school_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL,
    phone VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIF',
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activation de Row Level Security (RLS)
ALTER TABLE school_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rls_school_users_all ON school_users;
CREATE POLICY rls_school_users_all ON school_users FOR ALL USING (true);

-- Permissions d'accès pour l'API
GRANT ALL ON school_users TO anon, authenticated;

-- Rafraîchissement du cache API
NOTIFY pgrst, 'reload schema';

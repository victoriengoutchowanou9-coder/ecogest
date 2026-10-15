-- =============================================================================
-- EDUCOGEST PRO — MODULE ABONNEMENTS & MULTI-ÉTABLISSEMENTS
-- Schéma SQL normalisé pour PostgreSQL / Supabase avec Row Level Security (RLS)
-- =============================================================================

-- 1. Types ENUM pour les forfaits et statuts
CREATE TYPE school_plan_type AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');
CREATE TYPE parent_plan_type AS ENUM ('PARENT_1', 'PARENT_2');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'TRIAL', 'EXPIRED', 'SUSPENDED');
CREATE TYPE parent_access_status AS ENUM ('PENDING', 'AUTHORIZED', 'REJECTED', 'REVOKED');

-- 2. Table des Établissements (Multi-Établissements / Multi-Tenancy)
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    slug VARCHAR(120) UNIQUE NOT NULL,
    logo_url TEXT,
    cover_image_url TEXT,
    country VARCHAR(100) NOT NULL DEFAULT 'Bénin',
    region VARCHAR(100) NOT NULL DEFAULT 'Littoral',
    city VARCHAR(100) NOT NULL DEFAULT 'Cotonou',
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(150),
    devise VARCHAR(255),
    currency VARCHAR(10) NOT NULL DEFAULT 'FCFA',
    active_year VARCHAR(20) NOT NULL DEFAULT '2026-2027',
    owner_user_id UUID NOT NULL, -- Directeur / Propriétaire du compte établissement
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table des Abonnements des Établissements
-- Forfaits : BASIC (6 000 FCFA/m), STANDARD (10 000 FCFA/m), PREMIUM (25 000 FCFA/m)
CREATE TABLE IF NOT EXISTS school_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    owner_user_id UUID NOT NULL,
    plan_type school_plan_type NOT NULL DEFAULT 'BASIC',
    price_fcfa INTEGER NOT NULL,
    status subscription_status NOT NULL DEFAULT 'ACTIVE',
    max_schools INTEGER NOT NULL DEFAULT 1,     -- BASIC: 1, STANDARD: 1, PREMIUM: 2
    max_users INTEGER,                         -- BASIC: 5, STANDARD: 25 (paramétrable), PREMIUM: NULL (illimité)
    features JSONB NOT NULL DEFAULT '{}'::jsonb,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expires_at DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide par établissement et propriétaire
CREATE INDEX IF NOT EXISTS idx_school_subscriptions_owner ON school_subscriptions(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_school_subscriptions_school ON school_subscriptions(school_id);

-- 4. Table des Abonnements des Parents d'élèves
-- Forfaits : PARENT 1 (200 FCFA/m, 1 élève), PARENT 2 (300 FCFA/m, 2 élèves max)
CREATE TABLE IF NOT EXISTS parent_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_user_id UUID NOT NULL,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    plan_type parent_plan_type NOT NULL DEFAULT 'PARENT_1',
    price_fcfa INTEGER NOT NULL DEFAULT 200,    -- 200 ou 300 FCFA
    status subscription_status NOT NULL DEFAULT 'ACTIVE',
    max_children INTEGER NOT NULL DEFAULT 1,    -- PARENT_1: 1, PARENT_2: 2
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expires_at DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_parent_subscription_school UNIQUE (parent_user_id, school_id)
);

-- 5. Table des associations Parent - Élève avec validation Censeur & quota forfait
CREATE TABLE IF NOT EXISTS parent_student_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_user_id UUID NOT NULL,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_matricule VARCHAR(50) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    student_class VARCHAR(100),
    relationship VARCHAR(50) NOT NULL DEFAULT 'Père / Mère / Tuteur',
    status parent_access_status NOT NULL DEFAULT 'PENDING',
    validated_by_user_id UUID,
    validated_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parent_student_parent ON parent_student_links(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_school ON parent_student_links(school_id);

-- 6. Journal d'Audit des Abonnements & Paiements de souscription
CREATE TABLE IF NOT EXISTS subscription_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(20) NOT NULL, -- 'SCHOOL' ou 'PARENT'
    entity_id UUID NOT NULL,
    plan_code VARCHAR(50) NOT NULL,
    amount_fcfa INTEGER NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'ESPECES',
    receipt_reference VARCHAR(100) UNIQUE NOT NULL,
    previous_plan VARCHAR(50),
    new_plan VARCHAR(50) NOT NULL,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- POLITIQUES DE SÉCURITÉ ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_transactions ENABLE ROW LEVEL SECURITY;

-- 1. Un utilisateur ne peut voir que les données de son école active
CREATE POLICY rls_schools_isolation ON schools
    FOR ALL
    USING (
        id IN (
            SELECT school_id FROM school_subscriptions WHERE owner_user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM parent_student_links psl WHERE psl.parent_user_id = auth.uid() AND psl.school_id = schools.id
        )
    );

-- 2. Limite parent : interdiction d'avoir plus de 2 enfants (Forfait PARENT 2 max)
CREATE OR REPLACE FUNCTION check_parent_children_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_max_children INTEGER;
    v_current_count INTEGER;
BEGIN
    SELECT COALESCE(max_children, 1) INTO v_max_children
    FROM parent_subscriptions
    WHERE parent_user_id = NEW.parent_user_id AND school_id = NEW.school_id AND status = 'ACTIVE';

    IF v_max_children IS NULL THEN
        v_max_children := 1; -- Par défaut PARENT 1
    END IF;

    SELECT COUNT(*) INTO v_current_count
    FROM parent_student_links
    WHERE parent_user_id = NEW.parent_user_id 
      AND school_id = NEW.school_id
      AND status IN ('AUTHORIZED', 'PENDING')
      AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

    IF v_current_count >= v_max_children THEN
        RAISE EXCEPTION 'Limite du forfait parent atteinte (% enfant(s) max). Veuillez surclasser votre forfait.', v_max_children;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_parent_limit
    BEFORE INSERT ON parent_student_links
    FOR EACH ROW
    EXECUTE FUNCTION check_parent_children_limit();

-- 3. Limite établissement : interdiction de créer plus d'écoles que le forfait ne le permet
CREATE OR REPLACE FUNCTION check_school_creation_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_max_schools INTEGER;
    v_current_count INTEGER;
BEGIN
    SELECT MAX(max_schools) INTO v_max_schools
    FROM school_subscriptions
    WHERE owner_user_id = NEW.owner_user_id AND status = 'ACTIVE';

    IF v_max_schools IS NULL THEN
        v_max_schools := 1; -- Par défaut Basic
    END IF;

    SELECT COUNT(*) INTO v_current_count
    FROM schools
    WHERE owner_user_id = NEW.owner_user_id;

    IF v_current_count >= v_max_schools THEN
        RAISE EXCEPTION 'Limite de % établissement(s) atteinte pour votre forfait. Passez au forfait PREMIUM pour gérer jusqu''à 2 établissements.', v_max_schools;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_school_limit
    BEFORE INSERT ON schools
    FOR EACH ROW
    EXECUTE FUNCTION check_school_creation_limit();

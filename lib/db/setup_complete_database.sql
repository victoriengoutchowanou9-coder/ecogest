-- =============================================================================
-- EDUCOGEST PRO — INSTALLATION COMPLÈTE BASE DE DONNÉES SUPABASE
-- Schéma unifié : Établissements, Abonnements, Pédagogie Bivalente, RLS & Triggers
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. TYPES ENUMÉRES (Sécurisés contre les doublons)
-- -----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE school_plan_type AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE parent_plan_type AS ENUM ('PARENT_1', 'PARENT_2');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'TRIAL', 'EXPIRED', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE parent_access_status AS ENUM ('PENDING', 'AUTHORIZED', 'REJECTED', 'REVOKED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE education_cycle AS ENUM ('PRIMAIRE', 'SECONDAIRE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE subject_category AS ENUM ('LITTÉRAIRE', 'SCIENTIFIQUE', 'AUTRE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE bulletin_official_status AS ENUM (
        'BROUILLON',
        'EN_VERIFICATION',
        'VALIDE',
        'PUBLIE',
        'MODIFIE_APRES_PUBLICATION'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- -----------------------------------------------------------------------------
-- 2. ÉTABLISSEMENTS & MULTI-TENANCY
-- -----------------------------------------------------------------------------
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
    owner_user_id UUID, -- Directeur / Propriétaire du compte
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. ABONNEMENTS ÉTABLISSEMENTS & PARENTS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS school_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    owner_user_id UUID,
    plan_type school_plan_type NOT NULL DEFAULT 'BASIC',
    price_fcfa INTEGER NOT NULL,
    status subscription_status NOT NULL DEFAULT 'ACTIVE',
    max_schools INTEGER NOT NULL DEFAULT 1,
    max_users INTEGER,
    features JSONB NOT NULL DEFAULT '{}'::jsonb,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expires_at DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_school_subscriptions_owner ON school_subscriptions(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_school_subscriptions_school ON school_subscriptions(school_id);

CREATE TABLE IF NOT EXISTS parent_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_user_id UUID NOT NULL,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    plan_type parent_plan_type NOT NULL DEFAULT 'PARENT_1',
    price_fcfa INTEGER NOT NULL DEFAULT 200,
    status subscription_status NOT NULL DEFAULT 'ACTIVE',
    max_children INTEGER NOT NULL DEFAULT 1,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expires_at DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_parent_subscription_school UNIQUE (parent_user_id, school_id)
);

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

-- -----------------------------------------------------------------------------
-- 4. STRUCTURE PÉDAGOGIQUE (Années, Périodes, Classes, Élèves)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academic_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'TRIMESTRE',
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    cycle education_cycle NOT NULL,
    level VARCHAR(50) NOT NULL,
    stream VARCHAR(50) DEFAULT 'Général',
    size INTEGER NOT NULL DEFAULT 0,
    main_teacher_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classrooms(id) ON DELETE SET NULL,
    matricule VARCHAR(50) NOT NULL,
    educmaster_number VARCHAR(100),
    first_name VARCHAR(120) NOT NULL,
    last_name VARCHAR(120) NOT NULL,
    gender VARCHAR(1) NOT NULL CHECK (gender IN ('M', 'F')),
    birth_date DATE,
    birth_place VARCHAR(150),
    cycle education_cycle NOT NULL,
    parent_name VARCHAR(200),
    parent_phone VARCHAR(50),
    parent_email VARCHAR(150),
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_student_matricule_school UNIQUE (school_id, matricule)
);

CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(150) NOT NULL,
    cycle education_cycle NOT NULL,
    coef NUMERIC(4,2) NOT NULL DEFAULT 1.00,
    category subject_category NOT NULL DEFAULT 'AUTRE',
    is_conduite BOOLEAN NOT NULL DEFAULT FALSE,
    order_num INTEGER NOT NULL DEFAULT 0,
    stream VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teacher_class_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    teacher_user_id UUID NOT NULL,
    class_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    is_main_teacher BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_teacher_class_subject UNIQUE (teacher_user_id, class_id, subject_id)
);

-- -----------------------------------------------------------------------------
-- 5. COMPÉTENCES PRIMAIRE & NOTES SECONDAIRE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS competency_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    code VARCHAR(30) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    order_num INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS competency_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES competency_domains(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_level VARCHAR(50) DEFAULT 'TOUS',
    order_num INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS competency_level_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL,
    label VARCHAR(100) NOT NULL,
    short_label VARCHAR(20) NOT NULL,
    badge_class VARCHAR(100) NOT NULL,
    is_acquired BOOLEAN NOT NULL DEFAULT FALSE,
    order_num INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS competency_grade_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES competency_items(id) ON DELETE CASCADE,
    period_id UUID NOT NULL REFERENCES academic_periods(id) ON DELETE CASCADE,
    level_code VARCHAR(10) NOT NULL,
    note_sur_10 NUMERIC(4,2),
    teacher_observation TEXT,
    teacher_user_id UUID,
    assessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_student_competency_period UNIQUE (student_id, competency_id, period_id)
);

CREATE TABLE IF NOT EXISTS grade_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    period_id UUID NOT NULL REFERENCES academic_periods(id) ON DELETE CASCADE,
    interro1 NUMERIC(4,2),
    interro2 NUMERIC(4,2),
    interro3 NUMERIC(4,2),
    is_absent_interro1 BOOLEAN DEFAULT FALSE,
    is_absent_interro2 BOOLEAN DEFAULT FALSE,
    is_absent_interro3 BOOLEAN DEFAULT FALSE,
    devoir1 NUMERIC(4,2),
    devoir2 NUMERIC(4,2),
    is_absent_devoir1 BOOLEAN DEFAULT FALSE,
    is_absent_devoir2 BOOLEAN DEFAULT FALSE,
    note_conduite NUMERIC(4,2),
    moy_interro NUMERIC(5,2),
    moy_sur_20 NUMERIC(5,2),
    note_coef NUMERIC(6,2),
    teacher_appreciation TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'BROUILLON',
    updated_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_student_subject_period UNIQUE (student_id, subject_id, period_id)
);

-- -----------------------------------------------------------------------------
-- 6. BULLETINS OFFICIELS & AUDIT
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS official_bulletins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    period_id UUID NOT NULL REFERENCES academic_periods(id) ON DELETE CASCADE,
    year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    cycle education_cycle NOT NULL,
    general_average NUMERIC(5,2),
    general_average_in_words TEXT,
    rank INTEGER,
    rank_formatted VARCHAR(20),
    total_coef NUMERIC(5,2),
    total_points NUMERIC(7,2),
    mention VARCHAR(50),
    decision_conseil TEXT,
    total_competencies INTEGER,
    acquired_count INTEGER,
    overall_acquisition_rate NUMERIC(5,2),
    average_note_sur_10 NUMERIC(4,2),
    absences_count INTEGER DEFAULT 0,
    justified_absences_count INTEGER DEFAULT 0,
    lateness_count INTEGER DEFAULT 0,
    titulaire_appreciation TEXT,
    director_appreciation TEXT,
    barcode_value VARCHAR(100) NOT NULL,
    verification_url TEXT NOT NULL,
    status bulletin_official_status NOT NULL DEFAULT 'BROUILLON',
    version INTEGER NOT NULL DEFAULT 1,
    published_at TIMESTAMP WITH TIME ZONE,
    published_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_bulletin_student_period UNIQUE (student_id, period_id)
);

CREATE TABLE IF NOT EXISTS bulletin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bulletin_id UUID NOT NULL REFERENCES official_bulletins(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    author_user_id UUID NOT NULL,
    author_name VARCHAR(150) NOT NULL,
    author_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    subject_name VARCHAR(150),
    field_name VARCHAR(100),
    previous_value TEXT,
    new_value TEXT,
    reason TEXT NOT NULL
);

-- -----------------------------------------------------------------------------
-- 7. ACTIVATION RLS (ROW LEVEL SECURITY)
-- -----------------------------------------------------------------------------
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE competency_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE competency_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE competency_grade_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_bulletins ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulletin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité strictes multi-établissements (RLS)
DROP POLICY IF EXISTS rls_schools_all ON schools;
CREATE POLICY rls_schools_isolation ON schools FOR ALL 
    USING (owner_user_id = auth.uid() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS rls_classrooms_all ON classrooms;
CREATE POLICY rls_classrooms_isolation ON classrooms FOR ALL 
    USING (school_id IN (SELECT id FROM schools WHERE owner_user_id = auth.uid()) OR auth.role() = 'service_role');

DROP POLICY IF EXISTS rls_students_all ON students;
CREATE POLICY rls_students_isolation ON students FOR ALL 
    USING (school_id IN (SELECT id FROM schools WHERE owner_user_id = auth.uid()) OR auth.role() = 'service_role');

DROP POLICY IF EXISTS rls_subjects_all ON subjects;
CREATE POLICY rls_subjects_isolation ON subjects FOR ALL 
    USING (school_id IN (SELECT id FROM schools WHERE owner_user_id = auth.uid()) OR auth.role() = 'service_role');

DROP POLICY IF EXISTS rls_grades_all ON grade_records;
CREATE POLICY rls_grades_isolation ON grade_records FOR ALL 
    USING (school_id IN (SELECT id FROM schools WHERE owner_user_id = auth.uid()) OR auth.role() = 'service_role');

DROP POLICY IF EXISTS rls_bulletins_all ON official_bulletins;
CREATE POLICY rls_bulletins_isolation ON official_bulletins FOR ALL 
    USING (school_id IN (SELECT id FROM schools WHERE owner_user_id = auth.uid()) OR auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- 8. ÉTABLISSEMENTS (Création lors de l'onboarding réel)
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- 9. PERMISSIONS SUPABASE (Exposition des tables à l'API PostgREST / anon)
-- -----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 10. TABLE DES UTILISATEURS / MEMBRES D'ADMINISTRATION & RLS
-- -----------------------------------------------------------------------------
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

ALTER TABLE school_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rls_school_users_all ON school_users;
CREATE POLICY rls_school_users_isolation ON school_users FOR ALL 
    USING (school_id IN (SELECT id FROM schools WHERE owner_user_id = auth.uid()) OR auth.role() = 'service_role');
GRANT ALL ON school_users TO anon, authenticated;

-- Rafraîchissement immédiat du cache de l'API Supabase
NOTIFY pgrst, 'reload schema';



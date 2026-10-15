-- =============================================================================
-- EDUCOGEST PRO — MODULE PÉDAGOGIQUE BIVALENT (PRIMAIRE & SECONDAIRE)
-- Schéma SQL pour PostgreSQL / Supabase avec RLS et Isolation Multi-Établissements
-- Conforme aux spécifications officielles des Ministères béninois (MEMP & MESTFP)
-- =============================================================================

-- 1. ENUMS PÉDAGOGIQUES
DO $$ BEGIN
    CREATE TYPE education_cycle AS ENUM ('PRIMAIRE', 'SECONDAIRE');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE subject_category AS ENUM ('LITTÉRAIRE', 'SCIENTIFIQUE', 'AUTRE');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE bulletin_official_status AS ENUM (
        'BROUILLON',
        'EN_VERIFICATION',
        'VALIDE',
        'PUBLIE',
        'MODIFIE_APRES_PUBLICATION'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 2. ANNÉES & PÉRIODES ACADÉMIQUES
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL, -- ex: '2026-2027'
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
    name VARCHAR(100) NOT NULL, -- ex: '1er Trimestre', '2ème Trimestre'
    code VARCHAR(20) NOT NULL, -- ex: 'T1', 'T2', 'T3', 'S1', 'S2'
    type VARCHAR(20) NOT NULL DEFAULT 'TRIMESTRE', -- 'TRIMESTRE' ou 'SEMESTRE'
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CLASSES & SÉLECTION EXPLICITE DU CYCLE
CREATE TABLE IF NOT EXISTS classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- ex: 'CE2 B', '3ème A'
    cycle education_cycle NOT NULL, -- 'PRIMAIRE' ou 'SECONDAIRE'
    level VARCHAR(50) NOT NULL, -- Primaire: 'CI','CP','CE1','CE2','CM1','CM2' | Secondaire: '6ème'..'Tle'
    stream VARCHAR(50) DEFAULT 'Général', -- ex: 'Série A', 'Série C', 'Série D'
    size INTEGER NOT NULL DEFAULT 0,
    main_teacher_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ÉLÈVES & INSCRIPTIONS
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
    cycle education_cycle NOT NULL, -- Cycle rattaché
    parent_name VARCHAR(200),
    parent_phone VARCHAR(50),
    parent_email VARCHAR(150),
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_student_matricule_school UNIQUE (school_id, matricule)
);

-- 5. MATIÈRES & COEFFICIENTS (CONFIGURABLES SELON LE CYCLE ET LA CLASSE)
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

-- 6. AFFECTATION DES ENSEIGNANTS AUX CLASSES & MATIÈRES
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

-- =============================================================================
-- MODULE CYCLE PRIMAIRE : ÉVALUATION PAR COMPÉTENCES
-- =============================================================================

-- Domaines d'apprentissage (Français & Communication, Mathématiques, EST, ES...)
CREATE TABLE IF NOT EXISTS competency_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    code VARCHAR(30) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    order_num INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compétences disciplinaires ou transversales
CREATE TABLE IF NOT EXISTS competency_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES competency_domains(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_level VARCHAR(50) DEFAULT 'TOUS', -- CI, CP, CE1, CE2, CM1, CM2
    order_num INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Échelles d'acquisition (EXP, A, ECA, NA)
CREATE TABLE IF NOT EXISTS competency_level_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL, -- 'EXP', 'A', 'ECA', 'NA'
    label VARCHAR(100) NOT NULL, -- 'Expert / Dépassé', 'Acquis', etc.
    short_label VARCHAR(20) NOT NULL,
    badge_class VARCHAR(100) NOT NULL,
    is_acquired BOOLEAN NOT NULL DEFAULT FALSE,
    order_num INTEGER NOT NULL DEFAULT 0
);

-- Enregistrements d'évaluation par compétences (Cahier du maître du primaire)
CREATE TABLE IF NOT EXISTS competency_grade_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES competency_items(id) ON DELETE CASCADE,
    period_id UUID NOT NULL REFERENCES academic_periods(id) ON DELETE CASCADE,
    level_code VARCHAR(10) NOT NULL, -- 'EXP', 'A', 'ECA', 'NA'
    note_sur_10 NUMERIC(4,2), -- Note chiffrée optionnelle (0 à 10)
    teacher_observation TEXT,
    teacher_user_id UUID,
    assessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_student_competency_period UNIQUE (student_id, competency_id, period_id)
);

-- =============================================================================
-- MODULE CYCLE SECONDAIRE : CAHIER DE NOTES & FORMULES OFFICIELLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS grade_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    period_id UUID NOT NULL REFERENCES academic_periods(id) ON DELETE CASCADE,
    
    -- Interrogations écrites et orales
    interro1 NUMERIC(4,2),
    interro2 NUMERIC(4,2),
    interro3 NUMERIC(4,2),
    is_absent_interro1 BOOLEAN DEFAULT FALSE,
    is_absent_interro2 BOOLEAN DEFAULT FALSE,
    is_absent_interro3 BOOLEAN DEFAULT FALSE,
    
    -- Devoirs surveillés
    devoir1 NUMERIC(4,2),
    devoir2 NUMERIC(4,2),
    is_absent_devoir1 BOOLEAN DEFAULT FALSE,
    is_absent_devoir2 BOOLEAN DEFAULT FALSE,

    -- Note de conduite directe
    note_conduite NUMERIC(4,2),
    
    -- Calculs officiels stockés (cache)
    moy_interro NUMERIC(5,2),
    moy_sur_20 NUMERIC(5,2),
    note_coef NUMERIC(6,2),
    teacher_appreciation TEXT,
    
    status VARCHAR(30) NOT NULL DEFAULT 'BROUILLON', -- 'BROUILLON', 'SOUMIS', 'VERROUILLE'
    updated_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_student_subject_period UNIQUE (student_id, subject_id, period_id)
);

-- =============================================================================
-- SYNTHÈSES OFFICIELLES : BULLETINS SCOLAIRES & JOURNAL D'AUDIT
-- =============================================================================

CREATE TABLE IF NOT EXISTS official_bulletins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    period_id UUID NOT NULL REFERENCES academic_periods(id) ON DELETE CASCADE,
    year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    cycle education_cycle NOT NULL,
    
    -- Résultats Secondaire
    general_average NUMERIC(5,2),
    general_average_in_words TEXT,
    rank INTEGER,
    rank_formatted VARCHAR(20),
    total_coef NUMERIC(5,2),
    total_points NUMERIC(7,2),
    mention VARCHAR(50),
    decision_conseil TEXT,
    
    -- Résultats Primaire
    total_competencies INTEGER,
    acquired_count INTEGER,
    overall_acquisition_rate NUMERIC(5,2),
    average_note_sur_10 NUMERIC(4,2),
    
    -- Assiduité
    absences_count INTEGER DEFAULT 0,
    justified_absences_count INTEGER DEFAULT 0,
    lateness_count INTEGER DEFAULT 0,
    
    -- Appréciations officielles
    titulaire_appreciation TEXT,
    director_appreciation TEXT,
    
    -- Sécurisation & Authenticité
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

-- Journal d'audit pour traçabilité intégrale après publication
CREATE TABLE IF NOT EXISTS bulletin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bulletin_id UUID NOT NULL REFERENCES official_bulletins(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    author_user_id UUID NOT NULL,
    author_name VARCHAR(150) NOT NULL,
    author_role VARCHAR(50) NOT NULL, -- 'enseignant', 'censeur', 'directeur', 'admin'
    action VARCHAR(100) NOT NULL, -- 'CREATION', 'RECTIFICATION_NOTE', 'MODIFICATION_COEF', 'REPUBLICATION'
    subject_name VARCHAR(150),
    field_name VARCHAR(100),
    previous_value TEXT,
    new_value TEXT,
    reason TEXT NOT NULL
);

-- =============================================================================
-- POLITIQUES ROW LEVEL SECURITY (RLS) MULTI-ÉTABLISSEMENTS & RÔLES
-- =============================================================================

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

-- 1. Helper function pour récupérer l'établissement de l'utilisateur connecté
CREATE OR REPLACE FUNCTION get_user_school_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT school_id 
        FROM schools 
        WHERE owner_user_id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. RLS pour le personnel de l'école (Directeur, Censeur, Enseignants)
CREATE POLICY rls_school_staff_classrooms ON classrooms
    FOR ALL
    USING (
        school_id IN (
            SELECT id FROM schools WHERE owner_user_id = auth.uid()
            UNION
            SELECT school_id FROM teacher_class_assignments WHERE teacher_user_id = auth.uid()
        )
    );

CREATE POLICY rls_school_staff_students ON students
    FOR ALL
    USING (
        school_id IN (
            SELECT id FROM schools WHERE owner_user_id = auth.uid()
            UNION
            SELECT school_id FROM teacher_class_assignments WHERE teacher_user_id = auth.uid()
        )
    );

CREATE POLICY rls_school_staff_grades ON grade_records
    FOR ALL
    USING (
        school_id IN (
            SELECT id FROM schools WHERE owner_user_id = auth.uid()
            UNION
            SELECT school_id FROM teacher_class_assignments WHERE teacher_user_id = auth.uid()
        )
    );

CREATE POLICY rls_school_staff_competencies ON competency_grade_records
    FOR ALL
    USING (
        school_id IN (
            SELECT id FROM schools WHERE owner_user_id = auth.uid()
            UNION
            SELECT school_id FROM teacher_class_assignments WHERE teacher_user_id = auth.uid()
        )
    );

-- 3. RLS stricte pour les Parents : consultation UNIQUEMENT des bulletins PUBLIÉS de leurs propres enfants
CREATE POLICY rls_parents_published_bulletins ON official_bulletins
    FOR SELECT
    USING (
        status = 'PUBLIE'
        AND student_id IN (
            SELECT s.id 
            FROM students s
            JOIN parent_student_links psl ON psl.student_matricule = s.matricule AND psl.school_id = s.school_id
            WHERE psl.parent_user_id = auth.uid() 
              AND psl.status = 'AUTHORIZED'
        )
    );

-- 4. RLS pour le personnel sur les bulletins (préparation, vérification, publication)
CREATE POLICY rls_staff_official_bulletins ON official_bulletins
    FOR ALL
    USING (
        school_id IN (
            SELECT id FROM schools WHERE owner_user_id = auth.uid()
            UNION
            SELECT school_id FROM teacher_class_assignments WHERE teacher_user_id = auth.uid()
        )
    );

-- 5. Trigger d'interdiction de modification silencieuse post-publication
CREATE OR REPLACE FUNCTION enforce_bulletin_publication_audit()
RETURNS TRIGGER AS $$
BEGIN
    -- Si le bulletin est déjà publié et que des résultats changent
    IF OLD.status = 'PUBLIE' AND NEW.status = 'PUBLIE' THEN
        IF OLD.general_average IS DISTINCT FROM NEW.general_average 
           OR OLD.overall_acquisition_rate IS DISTINCT FROM NEW.overall_acquisition_rate THEN
            NEW.status := 'MODIFIE_APRES_PUBLICATION';
            NEW.version := OLD.version + 1;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bulletin_publication_audit ON official_bulletins;
CREATE TRIGGER trg_bulletin_publication_audit
    BEFORE UPDATE ON official_bulletins
    FOR EACH ROW
    EXECUTE FUNCTION enforce_bulletin_publication_audit();

-- =============================================================================
-- MIGRATION : GESTION DES CLASSES DU PRIMAIRE ET ATTRIBUTION DES MAÎTRES
-- Date : 2026-10-25
-- Description :
--   1. Horaires d'ouverture/fermeture et jours ouvrables par classe primaire.
--   2. Règle stricte d'un maître unique responsable par classe primaire par année.
--   3. Historique d'attribution des maîtres (traçabilité complète).
--   4. Gestion des matières autonomes par le maître responsable de classe primaire.
--   5. Préservation absolue des règles et du fonctionnement du secondaire.
-- =============================================================================

-- 1. Table classrooms : Ajout des colonnes horaires, jours ouvrables et maître primaire
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'classrooms') THEN
        -- Heure d'ouverture
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'classrooms' AND column_name = 'opening_time') THEN
            ALTER TABLE public.classrooms ADD COLUMN opening_time VARCHAR(10) DEFAULT '08:00';
        END IF;

        -- Heure de fermeture
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'classrooms' AND column_name = 'closing_time') THEN
            ALTER TABLE public.classrooms ADD COLUMN closing_time VARCHAR(10) DEFAULT '15:30';
        END IF;

        -- Jours ouvrables (Lundi à Dimanche)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'classrooms' AND column_name = 'working_days') THEN
            ALTER TABLE public.classrooms ADD COLUMN working_days TEXT[] DEFAULT ARRAY['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
        END IF;

        -- Année scolaire rattachée
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'classrooms' AND column_name = 'academic_year_id') THEN
            ALTER TABLE public.classrooms ADD COLUMN academic_year_id VARCHAR(50) DEFAULT '2026-2027';
        END IF;

        -- Maître responsable primaire
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'classrooms' AND column_name = 'primary_teacher_id') THEN
            ALTER TABLE public.classrooms ADD COLUMN primary_teacher_id UUID;
        END IF;
    END IF;
END $$;

-- 2. Table primary_class_assignment_history : Traçabilité des attributions et changements de maîtres
CREATE TABLE IF NOT EXISTS public.primary_class_assignment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    academic_year_id VARCHAR(50) NOT NULL DEFAULT '2026-2027',
    teacher_id UUID,
    teacher_name VARCHAR(150) NOT NULL,
    previous_teacher_id UUID,
    previous_teacher_name VARCHAR(150),
    assigned_by VARCHAR(150) NOT NULL DEFAULT 'Direction',
    reason TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activation RLS sur l'historique des maîtres
ALTER TABLE public.primary_class_assignment_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rls_primary_assignment_history_isolation ON public.primary_class_assignment_history;
CREATE POLICY rls_primary_assignment_history_isolation ON public.primary_class_assignment_history
    FOR ALL
    USING (
        school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        school_id = public.get_current_authenticated_school_id()
        OR auth.role() = 'service_role'
    );

-- 3. Table subjects : Ajout du lien vers la classe et le maître pour le cycle primaire
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subjects') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'subjects' AND column_name = 'class_id') THEN
            ALTER TABLE public.subjects ADD COLUMN class_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'subjects' AND column_name = 'teacher_id') THEN
            ALTER TABLE public.subjects ADD COLUMN teacher_id UUID;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'subjects' AND column_name = 'is_active') THEN
            ALTER TABLE public.subjects ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'subjects' AND column_name = 'academic_year_id') THEN
            ALTER TABLE public.subjects ADD COLUMN academic_year_id VARCHAR(50) DEFAULT '2026-2027';
        END IF;
    END IF;
END $$;

-- 4. Fonction de validation : Horaires cohérents et règle stricte d'un maître unique pour le primaire
CREATE OR REPLACE FUNCTION public.check_primary_classroom_rules()
RETURNS TRIGGER AS $$
DECLARE
    v_teacher_school_id UUID;
BEGIN
    -- Validation des horaires pour toutes les classes (fermeture strictement après ouverture)
    IF NEW.opening_time IS NOT NULL AND NEW.closing_time IS NOT NULL THEN
        IF NEW.closing_time <= NEW.opening_time THEN
            RAISE EXCEPTION 'Heure invalide : l''heure de fermeture (%) doit être strictement postérieure à l''heure d''ouverture (%).', NEW.closing_time, NEW.opening_time;
        END IF;
    END IF;

    -- Règles spécifiques exclusivement au cycle PRIMAIRE
    IF NEW.cycle = 'PRIMAIRE' THEN
        -- Vérification d'appartenance de l'enseignant à l'établissement s'il est spécifié
        IF NEW.primary_teacher_id IS NOT NULL THEN
            SELECT school_id INTO v_teacher_school_id
            FROM public.school_users
            WHERE id = NEW.primary_teacher_id;

            IF v_teacher_school_id IS NOT NULL AND v_teacher_school_id <> NEW.school_id THEN
                RAISE EXCEPTION 'Attribution refusée : le maître sélectionné n''appartient pas à cet établissement scolaire.';
            END IF;
        END IF;
    END IF;

    -- Traçabilité automatique dans l'historique lors d'un changement de maître
    IF TG_OP = 'UPDATE' AND NEW.cycle = 'PRIMAIRE' THEN
        IF (OLD.main_teacher_id IS DISTINCT FROM NEW.main_teacher_id) OR
           (OLD.primary_teacher_id IS DISTINCT FROM NEW.primary_teacher_id) THEN
            INSERT INTO public.primary_class_assignment_history (
                school_id,
                class_id,
                academic_year_id,
                teacher_id,
                teacher_name,
                previous_teacher_id,
                previous_teacher_name,
                assigned_by,
                reason
            ) VALUES (
                NEW.school_id,
                NEW.id,
                COALESCE(NEW.academic_year_id, '2026-2027'),
                NEW.primary_teacher_id,
                COALESCE(NEW.name, 'Maître'),
                OLD.primary_teacher_id,
                OLD.name,
                'Direction',
                'Mise à jour du maître responsable de classe primaire'
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_primary_classroom_rules ON public.classrooms;
CREATE TRIGGER trg_check_primary_classroom_rules
    BEFORE INSERT OR UPDATE ON public.classrooms
    FOR EACH ROW
    EXECUTE FUNCTION public.check_primary_classroom_rules();

-- 5. Permissions RLS sur subjects pour permettre au maître primaire de gérer ses matières
DROP POLICY IF EXISTS rls_primary_teacher_subjects_manage ON public.subjects;
CREATE POLICY rls_primary_teacher_subjects_manage ON public.subjects
    FOR ALL
    USING (
        -- Soit administrateur/directeur de l'école
        school_id = public.get_current_authenticated_school_id()
        -- Soit maître responsable de la classe primaire correspondante
        OR (
            class_id IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM public.classrooms c
                WHERE c.id = class_id
                  AND c.cycle = 'PRIMAIRE'
                  AND (c.primary_teacher_id = auth.uid() OR c.school_id = public.get_current_authenticated_school_id())
            )
        )
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        school_id = public.get_current_authenticated_school_id()
        OR (
            class_id IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM public.classrooms c
                WHERE c.id = class_id
                  AND c.cycle = 'PRIMAIRE'
                  AND (c.primary_teacher_id = auth.uid() OR c.school_id = public.get_current_authenticated_school_id())
            )
        )
        OR auth.role() = 'service_role'
    );

-- 6. Rechargement du schéma PostgREST
NOTIFY pgrst, 'reload schema';

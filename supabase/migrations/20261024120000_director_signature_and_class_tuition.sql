-- =============================================================================
-- MIGRATION : DIRECTEUR (NOM ET SIGNATURE) & SCOLARITÉ PAR CLASSE
-- Date : 2026-10-24
-- Description :
--   1. Ajout des colonnes director_name et director_signature_url sur la table schools.
--   2. Ajout de la colonne tuition_fee (montant scolarité en FCFA) sur la table classrooms.
--   3. Assouplissement de l'assignation du professeur principal (main_teacher_id facultatif).
--   4. Préservation stricte de l'historique financier et des paiements existants.
-- =============================================================================

-- 1. Table schools : Nom et signature du Directeur
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'schools') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'director_name') THEN
            ALTER TABLE public.schools ADD COLUMN director_name VARCHAR(255) DEFAULT 'Direction de l''Établissement';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'director_signature_url') THEN
            ALTER TABLE public.schools ADD COLUMN director_signature_url TEXT;
        END IF;
    END IF;
END $$;

-- 2. Table classrooms : Montant de scolarité par classe
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'classrooms') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'classrooms' AND column_name = 'tuition_fee') THEN
            ALTER TABLE public.classrooms ADD COLUMN tuition_fee INTEGER NOT NULL DEFAULT 0;
        END IF;

        -- Garantir que main_teacher_id est bien optionnel (nullable)
        ALTER TABLE public.classrooms ALTER COLUMN main_teacher_id DROP NOT NULL;
    END IF;
END $$;

-- 3. Mise à jour de la politique de modification sur classrooms pour le Directeur
DROP POLICY IF EXISTS rls_classrooms_update ON public.classrooms;
CREATE POLICY rls_classrooms_update ON public.classrooms
    FOR UPDATE
    USING (
        school_id IN (SELECT id FROM public.schools WHERE owner_user_id = auth.uid())
        OR public.get_current_authenticated_school_id() = school_id
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS rls_classrooms_insert ON public.classrooms;
CREATE POLICY rls_classrooms_insert ON public.classrooms
    FOR INSERT
    WITH CHECK (
        school_id IN (SELECT id FROM public.schools WHERE owner_user_id = auth.uid())
        OR public.get_current_authenticated_school_id() = school_id
        OR auth.role() = 'service_role'
    );

-- 4. Rafraîchissement immédiat du cache de l'API Supabase PostgREST
NOTIFY pgrst, 'reload schema';

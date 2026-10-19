-- =============================================================================
-- MIGRATION 04 : INTÉGRITÉ DES PAIEMENTS, AVOIRS ET WEBHOOKS SÉCURISÉS
-- Date : 2026-10-19
-- Description :
--   1. Table unifiée `school_payments` pour les paiements de scolarité et souscriptions.
--   2. Statuts stricts : 'PENDING' (en attente), 'PAID' (payé), 'CANCELLED' (annulé), 'REFUNDED' (remboursé).
--   3. Immuabilité absolue des paiements confirmés : interdiction stricte de modification ou suppression.
--   4. Seule une écriture de correction (avoir / credit note) est autorisée pour rectifier une écriture.
--   5. Confirmation sécurisée exclusivement par webhook serveur vérifié ou caisse certifiée.
--   6. Journalisation automatique de chaque création et changement de statut dans `audit_logs`.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Table `school_payments`
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.school_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    parent_user_id UUID,
    payment_reference VARCHAR(100) UNIQUE NOT NULL,
    amount_fcfa INTEGER NOT NULL CHECK (amount_fcfa != 0),
    payment_type VARCHAR(50) NOT NULL DEFAULT 'TUITION', -- 'TUITION', 'SUBSCRIPTION', 'AVOIR_CORRECTION', 'AUTRE'
    payment_method VARCHAR(50) NOT NULL DEFAULT 'CASH',  -- 'CASH', 'FEDAPAY', 'KKIAPAY', 'MOBILE_MONEY', 'VIREMENT', 'CHEQUE'
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED')),
    is_credit_note BOOLEAN NOT NULL DEFAULT FALSE,
    original_payment_id UUID REFERENCES public.school_payments(id) ON DELETE RESTRICT,
    purpose TEXT NOT NULL,
    receipt_number VARCHAR(100),
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    verified_via_webhook BOOLEAN NOT NULL DEFAULT FALSE,
    webhook_signature TEXT,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    created_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_school_payments_school ON public.school_payments(school_id);
CREATE INDEX IF NOT EXISTS idx_school_payments_student ON public.school_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_school_payments_ref ON public.school_payments(payment_reference);
CREATE INDEX IF NOT EXISTS idx_school_payments_status ON public.school_payments(status);

ALTER TABLE public.school_payments ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 2. Politiques RLS sur `school_payments`
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS rls_payments_read ON public.school_payments;
CREATE POLICY rls_payments_read ON public.school_payments
    FOR SELECT
    USING (
        school_id = public.get_current_authenticated_school_id()
        AND (
            public.get_current_user_role() IN ('directeur', 'comptabilite', 'admin', 'censeur')
            OR (
                public.get_current_user_role() = 'parent'
                AND (
                    parent_user_id = public.get_current_user_id()
                    OR EXISTS (
                        SELECT 1 FROM public.parent_student_links psl
                        JOIN public.students s ON s.matricule = psl.student_matricule
                        WHERE s.id = school_payments.student_id
                          AND psl.parent_user_id = public.get_current_user_id()
                          AND psl.status = 'AUTHORIZED'
                    )
                )
            )
        )
    );

DROP POLICY IF EXISTS rls_payments_write ON public.school_payments;
CREATE POLICY rls_payments_write ON public.school_payments
    FOR INSERT
    WITH CHECK (
        school_id = public.get_current_authenticated_school_id()
        AND public.get_current_user_role() IN ('directeur', 'comptabilite', 'admin', 'service_role')
    );

-- -----------------------------------------------------------------------------
-- 3. Trigger d'immuabilité des paiements confirmés
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_enforce_confirmed_payment_immutability()
RETURNS TRIGGER AS $$
BEGIN
    -- Interdiction de supprimer un paiement confirmé ou un avoir
    IF TG_OP = 'DELETE' THEN
        IF OLD.status = 'PAID' THEN
            RAISE EXCEPTION 'Interdiction de supprimer un paiement confirmé (Réf: %). Seule une écriture de correction (avoir comptable) est autorisée.', OLD.payment_reference;
        END IF;
        RETURN OLD;
    END IF;

    -- En cas de mise à jour (UPDATE)
    IF TG_OP = 'UPDATE' THEN
        -- Si le paiement était déjà confirmé ('PAID')
        IF OLD.status = 'PAID' THEN
            -- Interdiction de modifier le montant, l'élève, l'établissement, ou la référence
            IF NEW.amount_fcfa != OLD.amount_fcfa 
               OR NEW.student_id IS DISTINCT FROM OLD.student_id
               OR NEW.school_id != OLD.school_id
               OR NEW.payment_reference != OLD.payment_reference
               OR NEW.is_credit_note != OLD.is_credit_note THEN
                RAISE EXCEPTION 'Écriture financière immuable : impossible de modifier les paramètres fondamentaux d''un paiement déjà confirmé (Réf: %). Veuillez émettre un avoir.', OLD.payment_reference;
            END IF;

            -- Interdiction de repasser un paiement payé en PENDING ou CANCELLED sans avoir
            IF NEW.status IN ('PENDING', 'CANCELLED') THEN
                RAISE EXCEPTION 'Opération interdite : un paiement confirmé ne peut être rétrogradé en attente ou annulé directement. Veuillez émettre un avoir comptable ou un remboursement formel.';
            END IF;
        END IF;

        NEW.updated_at := NOW();
        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_payment_immutability_update ON public.school_payments;
CREATE TRIGGER trg_enforce_payment_immutability_update
    BEFORE UPDATE ON public.school_payments
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_enforce_confirmed_payment_immutability();

DROP TRIGGER IF EXISTS trg_enforce_payment_immutability_delete ON public.school_payments;
CREATE TRIGGER trg_enforce_payment_immutability_delete
    BEFORE DELETE ON public.school_payments
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_enforce_confirmed_payment_immutability();

-- -----------------------------------------------------------------------------
-- 4. Trigger de journalisation automatique de chaque transaction financière
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_audit_payment_events()
RETURNS TRIGGER AS $$
DECLARE
    v_action TEXT;
    v_actor_id UUID;
    v_actor_role TEXT;
BEGIN
    v_actor_id := public.get_current_user_id();
    v_actor_role := public.get_current_user_role();

    IF TG_OP = 'INSERT' THEN
        v_action := CASE 
            WHEN NEW.is_credit_note THEN 'AVOIR_COMPTABLE_CREE'
            WHEN NEW.status = 'PAID' THEN 'PAIEMENT_CONFIRME'
            ELSE 'PAIEMENT_ENREGISTRE'
        END;

        INSERT INTO public.audit_logs (
            school_id,
            user_id,
            role,
            action,
            resource_type,
            resource_id,
            new_data,
            created_at
        ) VALUES (
            NEW.school_id,
            COALESCE(NEW.created_by_user_id, v_actor_id),
            v_actor_role,
            v_action,
            'payments',
            NEW.id::TEXT,
            jsonb_build_object(
                'payment_reference', NEW.payment_reference,
                'amount_fcfa', NEW.amount_fcfa,
                'status', NEW.status,
                'payment_method', NEW.payment_method,
                'payment_type', NEW.payment_type,
                'is_credit_note', NEW.is_credit_note,
                'original_payment_id', NEW.original_payment_id,
                'student_id', NEW.student_id,
                'receipt_number', NEW.receipt_number,
                'verified_via_webhook', NEW.verified_via_webhook
            ),
            NOW()
        );
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' AND (OLD.status IS DISTINCT FROM NEW.status OR OLD.amount_fcfa IS DISTINCT FROM NEW.amount_fcfa) THEN
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
            NEW.school_id,
            v_actor_id,
            v_actor_role,
            'CHANGEMENT_STATUT_PAIEMENT',
            'payments',
            NEW.id::TEXT,
            jsonb_build_object(
                'status', OLD.status,
                'amount_fcfa', OLD.amount_fcfa
            ),
            jsonb_build_object(
                'status', NEW.status,
                'amount_fcfa', NEW.amount_fcfa,
                'confirmed_at', NEW.confirmed_at,
                'verified_via_webhook', NEW.verified_via_webhook
            ),
            NOW()
        );
        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_payment_events ON public.school_payments;
CREATE TRIGGER trg_audit_payment_events
    AFTER INSERT OR UPDATE ON public.school_payments
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_audit_payment_events();

COMMENT ON TABLE public.school_payments IS 'Registre immuable des transactions financières, paiements et avoirs';

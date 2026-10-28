-- Official Receipts (OR): one row per registration payment. The CR describes the vehicle,
-- the OR proves a payment, so a vehicle accumulates many ORs over time.
CREATE TABLE IF NOT EXISTS public.vehicle_official_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES public.registered_vehicles (id) ON DELETE CASCADE,
    or_number TEXT NOT NULL UNIQUE,
    transaction_type TEXT NOT NULL DEFAULT 'Renewal'
        CHECK (transaction_type IN ('Initial Registration', 'Renewal', 'Transfer of Ownership', 'Replacement')),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payor_name TEXT NOT NULL,
    registration_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (registration_fee >= 0),
    plate_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (plate_fee >= 0),
    mvuc_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (mvuc_fee >= 0),
    penalty_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (penalty_fee >= 0),
    other_fees NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (other_fees >= 0),
    total_amount NUMERIC(10, 2) GENERATED ALWAYS AS
        (registration_fee + plate_fee + mvuc_fee + penalty_fee + other_fees) STORED,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (valid_until > valid_from)
);

CREATE INDEX IF NOT EXISTS vehicle_official_receipts_vehicle_id_idx
    ON public.vehicle_official_receipts (vehicle_id, valid_until DESC);

-- A vehicle is registered until its latest OR runs out, so no expiry is typed in by hand
ALTER TABLE public.registered_vehicles ALTER COLUMN registration_expiry DROP NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_vehicle_registration_expiry()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.registered_vehicles
  SET registration_expiry = (
        SELECT MAX(valid_until)
        FROM public.vehicle_official_receipts
        WHERE vehicle_id = COALESCE(NEW.vehicle_id, OLD.vehicle_id)
      ),
      updated_at = NOW()
  WHERE id = COALESCE(NEW.vehicle_id, OLD.vehicle_id);
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS vehicle_official_receipts_sync_expiry ON public.vehicle_official_receipts;
CREATE TRIGGER vehicle_official_receipts_sync_expiry
AFTER INSERT OR UPDATE OR DELETE ON public.vehicle_official_receipts
FOR EACH ROW EXECUTE FUNCTION public.sync_vehicle_registration_expiry();

ALTER TABLE public.vehicle_official_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and superadmins can view all official receipts"
ON public.vehicle_official_receipts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = (select auth.uid())
      AND profiles.role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admins and superadmins can insert official receipts"
ON public.vehicle_official_receipts
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = (select auth.uid())
      AND profiles.role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admins and superadmins can update official receipts"
ON public.vehicle_official_receipts
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = (select auth.uid())
      AND profiles.role IN ('admin', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = (select auth.uid())
      AND profiles.role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admins and superadmins can delete official receipts"
ON public.vehicle_official_receipts
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = (select auth.uid())
      AND profiles.role IN ('admin', 'superadmin')
  )
);

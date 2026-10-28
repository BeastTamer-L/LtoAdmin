-- Align registered_vehicles with the LTO Certificate of Registration (CR)

-- Make and series are separate fields on the CR
ALTER TABLE public.registered_vehicles RENAME COLUMN make_model TO make;
ALTER TABLE public.registered_vehicles ADD COLUMN IF NOT EXISTS series TEXT;

ALTER TABLE public.registered_vehicles
    ADD COLUMN IF NOT EXISTS cr_number TEXT,
    ADD COLUMN IF NOT EXISTS body_type TEXT,
    ADD COLUMN IF NOT EXISTS fuel_type TEXT,
    ADD COLUMN IF NOT EXISTS piston_displacement INTEGER CHECK (piston_displacement > 0),
    ADD COLUMN IF NOT EXISTS number_of_cylinders INTEGER CHECK (number_of_cylinders > 0),
    ADD COLUMN IF NOT EXISTS gross_weight_kg NUMERIC(8, 1) CHECK (gross_weight_kg >= 0),
    ADD COLUMN IF NOT EXISTS net_weight_kg NUMERIC(8, 1) CHECK (net_weight_kg >= 0),
    ADD COLUMN IF NOT EXISTS net_capacity_kg NUMERIC(8, 1) CHECK (net_capacity_kg >= 0),
    ADD COLUMN IF NOT EXISTS owner_name TEXT,
    ADD COLUMN IF NOT EXISTS owner_address TEXT;

ALTER TABLE public.registered_vehicles
    ADD CONSTRAINT registered_vehicles_cr_number_key UNIQUE (cr_number),
    ADD CONSTRAINT registered_vehicles_fuel_type_check
        CHECK (fuel_type IN ('Gasoline', 'Diesel', 'LPG', 'Electric', 'Hybrid'));

-- The CR names the registered owner, so backfill it for any existing rows
UPDATE public.registered_vehicles v
SET owner_name = COALESCE(
        (SELECT concat_ws(' ', l.first_name, l.middle_name, l.last_name)
         FROM public.driver_licenses l
         WHERE l.license_number = v.owner_license_number),
        'UNKNOWN'
    )
WHERE v.owner_name IS NULL;

ALTER TABLE public.registered_vehicles ALTER COLUMN owner_name SET NOT NULL;

-- CR classifications
ALTER TABLE public.registered_vehicles DROP CONSTRAINT IF EXISTS registered_vehicles_classification_check;
UPDATE public.registered_vehicles
SET classification = 'For Hire'
WHERE classification IN ('Commercial', 'Public Utility');
ALTER TABLE public.registered_vehicles
    ADD CONSTRAINT registered_vehicles_classification_check
        CHECK (classification IN ('Private', 'For Hire', 'Government', 'Diplomatic'));

-- Franchise stays for the For Hire case; the CR's "encumbered to" replaces encumbrance
ALTER TABLE public.registered_vehicles RENAME COLUMN encumbrance TO encumbered_to;

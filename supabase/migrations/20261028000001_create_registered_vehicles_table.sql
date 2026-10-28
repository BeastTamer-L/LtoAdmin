-- Registered vehicle records shown on the Vehicle Database page
CREATE TABLE IF NOT EXISTS public.registered_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plate_number TEXT NOT NULL UNIQUE,
    mv_file_number TEXT NOT NULL UNIQUE,
    make_model TEXT NOT NULL,
    color TEXT,
    year_model INTEGER CHECK (year_model BETWEEN 1900 AND 2100),
    classification TEXT NOT NULL DEFAULT 'Private'
        CHECK (classification IN ('Private', 'Commercial', 'Government', 'Public Utility')),
    -- Expired is not stored: it is derived from registration_expiry
    status TEXT NOT NULL DEFAULT 'Valid'
        CHECK (status IN ('Valid', 'Suspended')),
    engine_number TEXT,
    chassis_number TEXT,
    registered_at DATE NOT NULL DEFAULT CURRENT_DATE,
    registration_expiry DATE NOT NULL,
    owner_license_number TEXT
        REFERENCES public.driver_licenses (license_number)
        ON UPDATE CASCADE ON DELETE SET NULL,
    tpl_insurance TEXT,
    franchise TEXT,
    lto_district_office TEXT,
    encumbrance TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS registered_vehicles_owner_license_number_idx
    ON public.registered_vehicles (owner_license_number);

ALTER TABLE public.registered_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and superadmins can view all registered vehicles"
ON public.registered_vehicles
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

CREATE POLICY "Admins and superadmins can insert registered vehicles"
ON public.registered_vehicles
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

CREATE POLICY "Admins and superadmins can update registered vehicles"
ON public.registered_vehicles
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

CREATE POLICY "Admins and superadmins can delete registered vehicles"
ON public.registered_vehicles
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

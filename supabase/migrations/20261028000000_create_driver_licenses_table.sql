-- Driver license records shown on the License Database page
CREATE TABLE IF NOT EXISTS public.driver_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_number TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    expiration_date DATE NOT NULL,
    license_class TEXT NOT NULL DEFAULT 'Non-Professional'
        CHECK (license_class IN ('Professional', 'Non-Professional')),
    -- Expired is not stored: it is derived from expiration_date
    status TEXT NOT NULL DEFAULT 'Active'
        CHECK (status IN ('Active', 'Suspended', 'Revoked')),
    demerit_points INTEGER NOT NULL DEFAULT 0 CHECK (demerit_points >= 0),
    restriction_codes TEXT[] NOT NULL DEFAULT '{}',
    conditions TEXT,
    organ_donor BOOLEAN NOT NULL DEFAULT FALSE,
    nationality TEXT NOT NULL DEFAULT 'PHL',
    sex TEXT CHECK (sex IN ('M', 'F')),
    weight_kg NUMERIC(5, 1),
    height_cm NUMERIC(5, 1),
    blood_type TEXT,
    eye_color TEXT,
    agency_code TEXT,
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_address TEXT,
    emergency_contact_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS driver_licenses_expiration_date_idx
    ON public.driver_licenses (expiration_date);

ALTER TABLE public.driver_licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and superadmins can view all driver licenses"
ON public.driver_licenses
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

CREATE POLICY "Admins and superadmins can insert driver licenses"
ON public.driver_licenses
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

CREATE POLICY "Admins and superadmins can update driver licenses"
ON public.driver_licenses
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

CREATE POLICY "Admins and superadmins can delete driver licenses"
ON public.driver_licenses
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

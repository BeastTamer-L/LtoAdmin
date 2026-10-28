-- Align driver_licenses with the printed LTO driver's license card

-- The card gives height in meters (e.g. 1.65), not centimeters
ALTER TABLE public.driver_licenses
    ALTER COLUMN height_cm TYPE NUMERIC(3, 2) USING height_cm / 100;
ALTER TABLE public.driver_licenses RENAME COLUMN height_cm TO height_m;
ALTER TABLE public.driver_licenses
    ADD CONSTRAINT driver_licenses_height_m_check CHECK (height_m > 0 AND height_m < 3);

-- Printed on the card
ALTER TABLE public.driver_licenses
    ADD COLUMN IF NOT EXISTS serial_number TEXT,
    ADD COLUMN IF NOT EXISTS date_issued DATE;

ALTER TABLE public.driver_licenses
    ADD CONSTRAINT driver_licenses_serial_number_key UNIQUE (serial_number);

-- Only real DL codes can be stored
ALTER TABLE public.driver_licenses
    ADD CONSTRAINT driver_licenses_restriction_codes_check
        CHECK (restriction_codes <@ ARRAY['A', 'A1', 'B', 'B1', 'B2', 'C', 'D', 'BE', 'CE']::TEXT[]);

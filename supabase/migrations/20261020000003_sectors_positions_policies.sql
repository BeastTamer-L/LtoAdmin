-- Enable RLS on sectors table
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;

-- Allow admins and superadmins to view all sectors
CREATE POLICY "Admins and superadmins can view all sectors"
ON sectors
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

-- Allow admins and superadmins to insert sectors
CREATE POLICY "Admins and superadmins can insert sectors"
ON sectors
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

-- Allow admins and superadmins to update sectors
CREATE POLICY "Admins and superadmins can update sectors"
ON sectors
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

-- Allow admins and superadmins to delete sectors
CREATE POLICY "Admins and superadmins can delete sectors"
ON sectors
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

-- Enable RLS on positions table
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

-- Allow admins and superadmins to view all positions
CREATE POLICY "Admins and superadmins can view all positions"
ON positions
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

-- Allow admins and superadmins to insert positions
CREATE POLICY "Admins and superadmins can insert positions"
ON positions
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

-- Allow admins and superadmins to update positions
CREATE POLICY "Admins and superadmins can update positions"
ON positions
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

-- Allow admins and superadmins to delete positions
CREATE POLICY "Admins and superadmins can delete positions"
ON positions
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

-- Allow admins and superadmins to change a ticket's status (settle it, or suspend it after 15 days)
DROP POLICY IF EXISTS "Admins and superadmins can update ticket status" ON public.traffic_tickets;

CREATE POLICY "Admins and superadmins can update ticket status"
ON public.traffic_tickets
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

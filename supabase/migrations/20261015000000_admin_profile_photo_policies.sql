create policy "Active admins can view profile photos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'profile-photos'
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.is_active is true
      and profiles.role in ('admin', 'superadmin')
  )
);

create policy "Active admins can upload profile photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-photos'
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.is_active is true
      and profiles.role in ('admin', 'superadmin')
  )
);

create policy "Active admins can update profile photos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-photos'
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.is_active is true
      and profiles.role in ('admin', 'superadmin')
  )
)
with check (
  bucket_id = 'profile-photos'
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.is_active is true
      and profiles.role in ('admin', 'superadmin')
  )
);

create policy "Active admins can delete profile photos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-photos'
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.is_active is true
      and profiles.role in ('admin', 'superadmin')
  )
);
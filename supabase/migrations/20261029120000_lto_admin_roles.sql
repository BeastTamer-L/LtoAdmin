-- LTO admin accounts: two new roles in public.profiles, lto_admin and lto_superadmin.
-- The LTO admin site (LtoAdmin) lets in only these two; the PSTDM admin (TraffiCamAdminSIde) keeps admin / superadmin.
--
-- 1. profiles_new_role_check: the four roles it had (read from the database on 2026-10-29: superadmin, admin, staff,
--    enforcer) plus lto_admin and lto_superadmin. profiles.role is character varying.
-- 2. The row security rules the LTO admin pages need (those whose role list holds 'superadmin') also accept the LTO
--    roles: licenses, vehicles, official receipts, tickets (read + settle), portal drivers, violation types, the ticket
--    files bucket, and reading profiles (enforcer names). On profiles only the read rules change: an LTO admin cannot
--    create or edit staff accounts. Each changed rule is listed in the output (NOTICE).
-- Safe to run twice.

-- ------------------------------------------------------------------------------------------------ 1. the role check
alter table public.profiles drop constraint if exists profiles_new_role_check;
alter table public.profiles add constraint profiles_new_role_check
    check ((role)::text = any (array['superadmin', 'admin', 'staff', 'enforcer', 'lto_admin', 'lto_superadmin']::text[]));

-- ------------------------------------------------------------------------------------------------ 2. row security
-- In a rule, "role in ('admin', 'superadmin')" is stored as  ARRAY['admin'::character varying, 'superadmin'::...]
-- (or ::text). The two LTO roles are added to every such list, with the same cast.
do $$
declare
    pol record;
    pattern constant text := '(ARRAY\[[^]]*''superadmin''::(text|character varying)[^]]*)\]';
    addition constant text := '\1, ''lto_admin''::\2, ''lto_superadmin''::\2]';
    new_qual text;
    new_check text;
    statement text;
    changed integer := 0;
begin
    for pol in
        select schemaname, tablename, policyname, cmd, qual, with_check
        from pg_policies
        where (
                (schemaname = 'public' and tablename in (
                    'driver_licenses', 'registered_vehicles', 'vehicle_official_receipts', 'traffic_tickets',
                    'portal_profiles', 'violation_types'))
             or (schemaname = 'public' and tablename = 'profiles' and cmd = 'SELECT')
             or (schemaname = 'storage' and tablename = 'objects' and coalesce(qual, '') like '%ticket-files%')
              )
          and (coalesce(qual, '') || coalesce(with_check, '')) like '%superadmin%'
          and (coalesce(qual, '') || coalesce(with_check, '')) not like '%lto_admin%'
    loop
        new_qual := regexp_replace(pol.qual, pattern, addition, 'g');
        new_check := regexp_replace(pol.with_check, pattern, addition, 'g');

        if new_qual is not distinct from pol.qual and new_check is not distinct from pol.with_check then
            raise notice 'left as it is (role list written another way): %.% "%"', pol.schemaname, pol.tablename, pol.policyname;
            continue;
        end if;

        statement := format('alter policy %I on %I.%I', pol.policyname, pol.schemaname, pol.tablename);
        if new_qual is not null then
            statement := statement || format(' using (%s)', new_qual);
        end if;
        if new_check is not null then
            statement := statement || format(' with check (%s)', new_check);
        end if;
        execute statement;
        changed := changed + 1;
        raise notice 'LTO roles added: %.% "%" (%)', pol.schemaname, pol.tablename, pol.policyname, pol.cmd;
    end loop;
    raise notice '% rules now accept lto_admin / lto_superadmin', changed;
end;
$$;

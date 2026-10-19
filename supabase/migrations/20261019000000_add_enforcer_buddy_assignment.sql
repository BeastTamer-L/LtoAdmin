alter table public.profiles
  add column if not exists buddy_id uuid
  references public.profiles(id)
  on delete set null;

create or replace function public.validate_enforcer_buddy_assignment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.buddy_id is null then
    return new;
  end if;

  if new.buddy_id = new.id then
    raise exception 'An enforcer cannot be assigned as their own buddy.'
      using errcode = '23514';
  end if;

  if not exists (
    select 1
    from public.profiles buddy
    where buddy.id = new.buddy_id
      and buddy.role = 'enforcer'
  ) then
    raise exception 'Buddy assignment must reference an existing enforcer.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_validate_buddy_assignment on public.profiles;

create trigger profiles_validate_buddy_assignment
before insert or update of buddy_id on public.profiles
for each row
execute function public.validate_enforcer_buddy_assignment();
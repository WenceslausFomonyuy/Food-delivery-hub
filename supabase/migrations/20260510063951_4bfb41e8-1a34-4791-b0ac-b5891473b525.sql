
-- Revoke execute on trigger-only functions; triggers still work as table owner
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- Set search_path on set_updated_at (handle_new_user already has it)
create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

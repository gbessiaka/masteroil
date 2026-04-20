-- Table profiles liée aux utilisateurs Supabase Auth
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  role text not null check (role in ('super_admin', 'gestionnaire', 'commercial')),
  active boolean default true,
  created_at timestamptz default now()
);

-- Activer RLS
alter table public.profiles enable row level security;

-- Les admins connectés peuvent lire tous les profils
create policy "Authenticated can read profiles"
  on public.profiles for select
  to authenticated
  using (true);

-- Seul le service_role (API) peut écrire
create policy "Service role can manage profiles"
  on public.profiles for all
  to service_role
  using (true);


-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- MENU ITEMS
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  category text not null,
  popular boolean not null default false,
  available boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.menu_items enable row level security;
create policy "menu_items_public_read" on public.menu_items for select using (true);

-- ORDERS
create type public.order_status as enum ('pending','confirmed','preparing','ready','completed','cancelled');
create type public.fulfillment_type as enum ('pickup','delivery');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status public.order_status not null default 'pending',
  fulfillment public.fulfillment_type not null default 'pickup',
  customer_name text not null,
  phone text not null,
  address text,
  notes text,
  total numeric(10,2) not null check (total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.orders enable row level security;

create policy "orders_select_own" on public.orders for select using (auth.uid() = user_id);
create policy "orders_insert_own" on public.orders for insert with check (auth.uid() = user_id);
create policy "orders_update_own_pending" on public.orders for update
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id);

create trigger orders_set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- ORDER ITEMS
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  name text not null,
  price numeric(10,2) not null,
  quantity int not null check (quantity > 0),
  created_at timestamptz not null default now()
);
alter table public.order_items enable row level security;

create policy "order_items_select_own" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "order_items_insert_own" on public.order_items for insert
  with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "order_items_update_own_pending" on public.order_items for update
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid() and o.status = 'pending'));
create policy "order_items_delete_own_pending" on public.order_items for delete
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid() and o.status = 'pending'));

-- REVIEWS
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 3 and 1000),
  author_name text not null,
  created_at timestamptz not null default now()
);
alter table public.reviews enable row level security;

create policy "reviews_public_read" on public.reviews for select using (true);
create policy "reviews_insert_own" on public.reviews for insert with check (auth.uid() = user_id);
create policy "reviews_update_own" on public.reviews for update using (auth.uid() = user_id);
create policy "reviews_delete_own" on public.reviews for delete using (auth.uid() = user_id);

create index reviews_created_at_idx on public.reviews(created_at desc);
create index orders_user_created_idx on public.orders(user_id, created_at desc);

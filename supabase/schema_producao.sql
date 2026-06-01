
-- REIM EVENTOS - SUPABASE BACKEND REAL V1
create extension if not exists "uuid-ossp";

do $$ begin
  create type user_role as enum ('cliente','fornecedor','admin','super_admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type supplier_status as enum ('pendente_perfil','ativo','bloqueado','vencido');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum ('pendente','ativa','vencida','cancelada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type quote_status as enum ('enviado','respondido','fechado','cancelado');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'cliente',
  full_name text not null,
  email text,
  whatsapp text,
  city text,
  state text default 'BA',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  icon text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.suppliers (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id),
  business_name text not null,
  description text,
  city text not null,
  state text default 'BA',
  whatsapp text,
  instagram text,
  website text,
  average_price text,
  status supplier_status default 'pendente_perfil',
  is_featured boolean default false,
  featured_until timestamptz,
  rating_average numeric(3,2) default 0,
  rating_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.media (
  id uuid primary key default uuid_generate_v4(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('foto','video')),
  file_url text not null,
  is_cover boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price_cents integer not null,
  duration_days integer not null,
  description text,
  annual_adjustment text default 'Reajuste anual mediante aviso prévio',
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  status subscription_status default 'pendente',
  starts_at timestamptz,
  ends_at timestamptz,
  payment_provider text,
  payment_reference text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  event_name text not null,
  event_type text,
  event_date date,
  city text,
  state text default 'BA',
  guest_count integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.event_items (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  category_id uuid references public.categories(id),
  status text default 'analisando' check (status in ('analisando','escolhido','contratado','removido')),
  created_at timestamptz default now(),
  unique(event_id, supplier_id)
);

create table if not exists public.quotes (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  message text,
  status quote_status default 'enviado',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  attendance integer check (attendance between 1 and 5),
  punctuality integer check (punctuality between 1 and 5),
  quality integer check (quality between 1 and 5),
  value_score integer check (value_score between 1 and 5),
  comment text,
  supplier_reply text,
  created_at timestamptz default now(),
  unique(client_id, supplier_id, event_id)
);

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  is_read boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.admin_logs (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_table text,
  target_id uuid,
  details jsonb,
  created_at timestamptz default now()
);

create table if not exists public.moderation_reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid references public.profiles(id) on delete set null,
  supplier_id uuid references public.suppliers(id) on delete cascade,
  reason text not null,
  status text default 'aberto' check (status in ('aberto','em_analise','resolvido','ignorado')),
  created_at timestamptz default now()
);

insert into public.categories (name, slug, icon) values
('Fotografia e Filmagem','fotografia-e-filmagem','camera'),
('Buffet','buffet','utensils'),
('Cabine e Totem de Fotos','cabine-e-totem-de-fotos','camera'),
('Decoração','decoracao','sparkles'),
('Cerimonialistas','cerimonialistas','gem'),
('Bolo, Doces e Salgados','bolo-doces-salgados','cake'),
('Bandas & Músicos','bandas-musicos','music'),
('Maquiagem e Beleza','maquiagem-e-beleza','sparkles')
on conflict (slug) do nothing;

insert into public.plans (name, price_cents, duration_days, description) values
('Mensal', 2990, 30, 'Vitrine ativa por 30 dias'),
('Trimestral', 6990, 90, 'Vitrine ativa por 90 dias'),
('Anual', 19700, 365, 'Vitrine ativa por 1 ano')
on conflict do nothing;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.suppliers enable row level security;
alter table public.media enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.events enable row level security;
alter table public.event_items enable row level security;
alter table public.quotes enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.admin_logs enable row level security;
alter table public.moderation_reports enable row level security;

create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin'));
$$;

drop policy if exists "categories_public" on public.categories;
create policy "categories_public" on public.categories for select using (true);

drop policy if exists "plans_public" on public.plans;
create policy "plans_public" on public.plans for select using (is_active = true);

drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own" on public.profiles for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

drop policy if exists "suppliers_public_active" on public.suppliers;
create policy "suppliers_public_active" on public.suppliers for select using (status = 'ativo' or owner_id = auth.uid() or public.is_admin());

drop policy if exists "suppliers_owner_insert" on public.suppliers;
create policy "suppliers_owner_insert" on public.suppliers for insert with check (auth.uid() = owner_id);

drop policy if exists "suppliers_owner_update" on public.suppliers;
create policy "suppliers_owner_update" on public.suppliers for update using (auth.uid() = owner_id or public.is_admin());

drop policy if exists "media_public" on public.media;
create policy "media_public" on public.media for select using (
 exists(select 1 from public.suppliers s where s.id=media.supplier_id and (s.status='ativo' or s.owner_id=auth.uid() or public.is_admin()))
);

drop policy if exists "media_owner_all" on public.media;
create policy "media_owner_all" on public.media for all using (auth.uid() = owner_id or public.is_admin()) with check (auth.uid() = owner_id or public.is_admin());

drop policy if exists "subscriptions_owner_admin" on public.subscriptions;
create policy "subscriptions_owner_admin" on public.subscriptions for select using (
 public.is_admin() or exists(select 1 from public.suppliers s where s.id=subscriptions.supplier_id and s.owner_id=auth.uid())
);

drop policy if exists "events_owner_all" on public.events;
create policy "events_owner_all" on public.events for all using (auth.uid() = client_id or public.is_admin()) with check (auth.uid() = client_id or public.is_admin());

drop policy if exists "event_items_owner" on public.event_items;
create policy "event_items_owner" on public.event_items for all using (
 public.is_admin() or exists(select 1 from public.events e where e.id=event_items.event_id and e.client_id=auth.uid())
);

drop policy if exists "quotes_participants" on public.quotes;
create policy "quotes_participants" on public.quotes for select using (
 public.is_admin() or auth.uid()=client_id or exists(select 1 from public.suppliers s where s.id=quotes.supplier_id and s.owner_id=auth.uid())
);

drop policy if exists "quotes_client_insert" on public.quotes;
create policy "quotes_client_insert" on public.quotes for insert with check (auth.uid()=client_id);

drop policy if exists "quotes_participant_update" on public.quotes;
create policy "quotes_participant_update" on public.quotes for update using (
 public.is_admin() or auth.uid()=client_id or exists(select 1 from public.suppliers s where s.id=quotes.supplier_id and s.owner_id=auth.uid())
);

drop policy if exists "messages_participants" on public.messages;
create policy "messages_participants" on public.messages for select using (
 public.is_admin() or exists (
  select 1 from public.quotes q join public.suppliers s on s.id=q.supplier_id
  where q.id=messages.quote_id and (q.client_id=auth.uid() or s.owner_id=auth.uid())
 )
);

drop policy if exists "messages_sender_insert" on public.messages;
create policy "messages_sender_insert" on public.messages for insert with check (auth.uid()=sender_id);

drop policy if exists "reviews_public" on public.reviews;
create policy "reviews_public" on public.reviews for select using (true);

drop policy if exists "reviews_contracted_insert" on public.reviews;
create policy "reviews_contracted_insert" on public.reviews for insert with check (
 auth.uid()=client_id and exists (
  select 1 from public.event_items ei join public.events e on e.id=ei.event_id
  where e.client_id=auth.uid() and ei.supplier_id=reviews.supplier_id and ei.status='contratado'
 )
);

drop policy if exists "notifications_own" on public.notifications;
create policy "notifications_own" on public.notifications for select using (auth.uid()=user_id or public.is_admin());

drop policy if exists "admin_logs_admin" on public.admin_logs;
create policy "admin_logs_admin" on public.admin_logs for select using (public.is_admin());

drop policy if exists "moderation_reports_owner_admin" on public.moderation_reports;
create policy "moderation_reports_owner_admin" on public.moderation_reports for all using (auth.uid()=reporter_id or public.is_admin()) with check (auth.uid()=reporter_id or public.is_admin());

create index if not exists idx_suppliers_city on public.suppliers(city);
create index if not exists idx_suppliers_status on public.suppliers(status);
create index if not exists idx_suppliers_category on public.suppliers(category_id);
create index if not exists idx_quotes_supplier on public.quotes(supplier_id);
create index if not exists idx_quotes_client on public.quotes(client_id);
create index if not exists idx_messages_quote on public.messages(quote_id);
create index if not exists idx_events_client on public.events(client_id);

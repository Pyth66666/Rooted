-- Public catalogue only. User profiles remain in their separate protected table.
begin;
create table if not exists public.catalogue_products (
  id text primary key,
  brand text not null,
  name text not null,
  market text not null check (market = 'MY'),
  tags jsonb not null,
  claim text not null,
  catalogue_version text not null
);
create table if not exists public.catalogue_formulations (
  id text primary key,
  product_id text not null references public.catalogue_products(id),
  ingredients text not null,
  ingredients_complete boolean not null,
  contains_fragrance boolean,
  source_url text not null check (source_url like 'https://%'),
  source_name text not null,
  reviewed_at date not null,
  status text not null check (status in ('source-reviewed', 'pending', 'withdrawn')),
  note text not null
);
create table if not exists public.catalogue_listings (
  id text primary key,
  product_id text not null references public.catalogue_products(id),
  formulation_id text not null references public.catalogue_formulations(id),
  retailer text not null,
  size text not null,
  url text not null check (url like 'https://%'),
  price numeric(10,2) not null check (price >= 0),
  regular_price numeric(10,2) not null check (regular_price >= price),
  currency text not null check (currency = 'MYR'),
  observed_at date not null,
  stock text not null default 'unknown',
  affiliate boolean not null default false
);
alter table public.catalogue_products enable row level security;
alter table public.catalogue_formulations enable row level security;
alter table public.catalogue_listings enable row level security;
revoke all on public.catalogue_products, public.catalogue_formulations, public.catalogue_listings from anon, authenticated;
grant select on public.catalogue_products, public.catalogue_formulations, public.catalogue_listings to anon, authenticated;
grant all on public.catalogue_products, public.catalogue_formulations, public.catalogue_listings to service_role;
create policy "read reviewed formulations" on public.catalogue_formulations for select to anon, authenticated using (status = 'source-reviewed');
create policy "read reviewed products" on public.catalogue_products for select to anon, authenticated using (exists (select 1 from public.catalogue_formulations f where f.product_id = catalogue_products.id and f.status = 'source-reviewed'));
create policy "read reviewed listings" on public.catalogue_listings for select to anon, authenticated using (exists (select 1 from public.catalogue_formulations f where f.id = catalogue_listings.formulation_id and f.status = 'source-reviewed'));
commit;

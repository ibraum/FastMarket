-- Create sellers table
create table public.sellers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  whatsapp text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create products table
create table public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  image_path text,
  min_price numeric not null,
  max_price numeric not null,
  total_days integer not null,
  status text not null default 'available' check (status in ('available', 'sold', 'expired')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  seller_id uuid references public.sellers(id) on delete cascade not null
);

-- Enable Row Level Security
alter table public.sellers enable row level security;
alter table public.products enable row level security;

-- Sellers policies
create policy "Users can view their own seller profile"
  on public.sellers for select
  using (auth.uid()::text = id::text);

create policy "Users can update their own seller profile"
  on public.sellers for update
  using (auth.uid()::text = id::text);

create policy "Users can insert their own seller profile"
  on public.sellers for insert
  with check (auth.uid()::text = id::text);

-- Products policies
create policy "Products are viewable by everyone"
  on public.products for select
  using (true);

create policy "Users can insert their own products"
  on public.products for insert
  with check (auth.uid()::text = seller_id::text);

create policy "Users can update their own products"
  on public.products for update
  using (auth.uid()::text = seller_id::text);

create policy "Users can delete their own products"
  on public.products for delete
  using (auth.uid()::text = seller_id::text);

-- Create storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true);

-- Storage policies
create policy "Anyone can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Authenticated users can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "Users can update their own product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and auth.uid()::text = owner::text);

create policy "Users can delete their own product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and auth.uid()::text = owner::text);

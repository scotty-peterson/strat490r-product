-- Migration: Create saved_ideas table with Row Level Security
-- Run this in your Supabase project: Dashboard → SQL Editor → paste & run

-- Create the saved_ideas table
create table if not exists public.saved_ideas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  idea_id     text not null,
  saved_at    timestamptz default now() not null,
  unique(user_id, idea_id)
);

-- Enable Row Level Security
alter table public.saved_ideas enable row level security;

-- Policy: Users can only read their own saved ideas
create policy "Users can view their own saved ideas"
  on public.saved_ideas
  for select
  using (auth.uid() = user_id);

-- Policy: Users can save ideas
create policy "Users can insert their own saved ideas"
  on public.saved_ideas
  for insert
  with check (auth.uid() = user_id);

-- Policy: Users can unsave ideas
create policy "Users can delete their own saved ideas"
  on public.saved_ideas
  for delete
  using (auth.uid() = user_id);

-- Index for fast lookups by user
create index if not exists saved_ideas_user_id_idx
  on public.saved_ideas(user_id);

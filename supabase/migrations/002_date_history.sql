-- Migration: Create date_history table for tracking completed dates with ratings
-- Run this in your Supabase project: Dashboard > SQL Editor > paste & run

-- Create the date_history table
create table if not exists public.date_history (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  idea_id     text not null,
  rating      smallint check (rating >= 1 and rating <= 5),
  note        text,
  completed_at timestamptz default now() not null,
  created_at  timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.date_history enable row level security;

-- Policy: Users can only read their own history
create policy "Users can view their own date history"
  on public.date_history
  for select
  using (auth.uid() = user_id);

-- Policy: Users can log completed dates
create policy "Users can insert their own date history"
  on public.date_history
  for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own ratings/notes
create policy "Users can update their own date history"
  on public.date_history
  for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own history entries
create policy "Users can delete their own date history"
  on public.date_history
  for delete
  using (auth.uid() = user_id);

-- Index for fast lookups by user
create index if not exists date_history_user_id_idx
  on public.date_history(user_id);

-- Index for looking up if a specific idea was completed
create index if not exists date_history_user_idea_idx
  on public.date_history(user_id, idea_id);

-- Create the videos table
create table videos (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  youtube_id text not null,
  latitude float8 not null,
  longitude float8 not null,
  description text,
  location_name text,
  author_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table videos enable row level security;

-- Policy: Everyone can view videos
create policy "Public videos are viewable by everyone"
  on videos for select
  using ( true );

-- Policy: Authenticated users can insert videos
create policy "Users can insert their own videos"
  on videos for insert
  with check ( auth.uid() = author_id );

-- Policy: Users can update their own videos
create policy "Users can update their own videos"
  on videos for update
  using ( auth.uid() = author_id );

-- Policy: Users can delete their own videos
create policy "Users can delete their own videos"
  on videos for delete
  using ( auth.uid() = author_id );


-- Supabase RLS Policies for Videos Table

-- ============================================
-- READ Policy (Already exists)
-- ============================================
-- Allow everyone to read all videos
-- CREATE POLICY "Public videos are viewable by everyone"
--   ON videos FOR SELECT
--   USING ( true );

-- ============================================
-- INSERT Policy (Already exists)
-- ============================================
-- Allow authenticated users to insert videos with their own author_id
-- CREATE POLICY "Users can insert their own videos"
--   ON videos FOR INSERT
--   WITH CHECK ( auth.uid() = author_id );

-- ============================================
-- UPDATE Policy
-- ============================================
-- Allow users to update only their own videos
CREATE POLICY "Users can update their own videos"
  ON videos FOR UPDATE
  USING ( auth.uid() = author_id )
  WITH CHECK ( auth.uid() = author_id );

-- ============================================
-- DELETE Policy
-- ============================================
-- Allow users to delete only their own videos
CREATE POLICY "Users can delete their own videos"
  ON videos FOR DELETE
  USING ( auth.uid() = author_id );

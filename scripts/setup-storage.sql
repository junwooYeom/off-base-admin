-- Script to set up Supabase Storage buckets
-- Run this in your Supabase SQL editor

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('property-media', 'property-media', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']),
  ('documents', 'documents', true, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for property-media bucket
CREATE POLICY "Allow authenticated users to upload property media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-media');

CREATE POLICY "Allow authenticated users to update property media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'property-media');

CREATE POLICY "Allow authenticated users to delete property media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-media');

CREATE POLICY "Allow public to view property media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-media');

-- Set up RLS policies for documents bucket
CREATE POLICY "Allow authenticated users to upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow authenticated users to update documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Allow authenticated users to delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Allow authenticated to view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Note: After running this script, you may need to:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Verify that both buckets are created
-- 3. Check that the policies are applied correctly
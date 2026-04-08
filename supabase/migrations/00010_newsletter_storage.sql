-- Create storage bucket for newsletter images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'newsletter-images',
  'newsletter-images',
  true,
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow admins to upload
CREATE POLICY "Admins can upload newsletter images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'newsletter-images'
  AND public.is_admin()
);

-- Allow admins to delete
CREATE POLICY "Admins can delete newsletter images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'newsletter-images'
  AND public.is_admin()
);

-- Anyone can view (public bucket)
CREATE POLICY "Public can view newsletter images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'newsletter-images');

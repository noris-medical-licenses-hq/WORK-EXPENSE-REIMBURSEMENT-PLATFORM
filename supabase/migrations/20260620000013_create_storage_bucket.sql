-- Create private receipts bucket
-- Path convention: {user_id}/{expense_id}/{uuid}-{filename}
-- Max file size: 10MB, allowed types: images + PDF

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: users can only access their own folder (first path segment = user_id)

CREATE POLICY "receipts_insert_own"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "receipts_select_own"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "receipts_delete_own"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

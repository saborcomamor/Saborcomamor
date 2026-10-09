-- Repair the photo cleanup workflow: Storage DELETE also needs SELECT visibility
-- for authenticated administrators on the public-derivative bucket.
-- Public delivery remains governed by the public bucket; no general listing to anon.
CREATE POLICY sabor_admin_read_published
ON storage.objects FOR SELECT TO authenticated
USING(bucket_id='sabor-publicadas' AND (SELECT public.is_site_admin()));

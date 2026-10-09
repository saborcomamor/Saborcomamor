-- Somente a conta administrativa pode relacionar o arquivo original a uma fotografia.
CREATE OR REPLACE FUNCTION public.register_photo_original(p_photo_id uuid, p_storage_path text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NOT public.is_site_admin() THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  IF p_storage_path IS NULL OR p_storage_path !~ ('^' || p_photo_id::text || '/original\.[a-z0-9]{2,8}$') THEN
    RAISE EXCEPTION 'Invalid original path';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id='sabor-originais' AND name=p_storage_path) THEN
    RAISE EXCEPTION 'Original upload not found';
  END IF;
  INSERT INTO app_private.photo_originals(photo_id,storage_path)
  VALUES (p_photo_id,p_storage_path)
  ON CONFLICT (photo_id) DO UPDATE SET storage_path=excluded.storage_path;
  INSERT INTO app_private.admin_audit(actor_id,action,entity_name,entity_id)
  VALUES ((SELECT auth.uid()),'LINK_ORIGINAL','photos',p_photo_id::text);
END; $$;
REVOKE EXECUTE ON FUNCTION public.register_photo_original(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.register_photo_original(uuid,text) TO authenticated;

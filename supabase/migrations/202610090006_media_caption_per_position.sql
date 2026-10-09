-- Mantém a legenda da posição separada do cadastro da fotografia.
-- Sem texto informado, a foto substituta não herda a legenda ilustrativa.
CREATE OR REPLACE FUNCTION public.set_site_media_slot(
  p_slot_key text, p_photo_id uuid, p_caption text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE p public.photos%ROWTYPE;
BEGIN
 IF NOT public.is_site_admin() THEN
   RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501';
 END IF;
 IF p_slot_key IS NULL OR p_slot_key !~ '^[a-z0-9._-]{3,120}$' OR NOT EXISTS (
   SELECT 1 FROM public.site_media_slot_catalog WHERE slot_key=p_slot_key
 ) THEN
   RAISE EXCEPTION 'Unknown site media position' USING ERRCODE='22023';
 END IF;
 IF length(coalesce(p_caption,'')) > 160 THEN
   RAISE EXCEPTION 'Caption is too long' USING ERRCODE='22023';
 END IF;
 SELECT * INTO p FROM public.photos WHERE id=p_photo_id;
 IF NOT FOUND OR p.published_storage_path IS NULL OR p.asset_sha256 IS NULL THEN
   RAISE EXCEPTION 'Image not ready' USING ERRCODE='22023';
 END IF;
 IF NOT EXISTS (
   SELECT 1 FROM app_private.photo_approvals a
   WHERE a.photo_id=p.id AND a.asset_sha256=p.asset_sha256
 ) THEN
   RAISE EXCEPTION 'Rights for this image are not verified' USING ERRCODE='23514';
 END IF;
 IF NOT EXISTS (
   SELECT 1 FROM storage.objects o
   WHERE o.bucket_id='sabor-publicadas' AND o.name=p.published_storage_path
 ) THEN
   RAISE EXCEPTION 'Web-optimized image not found' USING ERRCODE='23514';
 END IF;
 INSERT INTO public.site_media_slots(slot_key,photo_id,published_storage_path,alt_text,caption,is_published)
 VALUES (p_slot_key,p.id,p.published_storage_path,p.alt_text,trim(coalesce(p_caption,'')),true)
 ON CONFLICT(slot_key) DO UPDATE SET
   photo_id=EXCLUDED.photo_id,
   published_storage_path=EXCLUDED.published_storage_path,
   alt_text=EXCLUDED.alt_text,
   caption=EXCLUDED.caption,
   is_published=true,updated_at=now();
 INSERT INTO app_private.admin_audit(actor_id,action,entity_name,entity_id)
 VALUES ((SELECT auth.uid()), 'SET_IMAGE_AND_CAPTION','site_media_slots', p_slot_key);
END; $$;
REVOKE EXECUTE ON FUNCTION public.set_site_media_slot(text,uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_site_media_slot(text,uuid,text) TO authenticated;
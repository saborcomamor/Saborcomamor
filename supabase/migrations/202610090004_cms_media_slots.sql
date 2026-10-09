-- CMS fotográfico por posições de páginas/seções, independente da galeria.
-- Migração registrada no Supabase: cms_named_site_media_slots + register_all_image_slots.
CREATE TABLE public.site_media_slot_catalog (
 slot_key text PRIMARY KEY CHECK(slot_key ~ '^[a-z0-9._-]{3,120}$'),
 label text NOT NULL, section_name text NOT NULL, page_name text NOT NULL
);
CREATE TABLE public.site_media_slots (
 slot_key text PRIMARY KEY CHECK(slot_key ~ '^[a-z0-9._-]{3,120}$'),
 photo_id uuid NOT NULL REFERENCES public.photos(id) ON DELETE RESTRICT,
 published_storage_path text NOT NULL,
 alt_text text NOT NULL CHECK(length(alt_text) BETWEEN 3 AND 250),
 caption text NOT NULL DEFAULT '', is_published boolean NOT NULL DEFAULT true,
 updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_media_slot_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_media_slots ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.site_media_slot_catalog FROM PUBLIC,anon,authenticated;
REVOKE ALL ON public.site_media_slots FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.site_media_slot_catalog, public.site_media_slots TO anon,authenticated;
CREATE POLICY site_media_slot_catalog_read ON public.site_media_slot_catalog FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY site_media_slots_public_read ON public.site_media_slots FOR SELECT TO anon USING(is_published);
CREATE POLICY site_media_slots_authenticated_read ON public.site_media_slots FOR SELECT TO authenticated USING(is_published OR (SELECT public.is_site_admin()));
CREATE INDEX site_media_slots_photo_id_idx ON public.site_media_slots(photo_id);
CREATE TRIGGER site_media_slots_touch_updated_at BEFORE UPDATE ON public.site_media_slots FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at();

CREATE OR REPLACE FUNCTION public.set_site_media_slot(p_slot_key text,p_photo_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.photos%ROWTYPE;
BEGIN
 IF NOT public.is_site_admin() THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
 IF p_slot_key IS NULL OR p_slot_key !~ '^[a-z0-9._-]{3,120}$' OR NOT EXISTS(
 SELECT 1 FROM public.site_media_slot_catalog WHERE slot_key=p_slot_key
 ) THEN RAISE EXCEPTION 'Unknown site media position' USING ERRCODE='22023'; END IF;
 SELECT * INTO p FROM public.photos WHERE id=p_photo_id;
 IF NOT FOUND OR p.published_storage_path IS NULL OR p.asset_sha256 IS NULL THEN RAISE EXCEPTION 'Image not available' USING ERRCODE='22023'; END IF;
 IF NOT EXISTS(SELECT 1 FROM app_private.photo_approvals a WHERE a.photo_id=p.id AND a.asset_sha256=p.asset_sha256)
 THEN RAISE EXCEPTION 'Rights not verified' USING ERRCODE='23514'; END IF;
 IF NOT EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='sabor-publicadas' AND name=p.published_storage_path)
 THEN RAISE EXCEPTION 'Image not uploaded to public-ready bucket' USING ERRCODE='23514'; END IF;
 INSERT INTO public.site_media_slots(slot_key,photo_id,published_storage_path,alt_text,caption,is_published)
 VALUES (p_slot_key,p.id,p.published_storage_path,p.alt_text,p.caption,true)
 ON CONFLICT(slot_key) DO UPDATE SET photo_id=EXCLUDED.photo_id,
 published_storage_path=EXCLUDED.published_storage_path,alt_text=EXCLUDED.alt_text,
 caption=EXCLUDED.caption,is_published=true,updated_at=now();
 INSERT INTO app_private.admin_audit(actor_id,action,entity_name,entity_id)
 VALUES ((SELECT auth.uid()),'SET_IMAGE','site_media_slots',p_slot_key);
END $$;
CREATE OR REPLACE FUNCTION public.clear_site_media_slot(p_slot_key text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NOT public.is_site_admin() THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
 DELETE FROM public.site_media_slots WHERE slot_key=p_slot_key;
 INSERT INTO app_private.admin_audit(actor_id,action,entity_name,entity_id)
 VALUES ((SELECT auth.uid()),'RESTORE_ORIGINAL','site_media_slots',p_slot_key);
END $$;
REVOKE EXECUTE ON FUNCTION public.set_site_media_slot(text,uuid) FROM PUBLIC,anon;
REVOKE EXECUTE ON FUNCTION public.clear_site_media_slot(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.set_site_media_slot(text,uuid), public.clear_site_media_slot(text) TO authenticated;
-- As 60 posições são registradas separadamente; catálogo fonte em lib/cms/slots.ts.

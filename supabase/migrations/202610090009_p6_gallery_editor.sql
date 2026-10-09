
-- P6: control of photographic presentation, high-quality derivatives, safe deletions and visual identity.
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS high_res_storage_path text;
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS high_res_width integer;
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS high_res_height integer;
ALTER TABLE public.gallery_entries ADD COLUMN IF NOT EXISTS fit_mode text NOT NULL DEFAULT 'contain' CHECK (fit_mode IN ('cover','contain'));
ALTER TABLE public.gallery_entries ADD COLUMN IF NOT EXISTS focus_x integer NOT NULL DEFAULT 50 CHECK(focus_x BETWEEN 0 AND 100);
ALTER TABLE public.gallery_entries ADD COLUMN IF NOT EXISTS focus_y integer NOT NULL DEFAULT 50 CHECK(focus_y BETWEEN 0 AND 100);
ALTER TABLE public.gallery_entries ADD COLUMN IF NOT EXISTS zoom numeric(4,2) NOT NULL DEFAULT 1 CHECK(zoom BETWEEN 1 AND 2);

CREATE TABLE IF NOT EXISTS public.visual_settings (
 id smallint PRIMARY KEY DEFAULT 1 CHECK (id=1),
 keepsakes_font text NOT NULL DEFAULT 'caveat' CHECK(keepsakes_font IN ('caveat','dancing','allura')),
 favicon_path text NOT NULL DEFAULT '' CHECK(length(favicon_path)<=200),
 favicon_version text NOT NULL DEFAULT '' CHECK(length(favicon_version)<=80),
 updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.visual_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.visual_settings FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.visual_settings TO anon,authenticated;
GRANT INSERT,UPDATE ON public.visual_settings TO authenticated;
CREATE POLICY visual_settings_read ON public.visual_settings FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY visual_settings_admin_insert ON public.visual_settings FOR INSERT TO authenticated WITH CHECK((SELECT public.is_site_admin()));
CREATE POLICY visual_settings_admin_update ON public.visual_settings FOR UPDATE TO authenticated USING((SELECT public.is_site_admin())) WITH CHECK((SELECT public.is_site_admin()));
INSERT INTO public.visual_settings(id) VALUES (1) ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES ('sabor-identidade','sabor-identidade',true,2097152,ARRAY['image/png']::text[])
ON CONFLICT (id) DO NOTHING;
CREATE POLICY brand_admin_insert ON storage.objects FOR INSERT TO authenticated
WITH CHECK(bucket_id='sabor-identidade' AND (SELECT public.is_site_admin()));
CREATE POLICY brand_admin_delete ON storage.objects FOR DELETE TO authenticated
USING(bucket_id='sabor-identidade' AND (SELECT public.is_site_admin()));
CREATE POLICY public_photos_admin_delete ON storage.objects FOR DELETE TO authenticated
USING(bucket_id='sabor-publicadas' AND (SELECT public.is_site_admin()));

CREATE TABLE public.photo_cleanup_queue (
 photo_id uuid PRIMARY KEY,
 original_path text,
 published_path text,
 high_res_path text,
 completed boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 completed_at timestamptz
);
ALTER TABLE public.photo_cleanup_queue ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.photo_cleanup_queue FROM PUBLIC,anon,authenticated;
GRANT SELECT,UPDATE ON public.photo_cleanup_queue TO authenticated;
CREATE POLICY photo_cleanup_read_admin ON public.photo_cleanup_queue FOR SELECT TO authenticated USING((SELECT public.is_site_admin()));
CREATE POLICY photo_cleanup_update_admin ON public.photo_cleanup_queue FOR UPDATE TO authenticated USING((SELECT public.is_site_admin())) WITH CHECK((SELECT public.is_site_admin()));

CREATE OR REPLACE FUNCTION public.publish_gallery_layout(p_items jsonb)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $fn$
DECLARE v_count integer; v_unique integer; v_valid integer;
BEGIN
 IF NOT public.is_site_admin() THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
 IF p_items IS NULL OR jsonb_typeof(p_items)<>'array' OR jsonb_array_length(p_items)>200 THEN
   RAISE EXCEPTION 'Invalid gallery selection' USING ERRCODE='22023';
 END IF;
 SELECT count(*),count(DISTINCT x.item->>'photo_id') INTO v_count,v_unique
 FROM jsonb_array_elements(p_items) x(item);
 IF v_count<>v_unique THEN RAISE EXCEPTION 'Duplicate photographs' USING ERRCODE='22023'; END IF;
 IF EXISTS (
   SELECT 1 FROM jsonb_array_elements(p_items) x(item)
   WHERE NOT (x.item ? 'photo_id')
     OR COALESCE(x.item->>'photo_id','') !~ '^[a-f0-9-]{36}$'
     OR COALESCE(x.item->>'fit_mode','contain') NOT IN('cover','contain')
     OR COALESCE(x.item->>'focus_x','50') !~ '^[0-9]{1,3}$'
     OR COALESCE(x.item->>'focus_y','50') !~ '^[0-9]{1,3}$'
     OR COALESCE(x.item->>'zoom','1') !~ '^[0-9]+(\.[0-9]{1,2})?$'
 ) THEN RAISE EXCEPTION 'Invalid gallery layout values' USING ERRCODE='22023'; END IF;
 SELECT count(*) INTO v_valid FROM jsonb_array_elements(p_items) x(item)
 JOIN public.photos p ON p.id=(x.item->>'photo_id')::uuid
 JOIN app_private.photo_approvals a ON a.photo_id=p.id AND a.asset_sha256=p.asset_sha256
 JOIN storage.objects o ON o.bucket_id='sabor-publicadas'
      AND o.name=COALESCE(p.high_res_storage_path,p.published_storage_path)
 WHERE p.published_storage_path IS NOT NULL
   AND (x.item->>'focus_x')::integer BETWEEN 0 AND 100
   AND (x.item->>'focus_y')::integer BETWEEN 0 AND 100
   AND (x.item->>'zoom')::numeric BETWEEN 1 AND 2;
 IF v_valid<>v_count THEN RAISE EXCEPTION 'An image or its framing is invalid' USING ERRCODE='23514'; END IF;
 PERFORM pg_advisory_xact_lock(14835,12240);
 DELETE FROM public.gallery_entries;
 INSERT INTO public.gallery_entries(photo_id,sort_order,published_storage_path,alt_text,fit_mode,focus_x,focus_y,zoom)
 SELECT p.id,(x.ord-1)::int,COALESCE(p.high_res_storage_path,p.published_storage_path),
    p.alt_text,COALESCE(x.item->>'fit_mode','contain'),
    COALESCE((x.item->>'focus_x')::int,50),COALESCE((x.item->>'focus_y')::int,50),
    COALESCE((x.item->>'zoom')::numeric,1)
 FROM jsonb_array_elements(p_items) WITH ORDINALITY x(item,ord)
 JOIN public.photos p ON p.id=(x.item->>'photo_id')::uuid
 ORDER BY x.ord;
 INSERT INTO app_private.admin_audit(actor_id,action,entity_name,entity_id)
 VALUES ((SELECT auth.uid()),'PUBLISH_GALLERY_LAYOUT','gallery_entries',v_count::text);
 RETURN v_count;
END; $fn$;
REVOKE EXECUTE ON FUNCTION public.publish_gallery_layout(jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.publish_gallery_layout(jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_photo_original_path(p_photo_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $fn$
DECLARE v_path text;
BEGIN
 IF NOT public.is_site_admin() THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
 SELECT o.storage_path INTO v_path FROM app_private.photo_originals o
 WHERE o.photo_id=p_photo_id;
 RETURN v_path;
END; $fn$;
REVOKE EXECUTE ON FUNCTION public.get_photo_original_path(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_photo_original_path(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.register_highres_photo(
 p_photo_id uuid,p_path text,p_width integer,p_height integer
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $fn$
DECLARE v_hash text;
BEGIN
 IF NOT public.is_site_admin() THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
 IF p_path !~ ('^'||p_photo_id::text||'/gallery-[a-f0-9-]{36}\.webp$') OR
    p_width NOT BETWEEN 1 AND 6000 OR p_height NOT BETWEEN 1 AND 6000 THEN
   RAISE EXCEPTION 'Invalid high-resolution asset' USING ERRCODE='22023';
 END IF;
 SELECT p.asset_sha256 INTO v_hash FROM public.photos p WHERE p.id=p_photo_id FOR UPDATE;
 IF v_hash IS NULL OR NOT EXISTS(
   SELECT 1 FROM app_private.photo_approvals a
   WHERE a.photo_id=p_photo_id AND a.asset_sha256=v_hash
 ) THEN RAISE EXCEPTION 'Photo rights not verified' USING ERRCODE='23514'; END IF;
 IF NOT EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id='sabor-publicadas' AND o.name=p_path)
 THEN RAISE EXCEPTION 'High-resolution file was not uploaded' USING ERRCODE='23514'; END IF;
 UPDATE public.photos SET high_res_storage_path=p_path,high_res_width=p_width,high_res_height=p_height
 WHERE id=p_photo_id;
 UPDATE public.gallery_entries SET published_storage_path=p_path WHERE photo_id=p_photo_id;
 INSERT INTO app_private.admin_audit(actor_id,action,entity_name,entity_id)
 VALUES ((SELECT auth.uid()),'HIGH_RES_PHOTO','photos',p_photo_id::text);
END; $fn$;
REVOKE EXECUTE ON FUNCTION public.register_highres_photo(uuid,text,integer,integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.register_highres_photo(uuid,text,integer,integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.delete_unused_photo(p_photo_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $fn$
DECLARE v_photo public.photos%ROWTYPE; v_original text;
BEGIN
 IF NOT public.is_site_admin() THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
 SELECT * INTO v_photo FROM public.photos WHERE id=p_photo_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Photo no longer exists' USING ERRCODE='P0002'; END IF;
 IF EXISTS(SELECT 1 FROM public.gallery_entries WHERE photo_id=p_photo_id) OR
    EXISTS(SELECT 1 FROM public.intro_frames WHERE photo_id=p_photo_id) OR
    EXISTS(SELECT 1 FROM public.site_media_slots WHERE photo_id=p_photo_id) THEN
   RAISE EXCEPTION 'Photo is in use: remove or replace it first' USING ERRCODE='23503';
 END IF;
 SELECT storage_path INTO v_original FROM app_private.photo_originals WHERE photo_id=p_photo_id;
 INSERT INTO public.photo_cleanup_queue(photo_id,original_path,published_path,high_res_path)
 VALUES(p_photo_id,v_original,v_photo.published_storage_path,v_photo.high_res_storage_path);
 DELETE FROM app_private.photo_approvals WHERE photo_id=p_photo_id;
 DELETE FROM app_private.photo_originals WHERE photo_id=p_photo_id;
 DELETE FROM public.photos WHERE id=p_photo_id;
 INSERT INTO app_private.admin_audit(actor_id,action,entity_name,entity_id)
 VALUES((SELECT auth.uid()),'DELETE_UNUSED_PHOTO','photos',p_photo_id::text);
 RETURN jsonb_build_object('photo_id',p_photo_id,'original_path',v_original,
    'published_path',v_photo.published_storage_path,'high_res_path',v_photo.high_res_storage_path);
END; $fn$;
REVOKE EXECUTE ON FUNCTION public.delete_unused_photo(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.delete_unused_photo(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.complete_photo_cleanup(p_photo_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $fn$
DECLARE v_item public.photo_cleanup_queue%ROWTYPE;
BEGIN
 IF NOT public.is_site_admin() THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
 SELECT * INTO v_item FROM public.photo_cleanup_queue WHERE photo_id=p_photo_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Cleanup request not found'; END IF;
 IF EXISTS(SELECT 1 FROM storage.objects WHERE
   (bucket_id='sabor-originais' AND name=v_item.original_path) OR
   (bucket_id='sabor-publicadas' AND name IN(v_item.published_path,v_item.high_res_path))
 ) THEN RAISE EXCEPTION 'Some files still need to be removed'; END IF;
 UPDATE public.photo_cleanup_queue SET completed=true,completed_at=now() WHERE photo_id=p_photo_id;
END; $fn$;
REVOKE EXECUTE ON FUNCTION public.complete_photo_cleanup(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.complete_photo_cleanup(uuid) TO authenticated;

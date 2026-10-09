-- Fix SQLSTATE 21000: Supabase PostgREST forbids DELETE without WHERE.
-- Both tables have photo_id NOT NULL as their primary key.
-- Preserve validation, rights checks, advisory locks and audit entries.
-- No existing rows are modified by this migration.
-- publish_gallery_layout(p_items jsonb): preserve atomic operation with explicit bounded predicate.
CREATE OR REPLACE FUNCTION public.publish_gallery_layout(p_items jsonb)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
 DELETE FROM public.gallery_entries WHERE photo_id IS NOT NULL;
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
END; $function$;

-- replace_gallery_selection(p_photo_ids uuid[]): preserve atomic operation with explicit bounded predicate.
CREATE OR REPLACE FUNCTION public.replace_gallery_selection(p_photo_ids uuid[])
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE v_requested int;
DECLARE v_valid int;
DECLARE v_duplicates int;
BEGIN
 IF NOT public.is_site_admin() THEN
  RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501';
 END IF;
 IF p_photo_ids IS NULL OR cardinality(p_photo_ids)>200 THEN
  RAISE EXCEPTION 'Invalid gallery selection' USING ERRCODE='22023';
 END IF;
 SELECT count(*),count(DISTINCT u.photo_id) INTO v_requested,v_duplicates
 FROM unnest(p_photo_ids) AS u(photo_id);
 IF v_requested<>v_duplicates THEN
  RAISE EXCEPTION 'Duplicate image ids' USING ERRCODE='22023';
 END IF;
 SELECT count(*) INTO v_valid
 FROM public.photos p
 JOIN app_private.photo_approvals a
  ON a.photo_id=p.id AND a.asset_sha256=p.asset_sha256
 JOIN storage.objects o
  ON o.bucket_id='sabor-publicadas' AND o.name=p.published_storage_path
 WHERE p.id=ANY(p_photo_ids) AND p.published_storage_path IS NOT NULL;
 IF v_requested<>v_valid THEN
  RAISE EXCEPTION 'An image is unavailable or rights not verified' USING ERRCODE='23514';
 END IF;
 PERFORM pg_advisory_xact_lock(14835,12240);
 DELETE FROM public.gallery_entries WHERE photo_id IS NOT NULL;
 INSERT INTO public.gallery_entries(photo_id,sort_order,published_storage_path,alt_text)
 SELECT p.id, (u.ord-1)::int, p.published_storage_path,p.alt_text
 FROM unnest(p_photo_ids) WITH ORDINALITY AS u(photo_id,ord)
 JOIN public.photos p ON p.id=u.photo_id
 ORDER BY u.ord;
 INSERT INTO app_private.admin_audit(actor_id,action,entity_name,entity_id)
 VALUES ((SELECT auth.uid()),'PUBLISH_GALLERY','gallery_entries',v_requested::text);
 RETURN v_requested;
END; $function$;

-- replace_intro_frames(p_photo_ids uuid[]): preserve atomic operation with explicit bounded predicate.
CREATE OR REPLACE FUNCTION public.replace_intro_frames(p_photo_ids uuid[])
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE wanted integer; valid integer;
BEGIN
 IF NOT public.is_site_admin() THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
 IF p_photo_ids IS NULL OR cardinality(p_photo_ids)>12 THEN RAISE EXCEPTION 'Choose up to twelve photos' USING ERRCODE='22023'; END IF;
 SELECT count(*) INTO wanted FROM unnest(p_photo_ids);
 IF wanted<> (SELECT count(DISTINCT i) FROM unnest(p_photo_ids) AS i) THEN
   RAISE EXCEPTION 'Duplicate photos' USING ERRCODE='22023';
 END IF;
 SELECT count(*) INTO valid
 FROM public.photos p
 JOIN app_private.photo_approvals a ON a.photo_id=p.id AND a.asset_sha256=p.asset_sha256
 JOIN storage.objects o ON o.bucket_id='sabor-publicadas' AND o.name=p.published_storage_path
 WHERE p.id=ANY(p_photo_ids) AND p.published_storage_path IS NOT NULL;
 IF valid<>wanted THEN RAISE EXCEPTION 'Photo unavailable or without verified authorization' USING ERRCODE='23514'; END IF;
 PERFORM pg_advisory_xact_lock(20832, 19082);
 DELETE FROM public.intro_frames WHERE photo_id IS NOT NULL;
 INSERT INTO public.intro_frames(photo_id,sort_order,published_storage_path,alt_text)
 SELECT p.id,(u.ord-1)::integer,p.published_storage_path,p.alt_text
 FROM unnest(p_photo_ids) WITH ORDINALITY AS u(photo_id,ord)
 JOIN public.photos p ON p.id=u.photo_id
 ORDER BY u.ord;
 INSERT INTO app_private.admin_audit(actor_id,action,entity_name,entity_id)
 VALUES((SELECT auth.uid()),'REPLACE_INTRO','intro_frames',wanted::text);
 RETURN wanted;
END; $function$;

-- replace_intro_frames_v2(p_photo_ids uuid[]): preserve atomic operation with explicit bounded predicate.
CREATE OR REPLACE FUNCTION public.replace_intro_frames_v2(p_photo_ids uuid[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE v_total integer; v_distinct integer; v_eligible integer; v_actor uuid;
BEGIN
 v_actor := (SELECT auth.uid());
 IF v_actor IS NULL OR NOT public.is_site_admin() THEN
   RAISE EXCEPTION 'Acesso administrativo necessário' USING ERRCODE='42501';
 END IF;
 IF p_photo_ids IS NULL OR cardinality(p_photo_ids)>12 THEN
   RAISE EXCEPTION 'Escolha no máximo 12 fotografias' USING ERRCODE='22023';
 END IF;
 SELECT count(*),count(DISTINCT e.photo_id) INTO v_total,v_distinct
 FROM unnest(p_photo_ids) AS e(photo_id);
 IF v_total<>v_distinct OR EXISTS(
   SELECT 1 FROM unnest(p_photo_ids) AS e(photo_id) WHERE e.photo_id IS NULL
 ) THEN RAISE EXCEPTION 'A sequência contém fotografias repetidas ou inválidas' USING ERRCODE='22023'; END IF;
 SELECT count(*) INTO v_eligible FROM public.photos p
 WHERE p.id=ANY(p_photo_ids) AND p.published_storage_path IS NOT NULL
 AND p.asset_sha256 IS NOT NULL
 AND EXISTS(SELECT 1 FROM app_private.photo_approvals a
            WHERE a.photo_id=p.id AND a.asset_sha256=p.asset_sha256)
 AND EXISTS(SELECT 1 FROM storage.objects o
            WHERE o.bucket_id='sabor-publicadas' AND o.name=p.published_storage_path);
 IF v_eligible<>v_total THEN
   RAISE EXCEPTION 'Uma ou mais fotografias não estão disponíveis para esta sequência' USING ERRCODE='23514';
 END IF;
 PERFORM pg_advisory_xact_lock(20832,19082);
 DELETE FROM public.intro_frames WHERE photo_id IS NOT NULL;
 INSERT INTO public.intro_frames(photo_id,sort_order,published_storage_path,alt_text)
 SELECT p.id,(s.ord-1)::integer,p.published_storage_path,p.alt_text
 FROM unnest(p_photo_ids) WITH ORDINALITY AS s(photo_id,ord)
 JOIN public.photos p ON p.id=s.photo_id ORDER BY s.ord;
 INSERT INTO app_private.admin_audit(actor_id,action,entity_name,entity_id)
 VALUES(v_actor,'REPLACE_INTRO_V2','intro_frames',v_total::text);
 RETURN jsonb_build_object('saved',true,'count',v_total,'photo_ids',to_jsonb(p_photo_ids));
END; $function$;

-- Invalidate PostgREST schema cache when applying the migration.
NOTIFY pgrst,'reload schema';

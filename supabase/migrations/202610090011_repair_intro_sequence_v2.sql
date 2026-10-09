-- Repair photo-opening sequence writes and return a verifiable result.
-- Preserve existing intro_frames and the older RPC during the transition.
CREATE OR REPLACE FUNCTION public.replace_intro_frames_v2(p_photo_ids uuid[])
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
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
 DELETE FROM public.intro_frames;
 INSERT INTO public.intro_frames(photo_id,sort_order,published_storage_path,alt_text)
 SELECT p.id,(s.ord-1)::integer,p.published_storage_path,p.alt_text
 FROM unnest(p_photo_ids) WITH ORDINALITY AS s(photo_id,ord)
 JOIN public.photos p ON p.id=s.photo_id ORDER BY s.ord;
 INSERT INTO app_private.admin_audit(actor_id,action,entity_name,entity_id)
 VALUES(v_actor,'REPLACE_INTRO_V2','intro_frames',v_total::text);
 RETURN jsonb_build_object('saved',true,'count',v_total,'photo_ids',to_jsonb(p_photo_ids));
END; $function$;
REVOKE ALL ON FUNCTION public.replace_intro_frames_v2(uuid[]) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.replace_intro_frames_v2(uuid[]) TO authenticated;
NOTIFY pgrst,'reload schema';

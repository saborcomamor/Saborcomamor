-- P1: business contact CMS and cinematic entry. Additive migration; preserves existing photos.
CREATE TABLE public.business_profile(
 id smallint PRIMARY KEY DEFAULT 1 CHECK(id=1),
 business_name text NOT NULL DEFAULT 'Sabor com Amor' CHECK(length(business_name) BETWEEN 2 AND 100),
 city text NOT NULL DEFAULT 'Telêmaco Borba, PR' CHECK(length(city)<=120),
 whatsapp text NOT NULL DEFAULT '' CHECK(whatsapp='' OR whatsapp ~ '^[0-9]{10,15}$'),
 telephone text NOT NULL DEFAULT '' CHECK(length(telephone)<=25),
 email text NOT NULL DEFAULT '' CHECK(length(email)<=180),
 address text NOT NULL DEFAULT '' CHECK(length(address)<=250),
 hours text NOT NULL DEFAULT '' CHECK(length(hours)<=180),
 instagram text NOT NULL DEFAULT '' CHECK(length(instagram)<=200),
 facebook text NOT NULL DEFAULT '' CHECK(length(facebook)<=200),
 updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.business_profile ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.business_profile FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.business_profile TO anon,authenticated;
GRANT INSERT,UPDATE ON public.business_profile TO authenticated;
CREATE POLICY business_profile_read ON public.business_profile FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY business_profile_admin_insert ON public.business_profile FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_site_admin()));
CREATE POLICY business_profile_admin_update ON public.business_profile FOR UPDATE TO authenticated USING((SELECT public.is_site_admin())) WITH CHECK ((SELECT public.is_site_admin()));
CREATE TRIGGER business_profile_updated BEFORE UPDATE ON public.business_profile FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at();
INSERT INTO public.business_profile(id) VALUES(1) ON CONFLICT DO NOTHING;
CREATE TABLE public.intro_frames(
 photo_id uuid PRIMARY KEY REFERENCES public.photos(id) ON DELETE RESTRICT,
 sort_order integer NOT NULL CHECK(sort_order>=0),
 published_storage_path text NOT NULL,
 alt_text text NOT NULL CHECK(length(alt_text) BETWEEN 3 AND 250),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX intro_frames_sort ON public.intro_frames(sort_order,photo_id);
ALTER TABLE public.intro_frames ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.intro_frames FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.intro_frames TO anon,authenticated;
CREATE POLICY intro_frames_public_read ON public.intro_frames FOR SELECT TO anon,authenticated USING(true);
INSERT INTO public.intro_frames(photo_id,sort_order,published_storage_path,alt_text)
 SELECT s.photo_id,(row_number() OVER(ORDER BY s.slot_key)-1)::int,s.published_storage_path,s.alt_text
 FROM public.site_media_slots s
 JOIN public.photos p ON p.id=s.photo_id AND p.published_storage_path=s.published_storage_path
 JOIN app_private.photo_approvals a ON a.photo_id=p.id AND a.asset_sha256=p.asset_sha256
 JOIN storage.objects o ON o.bucket_id='sabor-publicadas' AND o.name=p.published_storage_path
 WHERE s.slot_key LIKE 'home.hero.%' ORDER BY s.slot_key LIMIT 12
 ON CONFLICT DO NOTHING;
CREATE OR REPLACE FUNCTION public.replace_intro_frames(p_photo_ids uuid[])
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE wanted integer; valid integer;
BEGIN
 IF NOT public.is_site_admin() THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
 IF p_photo_ids IS NULL OR cardinality(p_photo_ids)>12 THEN RAISE EXCEPTION 'Choose up to twelve photos' USING ERRCODE='22023'; END IF;
 SELECT count(*) INTO wanted FROM unnest(p_photo_ids);
 IF wanted<>(SELECT count(DISTINCT i) FROM unnest(p_photo_ids) AS i) THEN
   RAISE EXCEPTION 'Duplicate photos' USING ERRCODE='22023';
 END IF;
 SELECT count(*) INTO valid FROM public.photos p
 JOIN app_private.photo_approvals a ON a.photo_id=p.id AND a.asset_sha256=p.asset_sha256
 JOIN storage.objects o ON o.bucket_id='sabor-publicadas' AND o.name=p.published_storage_path
 WHERE p.id=ANY(p_photo_ids) AND p.published_storage_path IS NOT NULL;
 IF wanted<>valid THEN RAISE EXCEPTION 'Photo unavailable or without verified authorization' USING ERRCODE='23514'; END IF;
 PERFORM pg_advisory_xact_lock(20832,19082);
 DELETE FROM public.intro_frames;
 INSERT INTO public.intro_frames(photo_id,sort_order,published_storage_path,alt_text)
 SELECT p.id,(u.ord-1)::integer,p.published_storage_path,p.alt_text
 FROM unnest(p_photo_ids) WITH ORDINALITY AS u(photo_id,ord)
 JOIN public.photos p ON p.id=u.photo_id ORDER BY u.ord;
 INSERT INTO app_private.admin_audit(actor_id,action,entity_name,entity_id)
 VALUES ((SELECT auth.uid()),'REPLACE_INTRO','intro_frames',wanted::text);
 RETURN wanted;
END; $$;
REVOKE EXECUTE ON FUNCTION public.replace_intro_frames(uuid[]) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.replace_intro_frames(uuid[]) TO authenticated;


-- Seleção pública independente dos 60 usos das imagens no site.
CREATE TABLE public.gallery_entries (
  photo_id uuid PRIMARY KEY REFERENCES public.photos(id) ON DELETE RESTRICT,
  sort_order integer NOT NULL CHECK (sort_order >= 0),
  published_storage_path text NOT NULL,
  alt_text text NOT NULL CHECK (length(alt_text) BETWEEN 3 AND 250),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX gallery_entries_order_idx ON public.gallery_entries (sort_order,photo_id);
ALTER TABLE public.gallery_entries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.gallery_entries FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.gallery_entries TO anon,authenticated;
CREATE POLICY gallery_entries_public_read ON public.gallery_entries
 FOR SELECT TO anon,authenticated USING(true);

-- Guarda a seleção visível existente antes de migrar o componente público.
INSERT INTO public.gallery_entries (photo_id, sort_order, published_storage_path, alt_text)
SELECT p.id,
  (row_number() OVER (ORDER BY p.sort_order, p.created_at, p.id)-1)::integer,
  p.published_storage_path, p.alt_text
FROM public.photos p
JOIN app_private.photo_approvals a
 ON a.photo_id=p.id AND a.asset_sha256=p.asset_sha256
JOIN storage.objects o
 ON o.bucket_id='sabor-publicadas' AND o.name=p.published_storage_path
WHERE p.is_published=true AND p.published_storage_path IS NOT NULL
ON CONFLICT (photo_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.replace_gallery_selection(p_photo_ids uuid[])
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
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
 DELETE FROM public.gallery_entries;
 INSERT INTO public.gallery_entries(photo_id,sort_order,published_storage_path,alt_text)
 SELECT p.id, (u.ord-1)::int, p.published_storage_path,p.alt_text
 FROM unnest(p_photo_ids) WITH ORDINALITY AS u(photo_id,ord)
 JOIN public.photos p ON p.id=u.photo_id
 ORDER BY u.ord;
 INSERT INTO app_private.admin_audit(actor_id,action,entity_name,entity_id)
 VALUES ((SELECT auth.uid()),'PUBLISH_GALLERY','gallery_entries',v_requested::text);
 RETURN v_requested;
END; $$;
REVOKE EXECUTE ON FUNCTION public.replace_gallery_selection(uuid[]) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.replace_gallery_selection(uuid[]) TO authenticated;

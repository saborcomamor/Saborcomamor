-- Sabor com Amor: conteúdo público, provas privadas, RLS e Storage.
-- Sem credenciais e sem autorização administrativa automática.
-- A conta administradora será adicionada SOMENTE após confirmar o email no Supabase Auth.

CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS app_private.site_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'editor')),
  disabled_at timestamptz,
  granted_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.is_site_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM app_private.site_admins
    WHERE user_id = (SELECT auth.uid()) AND disabled_at IS NULL
  );
$$;
REVOKE ALL ON FUNCTION public.is_site_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_site_admin() TO anon, authenticated;

CREATE TABLE public.services (
  code text PRIMARY KEY CHECK (code ~ '^[a-z0-9-]{2,60}$'),
  title text NOT NULL CHECK (length(title) BETWEEN 2 AND 120),
  summary text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]{2,100}$'),
  title text NOT NULL CHECK (length(title) BETWEEN 2 AND 180),
  description text NOT NULL DEFAULT '',
  category text NOT NULL CHECK (category ~ '^[a-z0-9-]{2,50}$'),
  event_date date,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid REFERENCES public.albums(id) ON DELETE RESTRICT,
  published_storage_path text UNIQUE,
  asset_sha256 text CHECK (asset_sha256 IS NULL OR asset_sha256 ~ '^[a-f0-9]{64}$'),
  alt_text text NOT NULL CHECK (length(alt_text) BETWEEN 3 AND 250),
  caption text NOT NULL DEFAULT '',
  width integer CHECK (width IS NULL OR width > 0),
  height integer CHECK (height IS NULL OR height > 0),
  sort_order integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT photo_public_fields_required CHECK (
    NOT is_published OR (
      published_storage_path IS NOT NULL AND length(trim(published_storage_path)) > 3 AND
      asset_sha256 IS NOT NULL
    )
  )
);

CREATE TABLE app_private.photo_approvals (
  photo_id uuid PRIMARY KEY REFERENCES public.photos(id) ON DELETE RESTRICT,
  asset_sha256 text NOT NULL CHECK (asset_sha256 ~ '^[a-f0-9]{64}$'),
  evidence_reference text NOT NULL CHECK (length(trim(evidence_reference)) BETWEEN 3 AND 400),
  verified_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  verified_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE app_private.photo_originals (
  photo_id uuid PRIMARY KEY REFERENCES public.photos(id) ON DELETE RESTRICT,
  storage_path text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL CHECK (length(display_name) BETWEEN 2 AND 120),
  body text NOT NULL CHECK (length(body) BETWEEN 10 AND 2500),
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE app_private.testimonial_approvals (
  testimonial_id uuid PRIMARY KEY REFERENCES public.testimonials(id) ON DELETE RESTRICT,
  evidence_reference text NOT NULL CHECK (length(trim(evidence_reference)) BETWEEN 3 AND 400),
  verified_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  verified_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.site_content (
  section_key text PRIMARY KEY CHECK (section_key ~ '^[a-z0-9._-]{2,100}$'),
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  is_published boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE app_private.admin_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id uuid,
  action text NOT NULL,
  entity_name text NOT NULL,
  entity_id text NOT NULL,
  happened_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION app_private.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION app_private.log_admin_mutation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO app_private.admin_audit (actor_id, action, entity_name, entity_id)
  VALUES ((SELECT auth.uid()), TG_OP, TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE'
      THEN to_jsonb(OLD)->>CASE WHEN TG_TABLE_NAME IN ('services') THEN 'code' WHEN TG_TABLE_NAME IN ('site_content') THEN 'section_key' ELSE 'id' END
      ELSE to_jsonb(NEW)->>CASE WHEN TG_TABLE_NAME IN ('services') THEN 'code' WHEN TG_TABLE_NAME IN ('site_content') THEN 'section_key' ELSE 'id' END
    END
  );
  RETURN COALESCE(NEW, OLD);
END; $$;

CREATE OR REPLACE FUNCTION app_private.check_photo_publication()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NEW.is_published AND NOT EXISTS (
    SELECT 1 FROM app_private.photo_approvals a
    WHERE a.photo_id = NEW.id AND a.asset_sha256 = NEW.asset_sha256
  ) THEN
    RAISE EXCEPTION 'Photo cannot be published without verified rights for this asset' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER photos_verify_rights BEFORE INSERT OR UPDATE ON public.photos
  FOR EACH ROW EXECUTE FUNCTION app_private.check_photo_publication();

CREATE OR REPLACE FUNCTION app_private.check_testimonial_publication()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NEW.is_published AND NOT EXISTS (
    SELECT 1 FROM app_private.testimonial_approvals a WHERE a.testimonial_id = NEW.id
  ) THEN
    RAISE EXCEPTION 'Testimonial cannot be published without verified permission' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER testimonials_verify_rights BEFORE INSERT OR UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION app_private.check_testimonial_publication();

CREATE OR REPLACE FUNCTION public.approve_photo_rights(p_photo_id uuid, p_evidence_reference text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_hash text;
BEGIN
  IF NOT public.is_site_admin() THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501'; END IF;
  IF p_evidence_reference IS NULL OR length(trim(p_evidence_reference)) < 3 THEN
    RAISE EXCEPTION 'An evidence reference is required';
  END IF;
  SELECT asset_sha256 INTO v_hash FROM public.photos WHERE id = p_photo_id;
  IF v_hash IS NULL THEN RAISE EXCEPTION 'Photo and its SHA-256 checksum are required'; END IF;
  INSERT INTO app_private.photo_approvals (photo_id, asset_sha256, evidence_reference, verified_by)
    VALUES (p_photo_id, v_hash, trim(p_evidence_reference), (SELECT auth.uid()))
    ON CONFLICT (photo_id) DO UPDATE SET asset_sha256 = excluded.asset_sha256,
      evidence_reference = excluded.evidence_reference, verified_by = excluded.verified_by,
      verified_at = now();
  INSERT INTO app_private.admin_audit(actor_id, action, entity_name, entity_id)
    VALUES ((SELECT auth.uid()), 'APPROVE_RIGHTS', 'photos', p_photo_id::text);
END; $$;
REVOKE ALL ON FUNCTION public.approve_photo_rights(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_photo_rights(uuid,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.approve_testimonial_rights(p_testimonial_id uuid, p_evidence_reference text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NOT public.is_site_admin() THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501'; END IF;
  IF p_evidence_reference IS NULL OR length(trim(p_evidence_reference)) < 3 THEN
    RAISE EXCEPTION 'An evidence reference is required';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.testimonials WHERE id = p_testimonial_id) THEN
    RAISE EXCEPTION 'Testimonial not found';
  END IF;
  INSERT INTO app_private.testimonial_approvals (testimonial_id, evidence_reference, verified_by)
    VALUES (p_testimonial_id, trim(p_evidence_reference), (SELECT auth.uid()))
    ON CONFLICT (testimonial_id) DO UPDATE SET evidence_reference = excluded.evidence_reference,
      verified_by = excluded.verified_by, verified_at = now();
  INSERT INTO app_private.admin_audit(actor_id, action, entity_name, entity_id)
    VALUES ((SELECT auth.uid()), 'APPROVE_RIGHTS', 'testimonials', p_testimonial_id::text);
END; $$;
REVOKE ALL ON FUNCTION public.approve_testimonial_rights(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_testimonial_rights(uuid,text) TO authenticated;

DO $$ DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['services','albums','photos','testimonials','site_content'] LOOP
    EXECUTE format('CREATE TRIGGER %I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at()',t,t);
    EXECUTE format('CREATE TRIGGER %I_admin_audit AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION app_private.log_admin_mutation()',t,t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
    EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC, anon, authenticated',t);
    EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated',t);
    EXECUTE format('GRANT INSERT, UPDATE, DELETE ON public.%I TO authenticated',t);
    EXECUTE format('CREATE POLICY %I_public_read ON public.%I FOR SELECT TO anon, authenticated USING (is_published = true)',t,t);
    EXECUTE format('CREATE POLICY %I_admin_manage ON public.%I FOR ALL TO authenticated USING ((SELECT public.is_site_admin())) WITH CHECK ((SELECT public.is_site_admin()))',t,t);
  END LOOP;
END $$;

-- Não expor fotos vinculadas a álbuns ainda não publicados.
DROP POLICY photos_public_read ON public.photos;
CREATE POLICY photos_public_read ON public.photos FOR SELECT TO anon, authenticated USING (
  is_published AND (album_id IS NULL OR EXISTS (
    SELECT 1 FROM public.albums a WHERE a.id = album_id AND a.is_published
  ))
);

CREATE INDEX albums_published_order ON public.albums (is_published,sort_order);
CREATE INDEX photos_album_order ON public.photos (album_id,is_published,sort_order);
CREATE INDEX testimonials_published_order ON public.testimonials (is_published,sort_order);
CREATE INDEX audit_recent ON app_private.admin_audit (happened_at DESC);

INSERT INTO public.services(code,title,summary,sort_order,is_published) VALUES
  ('buffet-completo','Buffet completo','Nós compramos os ingredientes e preparamos a comida para sua comemoração.',10,false),
  ('servico-de-cozinha','Serviço de cozinha','Você fornece os ingredientes e nossa equipe prepara a refeição no local.',20,false);

-- Upload e acesso privados (originais), entrega pública de imagens otimizadas (somente após direitos conferidos).
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES
  ('sabor-originais','sabor-originais',false,15728640,ARRAY['image/jpeg','image/png','image/webp','image/avif']),
  ('sabor-publicadas','sabor-publicadas',true,3145728,ARRAY['image/jpeg','image/png','image/webp','image/avif'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY sabor_admin_read_originals ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'sabor-originais' AND (SELECT public.is_site_admin()));
CREATE POLICY sabor_admin_upload_originals ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'sabor-originais' AND (SELECT public.is_site_admin()));
CREATE POLICY sabor_admin_delete_originals ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'sabor-originais' AND (SELECT public.is_site_admin()));
CREATE POLICY sabor_admin_upload_published ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'sabor-publicadas' AND (SELECT public.is_site_admin()));
-- Public URLs of the published bucket can be fetched by anyone; no write for anon.
-- No UPDATE/DELETE policy for the published bucket: changes require explicit server-side workflow.

REVOKE ALL ON SCHEMA app_private FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA app_private FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA app_private FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA app_private REVOKE ALL ON TABLES FROM PUBLIC;

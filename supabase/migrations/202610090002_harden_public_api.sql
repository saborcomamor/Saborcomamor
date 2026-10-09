-- Supabase concede EXECUTE explicitamente ao papel anon em funções públicas novas.
-- Remover os grants individuais; REVOKE FROM PUBLIC sozinho não é suficiente.
REVOKE EXECUTE ON FUNCTION public.is_site_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.approve_photo_rights(uuid,text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.approve_testimonial_rights(uuid,text) FROM anon;

-- Consolidar políticas de SELECT para evitar duas políticas permissivas por papel.
DO $$ DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['services','albums','photos','testimonials','site_content'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_public_read ON public.%I',t,t);
    EXECUTE format('DROP POLICY IF EXISTS %I_admin_manage ON public.%I',t,t);
    IF t = 'photos' THEN
      EXECUTE format('CREATE POLICY %I_anon_read ON public.%I FOR SELECT TO anon USING (is_published AND (album_id IS NULL OR EXISTS (SELECT 1 FROM public.albums a WHERE a.id = album_id AND a.is_published)))',t,t);
      EXECUTE format('CREATE POLICY %I_authenticated_read ON public.%I FOR SELECT TO authenticated USING ((SELECT public.is_site_admin()) OR (is_published AND (album_id IS NULL OR EXISTS (SELECT 1 FROM public.albums a WHERE a.id = album_id AND a.is_published))))',t,t);
    ELSE
      EXECUTE format('CREATE POLICY %I_anon_read ON public.%I FOR SELECT TO anon USING (is_published)',t,t);
      EXECUTE format('CREATE POLICY %I_authenticated_read ON public.%I FOR SELECT TO authenticated USING (is_published OR (SELECT public.is_site_admin()))',t,t);
    END IF;
    EXECUTE format('CREATE POLICY %I_admin_insert ON public.%I FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_site_admin()))',t,t);
    EXECUTE format('CREATE POLICY %I_admin_update ON public.%I FOR UPDATE TO authenticated USING ((SELECT public.is_site_admin())) WITH CHECK ((SELECT public.is_site_admin()))',t,t);
    EXECUTE format('CREATE POLICY %I_admin_delete ON public.%I FOR DELETE TO authenticated USING ((SELECT public.is_site_admin()))',t,t);
  END LOOP;
END $$;
CREATE INDEX photo_rights_by_verifier ON app_private.photo_approvals(verified_by);
CREATE INDEX testimonial_rights_by_verifier ON app_private.testimonial_approvals(verified_by);

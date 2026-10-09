-- Leia resultados e confirme 'false' para execução anon e acesso privado.
SELECT p.proname,has_function_privilege('anon',p.oid,'EXECUTE') AS anon_can_execute
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname IN (
  'approve_photo_rights','approve_testimonial_rights','register_photo_original','is_site_admin');
SELECT n.nspname,has_schema_privilege('anon',n.oid,'USAGE') AS anon_can_use_private_schema
FROM pg_namespace n WHERE n.nspname='app_private';
SELECT schemaname,tablename,rowsecurity FROM pg_tables
JOIN pg_class ON pg_class.relname=pg_tables.tablename
WHERE schemaname='public' AND tablename IN ('services','albums','photos','testimonials','site_content');

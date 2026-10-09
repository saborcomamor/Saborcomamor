# Migração P1 — perfis e entrada
Aplicada ao projeto Supabase `zjhdnsjkfurflhgtauot` como `business_profile_and_cinematic_intro`.
Tabelas: `public.business_profile` (somente id=1; RLS edição admin) e `public.intro_frames`
(seleção pública de fotos autorizadas).
Função administrativa `public.replace_intro_frames(uuid[])`: valida direitos, storage, máximo 12, ordem e troca atômica.
A migração é **aditiva**. Foram mantidas 41 fotografias, 60 posições e a galeria antiga.
O seed da entrada foi feito com as três fotos autorizadas nas posições `home.hero.01..03`.
**Reproduzir no outro banco**: criar as tabelas com RLS equivalentes e a função administrativa antes do deploy.

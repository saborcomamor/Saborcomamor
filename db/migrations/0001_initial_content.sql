-- Sabor com Amor | Migração 0001
-- Executada no projeto Neon square-art-75354279, banco neondb, branch production.
-- Operação não destrutiva: somente criação de schema, tabelas, índices e dois serviços rascunho.
-- NÃO adicionar dados pessoais, credenciais ou tokens nesta migração.
BEGIN;
CREATE SCHEMA IF NOT EXISTS sabor;

CREATE TABLE IF NOT EXISTS sabor.services (
  code text PRIMARY KEY CHECK (code ~ '^[a-z0-9-]{2,60}$'),
  title text NOT NULL CHECK(length(title) BETWEEN 2 AND 120),
  short_description text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sabor.albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK(slug ~ '^[a-z0-9-]{2,100}$'),
  title text NOT NULL CHECK(length(title) BETWEEN 2 AND 180),
  description text NOT NULL DEFAULT '',
  category text NOT NULL CHECK(category ~ '^[a-z0-9-]{2,50}$'),
  event_date date,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sabor.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid REFERENCES sabor.albums(id) ON DELETE RESTRICT,
  storage_key text NOT NULL UNIQUE CHECK(length(storage_key) BETWEEN 3 AND 512),
  alt_text text NOT NULL CHECK(length(alt_text) BETWEEN 3 AND 250),
  caption text NOT NULL DEFAULT '',
  width integer CHECK(width IS NULL OR width > 0),
  height integer CHECK(height IS NULL OR height > 0),
  display_order integer NOT NULL DEFAULT 0,
  rights_state text NOT NULL DEFAULT 'pending' CHECK(rights_state IN ('pending','cleared','blocked')),
  rights_reference text,
  rights_verified_at timestamptz,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT published_photo_requires_rights CHECK (
    NOT is_published OR
    (rights_state = 'cleared' AND rights_reference IS NOT NULL
       AND length(trim(rights_reference)) > 0 AND rights_verified_at IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS sabor.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL CHECK(length(display_name) BETWEEN 2 AND 120),
  body text NOT NULL CHECK(length(body) BETWEEN 10 AND 2500),
  consent_reference text,
  consent_verified_at timestamptz,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT published_testimonial_requires_consent CHECK (
    NOT is_published OR
    (consent_reference IS NOT NULL AND length(trim(consent_reference)) > 0
       AND consent_verified_at IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS sabor.site_content (
  section_key text PRIMARY KEY CHECK(section_key ~ '^[a-z0-9._-]{2,100}$'),
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  is_published boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sabor.admin_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_external_id text NOT NULL,
  action text NOT NULL CHECK(length(action) BETWEEN 3 AND 100),
  object_type text NOT NULL,
  object_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS albums_published_order_idx
  ON sabor.albums(is_published, display_order);
CREATE INDEX IF NOT EXISTS photos_album_published_order_idx
  ON sabor.photos(album_id, is_published, display_order);
CREATE INDEX IF NOT EXISTS testimonials_published_order_idx
  ON sabor.testimonials(is_published, display_order);
CREATE INDEX IF NOT EXISTS audit_by_created_idx
  ON sabor.admin_audit(created_at DESC);

-- Negar acesso por privilégios implícitos a qualquer usuário PUBLIC.
-- Quando houver backend, criar um papel restrito com acesso apenas ao necessário.
REVOKE ALL ON SCHEMA sabor FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA sabor FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA sabor FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA sabor REVOKE ALL ON TABLES FROM PUBLIC;

INSERT INTO sabor.services(code,title,short_description,display_order,is_published)
VALUES
  ('buffet-completo','Buffet completo','A equipe cuida da compra dos ingredientes e do preparo da refeição.',10,false),
  ('servico-de-cozinha','Serviço de cozinha','O cliente fornece os ingredientes e contrata a equipe para cozinhar.',20,false)
ON CONFLICT (code) DO NOTHING;
COMMIT;

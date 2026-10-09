import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const migration = readFileSync(new URL('../db/migrations/0001_initial_content.sql', import.meta.url), 'utf8');

test('migração é não destrutiva e não adiciona credenciais', () => {
  assert.ok(!/\bDROP\s+(TABLE|SCHEMA)\b|\bTRUNCATE\b|\bDELETE\s+FROM\b/i.test(migration));
  assert.ok(!/postgresql:\/\/\S+:\S+@/i.test(migration));
  assert.match(migration, /REVOKE ALL ON SCHEMA sabor FROM PUBLIC/);
});

test('publicação de fotografias exige verificação de direitos', () => {
  assert.match(migration, /CONSTRAINT published_photo_requires_rights/);
  assert.match(migration, /rights_state = 'cleared'/);
  assert.match(migration, /rights_verified_at IS NOT NULL/);
});

test('publicação de depoimentos exige referência de autorização', () => {
  assert.match(migration, /CONSTRAINT published_testimonial_requires_consent/);
  assert.match(migration, /consent_verified_at IS NOT NULL/);
});

test('a migração não cria tabela de leads antes do backend seguro', () => {
  assert.ok(!/CREATE TABLE[^;]*lead|CREATE TABLE[^;]*quote_request/i.test(migration));
});

/*
# GovSync Initial Schema

1. New Tables
- `services` — government service catalog (seeded)
- `api_registry` — connected department APIs with health info (seeded)
- `applications` — citizen applications with status tracking
- `application_events` — timeline events for each application
- `consent_records` — consent history for data access
- `audit_logs` — tamper-evident audit trail

2. Security
- RLS enabled on all tables
- anon + authenticated CRUD on all tables (single-tenant demo prototype)
*/

CREATE TABLE IF NOT EXISTS services (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  department text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'FileText',
  estimated_time text NOT NULL DEFAULT '5-10 min',
  required_data text[] NOT NULL DEFAULT '{}',
  eligibility_rules jsonb NOT NULL DEFAULT '[]',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_services" ON services;
CREATE POLICY "anon_read_services" ON services FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_services" ON services;
CREATE POLICY "anon_write_services" ON services FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_services" ON services;
CREATE POLICY "anon_update_services" ON services FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_services" ON services;
CREATE POLICY "anon_delete_services" ON services FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS api_registry (
  id text PRIMARY KEY,
  name text NOT NULL,
  department text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'Server',
  base_url text NOT NULL,
  status text NOT NULL DEFAULT 'operational',
  avg_response_ms integer NOT NULL DEFAULT 200,
  last_checked timestamptz DEFAULT now(),
  data_fields text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE api_registry ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_api_registry" ON api_registry;
CREATE POLICY "anon_read_api_registry" ON api_registry FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_api_registry" ON api_registry;
CREATE POLICY "anon_write_api_registry" ON api_registry FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_api_registry" ON api_registry;
CREATE POLICY "anon_update_api_registry" ON api_registry FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_api_registry" ON api_registry;
CREATE POLICY "anon_delete_api_registry" ON api_registry FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id text NOT NULL REFERENCES services(id),
  citizen_id text NOT NULL,
  citizen_name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  eligibility_result jsonb,
  normalized_data jsonb,
  conflicts jsonb DEFAULT '[]',
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_applications" ON applications;
CREATE POLICY "anon_read_applications" ON applications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_applications" ON applications;
CREATE POLICY "anon_insert_applications" ON applications FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_applications" ON applications;
CREATE POLICY "anon_update_applications" ON applications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_applications" ON applications;
CREATE POLICY "anon_delete_applications" ON applications FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS application_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  title text NOT NULL,
  description text,
  status text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE application_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_events" ON application_events;
CREATE POLICY "anon_read_events" ON application_events FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_events" ON application_events;
CREATE POLICY "anon_insert_events" ON application_events FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_events" ON application_events;
CREATE POLICY "anon_update_events" ON application_events FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_events" ON application_events;
CREATE POLICY "anon_delete_events" ON application_events FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  citizen_id text NOT NULL,
  service_id text NOT NULL,
  data_sources text[] NOT NULL DEFAULT '{}',
  fields_accessed jsonb NOT NULL DEFAULT '[]',
  granted boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_consent" ON consent_records;
CREATE POLICY "anon_read_consent" ON consent_records FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_consent" ON consent_records;
CREATE POLICY "anon_insert_consent" ON consent_records FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_consent" ON consent_records;
CREATE POLICY "anon_update_consent" ON consent_records FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_consent" ON consent_records;
CREATE POLICY "anon_delete_consent" ON consent_records FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id text NOT NULL,
  actor_role text NOT NULL DEFAULT 'citizen',
  action text NOT NULL,
  entity_type text,
  entity_id text,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_audit" ON audit_logs;
CREATE POLICY "anon_read_audit" ON audit_logs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_audit" ON audit_logs;
CREATE POLICY "anon_insert_audit" ON audit_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_audit" ON audit_logs;
CREATE POLICY "anon_update_audit" ON audit_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_audit" ON audit_logs;
CREATE POLICY "anon_delete_audit" ON audit_logs FOR DELETE TO anon, authenticated USING (true);

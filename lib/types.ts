import type React from 'react';
import type { Department, Service } from './demo';

export interface UserRow {
  id: string;
  name: string;
  mobile: string;
  role: 'citizen' | 'admin';
  password_hash: string;
  recovery_hash?: string | null;
  created_at: number;
}

export interface Account {
  id: string;
  name: string;
  mobile: string;
  role: 'citizen' | 'admin';
  citizenId?: string;
}

export interface ApplicationRecord {
  id: string;
  owner: string;
  citizen_id: string;
  name: string;
  status: string;
  consent: number;
  expires_at: string;
  scopes: string;
  result: string | null;
  service: string;
  details: string | null;
  decision_note: string | null;
  decided_at: string | null;
  email: string | null;
  statement: string | null;
  created_at: string;
  submitted_at: string | null;
}

export interface CheckRecord {
  id: string;
  application_id: string;
  department: string;
  raw: string;
  normalized: string;
  checked_at: string;
}

export interface AuditRecord {
  id: string;
  owner: string;
  application_id: string | null;
  action: string;
  department: string | null;
  outcome: string;
  details: string;
  duration_ms: number | null;
  created_at: string;
}

export interface RuleEvaluation {
  label: string;
  passed: boolean;
  detail: string;
}

export interface AssessmentResult {
  status: 'eligible' | 'ineligible' | 'needs_review';
  rules: RuleEvaluation[];
  profile: Record<string, unknown>;
  details?: Record<string, unknown>;
}

export interface CertificateData {
  reference: string;
  issuedAt: string | null;
  profile: Record<string, unknown>;
  notice: string;
}

export interface WorkspaceData {
  user: Account;
  applications: ApplicationRecord[];
  audit: AuditRecord[];
  citizens: Array<{ id: string; name: string; description: string; initials: string }>;
}

export interface AdminMappingData {
  application: Pick<ApplicationRecord, 'id' | 'name' | 'citizen_id' | 'service' | 'status'>;
  checks: Array<{
    department: Department;
    raw: Record<string, unknown>;
    normalized: Record<string, unknown>;
    checked_at: string;
  }>;
}

export interface DepartmentCheckState {
  raw: Record<string, unknown>;
  normalized: Record<string, unknown>;
}

export interface WorkspaceContext {
  view: string;
  workspace: WorkspaceData;
  loading: boolean;
  busy: boolean;
  auth: boolean;
  service: Service | null;
  citizen: string;
  setCitizen: (c: string) => void;
  scopes: string[];
  setScopes: React.Dispatch<React.SetStateAction<string[]>>;
  accepted: boolean;
  setAccepted: (a: boolean) => void;
  app: ApplicationRecord | null;
  setApp: React.Dispatch<React.SetStateAction<ApplicationRecord | null>>;
  records: Record<string, DepartmentCheckState>;
  setRecords: React.Dispatch<React.SetStateAction<Record<string, DepartmentCheckState>>>;
  checks: Record<string, string>;
  stage: number;
  setStage: (s: number) => void;
  outage: boolean;
  setOutage: (o: boolean) => void;
  mismatch: boolean;
  setMismatch: (m: boolean) => void;
  reuse: string;
  setReuse: (r: string) => void;
  details: Record<string, unknown>;
  setDetails: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  email: string;
  setEmail: (e: string) => void;
  statement: string;
  setStatement: (s: string) => void;
  confirmed: boolean;
  setConfirmed: (c: boolean) => void;
  certificate: CertificateData | null;
  setCertificate: React.Dispatch<React.SetStateAction<CertificateData | null>>;
  refresh: () => Promise<void>;
  move: (v: string) => void;
  reset: (next?: Service | null) => void;
  openApp: (a: ApplicationRecord) => Promise<void>;
  begin: () => Promise<void>;
  retry: () => Promise<void>;
  submit: () => Promise<void>;
  revoke: (a: ApplicationRecord) => Promise<void>;
  decide: (a: ApplicationRecord, decision: string, note: string) => Promise<void>;
  clarify: (note: string) => Promise<void>;
  validate: (input?: Record<string, unknown>) => Promise<void>;
  showCertificate: () => Promise<void>;
  task: (fn: () => Promise<void>) => Promise<void>;
  setError: (e: string) => void;
}


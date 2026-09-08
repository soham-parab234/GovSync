// ============== Core Domain Types ==============

export type DataSource = 'identity' | 'income' | 'education' | 'residence' | 'documents';

export type ApplicationStatus =
  | 'draft'
  | 'consent_granted'
  | 'data_fetching'
  | 'data_fetched'
  | 'eligibility_checking'
  | 'eligible'
  | 'not_eligible'
  | 'needs_review'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'manual_review';

export type ApiStatus = 'operational' | 'degraded' | 'down';

export interface Service {
  id: string;
  name: string;
  category: string;
  department: string;
  description: string;
  icon: string;
  estimated_time: string;
  required_data: DataSource[];
  eligibility_rules: EligibilityRule[];
  is_active: boolean;
}

export interface EligibilityRule {
  field: string;
  operator: '<=' | '>=' | '==' | '!=' | '<' | '>';
  value: number | boolean | string;
  label: string;
}

export interface ApiRegistryEntry {
  id: string;
  name: string;
  department: string;
  description: string;
  icon: string;
  base_url: string;
  status: ApiStatus;
  avg_response_ms: number;
  last_checked: string;
  data_fields: string[];
}

// ============== Mock API Response Types ==============

export interface IdentityData {
  source: 'identity';
  name: string;
  fatherName: string;
  dob: string;
  age: number;
  gender: string;
  aadhaarNumber: string;
  photo: string;
  address: string;
  verified: boolean;
}

export interface IncomeData {
  source: 'income';
  annualIncome: number;
  taxPaid: number;
  employer: string;
  panNumber: string;
  assessmentYear: string;
}

export interface EducationData {
  source: 'education';
  highestQualification: string;
  institution: string;
  passPercentage: number;
  graduationYear: number;
  marksheets: { subject: string; marks: number; year: number }[];
}

export interface ResidenceData {
  source: 'residence';
  address: string;
  residenceType: string;
  verified: boolean;
  district: string;
  state: string;
  pincode: string;
}

export interface DocumentsData {
  source: 'documents';
  documents: {
    type: string;
    name: string;
    issuedBy: string;
    issueDate: string;
    verified: boolean;
  }[];
}

export type DepartmentData =
  | IdentityData
  | IncomeData
  | EducationData
  | ResidenceData
  | DocumentsData;

// ============== Normalized Citizen Profile ==============

export interface NormalizedProfile {
  name: string;
  fatherName: string;
  dob: string;
  age: number;
  gender: string;
  annualIncome: number;
  taxPaid: number;
  employer: string;
  panNumber: string;
  highestQualification: string;
  institution: string;
  passPercentage: number;
  graduationYear: number;
  address: string;
  residenceType: string;
  residenceVerified: boolean;
  district: string;
  state: string;
  pincode: string;
  documentsVerified: boolean;
  documents: { type: string; name: string; issuedBy: string; verified: boolean }[];
}

// ============== Conflict Detection ==============

export interface DataConflict {
  field: string;
  sources: string[];
  values: string[];
  severity: 'low' | 'medium' | 'high';
  description: string;
}

// ============== Eligibility Result ==============

export interface EligibilityResult {
  eligible: boolean;
  needsReview: boolean;
  rules: {
    field: string;
    label: string;
    passed: boolean;
    actualValue: string | number | boolean;
    expectedValue: string | number | boolean;
  }[];
  summary: string;
}

// ============== API Fetch Result ==============

export interface FetchResult {
  source: DataSource;
  status: 'success' | 'timeout' | 'error' | 'retrying';
  data?: DepartmentData;
  error?: string;
  responseTimeMs: number;
  attempts: number;
}

// ============== Application ==============

export interface Application {
  id: string;
  service_id: string;
  citizen_id: string;
  citizen_name: string;
  status: ApplicationStatus;
  eligibility_result: EligibilityResult | null;
  normalized_data: NormalizedProfile | null;
  conflicts: DataConflict[];
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationEvent {
  id: string;
  application_id: string;
  event_type: string;
  title: string;
  description: string | null;
  status: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ============== Consent ==============

export interface ConsentRecord {
  id: string;
  application_id: string | null;
  citizen_id: string;
  service_id: string;
  data_sources: DataSource[];
  fields_accessed: { source: DataSource; fields: string[]; reason: string }[];
  granted: boolean;
  created_at: string;
}

// ============== Audit Log ==============

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_role: 'citizen' | 'admin' | 'system';
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

// ============== Demo Citizen ==============

export interface DemoCitizen {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'citizen' | 'admin';
  description: string;
  registered?: boolean;
}

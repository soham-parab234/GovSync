import type {
  Application,
  ApplicationEvent,
  ApiRegistryEntry,
  Service,
} from '@/lib/types';

// Static seed data used when Supabase is not configured.
// Mirrors the SQL seed in supabase/migrations/20260831151309_init_govsync_schema.sql

export const mockServices: Service[] = [
  {
    id: 'scholarship',
    name: 'Merit Scholarship',
    category: 'Education',
    department: 'Ministry of Education',
    description:
      'Financial assistance for meritorious students from economically weaker sections pursuing higher education.',
    icon: 'GraduationCap',
    estimated_time: '8-12 min',
    required_data: ['identity', 'income', 'education', 'residence'],
    eligibility_rules: [
      { field: 'income', operator: '<=', value: 800000, label: 'Annual family income must not exceed ₹8,00,000' },
      { field: 'educationPercentage', operator: '>=', value: 75, label: 'Must have scored 75% or above in last qualifying exam' },
      { field: 'age', operator: '<=', value: 25, label: 'Applicant age must be 25 or below' },
      { field: 'residenceVerified', operator: '==', value: true, label: 'Residence must be verified' },
    ],
    is_active: true,
  },
  {
    id: 'ration-card',
    name: 'Ration Card',
    category: 'Public Distribution',
    department: 'Department of Food & Public Distribution',
    description:
      'Apply for a new ration card to access subsidized food grains under PDS.',
    icon: 'ShoppingBasket',
    estimated_time: '10-15 min',
    required_data: ['identity', 'residence', 'income'],
    eligibility_rules: [
      { field: 'income', operator: '<=', value: 300000, label: 'Annual family income must not exceed ₹3,00,000 for BPL category' },
      { field: 'residenceVerified', operator: '==', value: true, label: 'Residence must be verified' },
      { field: 'age', operator: '>=', value: 18, label: 'Applicant must be 18 years or older' },
    ],
    is_active: true,
  },
  {
    id: 'passport',
    name: 'Passport Application',
    category: 'Identity & Travel',
    department: 'Ministry of External Affairs',
    description: 'Apply for a new passport for international travel.',
    icon: 'Plane',
    estimated_time: '15-20 min',
    required_data: ['identity', 'residence', 'documents'],
    eligibility_rules: [
      { field: 'age', operator: '>=', value: 18, label: 'Applicant must be 18 years or older' },
      { field: 'residenceVerified', operator: '==', value: true, label: 'Residence must be verified' },
      { field: 'documentsVerified', operator: '==', value: true, label: 'Identity documents must be verified' },
    ],
    is_active: true,
  },
  {
    id: 'pension',
    name: 'Old Age Pension',
    category: 'Social Welfare',
    department: 'Ministry of Social Justice',
    description:
      'Monthly pension for senior citizens above 60 years from economically weaker sections.',
    icon: 'HandHeart',
    estimated_time: '5-10 min',
    required_data: ['identity', 'income', 'residence'],
    eligibility_rules: [
      { field: 'age', operator: '>=', value: 60, label: 'Applicant must be 60 years or older' },
      { field: 'income', operator: '<=', value: 100000, label: 'Annual income must not exceed ₹1,00,000' },
      { field: 'residenceVerified', operator: '==', value: true, label: 'Residence must be verified' },
    ],
    is_active: true,
  },
  {
    id: 'income-certificate',
    name: 'Income Certificate',
    category: 'Documentation',
    department: 'Revenue Department',
    description: 'Official income certificate based on tax records and employer data.',
    icon: 'FileText',
    estimated_time: '5-8 min',
    required_data: ['identity', 'income'],
    eligibility_rules: [
      { field: 'age', operator: '>=', value: 18, label: 'Applicant must be 18 years or older' },
    ],
    is_active: true,
  },
  {
    id: 'caste-certificate',
    name: 'Caste Certificate',
    category: 'Documentation',
    department: 'Revenue Department',
    description:
      'Official caste certificate for accessing reservation benefits and schemes.',
    icon: 'ScrollText',
    estimated_time: '8-12 min',
    required_data: ['identity', 'residence', 'documents'],
    eligibility_rules: [
      { field: 'age', operator: '>=', value: 18, label: 'Applicant must be 18 years or older' },
      { field: 'residenceVerified', operator: '==', value: true, label: 'Residence must be verified' },
      { field: 'documentsVerified', operator: '==', value: true, label: 'Supporting documents must be verified' },
    ],
    is_active: true,
  },
];

export const mockApiRegistry: ApiRegistryEntry[] = [
  {
    id: 'identity',
    name: 'National Identity Service (Aadhaar)',
    department: 'UIDAI',
    description: 'Citizen identity verification and demographic data.',
    icon: 'Fingerprint',
    base_url: 'https://mock-api.govsync.gov.in/identity/v1',
    status: 'operational',
    avg_response_ms: 180,
    last_checked: new Date().toISOString(),
    data_fields: ['name', 'dob', 'gender', 'age', 'photo', 'address'],
  },
  {
    id: 'income',
    name: 'Income Tax Department API',
    department: 'CBDT',
    description: 'Annual income, tax returns, and employer verification data.',
    icon: 'ReceiptIndianRupee',
    base_url: 'https://mock-api.govsync.gov.in/income/v1',
    status: 'operational',
    avg_response_ms: 240,
    last_checked: new Date().toISOString(),
    data_fields: ['annualIncome', 'taxPaid', 'employer', 'panNumber', 'assessmentYear'],
  },
  {
    id: 'education',
    name: 'National Academic Depository',
    department: 'Ministry of Education',
    description: 'Academic qualifications, degrees, marksheets, and institution verification.',
    icon: 'GraduationCap',
    base_url: 'https://mock-api.govsync.gov.in/education/v1',
    status: 'operational',
    avg_response_ms: 310,
    last_checked: new Date().toISOString(),
    data_fields: ['highestQualification', 'institution', 'passPercentage', 'graduationYear', 'marksheets'],
  },
  {
    id: 'residence',
    name: 'Residence Verification API',
    department: 'Revenue Department',
    description: 'Address verification and residential status confirmation.',
    icon: 'Home',
    base_url: 'https://mock-api.govsync.gov.in/residence/v1',
    status: 'degraded',
    avg_response_ms: 520,
    last_checked: new Date().toISOString(),
    data_fields: ['address', 'residenceType', 'verified', 'district', 'state'],
  },
  {
    id: 'documents',
    name: 'DigiLocker Document Vault',
    department: 'MeitY',
    description: 'Government-issued digital documents and certificates.',
    icon: 'FolderLock',
    base_url: 'https://mock-api.govsync.gov.in/digilocker/v1',
    status: 'operational',
    avg_response_ms: 200,
    last_checked: new Date().toISOString(),
    data_fields: ['documents', 'verified', 'issuedBy', 'issueDate'],
  },
];

// In-memory stores for mock mode (applications, events, consent, audit)
export const mockApplications: Application[] = [];
export const mockApplicationEvents: ApplicationEvent[] = [];
export const mockConsentRecords: any[] = [];
export const mockAuditLogs: any[] = [];

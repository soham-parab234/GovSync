import type { DemoCitizen, DepartmentData } from '../types';

export const demoCitizens: DemoCitizen[] = [
  {
    id: 'citizen-001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@govsync.demo',
    password: 'demo1234',
    role: 'citizen',
    description: 'Eligible student — meets all scholarship criteria',
    aadhaar: '2345 6789 0123',
    phone: '98765 43210',
  },
  {
    id: 'citizen-002',
    name: 'Priya Patel',
    email: 'priya.patel@govsync.demo',
    password: 'demo1234',
    role: 'citizen',
    description: 'Income exceeds threshold — demonstrates eligibility failure',
    aadhaar: '3456 7890 1234',
    phone: '98760 54321',
  },
  {
    id: 'citizen-003',
    name: 'Rohan Kumar',
    email: 'rohan.kumar@govsync.demo',
    password: 'demo1234',
    role: 'citizen',
    description: 'Name conflict between departments — demonstrates conflict detection',
    aadhaar: '4567 8901 2345',
    phone: '98750 65432',
  },
  {
    id: 'admin-001',
    name: 'Admin Officer',
    email: 'admin@govsync.demo',
    password: 'admin1234',
    role: 'admin',
    description: 'Government administrator — access admin dashboard',
    aadhaar: '5678 9012 3456',
    phone: '98740 76543',
  },
];

// Seeded mock government data per citizen.
// This simulates what each department's authoritative system would return.
export const citizenMockData: Record<string, Record<string, DepartmentData>> = {
  'citizen-001': {
    identity: {
      source: 'identity',
      name: 'Aarav Sharma',
      fatherName: 'Rajesh Sharma',
      dob: '2002-03-15',
      age: 23,
      gender: 'Male',
      aadhaarNumber: 'XXXX-XXXX-1234',
      photo: '',
      address: '12 Bhandari Marg, Civil Lines, Jaipur, Rajasthan',
      verified: true,
    },
    income: {
      source: 'income',
      annualIncome: 450000,
      taxPaid: 12500,
      employer: 'Self / Family Business',
      panNumber: 'ABCD1234E',
      assessmentYear: '2024-25',
    },
    education: {
      source: 'education',
      highestQualification: 'B.Tech (Computer Science)',
      institution: 'Rajasthan Technical University',
      passPercentage: 82,
      graduationYear: 2024,
      marksheets: [
        { subject: 'Data Structures', marks: 85, year: 2023 },
        { subject: 'Algorithms', marks: 88, year: 2023 },
        { subject: 'Database Systems', marks: 79, year: 2024 },
      ],
    },
    residence: {
      source: 'residence',
      address: '12 Bhandari Marg, Civil Lines, Jaipur, Rajasthan',
      residenceType: 'Owned',
      verified: true,
      district: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302001',
    },
    documents: {
      source: 'documents',
      documents: [
        { type: 'Aadhaar Card', name: 'Aadhaar_Card.pdf', issuedBy: 'UIDAI', issueDate: '2018-05-10', verified: true },
        { type: '10th Marksheet', name: '10th_Marksheet.pdf', issuedBy: 'CBSE', issueDate: '2018-05-20', verified: true },
        { type: '12th Marksheet', name: '12th_Marksheet.pdf', issuedBy: 'CBSE', issueDate: '2020-05-15', verified: true },
        { type: 'B.Tech Degree', name: 'BTech_Degree.pdf', issuedBy: 'RTU', issueDate: '2024-07-10', verified: true },
      ],
    },
  },
  'citizen-002': {
    identity: {
      source: 'identity',
      name: 'Priya Patel',
      fatherName: 'Suresh Patel',
      dob: '2001-07-22',
      age: 24,
      gender: 'Female',
      aadhaarNumber: 'XXXX-XXXX-5678',
      photo: '',
      address: '45 MG Road, Vastrapur, Ahmedabad, Gujarat',
      verified: true,
    },
    income: {
      source: 'income',
      annualIncome: 1200000,
      taxPaid: 95000,
      employer: 'Infosys Limited',
      panNumber: 'EFGH5678J',
      assessmentYear: '2024-25',
    },
    education: {
      source: 'education',
      highestQualification: 'M.Sc (Physics)',
      institution: 'Gujarat University',
      passPercentage: 78,
      graduationYear: 2023,
      marksheets: [
        { subject: 'Quantum Mechanics', marks: 80, year: 2022 },
        { subject: 'Thermodynamics', marks: 76, year: 2022 },
      ],
    },
    residence: {
      source: 'residence',
      address: '45 MG Road, Vastrapur, Ahmedabad, Gujarat',
      residenceType: 'Owned',
      verified: true,
      district: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380015',
    },
    documents: {
      source: 'documents',
      documents: [
        { type: 'Aadhaar Card', name: 'Aadhaar_Card.pdf', issuedBy: 'UIDAI', issueDate: '2017-03-12', verified: true },
        { type: 'M.Sc Degree', name: 'MSc_Degree.pdf', issuedBy: 'GU', issueDate: '2023-06-20', verified: true },
      ],
    },
  },
  'citizen-003': {
    identity: {
      source: 'identity',
      name: 'Rohan Kumar',
      fatherName: 'Mohan Kumar',
      dob: '2003-01-10',
      age: 22,
      gender: 'Male',
      aadhaarNumber: 'XXXX-XXXX-9012',
      photo: '',
      address: '78 Park Street, Kolkata, West Bengal',
      verified: true,
    },
    income: {
      source: 'income',
      annualIncome: 350000,
      taxPaid: 5000,
      employer: 'Self / Family Business',
      panNumber: 'IJKL9012K',
      assessmentYear: '2024-25',
    },
    education: {
      source: 'education',
      highestQualification: 'B.A (History)',
      institution: 'University of Calcutta',
      passPercentage: 72,
      graduationYear: 2024,
      marksheets: [
        { subject: 'Ancient Indian History', marks: 74, year: 2023 },
        { subject: 'Medieval India', marks: 70, year: 2023 },
      ],
    },
    // Note: address differs from identity — triggers conflict detection
    residence: {
      source: 'residence',
      address: '14 Camac Street, Park Street Area, Kolkata, West Bengal',
      residenceType: 'Rented',
      verified: true,
      district: 'Kolkata',
      state: 'West Bengal',
      pincode: '700017',
    },
    documents: {
      source: 'documents',
      documents: [
        { type: 'Aadhaar Card', name: 'Aadhaar_Card.pdf', issuedBy: 'UIDAI', issueDate: '2019-08-15', verified: true },
        { type: 'B.A Degree', name: 'BA_Degree.pdf', issuedBy: 'CU', issueDate: '2024-06-05', verified: false },
      ],
    },
  },
};

// ============== Registration Support ==============

const REGISTERED_STORAGE_KEY = 'govsync-registered';

interface StoredCitizen {
  citizen: DemoCitizen;
  mockData: Record<string, DepartmentData>;
}

export function isEmailRegistered(email: string): boolean {
  return demoCitizens.some(
    (c) => c.email.toLowerCase() === email.toLowerCase(),
  );
}

export function isIdentifierRegistered(identifier: string, method: 'email' | 'aadhaar' | 'phone'): boolean {
  const norm = identifier.replace(/\s/g, '').toLowerCase();
  return demoCitizens.some((c) => {
    if (method === 'email') return c.email.toLowerCase() === norm;
    if (method === 'aadhaar') return (c.aadhaar || '').replace(/\s/g, '') === norm;
    if (method === 'phone') return (c.phone || '').replace(/\s/g, '') === norm;
    return false;
  });
}

function computeAgeFromDob(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function generateCitizenMockData(
  citizenId: string,
  name: string,
  dob: string,
  documents: { type: string; name: string; issuedBy: string; issueDate: string; verified: boolean }[],
): Record<string, DepartmentData> {
  const suffix = citizenId.replace(/[^0-9a-z]/gi, '').slice(-4).padStart(4, '0');
  const age = computeAgeFromDob(dob);
  const address = 'Address on file with UIDAI';
  return {
    identity: {
      source: 'identity',
      name,
      fatherName: '—',
      dob,
      age,
      gender: '—',
      aadhaarNumber: `XXXX-XXXX-${suffix}`,
      photo: '',
      address,
      verified: true,
    },
    income: {
      source: 'income',
      annualIncome: 100000,
      taxPaid: 0,
      employer: 'Self Employed',
      panNumber: `ABCD${suffix}E`,
      assessmentYear: '2024-25',
    },
    education: {
      source: 'education',
      highestQualification: 'Graduate',
      institution: 'State University',
      passPercentage: 88,
      graduationYear: 2020,
      marksheets: [],
    },
    residence: {
      source: 'residence',
      address,
      residenceType: 'Owned',
      verified: true,
      district: 'Central District',
      state: 'Home State',
      pincode: '110001',
    },
    documents: {
      source: 'documents',
      documents: documents.map((d) => ({ ...d, verified: true })),
    },
  };
}

export function addRegisteredCitizen(
  citizen: DemoCitizen,
  mockData: Record<string, DepartmentData>,
): void {
  demoCitizens.push(citizen);
  citizenMockData[citizen.id] = mockData;

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(REGISTERED_STORAGE_KEY);
      const existing = stored ? (JSON.parse(stored) as StoredCitizen[]) : [];
      existing.push({ citizen, mockData });
      localStorage.setItem(REGISTERED_STORAGE_KEY, JSON.stringify(existing));
    } catch {
      // storage may be full or unavailable
    }
  }
}

export function loadRegisteredCitizens(): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(REGISTERED_STORAGE_KEY);
    if (!stored) return;
    const citizens = JSON.parse(stored) as StoredCitizen[];
    citizens.forEach(({ citizen, mockData }) => {
      if (!demoCitizens.find((c) => c.id === citizen.id)) {
        demoCitizens.push(citizen);
      }
      citizenMockData[citizen.id] = mockData;
    });
  } catch {
    // corrupted storage — ignore
  }
}

loadRegisteredCitizens();

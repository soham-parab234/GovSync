import type { DataSource, DepartmentData, FetchResult } from '../types';
import { citizenMockData } from './seedData';

const SIMULATED_LATENCY = {
  identity: 180,
  income: 240,
  education: 310,
  residence: 520,
  documents: 200,
};

const TIMEOUT_THRESHOLD = 4000;
const MAX_RETRIES = 2;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  source: DataSource,
  citizenId: string,
  attempt = 0,
): Promise<FetchResult> {
  const latency = SIMULATED_LATENCY[source] ?? 300;
  const startTime = Date.now();

  await delay(latency + Math.random() * 100);

  const data = citizenMockData[citizenId]?.[source];

  if (!data) {
    return {
      source,
      status: 'error',
      error: `No data found for citizen ${citizenId} at source ${source}`,
      responseTimeMs: Date.now() - startTime,
      attempts: attempt + 1,
    };
  }

  // Simulate occasional timeout for degraded APIs (residence is marked degraded)
  if (source === 'residence' && Math.random() < 0.15 && attempt < MAX_RETRIES) {
    if (latency > TIMEOUT_THRESHOLD / 2) {
      return {
        source,
        status: 'retrying',
        error: 'Request timed out, retrying...',
        responseTimeMs: TIMEOUT_THRESHOLD,
        attempts: attempt + 1,
      };
    }
  }

  return {
    source,
    status: 'success',
    data: data as DepartmentData,
    responseTimeMs: Date.now() - startTime,
    attempts: attempt + 1,
  };
}

export async function fetchFromDepartment(
  source: DataSource,
  citizenId: string,
): Promise<FetchResult> {
  let result = await fetchWithRetry(source, citizenId);

  if (result.status === 'retrying') {
    result = await fetchWithRetry(source, citizenId, result.attempts);
    if (result.status === 'retrying') {
      result = await fetchWithRetry(source, citizenId, result.attempts);
    }
  }

  if (result.status === 'retrying') {
    return {
      source,
      status: 'timeout',
      error: 'Request timed out after maximum retries. Manual review required.',
      responseTimeMs: TIMEOUT_THRESHOLD,
      attempts: MAX_RETRIES + 1,
    };
  }

  return result;
}

export async function fetchAllDepartments(
  sources: DataSource[],
  citizenId: string,
): Promise<FetchResult[]> {
  const results = await Promise.all(
    sources.map((source) => fetchFromDepartment(source, citizenId)),
  );
  return results;
}

export const apiRegistry: Record<DataSource, { name: string; department: string; icon: string }> = {
  identity: { name: 'National Identity Service', department: 'UIDAI', icon: 'Fingerprint' },
  income: { name: 'Income Tax Department', department: 'CBDT', icon: 'ReceiptIndianRupee' },
  education: { name: 'National Academic Depository', department: 'Ministry of Education', icon: 'GraduationCap' },
  residence: { name: 'Residence Verification API', department: 'Revenue Department', icon: 'Home' },
  documents: { name: 'DigiLocker Document Vault', department: 'MeitY', icon: 'FolderLock' },
};

export const dataFieldDescriptions: Record<DataSource, { fields: string[]; reason: string }> = {
  identity: {
    fields: ['Name', 'Date of Birth', 'Age', 'Gender', 'Aadhaar Number', 'Address'],
    reason: 'To verify your identity and confirm you are the applicant.',
  },
  income: {
    fields: ['Annual Income', 'Tax Paid', 'Employer', 'PAN Number'],
    reason: 'To determine financial eligibility and income category.',
  },
  education: {
    fields: ['Highest Qualification', 'Institution', 'Pass Percentage', 'Graduation Year'],
    reason: 'To verify academic merit and qualification requirements.',
  },
  residence: {
    fields: ['Address', 'Residence Type', 'Verification Status', 'District', 'State'],
    reason: 'To confirm residential eligibility and domicile status.',
  },
  documents: {
    fields: ['Government Documents', 'Verification Status', 'Issuing Authority'],
    reason: 'To retrieve supporting documents from your DigiLocker.',
  },
};

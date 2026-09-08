import type {
  DataConflict,
  DepartmentData,
  EligibilityResult,
  EligibilityRule,
  FetchResult,
  NormalizedProfile,
  Service,
  DataSource,
} from './types';

// ============== Requirement Engine ==============

export function getRequiredDataSources(service: Service): DataSource[] {
  return service.required_data;
}

export function getDataRequirements(service: Service): { source: DataSource; fields: string[]; reason: string }[] {
  const fieldMap: Record<DataSource, string[]> = {
    identity: ['Name', 'Date of Birth', 'Age', 'Gender', 'Aadhaar Number', 'Address'],
    income: ['Annual Income', 'Tax Paid', 'Employer', 'PAN Number'],
    education: ['Highest Qualification', 'Institution', 'Pass Percentage', 'Graduation Year'],
    residence: ['Address', 'Residence Type', 'Verification Status', 'District', 'State'],
    documents: ['Government Documents', 'Verification Status', 'Issuing Authority'],
  };

  const reasonMap: Record<DataSource, string> = {
    identity: 'To verify your identity and confirm you are the applicant.',
    income: 'To determine financial eligibility and income category.',
    education: 'To verify academic merit and qualification requirements.',
    residence: 'To confirm residential eligibility and domicile status.',
    documents: 'To retrieve supporting documents from your DigiLocker.',
  };

  return service.required_data.map((src: DataSource) => ({
    source: src,
    fields: fieldMap[src],
    reason: reasonMap[src],
  }));
}

// ============== Data Normalization ==============

export function normalizeData(fetchResults: FetchResult[]): NormalizedProfile | null {
  const successResults = fetchResults.filter((r) => r.status === 'success' && r.data);
  if (successResults.length === 0) return null;

  const dataMap: Record<string, DepartmentData> = {};
  successResults.forEach((r) => {
    if (r.data) dataMap[r.source] = r.data;
  });

  const identity = dataMap.identity as Extract<DepartmentData, { source: 'identity' }> | undefined;
  const income = dataMap.income as Extract<DepartmentData, { source: 'income' }> | undefined;
  const education = dataMap.education as Extract<DepartmentData, { source: 'education' }> | undefined;
  const residence = dataMap.residence as Extract<DepartmentData, { source: 'residence' }> | undefined;
  const documents = dataMap.documents as Extract<DepartmentData, { source: 'documents' }> | undefined;

  return {
    name: identity?.name ?? '',
    fatherName: identity?.fatherName ?? '',
    dob: identity?.dob ?? '',
    age: identity?.age ?? 0,
    gender: identity?.gender ?? '',
    annualIncome: income?.annualIncome ?? 0,
    taxPaid: income?.taxPaid ?? 0,
    employer: income?.employer ?? '',
    panNumber: income?.panNumber ?? '',
    highestQualification: education?.highestQualification ?? '',
    institution: education?.institution ?? '',
    passPercentage: education?.passPercentage ?? 0,
    graduationYear: education?.graduationYear ?? 0,
    address: residence?.address ?? identity?.address ?? '',
    residenceType: residence?.residenceType ?? '',
    residenceVerified: residence?.verified ?? false,
    district: residence?.district ?? '',
    state: residence?.state ?? '',
    pincode: residence?.pincode ?? '',
    documentsVerified: documents?.documents.every((d) => d.verified) ?? false,
    documents:
      documents?.documents.map((d) => ({
        type: d.type,
        name: d.name,
        issuedBy: d.issuedBy,
        verified: d.verified,
      })) ?? [],
  };
}

// ============== Conflict Detection ==============

export function detectConflicts(fetchResults: FetchResult[]): DataConflict[] {
  const conflicts: DataConflict[] = [];
  const successResults = fetchResults.filter((r) => r.status === 'success' && r.data);
  const dataMap: Record<string, DepartmentData> = {};
  successResults.forEach((r) => {
    if (r.data) dataMap[r.source] = r.data;
  });

  const identity = dataMap.identity as Extract<DepartmentData, { source: 'identity' }> | undefined;
  const residence = dataMap.residence as Extract<DepartmentData, { source: 'residence' }> | undefined;

  // Address conflict between identity and residence
  if (identity && residence) {
    if (identity.address && residence.address && identity.address !== residence.address) {
      conflicts.push({
        field: 'Address',
        sources: ['Identity (UIDAI)', 'Residence (Revenue Dept)'],
        values: [identity.address, residence.address],
        severity: 'medium',
        description: 'Address on Aadhaar does not match address in residence records.',
      });
    }
  }

  // Name conflict simulation for citizen-003
  // In a real system, we'd compare name fields across sources
  // Here we check if education institution name has discrepancies
  const education = dataMap.education as Extract<DepartmentData, { source: 'education' }> | undefined;
  if (identity && education) {
    // Check for potential name mismatch in records (simulated)
    if (identity.name && education.institution) {
      // This is a placeholder for real cross-source name verification
      // In production, we'd compare the citizen's name as recorded by each department
    }
  }

  return conflicts;
}

// ============== Eligibility Engine ==============

export function evaluateEligibility(
  rules: EligibilityRule[],
  profile: NormalizedProfile,
): EligibilityResult {
  const fieldAccessors: Record<string, (p: NormalizedProfile) => number | boolean | string> = {
    income: (p) => p.annualIncome,
    age: (p) => p.age,
    educationPercentage: (p) => p.passPercentage,
    residenceVerified: (p) => p.residenceVerified,
    documentsVerified: (p) => p.documentsVerified,
  };

  const evaluatedRules = rules.map((rule) => {
    const accessor = fieldAccessors[rule.field];
    const actualValue = accessor ? accessor(profile) : 0;
    let passed = false;

    switch (rule.operator) {
      case '<=':
        passed = (actualValue as number) <= (rule.value as number);
        break;
      case '>=':
        passed = (actualValue as number) >= (rule.value as number);
        break;
      case '==':
        passed = actualValue === rule.value;
        break;
      case '!=':
        passed = actualValue !== rule.value;
        break;
      case '<':
        passed = (actualValue as number) < (rule.value as number);
        break;
      case '>':
        passed = (actualValue as number) > (rule.value as number);
        break;
    }

    return {
      field: rule.field,
      label: rule.label,
      passed,
      actualValue,
      expectedValue: rule.value,
    };
  });

  const failedRules = evaluatedRules.filter((r) => !r.passed);
  const allPassed = failedRules.length === 0;
  const needsReview = !allPassed && failedRules.some((r) => r.field === 'residenceVerified' || r.field === 'documentsVerified');

  let summary: string;
  if (allPassed) {
    summary = 'All eligibility criteria have been met. The application is eligible for submission.';
  } else if (needsReview) {
    summary = 'Some verification checks require manual review. The application will be forwarded for manual verification.';
  } else {
    summary = `${failedRules.length} eligibility ${failedRules.length === 1 ? 'criterion' : 'criteria'} not met. Please review the failed conditions below.`;
  }

  return {
    eligible: allPassed,
    needsReview,
    rules: evaluatedRules,
    summary,
  };
}

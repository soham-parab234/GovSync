export const purposes = ['Education', 'Employment', 'Government service'] as const;
export const trackedStatuses = ['submitted', 'approved', 'clarification', 'rejected'];

export function residenceDetails(records: Record<string, Record<string, unknown>>, input: Record<string, unknown> = {}) {
  const residence = records.residence || {};
  const documents = records.documents || {};
  return {
    address: typeof input.address === 'string' ? input.address.trim() : String(residence.address || ''),
    residenceSince: Number(input.residenceSince ?? residence.residenceSince),
    purpose: typeof input.purpose === 'string' ? input.purpose : 'Education',
    documentId: typeof input.documentId === 'string' ? input.documentId : String(documents.documentId || ''),
  };
}

export function assessResidence(records: Record<string, Record<string, unknown>>, input: Record<string, unknown> = {}) {
  const identity = records.identity || {};
  const residence = records.residence || {};
  const documents = records.documents || {};
  const details = residenceDetails(records, input);
  const birthYear = typeof identity.dateOfBirth === 'string' ? Number(identity.dateOfBirth.slice(0, 4)) : 0;
  const rules = [
    { label: 'Name matches identity record', passed: Boolean(identity.name) && identity.citizenId === documents.citizenId },
    { label: 'Address matches residence registry', passed: details.address === residence.address },
    { label: 'Address format valid', passed: details.address.length >= 10 && details.address.length <= 250 },
    { label: 'District matches PIN', passed: residence.district === 'Mumbai Suburban' && residence.pin === '400069' },
    { label: 'Verified Maharashtra domicile', passed: residence.state === 'Maharashtra' && residence.domicileVerified === true },
    { label: 'Verified supporting document', passed: documents.documentVerified === true && details.documentId === documents.documentId },
    { label: 'Residence history matches registry', passed: Number.isInteger(details.residenceSince) && details.residenceSince === residence.residenceSince && details.residenceSince >= birthYear && details.residenceSince <= new Date().getFullYear() },
    { label: 'Required fields complete', passed: (purposes as readonly string[]).includes(details.purpose) && Boolean(details.address) && Boolean(details.documentId) },
  ];
  return { status: rules.every(r => r.passed) ? 'eligible' : 'needs_review', rules, profile: { ...identity, ...residence, ...documents, ...details }, details };
}

export const purposes = ['Education', 'Employment', 'Government service'] as const;
export const trackedStatuses = ['submitted', 'approved', 'clarification', 'rejected'];
export function residenceDetails(records: Record<string, any>, input: Record<string, any> = {}) {
  return {
    address: typeof input.address === 'string' ? input.address.trim() : records.residence.address,
    residenceSince: Number(input.residenceSince ?? records.residence.residenceSince),
    purpose: input.purpose ?? 'Education',
    documentId: input.documentId ?? records.documents.documentId,
  };
}
export function assessResidence(records: Record<string, any>, input: Record<string, any> = {}) {
  const { identity, residence, documents } = records;
  const details = residenceDetails(records, input);
  const rules = [
    { label: 'Name matches identity record', passed: !!identity.name && identity.citizenId === documents.citizenId },
    { label: 'Address matches residence registry', passed: details.address === residence.address },
    { label: 'Address format valid', passed: details.address.length >= 10 && details.address.length <= 250 },
    { label: 'District matches PIN', passed: residence.district === 'Mumbai Suburban' && residence.pin === '400069' },
    { label: 'Verified Maharashtra domicile', passed: residence.state === 'Maharashtra' && residence.domicileVerified === true },
    { label: 'Verified supporting document', passed: documents.documentVerified === true && details.documentId === documents.documentId },
    { label: 'Residence history matches registry', passed: Number.isInteger(details.residenceSince) && details.residenceSince === residence.residenceSince && details.residenceSince >= Number(identity.dateOfBirth.slice(0,4)) && details.residenceSince <= new Date().getFullYear() },
    { label: 'Required fields complete', passed: purposes.includes(details.purpose) && !!details.address && !!details.documentId },
  ];
  return { status: rules.every(r => r.passed) ? 'eligible' : 'needs_review', rules, profile: { ...identity, ...residence, ...documents, ...details }, details };
}

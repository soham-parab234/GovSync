import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Shield, Fingerprint, ReceiptIndianRupee, GraduationCap, Chrome as Home, FolderLock, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Clock, Loader as Loader2, Circle as XCircle, FileCheck2, Send } from 'lucide-react';
import { fetchServiceById, createApplication, addApplicationEvent, createConsentRecord, updateApplicationStatus, addAuditLog } from '@/lib/db';
import { fetchAllDepartments } from '@/lib/mockApi/adapters';
import { normalizeData, detectConflicts, evaluateEligibility, getDataRequirements } from '@/lib/engine';
import { useAuth } from '@/context/AuthContext';
import type { Service, DataSource, FetchResult, NormalizedProfile, DataConflict, EligibilityResult } from '@/lib/types';
import { Card, Modal } from '@/components/ui';
import { getIcon } from '@/components/ui/Badges';

type Step = 'detail' | 'consent' | 'fetching' | 'profile' | 'conflict_resolution' | 'eligibility' | 'submit' | 'done';

const sourceIcons: Record<DataSource, typeof Fingerprint> = {
  identity: Fingerprint,
  income: ReceiptIndianRupee,
  education: GraduationCap,
  residence: Home,
  documents: FolderLock,
};

const sourceNames: Record<DataSource, string> = {
  identity: 'National Identity Service (UIDAI)',
  income: 'Income Tax Department (CBDT)',
  education: 'National Academic Depository',
  residence: 'Residence Verification (Revenue Dept)',
  documents: 'DigiLocker Document Vault',
};

export function ServiceDetailPage({ serviceId, onBack, onNavigate }: { serviceId: string; onBack: () => void; onNavigate: (v: 'applications') => void }) {
  const { citizen } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('detail');
  const [consentOpen, setConsentOpen] = useState(false);
  const [consentGranted, setConsentGranted] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [fetchResults, setFetchResults] = useState<FetchResult[]>([]);
  const [profile, setProfile] = useState<NormalizedProfile | null>(null);
  const [conflicts, setConflicts] = useState<DataConflict[]>([]);
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [conflictSelections, setConflictSelections] = useState<Record<number, string>>({});
  const [manualInputs, setManualInputs] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchServiceById(serviceId)
      .then(setService)
      .finally(() => setLoading(false));
  }, [serviceId]);

  const requirements = service ? getDataRequirements(service) : [];

  const handleConsent = async (granted: boolean) => {
    if (!citizen || !service) return;
    setConsentOpen(false);
    setConsentGranted(granted);

    if (!granted) return;

    // Create application
    const app = await createApplication(service.id, citizen.id, citizen.name);
    setApplicationId(app.id);

    // Log consent
    await createConsentRecord(app.id, citizen.id, service.id, service.required_data, requirements, true);
    await addAuditLog(citizen.id, 'citizen', 'CONSENT_GRANTED', 'application', app.id, { service_id: service.id, data_sources: service.required_data });
    await addApplicationEvent(app.id, 'consent', 'Consent Granted', `Citizen granted consent to access ${service.required_data.length} data sources`, 'consent_granted', { sources: service.required_data });

    await updateApplicationStatus(app.id, 'consent_granted');

    // Start fetching
    setStep('fetching');
    await updateApplicationStatus(app.id, 'data_fetching');
    await addApplicationEvent(app.id, 'data_fetch', 'Fetching Data from Departments', 'Retrieving data from mock government APIs', 'data_fetching');

    const results = await fetchAllDepartments(service.required_data, citizen.id);
    setFetchResults(results);

    const successCount = results.filter((r) => r.status === 'success').length;
    const failedSources = results.filter((r) => r.status !== 'success').map((r) => r.source);

    await addApplicationEvent(
      app.id,
      'data_fetched',
      `Data Retrieved from ${successCount}/${results.length} Sources`,
      failedSources.length > 0 ? `Failed sources: ${failedSources.join(', ')}` : 'All department APIs responded successfully',
      'data_fetched',
      { results: results.map((r) => ({ source: r.source, status: r.status, responseTimeMs: r.responseTimeMs })) },
    );

    // Normalize & detect conflicts
    const normalized = normalizeData(results);
    const detectedConflicts = detectConflicts(results);
    setProfile(normalized);
    setConflicts(detectedConflicts);

    await updateApplicationStatus(app.id, 'data_fetched', {
      normalized_data: normalized || undefined,
      conflicts: detectedConflicts,
    });

    if (detectedConflicts.length > 0) {
      setStep('conflict_resolution');
    } else if (normalized) {
      await proceedToEligibility(app.id, normalized);
    }
  };

  const proceedToEligibility = async (appId: string, normalizedProfile: NormalizedProfile) => {
    if (!citizen || !service) return;

    setStep('eligibility');
    await updateApplicationStatus(appId, 'eligibility_checking');
    await addApplicationEvent(appId, 'eligibility_check', 'Checking Eligibility', 'Running deterministic rule-based eligibility engine', 'eligibility_checking');

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (service.eligibility_rules) {
      const result = evaluateEligibility(service.eligibility_rules as any, normalizedProfile);
      setEligibility(result);

      const status = result.eligible ? 'eligible' : result.needsReview ? 'needs_review' : 'not_eligible';
      await updateApplicationStatus(appId, status as any, { eligibility_result: result });
      await addApplicationEvent(
        appId,
        'eligibility_result',
        result.eligible ? 'Eligibility Confirmed' : result.needsReview ? 'Manual Review Required' : 'Not Eligible',
        result.summary,
        status,
        { rules: result.rules },
      );
      await addAuditLog(citizen.id, 'citizen', 'ELIGIBILITY_CHECKED', 'application', appId, { eligible: result.eligible, needs_review: result.needsReview });
    }

    setStep('submit');
  };

  const allConflictsResolved = conflicts.every((_, i) => !!conflictSelections[i]?.trim());

  const handleConflictResolve = async () => {
    if (!applicationId || !profile || !citizen || !allConflictsResolved) return;

    const correctedProfile = { ...profile };
    const corrections: { field: string; oldValue: string; newValue: string }[] = [];

    conflicts.forEach((conflict, i) => {
      const correctedValue = conflictSelections[i]?.trim();
      if (correctedValue) {
        if (conflict.field === 'Address' && correctedValue !== correctedProfile.address) {
          corrections.push({ field: conflict.field, oldValue: correctedProfile.address, newValue: correctedValue });
          correctedProfile.address = correctedValue;
        }
      }
    });

    setProfile(correctedProfile);

    await addApplicationEvent(applicationId, 'data_corrected', 'Data Conflicts Resolved', `${corrections.length} field(s) corrected by citizen`, 'data_fetched', { corrections });
    await addAuditLog(citizen.id, 'citizen', 'DATA_CORRECTED', 'application', applicationId, { corrections });
    await updateApplicationStatus(applicationId, 'data_fetched', { normalized_data: correctedProfile });

    await proceedToEligibility(applicationId, correctedProfile);
  };

  const handleSubmit = async () => {
    if (!applicationId || !citizen || !service) return;
    setSubmitting(true);

    const now = new Date().toISOString();
    await updateApplicationStatus(applicationId, 'submitted', { submitted_at: now });
    await addApplicationEvent(applicationId, 'submit', 'Application Submitted', 'Application has been submitted for processing', 'submitted');
    await addAuditLog(citizen.id, 'citizen', 'APPLICATION_SUBMITTED', 'application', applicationId, { service_id: service.id });

    // Simulate department review
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await updateApplicationStatus(applicationId, 'under_review');
    await addApplicationEvent(applicationId, 'review', 'Under Review', 'Application is being reviewed by the concerned department', 'under_review');

    setSubmitting(false);
    setStep('done');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gov-600" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600">Service not found.</p>
        <button onClick={onBack} className="btn-secondary mt-4">Go Back</button>
      </div>
    );
  }

  const Icon = getIcon(service.icon);

  return (
    <div>
      <button onClick={onBack} className="btn-ghost mb-4 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Services
      </button>

      {/* Service Header */}
      <div className="card p-6 mb-6 bg-gradient-to-br from-white to-gov-50/30">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gov-600 to-teal-600 flex items-center justify-center flex-shrink-0">
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gov-600 bg-gov-50 px-2 py-0.5 rounded-full">{service.category}</span>
              <span className="text-xs text-slate-500">{service.department}</span>
            </div>
            <h1 className="text-xl font-serif font-bold text-slate-900">{service.name}</h1>
            <p className="text-sm text-slate-600 mt-2">{service.description}</p>
          </div>
        </div>
      </div>

      {/* Step: Detail */}
      {step === 'detail' && (
        <div className="grid lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h3 className="font-serif font-semibold text-slate-900 mb-4">What data will be accessed?</h3>
              <p className="text-sm text-slate-600 mb-4">
                GovSync will retrieve the following data from government departments on your behalf.
                You will be asked to give explicit consent before any data is accessed.
              </p>
              <div className="space-y-3">
                {requirements.map((req) => {
                  const SrcIcon = sourceIcons[req.source];
                  return (
                    <div key={req.source} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 border border-slate-200">
                        <SrcIcon className="w-4.5 h-4.5 text-gov-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-slate-900">{sourceNames[req.source]}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{req.reason}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {req.fields.map((f) => (
                            <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">{f}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <h3 className="font-serif font-semibold text-slate-900 mb-3">Eligibility Criteria</h3>
              <div className="space-y-2">
                {(service.eligibility_rules as any[]).map((rule, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    {rule.label}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-teal-600" />
                <h3 className="font-serif font-semibold text-slate-900">How It Works</h3>
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-gov-100 text-gov-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">1</span>
                  <p>Grant consent for data access from specific departments.</p>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-gov-100 text-gov-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">2</span>
                  <p>GovSync retrieves your data from the relevant department APIs.</p>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-gov-100 text-gov-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">3</span>
                  <p>Your data is normalized and validated for conflicts.</p>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-gov-100 text-gov-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">4</span>
                  <p>Eligibility is checked deterministically against service rules.</p>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-gov-100 text-gov-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">5</span>
                  <p>Submit your application with one click.</p>
                </div>
              </div>
              <button onClick={() => setConsentOpen(true)} className="btn-primary w-full mt-6">
                Start Application <ArrowRight className="w-4 h-4" />
              </button>
            </Card>
          </div>
        </div>
      )}

      {/* Step: Fetching */}
      {step === 'fetching' && (
        <Card className="animate-fade-in">
          <h3 className="font-serif font-semibold text-slate-900 mb-2">Retrieving Data from Government Departments</h3>
          <p className="text-sm text-slate-500 mb-6">Please wait while GovSync fetches your data from the connected department APIs.</p>
          <div className="space-y-4">
            {service.required_data.map((source) => {
              const SrcIcon = sourceIcons[source];
              const result = fetchResults.find((r) => r.source === source);
              const status = result?.status || 'pending';
              return (
                <div key={source} className="flex items-center gap-3 p-4 rounded-lg border border-slate-200">
                  <div className="w-10 h-10 rounded-lg bg-gov-50 flex items-center justify-center flex-shrink-0">
                    <SrcIcon className="w-5 h-5 text-gov-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-slate-900">{sourceNames[source]}</p>
                    <p className="text-xs text-slate-500">
                      {status === 'pending' && 'Waiting...'}
                      {status === 'retrying' && 'Retrying after timeout...'}
                      {status === 'success' && `Completed in ${result?.responseTimeMs}ms`}
                      {status === 'timeout' && 'Timed out — will require manual review'}
                      {status === 'error' && result?.error}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {status === 'pending' && <Clock className="w-5 h-5 text-slate-400" />}
                    {(status === 'retrying' || status === 'success') && <Loader2 className="w-5 h-5 text-gov-600 animate-spin" />}
                    {status === 'success' && <CheckCircle2 className="w-5 h-5 text-teal-600" />}
                    {status === 'timeout' && <AlertCircle className="w-5 h-5 text-amber-600" />}
                    {status === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Step: Eligibility / Profile Review */}
      {(step === 'conflict_resolution' || step === 'eligibility' || step === 'submit') && profile && (
        <div className="grid lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-2 space-y-6">
            {/* Unified Profile */}
            <Card>
              <h3 className="font-serif font-semibold text-slate-900 mb-4">Unified Citizen Profile</h3>
              <p className="text-sm text-slate-500 mb-4">Data retrieved from {fetchResults.filter((r) => r.status === 'success').length} of {fetchResults.length} department sources.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {profile.name && <ProfileField label="Full Name" value={profile.name} source="Identity" />}
                {profile.fatherName && <ProfileField label="Father's Name" value={profile.fatherName} source="Identity" />}
                <ProfileField label="Date of Birth" value={profile.dob || 'N/A'} source="Identity" />
                <ProfileField label="Age" value={String(profile.age)} source="Identity" />
                <ProfileField label="Gender" value={profile.gender || 'N/A'} source="Identity" />
                <ProfileField label="Annual Income" value={`₹${profile.annualIncome.toLocaleString('en-IN')}`} source="Income Tax" />
                <ProfileField label="Employer" value={profile.employer || 'N/A'} source="Income Tax" />
                <ProfileField label="PAN Number" value={profile.panNumber || 'N/A'} source="Income Tax" />
                <ProfileField label="Qualification" value={profile.highestQualification || 'N/A'} source="Education" />
                <ProfileField label="Institution" value={profile.institution || 'N/A'} source="Education" />
                <ProfileField label="Pass Percentage" value={`${profile.passPercentage}%`} source="Education" />
                <ProfileField label="Graduation Year" value={String(profile.graduationYear || 'N/A')} source="Education" />
                <ProfileField label="Address" value={profile.address || 'N/A'} source="Residence" />
                <ProfileField label="District" value={profile.district || 'N/A'} source="Residence" />
                <ProfileField label="Residence Verified" value={profile.residenceVerified ? 'Yes' : 'No'} source="Residence" />
                <ProfileField label="Documents Verified" value={profile.documentsVerified ? 'Yes' : 'No'} source="DigiLocker" />
              </div>

              {/* Conflicts — interactive resolution or resolved banner */}
              {step === 'conflict_resolution' && conflicts.length > 0 && (
                <div className="mt-4 p-4 rounded-lg border border-amber-200 bg-amber-50">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <p className="font-medium text-sm text-amber-800">Data Conflicts Detected — Please Review</p>
                  </div>
                  {conflicts.map((c, i) => (
                    <div key={i} className="mb-4 last:mb-0 p-3 rounded-lg bg-white border border-amber-200">
                      <p className="font-medium text-sm text-slate-900 mb-1">{c.field}</p>
                      <p className="text-xs text-slate-500 mb-3">{c.description}</p>
                      <div className="space-y-2">
                        {c.values.map((val, vi) => (
                          <button
                            key={vi}
                            type="button"
                            onClick={() => {
                              setConflictSelections((prev) => ({ ...prev, [i]: val }));
                              setManualInputs((prev) => ({ ...prev, [i]: '' }));
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                              conflictSelections[i] === val ? 'border-gov-500 bg-gov-50' : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                              conflictSelections[i] === val ? 'border-gov-500 bg-gov-500' : 'border-slate-300'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-500">{c.sources[vi]}</p>
                              <p className="text-sm text-slate-900">{val}</p>
                            </div>
                          </button>
                        ))}
                        <div className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                          conflictSelections[i] && !c.values.includes(conflictSelections[i]) ? 'border-gov-500 bg-gov-50' : 'border-slate-200'
                        }`}>
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                            conflictSelections[i] && !c.values.includes(conflictSelections[i]) ? 'border-gov-500 bg-gov-500' : 'border-slate-300'
                          }`} />
                          <input
                            type="text"
                            value={manualInputs[i] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setManualInputs((prev) => ({ ...prev, [i]: val }));
                              setConflictSelections((prev) => ({ ...prev, [i]: val }));
                            }}
                            placeholder="Enter correct value manually"
                            className="flex-1 px-3 py-1.5 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-gov-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {step === 'submit' && conflicts.length > 0 && (
                <div className="mt-4 p-4 rounded-lg border border-teal-200 bg-teal-50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <p className="font-medium text-sm text-teal-800">Data Conflicts Resolved</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Eligibility Result */}
            {eligibility && (
              <Card>
                <h3 className="font-serif font-semibold text-slate-900 mb-4">Eligibility Assessment</h3>
                <div className={`p-4 rounded-lg mb-4 ${
                  eligibility.eligible ? 'bg-teal-50 border border-teal-200' :
                  eligibility.needsReview ? 'bg-amber-50 border border-amber-200' :
                  'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {eligibility.eligible ? <CheckCircle2 className="w-5 h-5 text-teal-600" /> :
                     eligibility.needsReview ? <AlertCircle className="w-5 h-5 text-amber-600" /> :
                     <XCircle className="w-5 h-5 text-red-600" />}
                    <p className={`font-medium ${
                      eligibility.eligible ? 'text-teal-800' :
                      eligibility.needsReview ? 'text-amber-800' : 'text-red-800'
                    }`}>
                      {eligibility.eligible ? 'Eligible' : eligibility.needsReview ? 'Manual Review Required' : 'Not Eligible'}
                    </p>
                  </div>
                  <p className="text-sm text-slate-700">{eligibility.summary}</p>
                </div>
                <div className="space-y-2">
                  {eligibility.rules.map((rule, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {rule.passed ?
                        <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" /> :
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                      <span className={rule.passed ? 'text-slate-700' : 'text-slate-700'}>
                        {rule.label}
                      </span>
                      <span className="text-xs text-slate-400 ml-auto">
                        {typeof rule.actualValue === 'number' ? rule.actualValue.toLocaleString('en-IN') : String(rule.actualValue)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Submit Panel */}
          <div>
            <Card className="sticky top-24">
              <h3 className="font-serif font-semibold text-slate-900 mb-2">
                {step === 'conflict_resolution' ? 'Resolve Conflicts' : 'Submit Application'}
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                {step === 'conflict_resolution'
                  ? 'Please resolve the data conflicts in your profile before proceeding to eligibility check.'
                  : 'Review your profile and eligibility above. When ready, submit your application with one click.'}
              </p>
              {step === 'conflict_resolution' ? (
                <div className="mb-4">
                  <div className={`p-3 rounded-lg border text-sm flex items-center gap-2 ${
                    allConflictsResolved
                      ? 'bg-teal-50 border-teal-200 text-teal-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}>
                    {allConflictsResolved
                      ? <CheckCircle2 className="w-4 h-4" />
                      : <AlertCircle className="w-4 h-4" />}
                    {allConflictsResolved
                      ? 'All conflicts resolved. You can proceed.'
                      : `${conflicts.filter((_, i) => !conflictSelections[i]?.trim()).length} conflict(s) remaining to resolve.`}
                  </div>
                </div>
              ) : eligibility && (
                <div className="mb-4">
                  {eligibility.eligible ? (
                    <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-sm text-teal-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> You are eligible to apply.
                    </div>
                  ) : eligibility.needsReview ? (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Your application will be forwarded for manual review.
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800 flex items-center gap-2">
                      <XCircle className="w-4 h-4" /> You do not meet the eligibility criteria.
                    </div>
                  )}
                </div>
              )}
              {step === 'conflict_resolution' ? (
                <button
                  onClick={handleConflictResolve}
                  disabled={!allConflictsResolved}
                  className="btn-primary w-full"
                >
                  <ArrowRight className="w-4 h-4" />
                  Continue to Eligibility
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || (eligibility !== null && !eligibility.eligible && !eligibility.needsReview)}
                  className="btn-primary w-full"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Step: Done */}
      {step === 'done' && (
        <Card className="text-center py-12 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-xl font-serif font-bold text-slate-900 mb-2">Application Submitted Successfully!</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            Your application for {service.name} has been submitted and is now under review by the {service.department}.
            You can track its status from your applications page.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => onNavigate('applications')} className="btn-primary">
              <FileCheck2 className="w-4 h-4" /> Track Application
            </button>
            <button onClick={onBack} className="btn-secondary">
              Browse More Services
            </button>
          </div>
        </Card>
      )}

      {/* Consent Modal */}
      <Modal open={consentOpen} onClose={() => setConsentOpen(false)} title="Consent for Data Access" maxWidth="max-w-2xl">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-gov-50 border border-gov-200">
            <Shield className="w-5 h-5 text-gov-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-gov-900">Federated Data Access</p>
              <p className="text-xs text-gov-700 mt-1">
                GovSync will fetch the following data from government department APIs on your behalf.
                Your data will NOT be stored centrally. It will be used only for this application.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {requirements.map((req) => {
              const SrcIcon = sourceIcons[req.source];
              return (
                <div key={req.source} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <SrcIcon className="w-4 h-4 text-gov-600" />
                    <p className="font-medium text-sm text-slate-900">{sourceNames[req.source]}</p>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{req.reason}</p>
                  <div className="flex flex-wrap gap-1">
                    {req.fields.map((f) => (
                      <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200">{f}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setConsentOpen(false)} className="btn-secondary flex-1">
              Deny
            </button>
            <button onClick={() => handleConsent(true)} className="btn-primary flex-1">
              <CheckCircle2 className="w-4 h-4" /> Grant Consent & Continue
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ProfileField({ label, value, source }: { label: string; value: string; source: string }) {
  return (
    <div className="p-3 rounded-lg border border-slate-200 bg-white">
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">via {source}</p>
    </div>
  );
}

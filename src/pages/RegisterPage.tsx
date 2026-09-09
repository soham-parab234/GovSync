import { useState } from 'react';
import { Shield, ArrowLeft, ArrowRight, Loader as Loader2, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Phone, Fingerprint, FolderLock, FileText, GraduationCap, ReceiptIndianRupee, KeyRound, User, Mail, Lock, Eye, EyeOff, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type Step = 'details' | 'verify' | 'otp' | 'digilocker' | 'documents' | 'done';

interface RetrievedDoc {
  type: string;
  name: string;
  issuedBy: string;
  issueDate: string;
  verified: boolean;
}

const mockDigiLockerDocs: RetrievedDoc[] = [
  { type: 'Aadhaar Card', name: 'Aadhaar_Card.pdf', issuedBy: 'UIDAI', issueDate: '2019-08-15', verified: true },
  { type: 'PAN Card', name: 'PAN_Card.pdf', issuedBy: 'Income Tax Department', issueDate: '2020-01-10', verified: true },
  { type: '10th Marksheet', name: '10th_Marksheet.pdf', issuedBy: 'CBSE', issueDate: '2016-05-20', verified: true },
  { type: '12th Marksheet', name: '12th_Marksheet.pdf', issuedBy: 'CBSE', issueDate: '2018-05-15', verified: true },
  { type: 'Driving Licence', name: 'Driving_Licence.pdf', issuedBy: 'RTO', issueDate: '2021-03-08', verified: true },
];

export function RegisterPage({ onBack }: { onBack: () => void }) {
  const { register } = useAuth();
  const [step, setStep] = useState<Step>('details');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [verifyMethod, setVerifyMethod] = useState<'phone' | 'aadhaar'>('phone');

  // OTP
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // DigiLocker
  const [digiLockerConnected, setDigiLockerConnected] = useState(false);
  const [retrievedDocs, setRetrievedDocs] = useState<RetrievedDoc[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());

  const handleSendOtp = () => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setOtpSent(true);
    setStep('otp');
  };

  const handleVerifyOtp = () => {
    if (otp === generatedOtp || otp === '123456') {
      setError(null);
      setStep('digilocker');
    } else {
      setError('Incorrect OTP. Please try again. (Hint: use 123456 for demo)');
    }
  };

  const handleConnectDigiLocker = async () => {
    setLoading(true);
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setDigiLockerConnected(true);
    setRetrievedDocs(mockDigiLockerDocs);
    setSelectedDocs(new Set(mockDigiLockerDocs.map((d) => d.name)));
    setLoading(false);
    setStep('documents');
  };

  const toggleDoc = (docName: string) => {
    setSelectedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(docName)) next.delete(docName);
      else next.add(docName);
      return next;
    });
  };

  const handleCompleteRegistration = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (selectedDocs.size === 0) {
      setError('Please select at least one document from DigiLocker.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const docs = retrievedDocs.filter((d) => selectedDocs.has(d.name));
      await register({
        name,
        email,
        password,
        phone: verifyMethod === 'phone' ? phone : undefined,
        aadhaar: verifyMethod === 'aadhaar' ? aadhaar : undefined,
        dob,
        documents: docs,
      });
      setStep('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const docIcons: Record<string, typeof FileText> = {
    'Aadhaar Card': Fingerprint,
    'PAN Card': ReceiptIndianRupee,
    '10th Marksheet': GraduationCap,
    '12th Marksheet': GraduationCap,
    'Driving Licence': FileText,
  };

  const steps: { id: Step; label: string }[] = [
    { id: 'details', label: 'Your Details' },
    { id: 'verify', label: 'Verify Identity' },
    { id: 'otp', label: 'OTP' },
    { id: 'digilocker', label: 'DigiLocker' },
    { id: 'documents', label: 'Documents' },
  ];
  const currentStepIndex = steps.findIndex((s) => s.id === step);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel — branding */}
      <div className="lg:w-1/2 bg-gradient-to-br from-gov-800 via-gov-700 to-teal-700 text-white p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif">GovSync</h1>
              <p className="text-sm text-gov-100">Government Service Interoperability Platform</p>
            </div>
          </div>
          <h2 className="text-3xl lg:text-4xl font-serif font-bold leading-tight mb-4">
            Create your<br />citizen account.
          </h2>
          <p className="text-gov-100 text-lg leading-relaxed max-w-md">
            Register with your phone number or Aadhaar, connect your DigiLocker,
            and apply for any government service without re-uploading documents.
          </p>
        </div>
        <div className="relative z-10 hidden lg:flex gap-6 mt-12">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-300 animate-pulse-soft" />
            <span className="text-sm text-gov-100">DigiLocker Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-300" />
            <span className="text-sm text-gov-100">OTP Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-300" />
            <span className="text-sm text-gov-100">Federated Data</span>
          </div>
        </div>
      </div>

      {/* Right panel — registration form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-slate-50">
        <div className="w-full max-w-md">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </button>

          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Register New Account</h2>
          <p className="text-slate-500 mb-6">Complete the steps below to create your GovSync citizen account.</p>

          {/* Progress steps */}
          {step !== 'done' && (
            <div className="flex items-center gap-1 mb-6">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    i < currentStepIndex ? 'bg-teal-500 text-white' :
                    i === currentStepIndex ? 'bg-gov-600 text-white' :
                    'bg-slate-200 text-slate-400'
                  }`}>
                    {i < currentStepIndex ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-1 ${i < currentStepIndex ? 'bg-teal-400' : 'bg-slate-200'}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg mb-4 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Step: Details */}
          {step === 'details' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="As per your Aadhaar"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="input-field pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter"
                      className="input-field pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!name || !email || !password || !confirmPassword || !dob) {
                    setError('Please fill in all fields.');
                    return;
                  }
                  if (password !== confirmPassword) {
                    setError('Passwords do not match.');
                    return;
                  }
                  setError(null);
                  setStep('verify');
                }}
                className="btn-primary w-full"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step: Verify Identity */}
          {step === 'verify' && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm text-slate-600">Choose how you'd like to verify your identity. You'll receive an OTP to confirm.</p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setVerifyMethod('phone')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    verifyMethod === 'phone' ? 'border-gov-500 bg-gov-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Phone className={`w-5 h-5 mb-2 ${verifyMethod === 'phone' ? 'text-gov-600' : 'text-slate-400'}`} />
                  <p className="font-medium text-sm text-slate-900">Phone Number</p>
                  <p className="text-xs text-slate-500">Verify via SMS OTP</p>
                </button>
                <button
                  onClick={() => setVerifyMethod('aadhaar')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    verifyMethod === 'aadhaar' ? 'border-gov-500 bg-gov-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Fingerprint className={`w-5 h-5 mb-2 ${verifyMethod === 'aadhaar' ? 'text-gov-600' : 'text-slate-400'}`} />
                  <p className="font-medium text-sm text-slate-900">Aadhaar Number</p>
                  <p className="text-xs text-slate-500">Verify via Aadhaar OTP</p>
                </button>
              </div>

              {verifyMethod === 'phone' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98765 43210"
                      maxLength={10}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              )}

              {verifyMethod === 'aadhaar' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Aadhaar Number</label>
                  <div className="relative">
                    <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={aadhaar}
                      onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                      placeholder="XXXX XXXX XXXX"
                      maxLength={12}
                      className="input-field pl-10"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Enter your 12-digit Aadhaar number.</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep('details')} className="btn-secondary flex-1">
                  Back
                </button>
                <button
                  onClick={() => {
                    if (verifyMethod === 'phone' && phone.length < 10) {
                      setError('Please enter a valid 10-digit mobile number.');
                      return;
                    }
                    if (verifyMethod === 'aadhaar' && aadhaar.length < 12) {
                      setError('Please enter a valid 12-digit Aadhaar number.');
                      return;
                    }
                    setError(null);
                    handleSendOtp();
                  }}
                  className="btn-primary flex-1"
                >
                  Send OTP <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step: OTP */}
          {step === 'otp' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-lg bg-gov-50 border border-gov-200">
                <div className="flex items-center gap-2 mb-1">
                  <KeyRound className="w-4 h-4 text-gov-600" />
                  <p className="font-medium text-sm text-gov-900">OTP Sent</p>
                </div>
                <p className="text-xs text-gov-700">
                  An OTP has been sent to your {verifyMethod === 'phone' ? `mobile number ending in ${phone.slice(-4)}` : `Aadhaar-linked mobile`}.
                </p>
                {otpSent && (
                  <p className="text-xs text-gov-600 mt-1 font-mono bg-white/50 px-2 py-1 rounded mt-2 inline-block">
                    Demo OTP: {generatedOtp}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit code"
                  maxLength={6}
                  className="input-field text-center text-lg tracking-[0.5em] font-mono"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('verify')} className="btn-secondary flex-1">
                  Back
                </button>
                <button onClick={handleVerifyOtp} className="btn-primary flex-1">
                  Verify OTP <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step: DigiLocker */}
          {step === 'digilocker' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gov-100 to-teal-100 flex items-center justify-center mx-auto mb-4">
                  <FolderLock className="w-8 h-8 text-gov-600" />
                </div>
                <h3 className="font-serif font-semibold text-slate-900 mb-2">Connect Your DigiLocker</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  DigiLocker is the Government of India's document wallet. Connecting it lets GovSync
                  retrieve your verified documents automatically — no uploads needed.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <p className="text-sm text-slate-700">
                    You'll be redirected to DigiLocker to authorize access. Only you can see your documents.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                  Government of India verified service
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center py-6">
                  <Loader2 className="w-8 h-8 animate-spin text-gov-600 mb-3" />
                  <p className="text-sm text-slate-500">Connecting to DigiLocker...</p>
                </div>
              ) : (
                <button onClick={handleConnectDigiLocker} className="btn-primary w-full">
                  <FolderLock className="w-4 h-4" /> Connect DigiLocker
                </button>
              )}

              <button onClick={() => setStep('otp')} className="btn-ghost w-full text-sm">
                Back
              </button>
            </div>
          )}

          {/* Step: Documents */}
          {step === 'documents' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-teal-50 border border-teal-200">
                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <p className="text-sm text-teal-800">DigiLocker connected. {retrievedDocs.length} documents found.</p>
              </div>

              <p className="text-sm text-slate-600">Select the documents you'd like to link to your GovSync account. You can change these later.</p>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {retrievedDocs.map((doc) => {
                  const DocIcon = docIcons[doc.type] || FileText;
                  const selected = selectedDocs.has(doc.name);
                  return (
                    <button
                      key={doc.name}
                      onClick={() => toggleDoc(doc.name)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                        selected ? 'border-gov-500 bg-gov-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        selected ? 'bg-gov-100' : 'bg-slate-50'
                      }`}>
                        <DocIcon className={`w-4 h-4 ${selected ? 'text-gov-600' : 'text-slate-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900">{doc.type}</p>
                        <p className="text-xs text-slate-500">Issued by {doc.issuedBy}</p>
                      </div>
                      {doc.verified && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 flex items-center gap-1 flex-shrink-0">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      )}
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                        selected ? 'border-gov-500 bg-gov-500' : 'border-slate-300'
                      }`}>
                        {selected && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleCompleteRegistration}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {loading ? 'Creating Account...' : `Complete Registration (${selectedDocs.size} docs)`}
              </button>
            </div>
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-teal-600" />
              </div>
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-2">Account Created!</h2>
              <p className="text-slate-500 max-w-sm mx-auto mb-6">
                Welcome to GovSync, {name.split(' ')[0]}. Your account is ready and your DigiLocker
                documents are linked. You'll be redirected to your dashboard shortly.
              </p>
              <Loader2 className="w-6 h-6 animate-spin text-gov-600 mx-auto" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

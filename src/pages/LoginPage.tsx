import { useState } from 'react';
import { Shield, LogIn, Loader as Loader2, GraduationCap, CircleAlert as AlertCircle, Building2, UserPlus, Eye, EyeOff, Mail, Fingerprint, Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { demoCitizens } from '@/lib/mockApi/seedData';

type LoginMethod = 'email' | 'aadhaar' | 'phone';

export function LoginPage({ onRegister }: { onRegister: () => void }) {
  const { login, loginWithIdentifier, loginAsDemo, loading, error } = useAuth();
  const [method, setMethod] = useState<LoginMethod>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const methodTabs: { id: LoginMethod; label: string; icon: typeof Mail }[] = [
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'aadhaar', label: 'Aadhaar', icon: Fingerprint },
    { id: 'phone', label: 'Phone', icon: Phone },
  ];

  const fieldConfig: Record<LoginMethod, { label: string; placeholder: string; type: string; maxLength?: number }> = {
    email: { label: 'Email', placeholder: 'aarav.sharma@govsync.demo', type: 'email' },
    aadhaar: { label: 'Aadhaar Number', placeholder: '2345 6789 0123', type: 'text', maxLength: 14 },
    phone: { label: 'Phone Number', placeholder: '98765 43210', type: 'tel', maxLength: 10 },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (method === 'email') {
        await login(identifier, password);
      } else {
        await loginWithIdentifier(identifier, password, method);
      }
    } catch {
      // error is set in context
    }
  };

  const handleMethodChange = (m: LoginMethod) => {
    setMethod(m);
    setIdentifier('');
  };

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (method === 'aadhaar') {
      const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
      const formatted = digits.replace(/(\d{4})(\d{4})(\d{0,4})/, (_, a, b, c) =>
        c ? `${a} ${b} ${c}` : b ? `${a} ${b}` : a,
      );
      setIdentifier(formatted);
    } else if (method === 'phone') {
      setIdentifier(e.target.value.replace(/\D/g, '').slice(0, 10));
    } else {
      setIdentifier(e.target.value);
    }
  };

  const fc = fieldConfig[method];

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
            One platform.<br />Every government service.
          </h2>
          <p className="text-gov-100 text-lg leading-relaxed max-w-md">
            GovSync connects government departments through secure APIs, so you can apply for
            services without re-entering the same information or uploading the same documents.
          </p>
        </div>
        <div className="relative z-10 hidden lg:flex gap-6 mt-12">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-300 animate-pulse-soft" />
            <span className="text-sm text-gov-100">5 Departments Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-300" />
            <span className="text-sm text-gov-100">Federated Data Model</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-300" />
            <span className="text-sm text-gov-100">Consent-Driven Access</span>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-slate-50">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Sign in to your account</h2>
          <p className="text-slate-500 mb-8">Enter your credentials or pick a demo account below.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Login method tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
              {methodTabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleMethodChange(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      method === tab.id
                        ? 'bg-white text-gov-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{fc.label}</label>
              <input
                type={fc.type}
                value={identifier}
                onChange={handleIdentifierChange}
                placeholder={fc.placeholder}
                maxLength={fc.maxLength}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="demo1234"
                  className="input-field pr-10"
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

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-4">
            Don't have an account?{' '}
            <button onClick={onRegister} className="text-gov-600 hover:text-gov-700 font-medium inline-flex items-center gap-1">
              <UserPlus className="w-3.5 h-3.5" /> Register here
            </button>
          </p>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-slate-50 px-3 text-xs text-slate-400 uppercase tracking-wide">
                  Quick Demo Access
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {demoCitizens.map((c) => (
                <button
                  key={c.id}
                  onClick={() => loginAsDemo(c.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-gov-300 hover:bg-gov-50 transition-all text-left group"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    c.role === 'admin' ? 'bg-orange-100 text-orange-600' : 'bg-gov-100 text-gov-600'
                  }`}>
                    {c.role === 'admin' ? <Building2 className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-500 truncate">{c.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    c.role === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-gov-100 text-gov-700'
                  }`}>
                    {c.role === 'admin' ? 'Admin' : 'Citizen'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

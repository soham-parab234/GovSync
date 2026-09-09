import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { demoCitizens, addRegisteredCitizen, generateCitizenMockData, isEmailRegistered, isIdentifierRegistered } from '@/lib/mockApi/seedData';
import type { DemoCitizen } from '@/lib/types';

interface AuthState {
  citizen: DemoCitizen | null;
  loading: boolean;
  error: string | null;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  aadhaar?: string;
  dob: string;
  documents: { type: string; name: string; issuedBy: string; issueDate: string; verified: boolean }[];
}

type LoginMethod = 'email' | 'aadhaar' | 'phone';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<DemoCitizen>;
  loginWithIdentifier: (identifier: string, password: string, method: LoginMethod) => Promise<DemoCitizen>;
  logout: () => void;
  loginAsDemo: (citizenId: string) => void;
  register: (data: RegisterData) => Promise<DemoCitizen>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'govsync-citizen';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      try {
        const citizen = JSON.parse(stored) as DemoCitizen;
        return { citizen, loading: false, error: null };
      } catch {
        return { citizen: null, loading: false, error: null };
      }
    }
    return { citizen: null, loading: false, error: null };
  });

  const login = useCallback(async (email: string, password: string): Promise<DemoCitizen> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    await new Promise((resolve) => setTimeout(resolve, 500));

    const citizen = demoCitizens.find(
      (c) => c.email.toLowerCase() === email.toLowerCase() && c.password === password,
    );

    if (!citizen) {
      setState({ citizen: null, loading: false, error: 'Invalid email or password. Try a demo account below.' });
      throw new Error('Invalid credentials');
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(citizen));
    setState({ citizen, loading: false, error: null });
    return citizen;
  }, []);

  const loginWithIdentifier = useCallback(
    async (identifier: string, password: string, method: LoginMethod): Promise<DemoCitizen> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      await new Promise((resolve) => setTimeout(resolve, 500));

      const norm = identifier.replace(/\s/g, '').toLowerCase();
      const citizen = demoCitizens.find((c) => {
        let match = false;
        if (method === 'email') {
          match = c.email.toLowerCase() === norm;
        } else if (method === 'aadhaar') {
          match = (c.aadhaar || '').replace(/\s/g, '').toLowerCase() === norm;
        } else if (method === 'phone') {
          match = (c.phone || '').replace(/\s/g, '').toLowerCase() === norm;
        }
        return match && c.password === password;
      });

      const label = method === 'email' ? 'email' : method === 'aadhaar' ? 'Aadhaar number' : 'phone number';
      if (!citizen) {
        setState({ citizen: null, loading: false, error: `Invalid ${label} or password. Try a demo account below.` });
        throw new Error('Invalid credentials');
      }

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(citizen));
      setState({ citizen, loading: false, error: null });
      return citizen;
    },
    [],
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setState({ citizen: null, loading: false, error: null });
  }, []);

  const loginAsDemo = useCallback((citizenId: string) => {
    const citizen = demoCitizens.find((c) => c.id === citizenId);
    if (citizen) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(citizen));
      setState({ citizen, loading: false, error: null });
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<DemoCitizen> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    await new Promise((resolve) => setTimeout(resolve, 600));

    if (isEmailRegistered(data.email)) {
      setState({ citizen: null, loading: false, error: 'An account with this email already exists. Please sign in instead.' });
      throw new Error('Email already registered');
    }

    const citizenId = `citizen-${crypto.randomUUID().slice(0, 8)}`;
    const citizen: DemoCitizen = {
      id: citizenId,
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'citizen',
      description: 'Registered via DigiLocker',
      registered: true,
      aadhaar: data.aadhaar,
      phone: data.phone,
    };

    const mockData = generateCitizenMockData(citizenId, data.name, data.dob, data.documents);
    addRegisteredCitizen(citizen, mockData);

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(citizen));
    setState({ citizen, loading: false, error: null });
    return citizen;
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, loginWithIdentifier, logout, loginAsDemo, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

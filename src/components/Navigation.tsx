import { Shield, Menu, X, LogOut, LayoutDashboard, Store, FileCheck2, History, Server } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

export type View = 'dashboard' | 'marketplace' | 'applications' | 'consent-history' | 'admin-dashboard' | 'admin-registry' | 'admin-applications' | 'admin-audit';

interface NavItem {
  id: View;
  label: string;
  icon: typeof LayoutDashboard;
}

const citizenNav: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'marketplace', label: 'Services', icon: Store },
  { id: 'applications', label: 'My Applications', icon: FileCheck2 },
  { id: 'consent-history', label: 'Consent History', icon: History },
];

const adminNav: NavItem[] = [
  { id: 'admin-dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'admin-registry', label: 'API Registry', icon: Server },
  { id: 'admin-applications', label: 'Applications', icon: FileCheck2 },
  { id: 'admin-audit', label: 'Audit Log', icon: History },
];

export function Navigation({
  currentView,
  onNavigate,
}: {
  currentView: View;
  onNavigate: (view: View) => void;
}) {
  const { citizen, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdminMode = citizen?.role === 'admin';
  const navItems = isAdminMode ? adminNav : citizenNav;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gov-600 to-teal-600 flex items-center justify-center shadow-md">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 font-serif leading-none">GovSync</h1>
                <p className="text-[10px] text-slate-500 leading-none mt-0.5">
                  {isAdminMode ? 'Admin Console' : 'Citizen Portal'}
                </p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-gov-50 text-gov-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gov-500 to-teal-500 flex items-center justify-center text-white text-sm font-semibold">
                  {citizen?.name.charAt(0) || '?'}
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium text-slate-900 leading-none">{citizen?.name}</p>
                  <p className="text-[10px] text-slate-500 leading-none mt-0.5">
                    {isAdminMode ? 'Administrator' : 'Citizen'}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 animate-slide-in">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    active ? 'bg-gov-50 text-gov-700' : 'text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </header>
    </>
  );
}

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">{children}</div>;
}

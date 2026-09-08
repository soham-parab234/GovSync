import { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Navigation, PageContainer, type View } from '@/components/Navigation';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { CitizenDashboard } from '@/pages/CitizenDashboard';
import { ServiceMarketplace } from '@/pages/ServiceMarketplace';
import { ServiceDetailPage } from '@/pages/ServiceDetailPage';
import { ApplicationsPage } from '@/pages/ApplicationsPage';
import { ConsentHistoryPage } from '@/pages/ConsentHistoryPage';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { AdminRegistry } from '@/pages/AdminRegistry';
import { AdminApplications } from '@/pages/AdminApplications';
import { AdminAuditLog } from '@/pages/AdminAuditLog';

function AppContent() {
  const { citizen } = useAuth();
  const [view, setView] = useState<View>('dashboard');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  if (!citizen) {
    return showRegister
      ? <RegisterPage onBack={() => setShowRegister(false)} />
      : <LoginPage onRegister={() => setShowRegister(true)} />;
  }

  const handleNavigate = (v: View) => {
    setView(v);
    setSelectedService(null);
  };

  const handleOpenService = (id: string) => {
    setSelectedService(id);
    setView('marketplace');
  };

  const handleToggleRole = () => {
    const newMode = !isAdminMode;
    setIsAdminMode(newMode);
    setView(newMode ? 'admin-dashboard' : 'dashboard');
  };

  const renderView = () => {
    if (selectedService) {
      return (
        <ServiceDetailPage
          serviceId={selectedService}
          onBack={() => setSelectedService(null)}
          onNavigate={(v) => { handleNavigate(v); setSelectedService(null); }}
        />
      );
    }

    switch (view) {
      case 'dashboard':
        return <CitizenDashboard onNavigate={handleNavigate} onOpenService={handleOpenService} />;
      case 'marketplace':
        return <ServiceMarketplace onOpenService={handleOpenService} />;
      case 'applications':
        return <ApplicationsPage />;
      case 'consent-history':
        return <ConsentHistoryPage />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'admin-registry':
        return <AdminRegistry />;
      case 'admin-applications':
        return <AdminApplications />;
      case 'admin-audit':
        return <AdminAuditLog />;
      default:
        return <CitizenDashboard onNavigate={handleNavigate} onOpenService={handleOpenService} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation
        currentView={view}
        onNavigate={handleNavigate}
        onToggleRole={handleToggleRole}
        isAdminMode={isAdminMode}
      />
      <PageContainer>
        {renderView()}
      </PageContainer>
      <footer className="border-t border-slate-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-slate-400">
            GovSync — Government Digital Service Interoperability & Orchestration Platform
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Prototype using mock government APIs. Not connected to real government systems.
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

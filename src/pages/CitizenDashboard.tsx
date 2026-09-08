import { useEffect, useState } from 'react';
import { FileCheck2, Clock, CheckCircle2, AlertTriangle, ArrowRight, Store, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchApplications, fetchServices } from '@/lib/db';
import type { Application, Service } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badges';
import { Card, EmptyState, Skeleton } from '@/components/ui';
import type { View } from '@/components/Navigation';

export function CitizenDashboard({ onNavigate, onOpenService }: { onNavigate: (v: View) => void; onOpenService: (id: string) => void }) {
  const { citizen } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!citizen) return;
    Promise.all([fetchApplications(citizen.id), fetchServices()])
      .then(([apps, svcs]) => {
        setApplications(apps);
        setServices(svcs);
      })
      .finally(() => setLoading(false));
  }, [citizen]);

  const activeApps = applications.filter((a) => !['approved', 'rejected'].includes(a.status));
  const completedApps = applications.filter((a) => ['approved', 'rejected'].includes(a.status));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-slate-900">
          Welcome back, {citizen?.name.split(' ')[0]}
        </h1>
        <p className="text-slate-500 mt-1">Manage your government service applications in one place.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Applications', value: applications.length, icon: FileCheck2, color: 'text-gov-600 bg-gov-50' },
          { label: 'In Progress', value: activeApps.length, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Completed', value: completedApps.length, icon: CheckCircle2, color: 'text-teal-600 bg-teal-50' },
          { label: 'Available Services', value: services.length, icon: Store, color: 'text-purple-600 bg-purple-50' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-5">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{loading ? '—' : stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-semibold text-slate-900">Recent Applications</h2>
            <button onClick={() => onNavigate('applications')} className="text-sm text-gov-600 hover:text-gov-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : applications.length === 0 ? (
            <Card>
              <EmptyState
                icon={FileCheck2}
                title="No applications yet"
                description="Browse the service marketplace to start your first application."
                action={
                  <button onClick={() => onNavigate('marketplace')} className="btn-primary">
                    <Store className="w-4 h-4" /> Browse Services
                  </button>
                }
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 5).map((app) => {
                const service = services.find((s) => s.id === app.service_id);
                return (
                  <button
                    key={app.id}
                    onClick={() => onNavigate('applications')}
                    className="card p-4 w-full text-left hover:border-gov-300 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-gov-50 flex items-center justify-center flex-shrink-0">
                        <FileCheck2 className="w-5 h-5 text-gov-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">{service?.name || 'Unknown Service'}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={app.status} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Trust panel */}
        <div>
          <h2 className="text-lg font-serif font-semibold text-slate-900 mb-4">Your Privacy</h2>
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Federated Data Model</p>
                <p className="text-xs text-slate-500">Your data stays with the source department</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <p>GovSync never stores your government data centrally. It is fetched only when you give consent, used for the application, then discarded.</p>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <p>Every data access is logged in your consent history with full audit trail.</p>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <p>Government departments remain the authoritative source of your records.</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('consent-history')}
              className="btn-secondary w-full mt-4 text-sm"
            >
              View Consent History
            </button>
          </Card>
        </div>
      </div>

      {/* Quick services */}
      {!loading && services.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-serif font-semibold text-slate-900 mb-4">Quick Start</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.slice(0, 3).map((service) => (
              <button
                key={service.id}
                onClick={() => onOpenService(service.id)}
                className="card p-5 text-left hover:border-gov-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gov-600 bg-gov-50 px-2 py-1 rounded-full">{service.category}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-gov-600 transition-colors" />
                </div>
                <h3 className="font-serif font-semibold text-slate-900 mb-1">{service.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-2">{service.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

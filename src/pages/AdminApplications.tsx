import { useEffect, useState } from 'react';
import { FileCheck2, ArrowRight } from 'lucide-react';
import { fetchAllApplications, fetchApplicationEvents, fetchServices } from '@/lib/db';
import type { Application, ApplicationEvent, Service } from '@/lib/types';
import { StatusBadge, getIcon } from '@/components/ui/Badges';
import { Card, EmptyState, Skeleton, Modal, Timeline } from '@/components/ui';
import type { TimelineEvent } from '@/components/ui';

export function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [events, setEvents] = useState<ApplicationEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    Promise.all([fetchAllApplications(), fetchServices()])
      .then(([apps, svcs]) => {
        setApplications(apps);
        setServices(svcs);
      })
      .finally(() => setLoading(false));
  }, []);

  const openTimeline = async (app: Application) => {
    setSelectedApp(app);
    setEventsLoading(true);
    const evts = await fetchApplicationEvents(app.id);
    setEvents(evts);
    setEventsLoading(false);
  };

  const filters = ['all', 'submitted', 'under_review', 'approved', 'rejected', 'needs_review', 'eligible', 'not_eligible'];
  const filtered = filter === 'all' ? applications : applications.filter((a) => a.status === filter);

  const timelineEvents: TimelineEvent[] = events.map((e) => {
    const isLast = events.indexOf(e) === events.length - 1;
    const status: TimelineEvent['status'] = isLast && !['approved', 'rejected'].includes(e.status || '')
      ? 'active'
      : e.status === 'rejected' || e.status === 'not_eligible'
        ? 'error'
        : e.status === 'needs_review' || e.status === 'manual_review'
          ? 'warning'
          : 'done';
    return {
      id: e.id,
      title: e.title,
      description: e.description,
      status,
      timestamp: new Date(e.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    };
  });

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-slate-900 mb-1">All Applications</h1>
      <p className="text-slate-500 mb-6">View and manage all citizen applications across the platform.</p>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors capitalize ${
              filter === f ? 'bg-gov-700 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState icon={FileCheck2} title="No applications found" description="No applications match the selected filter." />
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wide">
                  <th className="pb-3 pr-4 font-medium">Citizen</th>
                  <th className="pb-3 pr-4 font-medium">Service</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Eligibility</th>
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => {
                  const service = services.find((s) => s.id === app.service_id);
                  return (
                    <tr key={app.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-4 font-medium text-slate-900">{app.citizen_name}</td>
                      <td className="py-3 pr-4 text-slate-600">{service?.name || app.service_id}</td>
                      <td className="py-3 pr-4"><StatusBadge status={app.status} /></td>
                      <td className="py-3 pr-4">
                        {app.eligibility_result ? (
                          <span className={`text-xs font-medium ${
                            app.eligibility_result.eligible ? 'text-teal-600' :
                            app.eligibility_result.needsReview ? 'text-amber-600' : 'text-red-500'
                          }`}>
                            {app.eligibility_result.eligible ? 'Eligible' : app.eligibility_result.needsReview ? 'Review' : 'Not Eligible'}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-slate-500 text-xs">
                        {new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3">
                        <button onClick={() => openTimeline(app)} className="text-gov-600 hover:text-gov-700">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={!!selectedApp} onClose={() => setSelectedApp(null)} title="Application Details & Timeline" maxWidth="max-w-2xl">
        {selectedApp && (
          <div>
            <div className="flex items-center gap-3 mb-6 p-4 rounded-lg bg-slate-50">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-slate-200">
                {(() => {
                  const service = services.find((s) => s.id === selectedApp.service_id);
                  const Icon = service ? getIcon(service.icon) : FileCheck2;
                  return <Icon className="w-5 h-5 text-gov-600" />;
                })()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">{services.find((s) => s.id === selectedApp.service_id)?.name}</p>
                <p className="text-xs text-slate-500">{selectedApp.citizen_name} — ID: {selectedApp.id.slice(0, 8)}</p>
              </div>
              <StatusBadge status={selectedApp.status} />
            </div>

            {selectedApp.eligibility_result && (
              <div className="mb-6 p-4 rounded-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-900 mb-2">Eligibility Assessment</p>
                <div className="space-y-1.5">
                  {selectedApp.eligibility_result.rules.map((rule, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className={rule.passed ? 'text-teal-600' : 'text-red-500'}>{rule.passed ? '✓' : '✗'}</span>
                      <span className="text-slate-600">{rule.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {eventsLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : timelineEvents.length > 0 ? (
              <Timeline events={timelineEvents} />
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">No events recorded.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

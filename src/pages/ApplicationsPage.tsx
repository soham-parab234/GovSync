import { useEffect, useState } from 'react';
import { FileCheck2, ArrowRight, Clock } from 'lucide-react';
import { fetchApplications, fetchApplicationEvents, fetchServices } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import type { Application, ApplicationEvent, Service } from '@/lib/types';
import { StatusBadge, getIcon } from '@/components/ui/Badges';
import { Card, EmptyState, Skeleton, Modal, Timeline } from '@/components/ui';
import type { TimelineEvent } from '@/components/ui';

export function ApplicationsPage() {
  const { citizen } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [events, setEvents] = useState<ApplicationEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    if (!citizen) return;
    Promise.all([fetchApplications(citizen.id), fetchServices()])
      .then(([apps, svcs]) => {
        setApplications(apps);
        setServices(svcs);
      })
      .finally(() => setLoading(false));
  }, [citizen]);

  const openTimeline = async (app: Application) => {
    setSelectedApp(app);
    setEventsLoading(true);
    const evts = await fetchApplicationEvents(app.id);
    setEvents(evts);
    setEventsLoading(false);
  };

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
      <h1 className="text-2xl font-serif font-bold text-slate-900 mb-1">My Applications</h1>
      <p className="text-slate-500 mb-6">Track the status and timeline of all your government service applications.</p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileCheck2}
            title="No applications yet"
            description="When you apply for a government service, your applications will appear here with full status tracking."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const service = services.find((s) => s.id === app.service_id);
            const Icon = service ? getIcon(service.icon) : FileCheck2;
            return (
              <button
                key={app.id}
                onClick={() => openTimeline(app)}
                className="card p-5 w-full text-left hover:border-gov-300 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gov-50 to-teal-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-gov-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{service?.name || 'Unknown Service'}</p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Applied on {new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {app.eligibility_result && (
                      <p className="text-xs mt-1">
                        {app.eligibility_result.eligible ? (
                          <span className="text-teal-600">Eligibility: Passed</span>
                        ) : app.eligibility_result.needsReview ? (
                          <span className="text-amber-600">Eligibility: Needs Review</span>
                        ) : (
                          <span className="text-red-500">Eligibility: Not Met</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusBadge status={app.status} />
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Timeline Modal */}
      <Modal open={!!selectedApp} onClose={() => setSelectedApp(null)} title="Application Timeline" maxWidth="max-w-2xl">
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
                <p className="text-xs text-slate-500">Application ID: {selectedApp.id.slice(0, 8)}</p>
              </div>
              <StatusBadge status={selectedApp.status} />
            </div>

            {eventsLoading ? (
              <div className="flex justify-center py-8">
                <Skeleton className="h-32 w-full" />
              </div>
            ) : timelineEvents.length > 0 ? (
              <Timeline events={timelineEvents} />
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">No events recorded yet.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { FileCheck2, Server, Activity, CheckCircle2, Clock, AlertCircle, TrendingUp, Users } from 'lucide-react';
import { fetchAllApplications, fetchApiRegistry, fetchAuditLogs } from '@/lib/db';
import type { Application } from '@/lib/types';
import { ApiStatusBadge, StatusBadge, getIcon } from '@/components/ui/Badges';
import { Card, Skeleton, EmptyState } from '@/components/ui';

export function AdminDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [apis, setApis] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAllApplications(), fetchApiRegistry(), fetchAuditLogs(10)])
      .then(([apps, apiList, logList]) => {
        setApplications(apps);
        setApis(apiList);
        setLogs(logList);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalApps = applications.length;
  const approved = applications.filter((a) => a.status === 'approved').length;
  const pending = applications.filter((a) => ['submitted', 'under_review', 'needs_review', 'manual_review'].includes(a.status)).length;
  const rejected = applications.filter((a) => a.status === 'rejected' || a.status === 'not_eligible').length;
  const approvalRate = totalApps > 0 ? Math.round((approved / totalApps) * 100) : 0;
  const operationalApis = apis.filter((a) => a.status === 'operational').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-slate-900">Admin Overview</h1>
        <p className="text-slate-500 mt-1">Platform health, application metrics, and recent activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Applications', value: totalApps, icon: FileCheck2, color: 'text-gov-600 bg-gov-50' },
          { label: 'Pending Review', value: pending, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Approval Rate', value: `${approvalRate}%`, icon: TrendingUp, color: 'text-teal-600 bg-teal-50' },
          { label: 'APIs Operational', value: `${operationalApis}/${apis.length}`, icon: Server, color: 'text-gov-600 bg-gov-50' },
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* API Health */}
        <div>
          <h2 className="text-lg font-serif font-semibold text-slate-900 mb-4">Department API Health</h2>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <Card>
              <div className="space-y-3">
                {apis.map((api) => {
                  const Icon = getIcon(api.icon);
                  return (
                    <div key={api.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4.5 h-4.5 text-slate-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-slate-900 truncate">{api.name}</p>
                          <p className="text-xs text-slate-500">{api.avg_response_ms}ms avg response</p>
                        </div>
                      </div>
                      <ApiStatusBadge status={api.status} />
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-serif font-semibold text-slate-900 mb-4">Recent Audit Activity</h2>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : logs.length === 0 ? (
            <Card>
              <EmptyState icon={Activity} title="No activity yet" description="Audit log entries will appear here as citizens use the platform." />
            </Card>
          ) : (
            <Card>
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-sm">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      log.actor_role === 'admin' ? 'bg-orange-50 text-orange-600' :
                      log.actor_role === 'system' ? 'bg-slate-100 text-slate-600' :
                      'bg-gov-50 text-gov-600'
                    }`}>
                      {log.actor_role === 'admin' ? <Users className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900">
                        <span className="font-medium">{log.actor_id === 'admin-001' ? 'Admin' : log.actor_id}</span>
                        <span className="text-slate-500"> — {log.action.replace(/_/g, ' ').toLowerCase()}</span>
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(log.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Applications */}
      <div className="mt-8">
        <h2 className="text-lg font-serif font-semibold text-slate-900 mb-4">Recent Applications</h2>
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : applications.length === 0 ? (
          <Card>
            <EmptyState icon={FileCheck2} title="No applications yet" description="Applications submitted by citizens will appear here." />
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
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.slice(0, 8).map((app) => (
                    <tr key={app.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-4 font-medium text-slate-900">{app.citizen_name}</td>
                      <td className="py-3 pr-4 text-slate-600">{app.service_id}</td>
                      <td className="py-3 pr-4"><StatusBadge status={app.status} /></td>
                      <td className="py-3 text-slate-500 text-xs">
                        {new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

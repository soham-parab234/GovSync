import { useEffect, useState } from 'react';
import { History, User, Shield, Settings } from 'lucide-react';
import { fetchAuditLogs } from '@/lib/db';
import { Card, EmptyState, Skeleton } from '@/components/ui';

export function AdminAuditLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs(200)
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);

  const roleIcons: Record<string, typeof User> = {
    citizen: User,
    admin: Settings,
    system: Shield,
  };

  const roleColors: Record<string, string> = {
    citizen: 'bg-gov-50 text-gov-600',
    admin: 'bg-orange-50 text-orange-600',
    system: 'bg-slate-100 text-slate-600',
  };

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-slate-900 mb-1">Audit Log</h1>
      <p className="text-slate-500 mb-6">Complete, tamper-evident record of every action taken on the platform.</p>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : logs.length === 0 ? (
        <Card>
          <EmptyState icon={History} title="No audit entries yet" description="As citizens and administrators use the platform, every action will be logged here." />
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wide">
                  <th className="pb-3 pr-4 font-medium">Actor</th>
                  <th className="pb-3 pr-4 font-medium">Role</th>
                  <th className="pb-3 pr-4 font-medium">Action</th>
                  <th className="pb-3 pr-4 font-medium">Entity</th>
                  <th className="pb-3 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const RoleIcon = roleIcons[log.actor_role] || User;
                  return (
                    <tr key={log.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-4 font-medium text-slate-900">{log.actor_id}</td>
                      <td className="py-3 pr-4">
                        <span className={`badge ${roleColors[log.actor_role] || 'bg-slate-100 text-slate-600'}`}>
                          <RoleIcon className="w-3 h-3" />
                          {log.actor_role}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-700 font-mono text-xs">{log.action}</td>
                      <td className="py-3 pr-4 text-slate-500 text-xs">
                        {log.entity_type ? `${log.entity_type}#${log.entity_id?.slice(0, 8)}` : '—'}
                      </td>
                      <td className="py-3 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

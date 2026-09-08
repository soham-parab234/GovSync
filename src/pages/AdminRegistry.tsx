import { useEffect, useState } from 'react';
import { Server, Activity, RefreshCw } from 'lucide-react';
import { fetchApiRegistry } from '@/lib/db';
import { ApiStatusBadge, getIcon } from '@/components/ui/Badges';
import { Card, Skeleton } from '@/components/ui';

export function AdminRegistry() {
  const [apis, setApis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApiRegistry()
      .then(setApis)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">API & Service Registry</h1>
          <p className="text-slate-500 mt-1">Connected government department APIs and their health status.</p>
        </div>
        <button onClick={() => { setLoading(true); fetchApiRegistry().then(setApis).finally(() => setLoading(false)); }} className="btn-secondary text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {apis.map((api) => {
            const Icon = getIcon(api.icon);
            return (
              <Card key={api.id}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gov-50 to-teal-50 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-gov-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{api.name}</p>
                      <p className="text-xs text-slate-500">{api.department}</p>
                    </div>
                  </div>
                  <ApiStatusBadge status={api.status} />
                </div>
                <p className="text-sm text-slate-600 mb-4">{api.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Base URL</span>
                    <code className="text-slate-700 bg-slate-50 px-2 py-0.5 rounded text-[10px]">{api.base_url}</code>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Avg Response</span>
                    <span className="text-slate-700 font-medium">{api.avg_response_ms}ms</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Last Checked</span>
                    <span className="text-slate-700">{new Date(api.last_checked).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-2">Data Fields Provided:</p>
                  <div className="flex flex-wrap gap-1">
                    {api.data_fields.map((f: string) => (
                      <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200">{f}</span>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { History, Shield, CheckCircle2, XCircle } from 'lucide-react';
import { fetchConsentRecords, fetchServices } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import type { ConsentRecord, Service } from '@/lib/types';
import { Card, EmptyState, Skeleton } from '@/components/ui';

export function ConsentHistoryPage() {
  const { citizen } = useAuth();
  const [records, setRecords] = useState<ConsentRecord[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!citizen) return;
    Promise.all([fetchConsentRecords(citizen.id), fetchServices()])
      .then(([recs, svcs]) => {
        setRecords(recs);
        setServices(svcs);
      })
      .finally(() => setLoading(false));
  }, [citizen]);

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-slate-900 mb-1">Consent History</h1>
      <p className="text-slate-500 mb-6">Every time you grant or deny consent for data access, it is recorded here permanently.</p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : records.length === 0 ? (
        <Card>
          <EmptyState
            icon={History}
            title="No consent records yet"
            description="When you apply for a service and grant consent for data access, the record will appear here."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {records.map((record) => {
            const service = services.find((s) => s.id === record.service_id);
            return (
              <div key={record.id} className="card p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      record.granted ? 'bg-teal-50' : 'bg-red-50'
                    }`}>
                      {record.granted ? <CheckCircle2 className="w-5 h-5 text-teal-600" /> : <XCircle className="w-5 h-5 text-red-500" />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{service?.name || 'Unknown Service'}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(record.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${record.granted ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-700'}`}>
                    {record.granted ? 'Granted' : 'Denied'}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Data sources accessed: {record.data_sources.join(', ')}</span>
                </div>

                {record.fields_accessed && Array.isArray(record.fields_accessed) && (
                  <div className="space-y-1.5">
                    {(record.fields_accessed as any[]).map((fa, i) => (
                      <div key={i} className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="font-medium text-slate-700 capitalize">{fa.source}:</span>
                        <span className="text-slate-500"> {fa.fields?.join(', ')}</span>
                        <span className="text-slate-400"> — {fa.reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

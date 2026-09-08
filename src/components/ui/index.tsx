import { type ReactNode } from 'react';
import { CheckCircle2, Clock, AlertCircle, XCircle, Loader2 } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  title: string;
  description: string | null;
  status: 'done' | 'active' | 'pending' | 'error' | 'warning';
  timestamp?: string;
}

const statusStyles = {
  done: { icon: CheckCircle2, color: 'text-teal-600 bg-teal-50 border-teal-200', line: 'bg-teal-300' },
  active: { icon: Loader2, color: 'text-gov-600 bg-gov-50 border-gov-200', line: 'bg-gov-300' },
  pending: { icon: Clock, color: 'text-slate-400 bg-slate-50 border-slate-200', line: 'bg-slate-200' },
  error: { icon: XCircle, color: 'text-red-600 bg-red-50 border-red-200', line: 'bg-red-300' },
  warning: { icon: AlertCircle, color: 'text-amber-600 bg-amber-50 border-amber-200', line: 'bg-amber-300' },
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="space-y-0">
      {events.map((event, index) => {
        const style = statusStyles[event.status];
        const Icon = style.icon;
        const isLast = index === events.length - 1;
        return (
          <div key={event.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${style.color} flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${event.status === 'active' ? 'animate-spin' : ''}`} />
              </div>
              {!isLast && <div className={`w-0.5 flex-1 ${style.line} mt-1 min-h-[2rem]`} />}
            </div>
            <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-6'}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900 text-sm">{event.title}</p>
                  {event.description && (
                    <p className="text-sm text-slate-500 mt-0.5">{event.description}</p>
                  )}
                </div>
                {event.timestamp && (
                  <span className="text-xs text-slate-400 whitespace-nowrap mt-0.5">
                    {event.timestamp}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card p-6 ${className}`}>{children}</div>;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-2xl',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto animate-slide-up`}>
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-semibold text-slate-900 font-serif">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return <Loader2 className={`w-5 h-5 animate-spin ${className}`} />;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof Clock;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

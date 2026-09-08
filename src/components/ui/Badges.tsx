import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Loader2,
  FileText,
  GraduationCap,
  ShoppingBasket,
  Plane,
  HandHeart,
  ScrollText,
  Fingerprint,
  ReceiptIndianRupee,
  Home,
  FolderLock,
  Server,
  type LucideIcon,
} from 'lucide-react';
import type { ApplicationStatus, ApiStatus } from '@/lib/types';

const iconMap: Record<string, LucideIcon> = {
  FileText,
  GraduationCap,
  ShoppingBasket,
  Plane,
  HandHeart,
  ScrollText,
  Fingerprint,
  ReceiptIndianRupee,
  Home,
  FolderLock,
  Server,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] || FileText;
}

const statusConfig: Record<ApplicationStatus, { label: string; color: string; icon: typeof Clock }> = {
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700', icon: FileText },
  consent_granted: { label: 'Consent Granted', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
  data_fetching: { label: 'Fetching Data', color: 'bg-amber-100 text-amber-700', icon: Loader2 },
  data_fetched: { label: 'Data Retrieved', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
  eligibility_checking: { label: 'Checking Eligibility', color: 'bg-amber-100 text-amber-700', icon: Loader2 },
  eligible: { label: 'Eligible', color: 'bg-teal-100 text-teal-700', icon: CheckCircle2 },
  not_eligible: { label: 'Not Eligible', color: 'bg-red-100 text-red-700', icon: XCircle },
  needs_review: { label: 'Needs Review', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  submitted: { label: 'Submitted', color: 'bg-gov-100 text-gov-700', icon: CheckCircle2 },
  under_review: { label: 'Under Review', color: 'bg-amber-100 text-amber-700', icon: Clock },
  approved: { label: 'Approved', color: 'bg-teal-100 text-teal-700', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  manual_review: { label: 'Manual Review', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <span className={`badge ${config.color}`}>
      <Icon className={`w-3 h-3 ${status === 'data_fetching' || status === 'eligibility_checking' ? 'animate-spin' : ''}`} />
      {config.label}
    </span>
  );
}

const apiStatusConfig: Record<ApiStatus, { label: string; color: string; dot: string }> = {
  operational: { label: 'Operational', color: 'text-teal-700 bg-teal-50', dot: 'bg-teal-500' },
  degraded: { label: 'Degraded', color: 'text-amber-700 bg-amber-50', dot: 'bg-amber-500' },
  down: { label: 'Down', color: 'text-red-700 bg-red-50', dot: 'bg-red-500' },
};

export function ApiStatusBadge({ status }: { status: ApiStatus }) {
  const config = apiStatusConfig[status];
  return (
    <span className={`badge ${config.color}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot} ${status === 'operational' ? 'animate-pulse-soft' : ''}`} />
      {config.label}
    </span>
  );
}

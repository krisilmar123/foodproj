import type { ReviewStatus } from '@/types';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: ReviewStatus;
}

const STATUS_CONFIG: Record<
  ReviewStatus,
  { label: string; classes: string; Icon: typeof CheckCircle }
> = {
  pending: {
    label: 'Pending',
    classes: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    Icon: Clock,
  },
  approved: {
    label: 'Approved',
    classes: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    Icon: CheckCircle,
  },
  rejected: {
    label: 'Rejected',
    classes: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    Icon: XCircle,
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const { Icon } = config;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.classes}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {config.label}
    </span>
  );
}

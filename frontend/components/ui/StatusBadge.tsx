import { getStatusStyle } from '@/lib/utils';

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase rounded-sm ${getStatusStyle(status)}`}>
      {status}
    </span>
  );
}


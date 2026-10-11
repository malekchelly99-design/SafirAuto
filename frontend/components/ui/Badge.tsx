import { getBadgeStyle } from '@/lib/utils';

interface BadgeProps {
  label: string;
  className?: string;
}

export default function Badge({ label, className = '' }: BadgeProps) {
  if (!label) return null;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase rounded-sm ${getBadgeStyle(label)} ${className}`}>
      {label}
    </span>
  );
}


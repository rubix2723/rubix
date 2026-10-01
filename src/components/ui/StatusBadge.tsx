import { clsx } from 'clsx';

/**
 * StatusBadge UI Primitive
 * 
 * STRICT ARCHITECTURAL CONSTRAINT:
 * Only use when bound to genuine, verified runtime data (e.g., live healthchecks,
 * endpoint telemetry, or system monitoring). Never use as decorative brand ornamentation
 * or simulated status theatre (such as "ONLINE", "ACTIVE", or pulsing indicators).
 */
export interface StatusBadgeProps {
  status?: 'active' | 'operational' | 'notice';
  label: string;
  className?: string;
}

export function StatusBadge({ status = 'active', label, className }: StatusBadgeProps) {
  return (
    <div
      className={clsx(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full',
        'bg-[var(--bg-surface)] border border-[var(--border-hairline)]',
        'text-xs font-mono tracking-wider uppercase text-[var(--text-secondary)]',
        className
      )}
    >
      <span
        className={clsx('size-1.5 rounded-full', {
          'bg-emerald-400': status === 'active' || status === 'operational',
          'bg-orange-400': status === 'notice',
        })}
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}

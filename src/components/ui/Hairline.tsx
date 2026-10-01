import { clsx } from 'clsx';

export interface HairlineProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Hairline({ orientation = 'horizontal', className }: HairlineProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={clsx(
        orientation === 'horizontal' ? 'w-full h-px bg-white/[0.08]' : 'h-full w-px bg-white/[0.08]',
        className
      )}
    />
  );
}

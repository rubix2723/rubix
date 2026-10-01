import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'signal' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  asLink?: boolean;
  href?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  asLink = false,
  href,
  icon,
  iconPosition = 'right',
  className,
  children,
  ...props
}: ButtonProps) {
  const isInteractivePushButton = !asLink && variant !== 'ghost';

  const baseStyles = clsx(
    'inline-flex items-center justify-center font-medium select-none cursor-pointer',
    'whitespace-nowrap text-center transition-all',
    'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--accent-signal)]',
    // Active tactile depression strictly restricted to push-button controls (never links, nav, cards, or text)
    isInteractivePushButton && 'active:scale-[0.98]',
    'disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed',
    {
      // Size scale (ensuring 44px minimum touch target on standard sizes)
      'text-xs px-3.5 py-2 min-h-[36px] rounded-md gap-1.5': size === 'sm',
      'text-sm px-5 py-2.5 min-h-[44px] rounded-lg gap-2': size === 'md',
      'text-base px-7 py-3.5 min-h-[52px] rounded-xl gap-2.5': size === 'lg',

      // Variants with rigorous WCAG AA/AAA contrast
      'bg-[var(--text-primary)] text-[var(--text-inverse)] hover:opacity-90 shadow-sm': variant === 'primary',
      'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--border-strong)] border border-[var(--border-hairline)]': variant === 'secondary',
      'bg-transparent text-[var(--text-primary)] hover:border-[var(--border-strong)] border border-[var(--border-hairline)]': variant === 'outline',
      'bg-[var(--accent-signal)] text-white font-semibold hover:bg-[var(--accent-signal-hover)] shadow-sm': variant === 'signal',
      'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2': variant === 'ghost',
    }
  );

  const merged = twMerge(baseStyles, className);

  const content = (
    <>
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0 transition-transform group-hover:translate-x-0.5">{icon}</span>}
    </>
  );

  if (asLink && href) {
    return (
      <a href={href} className={merged}>
        {content}
      </a>
    );
  }

  return (
    <button className={merged} {...props}>
      {content}
    </button>
  );
}

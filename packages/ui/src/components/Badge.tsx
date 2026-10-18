import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant =
  | 'default'
  | 'brand'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'agentforge'
  | 'pulseops'
  | 'gateflow'
  | 'cortexrag'
  | 'syncspace'
  | 'sentinelx'
  | 'cloudpilot';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  children: ReactNode;
}

export function Badge({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`nx-badge nx-badge--${variant} nx-badge--${size} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
}

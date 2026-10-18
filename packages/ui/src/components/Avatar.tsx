import type { HTMLAttributes } from 'react';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({
  name,
  src,
  size = 'md',
  className = '',
  ...props
}: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={`nx-avatar nx-avatar--${size} ${className}`.trim()}
      aria-label={name}
      {...props}
    >
      {src ? (
        <img src={src} alt={name} className="nx-avatar__img" />
      ) : (
        <span className="nx-avatar__fallback">{initials || '?'}</span>
      )}
    </div>
  );
}

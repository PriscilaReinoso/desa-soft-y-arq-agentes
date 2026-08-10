import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'muted' | 'ghost'
export type ButtonSize = 'xs' | 'sm' | 'md'

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: { background: 'var(--primary)', color: '#fff' },
  accent: { background: 'var(--accent)', color: '#fff' },
  outline: { background: 'none', color: 'var(--foreground)', border: '1px solid var(--border)' },
  muted: { background: 'var(--muted)', color: 'var(--foreground)' },
  ghost: { background: 'none', color: 'var(--primary)' },
}

const sizeStyles: Record<ButtonSize, CSSProperties> = {
  xs: { padding: '4px 10px', fontSize: 11 },
  sm: { padding: '9px 20px', fontSize: 13 },
  md: { padding: '10px 20px', fontSize: 14 },
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

export default function Button({ variant = 'primary', size = 'md', style, children, ...rest }: Props) {
  return (
    <button
      {...rest}
      style={{
        border: variant === 'primary' || variant === 'accent' ? 'none' : undefined,
        borderRadius: 8,
        fontFamily: 'inherit',
        fontWeight: 700,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        lineHeight: 1.2,
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
    >
      {children}
    </button>
  )
}

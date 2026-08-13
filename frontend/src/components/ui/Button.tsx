import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'muted' | 'ghost'
export type ButtonSize = 'xs' | 'sm' | 'md'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white',
  accent: 'bg-accent text-white',
  outline: 'bg-transparent text-foreground border border-border',
  muted: 'bg-muted text-foreground',
  ghost: 'bg-transparent text-primary',
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1 text-[11px]',
  sm: 'px-5 py-[9px] text-[13px]',
  md: 'px-5 py-2.5 text-sm',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

export default function Button({ variant = 'primary', size = 'md', className, style, children, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`rounded-lg font-bold cursor-pointer inline-flex items-center justify-center gap-1.5 leading-[1.2] ${variantClasses[variant]} ${sizeClasses[size]} ${className ?? ''}`}
      style={style}
    >
      {children}
    </button>
  )
}

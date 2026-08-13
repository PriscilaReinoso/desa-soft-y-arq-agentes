import type { CSSProperties, ReactNode } from 'react'

type Props = {
  children: ReactNode
  color?: string
  variant?: 'tint' | 'subtle'
  style?: CSSProperties
}

export default function Badge({ children, color = '#4A6B8A', variant = 'tint', style }: Props) {
  const subtle = variant === 'subtle'
  return (
    <span
      style={{
        background: subtle ? 'var(--secondary)' : `${color}18`,
        color: subtle ? 'var(--secondary-foreground)' : color,
        ...style,
      }}
      className={`text-[11px] rounded-full whitespace-nowrap px-2.5 py-[3px] ${
        subtle ? 'font-semibold' : 'font-bold'
      }`}
    >
      {children}
    </span>
  )
}

import type { CSSProperties, ReactNode } from 'react'

type Props = {
  children: ReactNode
  color?: string
  style?: CSSProperties
}

export default function Badge({ children, color = '#4A6B8A', style }: Props) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: '3px 10px',
        borderRadius: 99,
        background: `${color}18`,
        color,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  )
}

import type { CSSProperties, ReactNode } from 'react'

type Props = {
  children: ReactNode
  style?: CSSProperties
  onClick?: () => void
}

export default function Card({ children, style, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="bg-card border border-border rounded-xl overflow-hidden"
      style={style}
    >
      {children}
    </div>
  )
}

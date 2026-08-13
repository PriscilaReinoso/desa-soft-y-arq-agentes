import type { CSSProperties, ReactNode } from 'react'

type Props = {
  children: ReactNode
  maxWidth?: number
  style?: CSSProperties
}

export default function PageContainer({ children, maxWidth, style }: Props) {
  return (
    <div className="px-9 py-8" style={{ maxWidth, ...style }}>
      {children}
    </div>
  )
}

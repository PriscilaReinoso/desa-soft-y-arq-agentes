import type { CSSProperties, ReactNode } from 'react'

type Props = {
  children: ReactNode
  size?: 'sm' | 'md'
  style?: CSSProperties
}

export default function Alert({ children, size = 'sm', style }: Props) {
  return (
    <div
      style={style}
      className={`bg-danger/10 text-danger font-semibold rounded-lg ${
        size === 'md' ? 'text-[13px] px-4 py-3' : 'text-xs px-3 py-2.5'
      }`}
    >
      {children}
    </div>
  )
}

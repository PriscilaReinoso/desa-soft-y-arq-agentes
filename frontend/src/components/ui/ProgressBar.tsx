import type { CSSProperties } from 'react'

type Props = {
  value: number
  color?: string
  height?: number
  trackColor?: string
  style?: CSSProperties
}

export default function ProgressBar({ value, color = 'var(--primary)', height = 4, trackColor = 'var(--muted)', style }: Props) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div style={{ height, background: trackColor, borderRadius: 99, overflow: 'hidden', ...style }}>
      <div
        style={{
          height: '100%',
          width: `${clamped}%`,
          background: color,
          borderRadius: 99,
          transition: 'width 0.3s',
        }}
      />
    </div>
  )
}

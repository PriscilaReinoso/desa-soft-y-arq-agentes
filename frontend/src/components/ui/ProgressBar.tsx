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
    <div style={{ height, background: trackColor, ...style }} className="rounded-full overflow-hidden">
      <div
        style={{ width: `${clamped}%`, background: color }}
        className="h-full rounded-full transition-all duration-300"
      />
    </div>
  )
}

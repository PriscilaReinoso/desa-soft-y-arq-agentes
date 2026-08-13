import { initials } from '../../lib/format'

type Props = {
  name: string
  size?: number
  background?: string
  color?: string
}

export default function Avatar({ name, size = 36, background = 'var(--primary)', color = '#fff' }: Props) {
  return (
    <div
      style={{ width: size, height: size, background, color, fontSize: Math.max(11, size * 0.36) }}
      className="rounded-full flex items-center justify-center font-extrabold shrink-0"
    >
      {initials(name)}
    </div>
  )
}

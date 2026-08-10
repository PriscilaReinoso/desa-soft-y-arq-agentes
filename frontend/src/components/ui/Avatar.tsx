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
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: Math.max(11, size * 0.36),
        flexShrink: 0,
      }}
    >
      {initials(name)}
    </div>
  )
}

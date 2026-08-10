import type { ReactNode } from 'react'

type Props = {
  title: string
  subtitle?: ReactNode
  action?: ReactNode
}

export default function PageHeader({ title, subtitle, action }: Props) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
      <div>
        <h1 style={{ fontWeight: 800, fontSize: 24, margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ margin: '4px 0 0', color: 'var(--muted-foreground)', fontSize: 14 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

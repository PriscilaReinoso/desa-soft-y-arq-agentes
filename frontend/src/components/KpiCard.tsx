import type { Kpi } from '../types/domain'

type Props = { kpi: Kpi }

export default function KpiCard({ kpi }: Props) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: '20px',
        border: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ fontSize: 22, marginBottom: 8 }}>{kpi.icon}</div>
      <div style={{ fontWeight: 800, fontSize: 26, color: kpi.color, fontFamily: "'JetBrains Mono', monospace" }}>
        {kpi.value}
      </div>
      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--foreground)', marginTop: 2 }}>{kpi.label}</div>
      <div style={{ fontSize: 11.5, color: 'var(--muted-foreground)', marginTop: 4 }}>{kpi.delta}</div>
      <div
        style={{
          position: 'absolute',
          right: -10,
          top: -10,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: kpi.color,
          opacity: 0.07,
        }}
      />
    </div>
  )
}

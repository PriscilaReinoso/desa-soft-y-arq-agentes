import { deposits } from '../data/mock'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import ProgressBar from '../components/ui/ProgressBar'

export default function DepositsPage() {
  return (
    <div style={{ padding: '32px 36px' }}>
      <PageHeader
        title="Depósitos"
        subtitle={`${deposits.length} depósitos activos`}
        action={<Button>+ Nuevo depósito</Button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {deposits.map((d) => {
          const high = d.capacity > 70
          const capacityColor = high ? '#C85A3A' : '#7B9A4A'
          return (
            <Card key={d.name} style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 2 }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>📍 {d.location}</div>
                </div>
                <Badge color={capacityColor}>{d.capacity}% ocupado</Badge>
              </div>

              <ProgressBar value={d.capacity} color={high ? '#C85A3A' : 'var(--primary)'} height={6} style={{ marginBottom: 16 }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div style={{ background: 'var(--muted)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: 'var(--primary)' }}>
                    {d.items}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 600 }}>artículos</div>
                </div>
                <div style={{ background: 'var(--muted)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{d.manager}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 600 }}>responsable</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {d.categories.map((c) => (
                  <span
                    key={c}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '3px 10px',
                      background: 'var(--secondary)',
                      borderRadius: 99,
                      color: 'var(--secondary-foreground)',
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <Button variant="outline" size="sm" style={{ flex: 1 }}>
                  Ver artículos
                </Button>
                <Button variant="outline" size="sm" style={{ flex: 1 }}>
                  Editar
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

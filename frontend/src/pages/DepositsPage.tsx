import { deposits } from '../data/mock'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageContainer from '../components/ui/PageContainer'
import PageHeader from '../components/ui/PageHeader'
import ProgressBar from '../components/ui/ProgressBar'

export default function DepositsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Depósitos"
        subtitle={`${deposits.length} depósitos activos`}
        action={<Button>+ Nuevo depósito</Button>}
      />

      <div className="grid grid-cols-2 gap-4">
        {deposits.map((d) => {
          const high = d.capacity > 70
          const capacityColor = high ? '#C85A3A' : '#7B9A4A'
          return (
            <Card key={d.name} style={{ padding: 24 }}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-extrabold text-base mb-0.5">{d.name}</div>
                  <div className="text-xs text-muted-foreground">📍 {d.location}</div>
                </div>
                <Badge color={capacityColor}>{d.capacity}% ocupado</Badge>
              </div>

              <ProgressBar value={d.capacity} color={high ? '#C85A3A' : 'var(--primary)'} height={6} style={{ marginBottom: 16 }} />

              <div className="grid grid-cols-2 gap-3 mb-3.5">
                <div className="bg-muted rounded-lg px-3 py-2.5">
                  <div className="text-xl font-extrabold font-mono text-primary">
                    {d.items}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-semibold">artículos</div>
                </div>
                <div className="bg-muted rounded-lg px-3 py-2.5">
                  <div className="text-[13px] font-bold">{d.manager}</div>
                  <div className="text-[11px] text-muted-foreground font-semibold">responsable</div>
                </div>
              </div>

              <div className="flex gap-1.5 flex-wrap">
                {d.categories.map((c) => (
                  <Badge key={c} variant="subtle" style={{ padding: '3px 10px' }}>
                    {c}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2 mt-3.5">
                <Button variant="outline" size="sm" className="flex-1">
                  Ver artículos
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Editar
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </PageContainer>
  )
}

import type { Kpi } from '../types/domain'

type Props = { kpi: Kpi }

export default function KpiCard({ kpi }: Props) {
  return (
    <div className="bg-card rounded-xl p-5 border border-border relative overflow-hidden">
      <div className="text-[22px] mb-2">{kpi.icon}</div>
      <div className="font-extrabold text-[26px] font-mono" style={{ color: kpi.color }}>
        {kpi.value}
      </div>
      <div className="font-semibold text-[13px] text-foreground mt-0.5">{kpi.label}</div>
      <div className="text-[11.5px] text-muted-foreground mt-1">{kpi.delta}</div>
      <div
        style={{ background: kpi.color, opacity: 0.07 }}
        className="absolute -right-2.5 -top-2.5 w-[60px] h-[60px] rounded-full"
      />
    </div>
  )
}

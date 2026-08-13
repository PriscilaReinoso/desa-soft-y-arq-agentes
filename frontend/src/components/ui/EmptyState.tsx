type Props = {
  icon?: string
  message: string
}

export default function EmptyState({ icon = '◷', message }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground">
      <div className="text-[40px] mb-3">{icon}</div>
      <div className="text-sm font-semibold">{message}</div>
    </div>
  )
}

type Props = {
  icon?: string
  message: string
}

export default function EmptyState({ icon = '◷', message }: Props) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 40,
        textAlign: 'center',
        color: 'var(--muted-foreground)',
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontWeight: 600, fontSize: 14 }}>{message}</div>
    </div>
  )
}

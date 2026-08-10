type Props = {
  options: string[]
  active: string
  onChange: (value: string) => void
}

export default function FilterPills({ options, active, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {options.map((option) => {
        const isActive = option === active
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            style={{
              padding: '7px 14px',
              border: isActive ? '1.5px solid var(--primary)' : '1px solid var(--border)',
              borderRadius: 99,
              background: isActive ? 'var(--primary)' : '#fff',
              color: isActive ? '#fff' : 'var(--foreground)',
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

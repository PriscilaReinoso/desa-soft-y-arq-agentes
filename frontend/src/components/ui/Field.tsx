import type { ReactNode } from 'react'

type Props = {
  label: string
  children: ReactNode
  htmlFor?: string
}

export default function Field({ label, children, htmlFor }: Props) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-foreground)', display: 'block', marginBottom: 4 }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

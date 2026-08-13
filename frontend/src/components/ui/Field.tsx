import type { ReactNode } from 'react'

type Props = {
  label: string
  children: ReactNode
  htmlFor?: string
  error?: string
}

export default function Field({ label, children, htmlFor, error }: Props) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-bold text-muted-foreground mb-1"
      >
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
}

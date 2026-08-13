import type { ReactNode } from 'react'

type Props = {
  title: string
  subtitle?: ReactNode
  action?: ReactNode
}

export default function PageHeader({ title, subtitle, action }: Props) {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h1 className="font-extrabold text-2xl m-0">{title}</h1>
        {subtitle && <p className="mt-1 m-0 text-muted-foreground text-sm">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

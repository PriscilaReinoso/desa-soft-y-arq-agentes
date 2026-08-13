import type { CSSProperties, ReactNode } from 'react'

export type Column<T> = {
  key: string
  header: string
  render: (row: T) => ReactNode
  mono?: boolean
  align?: 'left' | 'center' | 'right'
  tdStyle?: CSSProperties
  nowrap?: boolean
}

type Props<T> = {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  headerPadding?: string
  cellPadding?: string
}

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  headerPadding = '11px 16px',
  cellPadding = '12px 16px',
}: Props<T>) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ padding: headerPadding }}
                className="text-left text-[11px] font-bold tracking-[0.06em] uppercase text-muted-foreground whitespace-nowrap"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={rowKey(row)} className={i > 0 ? 'border-t border-border' : undefined}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: cellPadding,
                    fontFamily: col.mono ? "'JetBrains Mono', monospace" : undefined,
                    textAlign: col.align ?? undefined,
                    whiteSpace: col.nowrap ? 'nowrap' : undefined,
                    ...col.tdStyle,
                  }}
                  className="text-[13px] text-foreground"
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

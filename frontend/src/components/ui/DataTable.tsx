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
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--muted)' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: headerPadding,
                  textAlign: 'left',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--muted-foreground)',
                  whiteSpace: 'nowrap',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={rowKey(row)} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: cellPadding,
                    fontSize: 13,
                    color: 'var(--foreground)',
                    fontFamily: col.mono ? "'JetBrains Mono', monospace" : 'inherit',
                    textAlign: col.align ?? 'left',
                    whiteSpace: col.nowrap ? 'nowrap' : 'normal',
                    ...col.tdStyle,
                  }}
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

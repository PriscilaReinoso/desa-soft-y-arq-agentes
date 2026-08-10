import type { Section } from '../App'

type NavItem = {
  id: Section
  label: string
  icon: string
  group?: string
}

const NAV: NavItem[] = [
  { id: 'dashboard',  label: 'Inicio',         icon: '⊞',  group: 'Principal' },
  { id: 'inventory',  label: 'Inventario',      icon: '◫',  group: 'Gestión' },
  { id: 'deposits',   label: 'Depósitos',       icon: '⬡',  group: 'Gestión' },
  { id: 'sales',      label: 'Ventas',          icon: '◈',  group: 'Gestión' },
  { id: 'suppliers',  label: 'Proveedores',     icon: '◎',  group: 'Gestión' },
  { id: 'pricelists', label: 'Listas de precios', icon: '◷', group: 'Gestión' },
  { id: 'budgets',    label: 'Presupuestos',    icon: '◧',  group: 'Ventas' },
  { id: 'assistant',  label: 'Asistente IA',    icon: '✦',  group: 'Herramientas' },
]

const groups = ['Principal', 'Gestión', 'Ventas', 'Herramientas']

type Props = {
  active: Section
  onNavigate: (s: Section) => void
}

export default function Sidebar({ active, onNavigate }: Props) {
  return (
    <aside
      className="flex flex-col shrink-0 overflow-y-auto"
      style={{
        width: 224,
        background: '#FFFFFF',
        borderRight: '1px solid var(--border)',
        padding: '0 0 24px 0',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <span
            style={{
              width: 34,
              height: 34,
              background: 'var(--primary)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              color: '#fff',
            }}
          >
            🔧
          </span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--foreground)', lineHeight: 1.1 }}>
              FerreStock
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500 }}>
              Gestión de inventario
            </div>
          </div>
        </div>
      </div>

      {/* Nav groups */}
      <nav style={{ flex: 1, padding: '12px 10px 0' }}>
        {groups.map((group) => {
          const items = NAV.filter((n) => n.group === group)
          return (
            <div key={group} style={{ marginBottom: 8 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--muted-foreground)',
                  padding: '10px 10px 4px',
                }}
              >
                {group}
              </div>
              {items.map((item) => {
                const isActive = active === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 10px',
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer',
                      background: isActive ? 'var(--primary)' : 'transparent',
                      color: isActive ? '#fff' : 'var(--foreground)',
                      fontFamily: 'inherit',
                      fontSize: 14,
                      fontWeight: isActive ? 700 : 500,
                      textAlign: 'left',
                      transition: 'background 0.15s, color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'var(--muted)'
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                    }}
                  >
                    <span style={{ fontSize: 16, opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
                    {item.label}
                    {item.id === 'assistant' && (
                      <span
                        style={{
                          marginLeft: 'auto',
                          fontSize: 10,
                          fontWeight: 700,
                          background: '#C8763A',
                          color: '#fff',
                          borderRadius: 99,
                          padding: '1px 6px',
                        }}
                      >
                        IA
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* User footer */}
      <div
        style={{
          margin: '0 10px',
          padding: '12px',
          background: 'var(--muted)',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          MR
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--foreground)' }}>
            Marcos Ruiz
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>Administrador</div>
        </div>
      </div>
    </aside>
  )
}

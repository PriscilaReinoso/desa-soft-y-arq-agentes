import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { mockUsuario } from '../../data/mock'
import { initials } from '../../lib/format'

type NavItem = {
  to: string
  label: string
  icon: string
  group: string
  badge?: string
}

const NAV: NavItem[] = [
  { to: '/inicio', label: 'Inicio', icon: '⊞', group: 'Principal' },
  { to: '/inventario', label: 'Inventario', icon: '◫', group: 'Gestión' },
  { to: '/depositos', label: 'Depósitos', icon: '⬡', group: 'Gestión' },
  { to: '/ventas', label: 'Ventas', icon: '◈', group: 'Gestión' },
  { to: '/proveedores', label: 'Proveedores', icon: '◎', group: 'Gestión' },
  { to: '/listas-de-precios', label: 'Listas de precios', icon: '◷', group: 'Gestión' },
  { to: '/presupuestos', label: 'Presupuestos', icon: '◧', group: 'Ventas' },
  { to: '/asistente', label: 'Asistente IA', icon: '✦', group: 'Herramientas', badge: 'IA' },
]

const groups = ['Principal', 'Gestión', 'Ventas', 'Herramientas']

export default function Sidebar() {
  const { usuario, logout } = useAuth()
  const user = usuario ?? mockUsuario

  return (
    <aside
      style={{
        width: 224,
        background: '#FFFFFF',
        borderRight: '1px solid var(--border)',
        padding: '0 0 24px 0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={({ isActive }) => ({
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 10px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    background: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--foreground)',
                    fontFamily: 'inherit',
                    fontSize: 14,
                    fontWeight: isActive ? 700 : 500,
                    transition: 'background 0.15s, color 0.15s',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <span style={{ fontSize: 16, opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
                      {item.label}
                      {item.badge && (
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
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          )
        })}
      </nav>

      {/* User footer */}
      <div style={{ margin: '0 10px' }}>
        <div
          style={{
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
            {initials(`${user.nombre} ${user.apellido}`)}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.nombre} {user.apellido}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{user.rol}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          style={{
            width: '100%',
            marginTop: 8,
            padding: '7px 12px',
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: 8,
            color: 'var(--muted-foreground)',
            fontFamily: 'inherit',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

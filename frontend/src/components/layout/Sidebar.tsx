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
    <aside className="w-[224px] bg-card border-r border-border flex flex-col shrink-0 overflow-y-auto pb-6">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <span className="w-[34px] h-[34px] bg-primary rounded-lg flex items-center justify-center text-lg text-white">
            🔧
          </span>
          <div>
            <div className="font-extrabold text-[15px] text-foreground leading-[1.1]">
              FerreStock
            </div>
            <div className="text-[11px] text-muted-foreground font-medium">
              Gestión de inventario
            </div>
          </div>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-2.5 pt-3">
        {groups.map((group) => {
          const items = NAV.filter((n) => n.group === group)
          return (
            <div key={group} className="mb-2">
              <div className="text-[10px] font-bold tracking-[0.08em] uppercase text-muted-foreground px-2.5 pt-2.5 pb-1">
                {group}
              </div>
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-2.5 px-2.5 py-[9px] rounded-lg no-underline text-sm transition-colors ${
                      isActive ? 'bg-primary text-white font-bold' : 'text-foreground font-medium'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`text-base ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.icon}</span>
                      {item.label}
                      {item.badge && (
                        <span className="ml-auto text-[10px] font-bold bg-accent text-white rounded-full px-1.5 py-px">
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
      <div className="mx-2.5">
        <div className="p-3 bg-muted rounded-[10px] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[13px] shrink-0">
            {initials(`${user.nombre} ${user.apellido}`)}
          </div>
          <div className="overflow-hidden flex-1">
            <div className="font-bold text-[13px] text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
              {user.nombre} {user.apellido}
            </div>
            <div className="text-[11px] text-muted-foreground">{user.rol}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="w-full mt-2 px-3 py-[7px] bg-transparent border border-border rounded-lg text-muted-foreground text-xs font-semibold cursor-pointer"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

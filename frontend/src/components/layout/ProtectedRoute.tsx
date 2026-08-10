import type { ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

type Props = {
  requireAuth: boolean
  children?: ReactNode
}

export default function ProtectedRoute({ requireAuth, children }: Props) {
  const { isAuthenticated } = useAuth()

  if (requireAuth && !isAuthenticated) return <Navigate to="/login" replace />
  if (!requireAuth && isAuthenticated) return <Navigate to="/inicio" replace />

  return children ?? <Outlet />
}

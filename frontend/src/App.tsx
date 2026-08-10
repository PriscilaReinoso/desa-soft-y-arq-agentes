import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import InventoryPage from './pages/InventoryPage'
import DepositsPage from './pages/DepositsPage'
import SalesPage from './pages/SalesPage'
import SuppliersPage from './pages/SuppliersPage'
import PriceListsPage from './pages/PriceListsPage'
import BudgetsPage from './pages/BudgetsPage'
import AssistantPage from './pages/AssistantPage'

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <ProtectedRoute requireAuth={false}>
        <LoginPage />
      </ProtectedRoute>
    ),
  },
  {
    element: <ProtectedRoute requireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/inicio" replace /> },
          { path: 'inicio', element: <DashboardPage /> },
          { path: 'inventario', element: <InventoryPage /> },
          { path: 'depositos', element: <DepositsPage /> },
          { path: 'ventas', element: <SalesPage /> },
          { path: 'proveedores', element: <SuppliersPage /> },
          { path: 'listas-de-precios', element: <PriceListsPage /> },
          { path: 'presupuestos', element: <BudgetsPage /> },
          { path: 'asistente', element: <AssistantPage /> },
          { path: '*', element: <Navigate to="/inicio" replace /> },
        ],
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}

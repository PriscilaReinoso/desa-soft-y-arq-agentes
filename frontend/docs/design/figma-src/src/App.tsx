import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Inventory from './components/Inventory'
import Deposits from './components/Deposits'
import Sales from './components/Sales'
import Suppliers from './components/Suppliers'
import PriceLists from './components/PriceLists'
import Budgets from './components/Budgets'
import AIAssistant from './components/AIAssistant'

export type Section =
  | 'dashboard'
  | 'inventory'
  | 'deposits'
  | 'sales'
  | 'suppliers'
  | 'pricelists'
  | 'budgets'
  | 'assistant'

export default function App() {
  const [active, setActive] = useState<Section>('dashboard')

  const renderSection = () => {
    switch (active) {
      case 'dashboard':   return <Dashboard onNavigate={setActive} />
      case 'inventory':   return <Inventory />
      case 'deposits':    return <Deposits />
      case 'sales':       return <Sales />
      case 'suppliers':   return <Suppliers />
      case 'pricelists':  return <PriceLists />
      case 'budgets':     return <Budgets />
      case 'assistant':   return <AIAssistant />
      default:            return <Dashboard onNavigate={setActive} />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      <Sidebar active={active} onNavigate={setActive} />
      <main className="flex-1 overflow-y-auto">
        {renderSection()}
      </main>
    </div>
  )
}

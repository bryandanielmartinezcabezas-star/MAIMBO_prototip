import { useState } from 'react'
import { Header } from './components/Header'
import { Inventory } from './components/Inventory'
import { Cart } from './components/Cart'
import { Dashboard } from './components/Dashboard'

type View = 'inventory' | 'cart' | 'dashboard'

export default function App() {
  const [currentView, setCurrentView] = useState<View>('inventory')

  return (
    <div className="app-container">
      <Header currentView={currentView} onNavigate={setCurrentView} />

      <main className="main-content">
        {currentView === 'inventory' && <Inventory />}
        {currentView === 'cart' && <Cart />}
        {currentView === 'dashboard' && <Dashboard />}
      </main>
    </div>
  )
}

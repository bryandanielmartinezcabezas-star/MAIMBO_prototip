interface HeaderProps {
  currentView: string
  onNavigate: (view: 'inventory' | 'cart' | 'dashboard') => void
}

export function Header({ currentView, onNavigate }: HeaderProps) {
  return (
    <header>
      <div className="logo">MAINBO</div>

      <nav className="nav-buttons">
        <button
          className={`nav-btn ${currentView === 'inventory' ? 'active' : ''}`}
          onClick={() => onNavigate('inventory')}
        >
          Inventario
        </button>
        <button
          className={`nav-btn ${currentView === 'cart' ? 'active' : ''}`}
          onClick={() => onNavigate('cart')}
        >
          Carrito
        </button>
        <button
          className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onNavigate('dashboard')}
        >
          Dashboard
        </button>
      </nav>
    </header>
  )
}

import { useState } from 'react'
import { STORE_INFO } from './config/store-info'
import { THEME } from './config/theme'
import { formatBs } from './domain/money'
import { Catalogo } from './components/features/Catalogo'
import { Inventario } from './components/features/Inventario'
import { Ticket } from './components/features/Ticket'
import { Ventas } from './components/features/Ventas'
import { Button } from './components/ui/Button'
import { Icon, type IconName } from './components/ui/Icon'
import { ToastHost } from './components/ui/ToastHost'
import { StoreProvider, useStore } from './store/StoreProvider'
import { ToastProvider, useToast } from './store/ToastProvider'
import './styles/app.css'

type View = 'catalogo' | 'inventario' | 'ventas'

const NAV: Array<{ key: View; label: string; icon: IconName }> = [
  { key: 'catalogo', label: 'Catálogo', icon: 'grid' },
  { key: 'inventario', label: 'Inventario', icon: 'box' },
  { key: 'ventas', label: 'Ventas', icon: 'chart' },
]

function Shell() {
  const { totals, resetDemo } = useStore()
  const { notify } = useToast()
  const [view, setView] = useState<View>('catalogo')
  const [ticketOpen, setTicketOpen] = useState(false)

  return (
    <div className="shell" data-nav={THEME.nav}>
      {/* Brand + navigation */}
      <header className="shell__brand">
        <div className="brand">
          <img className="brand__logo" src={THEME.logo} alt={THEME.logoAlt} />
          <div className="brand__meta">
            <span className="brand__variant">{THEME.label}</span>
            <span className="brand__blurb">{THEME.blurb}</span>
          </div>
        </div>
      </header>

      <nav className="shell__nav" aria-label="Secciones">
        {NAV.map((item) => (
          <button
            key={item.key}
            className={`navbtn ${view === item.key ? 'navbtn--on' : ''}`.trim()}
            onClick={() => setView(item.key)}
            aria-current={view === item.key ? 'page' : undefined}
          >
            <Icon name={item.icon} size={19} />
            <span>{item.label}</span>
          </button>
        ))}

        <div className="shell__navfoot">
          <button
            className="navbtn navbtn--quiet"
            onClick={() => {
              resetDemo()
              notify('Datos de demostración restaurados', 'ok')
            }}
            title="Vuelve a los datos de ejemplo"
          >
            <Icon name="refresh" size={17} />
            <span>Reiniciar demo</span>
          </button>
          <p className="shell__store">
            {STORE_INFO.name} · {STORE_INFO.city}
          </p>
        </div>
      </nav>

      {/* Work area */}
      <main className="shell__main">
        {view === 'catalogo' && <Catalogo />}
        {view === 'inventario' && <Inventario />}
        {view === 'ventas' && <Ventas />}
      </main>

      {/* Open ticket, docked on wide screens and a drawer on narrow ones */}
      <div className={`shell__ticket ${ticketOpen ? 'shell__ticket--open' : ''}`.trim()}>
        <button className="shell__ticketclose" onClick={() => setTicketOpen(false)} aria-label="Cerrar ticket">
          <Icon name="x" size={18} />
        </button>
        <Ticket />
      </div>

      {/* Mobile: a permanent handle to the ticket */}
      <div className="shell__bar">
        <Button block size="lg" onClick={() => setTicketOpen(true)} icon={<Icon name="cart" size={18} />}>
          Ticket · {totals.units} · {formatBs(totals.total)}
        </Button>
      </div>

      <ToastHost />
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </ToastProvider>
  )
}

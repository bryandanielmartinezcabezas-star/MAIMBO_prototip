import '../styles/dashboard.css'

export function Dashboard() {
  const stats = [
    { label: 'VENTAS HOY', value: '$0', change: '0%' },
    { label: 'ÓRDENES', value: '0', change: '+0%' },
    { label: 'PRODUCTOS', value: '6', change: 'En Stock' },
  ]

  return (
    <div className="dashboard-container animate-slide-in-down">
      <h1 className="dashboard-title">DASHBOARD</h1>

      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-change">{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="chart-placeholder">
        <div className="placeholder-content">
          <div className="placeholder-bars">
            <div className="bar" style={{ height: '40%' }}></div>
            <div className="bar" style={{ height: '65%' }}></div>
            <div className="bar" style={{ height: '50%' }}></div>
            <div className="bar" style={{ height: '80%' }}></div>
            <div className="bar" style={{ height: '55%' }}></div>
          </div>
          <p>GRÁFICA DE VENTAS - PRÓXIMAS ACTUALIZACIONES</p>
        </div>
      </div>

      <div className="recent-orders">
        <h2 className="orders-title">ÚLTIMAS TRANSACCIONES</h2>
        <div className="orders-empty">
          <p>Sin transacciones registradas</p>
        </div>
      </div>
    </div>
  )
}

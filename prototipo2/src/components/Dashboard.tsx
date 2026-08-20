import '../styles/dashboard.css'

export function Dashboard() {
  const stats = [
    { label: 'Ventas Hoy', value: '$0.00', subtext: 'en transacciones' },
    { label: 'Órdenes', value: '0', subtext: 'procesadas hoy' },
    { label: 'Inventario', value: '6', subtext: 'productos activos' },
  ]

  return (
    <div className="dashboard-container animate-fade-in-up">
      <h1 className="dashboard-title">Dashboard</h1>

      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-subtext">{stat.subtext}</div>
          </div>
        ))}
      </div>

      <div className="analytics-section">
        <h2 className="analytics-title">Análisis de Ventas</h2>
        <div className="chart-placeholder">
          <div className="chart-bars">
            {[40, 65, 50, 80, 55].map((height, i) => (
              <div key={i} className="bar" style={{ height: `${height}%` }}></div>
            ))}
          </div>
          <p>Gráfica disponible proximamente</p>
        </div>
      </div>

      <div className="recent-section">
        <h2 className="recent-title">Transacciones Recientes</h2>
        <div className="recent-empty">
          <p>No hay transacciones registradas</p>
        </div>
      </div>
    </div>
  )
}

import '../styles/cart.css'

export function Cart() {
  return (
    <div className="cart-container animate-slide-in-down">
      <h1 className="cart-title">CARRITO DE COMPRA</h1>

      <div className="cart-empty">
        <div className="empty-icon">□</div>
        <p>EL CARRITO ESTÁ VACÍO</p>
        <small>Selecciona productos del inventario para comenzar</small>
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>SUBTOTAL:</span>
          <span>$0.00</span>
        </div>
        <div className="summary-row">
          <span>IMPUESTO:</span>
          <span>$0.00</span>
        </div>
        <div className="summary-row total">
          <span>TOTAL:</span>
          <span>$0.00</span>
        </div>
      </div>

      <button className="checkout-btn" disabled>
        PROCESAR COMPRA
      </button>
    </div>
  )
}

import '../styles/cart.css'

export function Cart() {
  return (
    <div className="cart-container animate-fade-in-up">
      <h1 className="cart-title">Carrito de Compra</h1>

      <div className="cart-empty">
        <p className="empty-message">Tu carrito está vacío</p>
        <p className="empty-hint">Selecciona productos del catálogo para comenzar</p>
      </div>

      <div className="cart-summary">
        <div className="summary-item">
          <span>Subtotal</span>
          <span>$0.00</span>
        </div>
        <div className="summary-item">
          <span>Impuesto (13%)</span>
          <span>$0.00</span>
        </div>
        <div className="summary-item total">
          <span>Total</span>
          <span>$0.00</span>
        </div>
      </div>

      <button className="checkout-btn" disabled>
        Procesar Compra
      </button>
    </div>
  )
}

import { useState } from 'react'
import { formatBs } from '../../domain/money'
import type { PaymentMethod, Sale } from '../../domain/types'
import { downloadReceipt, printReceipt } from '../../services/receipt'
import { useStore } from '../../store/StoreProvider'
import { useToast } from '../../store/ToastProvider'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { Modal } from '../ui/Modal'
import { EmptyState, Field, Thumb } from '../ui/Primitives'

const PAYMENTS: Array<{ value: PaymentMethod; label: string }> = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'qr', label: 'QR' },
  { value: 'tarjeta', label: 'Tarjeta' },
]

const QUICK_DISCOUNTS = [0, 5, 10, 15]

/**
 * The open ticket. Lives beside the catalogue so the seller never leaves the
 * screen they are selling from — the way a real till works.
 */
export function Ticket() {
  const { cart, totals, discountPct, updateQty, removeFromCart, clearCart, setDiscountPct, checkout } = useStore()
  const { notify } = useToast()

  const [checkingOut, setCheckingOut] = useState(false)
  const [payment, setPayment] = useState<PaymentMethod>('efectivo')
  const [customer, setCustomer] = useState('')
  const [done, setDone] = useState<Sale | null>(null)

  const confirm = () => {
    const sale = checkout({ payment, customer })
    if (!sale) return
    setCheckingOut(false)
    setCustomer('')
    setDone(sale)
    notify(`Venta ${sale.number} registrada · ${formatBs(sale.total)}`, 'ok')
  }

  return (
    <aside className="ticket">
      <header className="ticket__head">
        <div className="ticket__title">
          <Icon name="cart" size={17} />
          <h2>Ticket</h2>
        </div>
        <span className="ticket__count">{totals.units}</span>
      </header>

      {cart.length === 0 ? (
        <div className="ticket__empty">
          <EmptyState icon="cart" title="Ticket vacío" detail="Agrega productos desde el catálogo." />
        </div>
      ) : (
        <>
          <ul className="ticket__lines">
            {cart.map((line) => (
              <li key={`${line.productId}-${line.size}`} className="tline">
                <Thumb src={line.image} alt="" className="tline__img" />
                <div className="tline__info">
                  <p className="tline__name">{line.name}</p>
                  <p className="tline__meta">
                    Talla {line.size} · {formatBs(line.unitPrice)}
                  </p>
                  <div className="tline__qty">
                    <button
                      onClick={() => updateQty(line.productId, line.size, line.qty - 1)}
                      aria-label="Quitar uno"
                    >
                      <Icon name="minus" size={13} />
                    </button>
                    <span>{line.qty}</span>
                    <button
                      onClick={() => updateQty(line.productId, line.size, line.qty + 1)}
                      aria-label="Agregar uno"
                    >
                      <Icon name="plus" size={13} />
                    </button>
                  </div>
                </div>
                <div className="tline__right">
                  <span className="tline__total">{formatBs(line.unitPrice * line.qty)}</span>
                  <button
                    className="tline__remove"
                    onClick={() => removeFromCart(line.productId, line.size)}
                    aria-label="Eliminar línea"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="ticket__discount">
            <span className="field__label">Descuento</span>
            <div className="chips">
              {QUICK_DISCOUNTS.map((d) => (
                <button
                  key={d}
                  className={`chipbtn chipbtn--sm ${discountPct === d ? 'chipbtn--on' : ''}`.trim()}
                  onClick={() => setDiscountPct(d)}
                >
                  {d}%
                </button>
              ))}
            </div>
          </div>

          <footer className="ticket__foot">
            <div className="sumrow">
              <span>Subtotal</span>
              <span>{formatBs(totals.subtotal)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="sumrow sumrow--minus">
                <span>Descuento {discountPct}%</span>
                <span>- {formatBs(totals.discount)}</span>
              </div>
            )}
            <div className="sumrow sumrow--total">
              <span>Total</span>
              <span>{formatBs(totals.total)}</span>
            </div>
            <p className="ticket__iva">IVA 13% incluido: {formatBs(totals.iva)}</p>

            <Button block size="lg" onClick={() => setCheckingOut(true)}>
              Cobrar {formatBs(totals.total)}
            </Button>
            <Button block variant="quiet" size="sm" onClick={clearCart}>
              Vaciar ticket
            </Button>
          </footer>
        </>
      )}

      {/* Checkout */}
      <Modal
        open={checkingOut}
        title="Cobrar venta"
        subtitle={`${totals.units} artículos · ${formatBs(totals.total)}`}
        onClose={() => setCheckingOut(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCheckingOut(false)}>
              Volver
            </Button>
            <Button onClick={confirm} icon={<Icon name="check" size={16} />}>
              Confirmar {formatBs(totals.total)}
            </Button>
          </>
        }
      >
        <div className="form">
          <div>
            <span className="field__label">Forma de pago</span>
            <div className="chips">
              {PAYMENTS.map((p) => (
                <button
                  key={p.value}
                  className={`chipbtn ${payment === p.value ? 'chipbtn--on' : ''}`.trim()}
                  onClick={() => setPayment(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <Field
            label="Cliente (opcional)"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            placeholder="Nombre de quien compra"
          />

          <div className="checkout__summary">
            <div className="sumrow">
              <span>Subtotal</span>
              <span>{formatBs(totals.subtotal)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="sumrow sumrow--minus">
                <span>Descuento</span>
                <span>- {formatBs(totals.discount)}</span>
              </div>
            )}
            <div className="sumrow sumrow--total">
              <span>Total a cobrar</span>
              <span>{formatBs(totals.total)}</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Post-sale receipt */}
      <Modal
        open={done !== null}
        title="Venta registrada"
        subtitle={done ? `Boleta N° ${done.number}` : undefined}
        onClose={() => setDone(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDone(null)}>
              Cerrar
            </Button>
            <Button
              variant="quiet"
              onClick={() => done && printReceipt(done)}
              icon={<Icon name="print" size={16} />}
            >
              Imprimir
            </Button>
            <Button
              onClick={() => done && downloadReceipt(done)}
              icon={<Icon name="download" size={16} />}
            >
              Descargar boleta
            </Button>
          </>
        }
      >
        <div className="success">
          <span className="success__mark">
            <Icon name="check" size={30} />
          </span>
          <p className="success__amount">{done ? formatBs(done.total) : ''}</p>
          <p className="success__detail">
            {done?.lines.reduce((n, l) => n + l.qty, 0)} artículos · {done?.payment}
            {done?.customer ? ` · ${done.customer}` : ''}
          </p>
          <p className="prose prose--muted">
            El stock ya se descontó del inventario y la venta aparece en Gestión de ventas.
          </p>
        </div>
      </Modal>
    </aside>
  )
}

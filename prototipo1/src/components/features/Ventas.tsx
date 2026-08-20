import { useMemo, useState } from 'react'
import { formatBs, formatBsShort } from '../../domain/money'
import type { Sale } from '../../domain/types'
import {
  byPayment,
  lastDays,
  margin,
  salesOn,
  summarise,
  todayKey,
  topProducts,
} from '../../services/analytics'
import { downloadReceipt, printReceipt } from '../../services/receipt'
import { useStore } from '../../store/StoreProvider'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { Modal } from '../ui/Modal'
import { EmptyState, StatTile, Thumb } from '../ui/Primitives'

const PAYMENT_LABEL: Record<Sale['payment'], string> = {
  efectivo: 'Efectivo',
  qr: 'QR',
  tarjeta: 'Tarjeta',
}

type Range = 'hoy' | 'semana' | 'todo'

const RANGES: Array<{ key: Range; label: string }> = [
  { key: 'hoy', label: 'Hoy' },
  { key: 'semana', label: '7 días' },
  { key: 'todo', label: 'Todo' },
]

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
}

function dateOf(iso: string): string {
  return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })
}

/** Sales management: how the shop is doing, and every ticket it has issued. */
export function Ventas() {
  const { sales, products } = useStore()
  const [range, setRange] = useState<Range>('hoy')
  const [detail, setDetail] = useState<Sale | null>(null)

  const bars = useMemo(() => lastDays(sales, 7), [sales])
  const weekCutoff = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 6)
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  }, [])

  const scoped = useMemo(() => {
    if (range === 'hoy') return salesOn(sales, todayKey())
    if (range === 'semana') return sales.filter((s) => new Date(s.date).getTime() >= weekCutoff)
    return sales
  }, [sales, range, weekCutoff])

  const stats = useMemo(() => summarise(scoped), [scoped])
  const profit = useMemo(() => margin(scoped, products), [scoped, products])
  const top = useMemo(() => topProducts(scoped, 5), [scoped])
  const payments = useMemo(() => byPayment(scoped), [scoped])

  const peak = Math.max(...bars.map((b) => b.revenue), 1)

  return (
    <section className="view view--ventas">
      <header className="view__head">
        <div>
          <h1 className="view__title">Gestión de ventas</h1>
          <p className="view__sub">{sales.length} boletas emitidas en total</p>
        </div>
        <div className="chips" role="group" aria-label="Rango">
          {RANGES.map((r) => (
            <button
              key={r.key}
              className={`chipbtn ${range === r.key ? 'chipbtn--on' : ''}`.trim()}
              onClick={() => setRange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </header>

      <div className="tiles tiles--4">
        <StatTile label="Ingresos" value={formatBsShort(stats.revenue)} detail={`${stats.tickets} ventas`} icon="chart" emphasis />
        <StatTile label="Ganancia" value={formatBsShort(profit)} detail="Precio menos costo" icon="tag" />
        <StatTile label="Ticket promedio" value={formatBsShort(stats.averageTicket)} detail="Por venta" icon="cart" />
        <StatTile label="Prendas vendidas" value={String(stats.units)} detail="Unidades" icon="box" />
      </div>

      <div className="split">
        {/* Weekly trend */}
        <section className="panel">
          <header className="panel__head">
            <h2>Últimos 7 días</h2>
            <span className="panel__note">Ingresos por día</span>
          </header>
          <div className="chart">
            {bars.map((b) => (
              <div key={b.key} className="chart__col" title={`${b.label}: ${formatBs(b.revenue)}`}>
                <span className="chart__value">{b.revenue > 0 ? formatBsShort(b.revenue) : '—'}</span>
                <div
                  className={`chart__bar ${b.isToday ? 'chart__bar--today' : ''}`.trim()}
                  style={{ height: `${Math.max(4, (b.revenue / peak) * 100)}%` }}
                />
                <span className="chart__label">{b.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Best sellers */}
        <section className="panel">
          <header className="panel__head">
            <h2>Más vendidos</h2>
            <span className="panel__note">{RANGES.find((r) => r.key === range)?.label}</span>
          </header>
          {top.length ? (
            <ol className="rank">
              {top.map((p, i) => (
                <li key={p.productId} className="rank__item">
                  <span className="rank__pos">{i + 1}</span>
                  <Thumb src={p.image} alt="" className="rank__img" />
                  <div className="rank__info">
                    <p className="rank__name">{p.name}</p>
                    <p className="rank__meta">{p.units} unidades</p>
                  </div>
                  <span className="rank__value">{formatBs(p.revenue)}</span>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState icon="chart" title="Sin ventas en este rango" />
          )}

          {payments.length > 0 && (
            <div className="paysplit">
              {payments.map((p) => (
                <div key={p.method} className="paysplit__item">
                  <span className="paysplit__label">{PAYMENT_LABEL[p.method]}</span>
                  <span className="paysplit__value">{formatBs(p.total)}</span>
                  <div
                    className="paysplit__bar"
                    style={{ width: `${(p.total / Math.max(stats.revenue, 1)) * 100}%` }}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Ledger */}
      <section className="panel">
        <header className="panel__head">
          <h2>Historial de boletas</h2>
          <span className="panel__note">{scoped.length} registros</span>
        </header>

        {scoped.length ? (
          <div className="tablewrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Boleta</th>
                  <th className="cell--hide-sm">Fecha</th>
                  <th>Hora</th>
                  <th className="cell--hide-sm">Cliente</th>
                  <th>Pago</th>
                  <th className="cell--num">Artículos</th>
                  <th className="cell--num">Total</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {scoped.map((s) => (
                  <tr key={s.id} onClick={() => setDetail(s)} className="row--click">
                    <td className="cell--mono">{s.number}</td>
                    <td className="cell--hide-sm">{dateOf(s.date)}</td>
                    <td className="cell--mono">{timeOf(s.date)}</td>
                    <td className="cell--hide-sm">{s.customer || '—'}</td>
                    <td>{PAYMENT_LABEL[s.payment]}</td>
                    <td className="cell--num">{s.lines.reduce((n, l) => n + l.qty, 0)}</td>
                    <td className="cell--num cell--strong">{formatBs(s.total)}</td>
                    <td className="cell--actions">
                      <Button
                        variant="quiet"
                        size="sm"
                        icon={<Icon name="download" size={15} />}
                        aria-label={`Descargar boleta ${s.number}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          downloadReceipt(s)
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon="chart" title="Todavía no hay ventas" detail="Cobra un ticket para verlo acá." />
        )}
      </section>

      <Modal
        open={detail !== null}
        title={`Boleta N° ${detail?.number ?? ''}`}
        subtitle={detail ? `${dateOf(detail.date)} · ${timeOf(detail.date)}` : undefined}
        onClose={() => setDetail(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDetail(null)}>
              Cerrar
            </Button>
            <Button variant="quiet" onClick={() => detail && printReceipt(detail)} icon={<Icon name="print" size={16} />}>
              Imprimir
            </Button>
            <Button onClick={() => detail && downloadReceipt(detail)} icon={<Icon name="download" size={16} />}>
              Descargar PDF
            </Button>
          </>
        }
      >
        {detail && (
          <div className="saledetail">
            <ul className="saledetail__lines">
              {detail.lines.map((l) => (
                <li key={`${l.productId}-${l.size}`}>
                  <Thumb src={l.image} alt="" className="saledetail__img" />
                  <div>
                    <p className="saledetail__name">{l.name}</p>
                    <p className="saledetail__meta">
                      {l.qty} × {formatBs(l.unitPrice)} · talla {l.size}
                    </p>
                  </div>
                  <span className="saledetail__total">{formatBs(l.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <div className="checkout__summary">
              <div className="sumrow">
                <span>Subtotal</span>
                <span>{formatBs(detail.subtotal)}</span>
              </div>
              {detail.discount > 0 && (
                <div className="sumrow sumrow--minus">
                  <span>Descuento</span>
                  <span>- {formatBs(detail.discount)}</span>
                </div>
              )}
              <div className="sumrow sumrow--total">
                <span>Total</span>
                <span>{formatBs(detail.total)}</span>
              </div>
              <p className="ticket__iva">
                IVA 13% incluido: {formatBs(detail.iva)} · Pago {PAYMENT_LABEL[detail.payment]}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}

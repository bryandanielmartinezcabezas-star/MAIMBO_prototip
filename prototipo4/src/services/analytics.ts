/** Everything the dashboard shows, derived from recorded sales. No fake numbers. */

import { round2 } from '../domain/money'
import type { Product, Sale } from '../domain/types'

/**
 * Day buckets use the shop's own calendar day, not UTC. Bolivia is UTC-4, so
 * toISOString() would roll over to tomorrow from 20:00 onwards and every
 * evening sale would drop out of "hoy".
 */
function localKey(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

const dayKey = (iso: string) => localKey(new Date(iso))

export const todayKey = () => localKey(new Date())

export function salesOn(sales: Sale[], key: string): Sale[] {
  return sales.filter((s) => dayKey(s.date) === key)
}

export interface DaySummary {
  revenue: number
  tickets: number
  units: number
  averageTicket: number
}

export function summarise(sales: Sale[]): DaySummary {
  const revenue = round2(sales.reduce((sum, s) => sum + s.total, 0))
  const units = sales.reduce((sum, s) => sum + s.lines.reduce((n, l) => n + l.qty, 0), 0)
  return {
    revenue,
    tickets: sales.length,
    units,
    averageTicket: sales.length ? round2(revenue / sales.length) : 0,
  }
}

/** Gross margin earned, using the cost recorded on each product. */
export function margin(sales: Sale[], products: Product[]): number {
  const costOf = new Map(products.map((p) => [p.id, p.cost]))
  const total = sales.reduce(
    (sum, s) =>
      sum + s.lines.reduce((n, l) => n + (l.unitPrice - (costOf.get(l.productId) ?? 0)) * l.qty, 0),
    0,
  )
  return round2(total)
}

export interface DayBar {
  key: string
  label: string
  revenue: number
  tickets: number
  isToday: boolean
}

/** Revenue per day for the last N days, including days with no sales. */
export function lastDays(sales: Sale[], days = 7): DayBar[] {
  const today = new Date()
  const bars: DayBar[] = []

  for (let offset = days - 1; offset >= 0; offset--) {
    const d = new Date(today)
    d.setDate(today.getDate() - offset)
    const key = localKey(d)
    const ofDay = salesOn(sales, key)
    bars.push({
      key,
      label: d.toLocaleDateString('es-BO', { weekday: 'short' }).replace('.', ''),
      revenue: round2(ofDay.reduce((sum, s) => sum + s.total, 0)),
      tickets: ofDay.length,
      isToday: offset === 0,
    })
  }

  return bars
}

export interface RankedProduct {
  productId: string
  name: string
  image: string
  units: number
  revenue: number
}

export function topProducts(sales: Sale[], limit = 5): RankedProduct[] {
  const acc = new Map<string, RankedProduct>()

  for (const sale of sales) {
    for (const line of sale.lines) {
      const current = acc.get(line.productId) ?? {
        productId: line.productId,
        name: line.name,
        image: line.image,
        units: 0,
        revenue: 0,
      }
      current.units += line.qty
      current.revenue = round2(current.revenue + line.lineTotal)
      acc.set(line.productId, current)
    }
  }

  return [...acc.values()].sort((a, b) => b.units - a.units).slice(0, limit)
}

/** Share of revenue per payment method — tells them how much to keep as change. */
export function byPayment(sales: Sale[]): Array<{ method: Sale['payment']; total: number }> {
  const acc = new Map<Sale['payment'], number>()
  for (const s of sales) acc.set(s.payment, round2((acc.get(s.payment) ?? 0) + s.total))
  return [...acc.entries()]
    .map(([method, total]) => ({ method, total }))
    .sort((a, b) => b.total - a.total)
}

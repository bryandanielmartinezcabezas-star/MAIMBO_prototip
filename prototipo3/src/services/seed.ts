/**
 * First-run data. Builds a week of plausible trading history so the dashboard
 * has something real to show, and subtracts it from stock so the two agree.
 * Deterministic: the same demo every time it is reset.
 */

import { ivaContainedIn, round2 } from '../domain/money'
import type { PaymentMethod, Product, Sale, SaleLine, StoreState } from '../domain/types'
import { CATALOG } from '../data/catalog'
import { todayKey } from './analytics'
import { applySale } from './inventory'

function seeded(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const PAYMENTS: PaymentMethod[] = ['efectivo', 'efectivo', 'qr', 'qr', 'tarjeta']

const NAMES = [
  'Ana Quispe', 'Luis Mamani', 'Carla Rojas', 'Diego Flores', 'Sofia Vargas',
  'Marco Chavez', 'Elena Torrez', 'Jorge Aruquipa', 'Paola Mendoza', '',
]

/** Busier on Friday and Saturday, quiet on Monday — how a market stall trades. */
const TICKETS_BY_WEEKDAY = [3, 2, 3, 4, 4, 7, 6]

function buildSale(
  rnd: () => number,
  products: Product[],
  date: Date,
  correlative: number,
): Sale {
  const lineCount = 1 + Math.floor(rnd() * 3)
  const lines: SaleLine[] = []

  for (let i = 0; i < lineCount; i++) {
    const product = products[Math.floor(rnd() * products.length)]
    const inStock = product.sizes.filter((s) => s.stock > 0)
    if (!inStock.length) continue

    const size = inStock[Math.floor(rnd() * inStock.length)]
    if (lines.some((l) => l.productId === product.id && l.size === size.size)) continue

    const qty = rnd() < 0.82 ? 1 : 2
    lines.push({
      productId: product.id,
      size: size.size,
      qty: Math.min(qty, size.stock),
      unitPrice: product.price,
      name: product.name,
      image: product.image,
      lineTotal: round2(product.price * Math.min(qty, size.stock)),
    })
  }

  const subtotal = round2(lines.reduce((sum, l) => sum + l.lineTotal, 0))
  // The odd haggled discount, which is how the market actually works.
  const discountPct = rnd() < 0.25 ? 5 + Math.floor(rnd() * 3) * 5 : 0
  const discount = round2((subtotal * discountPct) / 100)
  const total = round2(subtotal - discount)

  const stamped = new Date(date)
  stamped.setHours(9 + Math.floor(rnd() * 10), Math.floor(rnd() * 60), 0, 0)

  return {
    id: `seed-${correlative}`,
    number: String(correlative).padStart(6, '0'),
    date: stamped.toISOString(),
    lines,
    subtotal,
    discount,
    iva: ivaContainedIn(total),
    total,
    payment: PAYMENTS[Math.floor(rnd() * PAYMENTS.length)],
    customer: NAMES[Math.floor(rnd() * NAMES.length)],
  }
}

export function buildInitialState(): StoreState {
  const rnd = seeded(20260819)
  let products: Product[] = CATALOG.map((p) => ({ ...p, sizes: p.sizes.map((s) => ({ ...s })) }))
  const sales: Sale[] = []
  let correlative = 1

  // Six days of history plus a partial today.
  for (let offset = 6; offset >= 0; offset--) {
    const day = new Date()
    day.setDate(day.getDate() - offset)

    let tickets = TICKETS_BY_WEEKDAY[day.getDay()]
    if (offset === 0) tickets = Math.max(1, Math.floor(tickets / 2)) // today is still running

    for (let i = 0; i < tickets; i++) {
      const sale = buildSale(rnd, products, day, correlative)
      if (!sale.lines.length) continue
      products = applySale(products, sale.lines)
      sales.push(sale)
      correlative++
    }
  }

  return { products, cart: [], sales, discountPct: 0, seededOn: todayKey() }
}

/**
 * The seed is dated relative to the day it was built, so a state left over from
 * a previous day would show an empty "hoy" and a chart drifting off the left.
 * Rebuild in that case — unless there are real sales worth keeping.
 */
export function isStale(state: StoreState): boolean {
  if (state.seededOn === todayKey()) return false
  const allSeeded = state.sales.every((s) => s.id.startsWith('seed-'))
  return allSeeded
}

/** Correlative for the next ticket, continuing from whatever history exists. */
export function nextSaleNumber(sales: Sale[]): string {
  const highest = sales.reduce((max, s) => Math.max(max, Number(s.number) || 0), 0)
  return String(highest + 1).padStart(6, '0')
}

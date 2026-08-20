/**
 * Ticket rules. Pure functions over the cart array — the POS screen only renders
 * what these return, so both prototypes charge exactly the same amounts.
 */

import { ivaContainedIn, round2 } from '../domain/money'
import type { CartLine, Product, SaleLine, Totals } from '../domain/types'
import { stockFor } from './inventory'

/** A line is identified by product + size, never by product alone. */
const sameLine = (line: CartLine, productId: string, size: string) =>
  line.productId === productId && line.size === size

export type AddResult =
  | { ok: true; cart: CartLine[] }
  | { ok: false; reason: string }

/**
 * Add one unit, or bump the existing line. Refuses to sell more units than the
 * shelf holds — the single rule that keeps the ticket and the stock honest.
 */
export function addLine(cart: CartLine[], product: Product, size: string): AddResult {
  const available = stockFor(product, size)
  if (available <= 0) {
    return { ok: false, reason: `Sin stock en talla ${size}` }
  }

  const existing = cart.find((l) => sameLine(l, product.id, size))
  if (existing && existing.qty >= available) {
    return { ok: false, reason: `Solo quedan ${available} en talla ${size}` }
  }

  if (existing) {
    return {
      ok: true,
      cart: cart.map((l) => (sameLine(l, product.id, size) ? { ...l, qty: l.qty + 1 } : l)),
    }
  }

  return {
    ok: true,
    cart: [
      ...cart,
      {
        productId: product.id,
        size,
        qty: 1,
        unitPrice: product.price,
        name: product.name,
        image: product.image,
      },
    ],
  }
}

/** Set an explicit quantity, clamped to what is on the shelf. Zero removes the line. */
export function setQty(
  cart: CartLine[],
  products: Product[],
  productId: string,
  size: string,
  qty: number,
): CartLine[] {
  if (qty <= 0) return removeLine(cart, productId, size)

  const product = products.find((p) => p.id === productId)
  const available = product ? stockFor(product, size) : qty
  const clamped = Math.min(qty, available)

  return cart.map((l) => (sameLine(l, productId, size) ? { ...l, qty: clamped } : l))
}

export function removeLine(cart: CartLine[], productId: string, size: string): CartLine[] {
  return cart.filter((l) => !sameLine(l, productId, size))
}

export function clear(): CartLine[] {
  return []
}

export function unitCount(cart: CartLine[]): number {
  return cart.reduce((sum, l) => sum + l.qty, 0)
}

/**
 * Ticket arithmetic. Prices already include IVA, so the tax is broken out of the
 * total rather than added to it — which is what a Bolivian receipt shows.
 */
export function totals(cart: CartLine[], discountPct: number): Totals {
  const subtotal = round2(cart.reduce((sum, l) => sum + l.unitPrice * l.qty, 0))
  const pct = Math.min(Math.max(discountPct, 0), 100)
  const discount = round2((subtotal * pct) / 100)
  const total = round2(subtotal - discount)

  return {
    subtotal,
    discount,
    iva: ivaContainedIn(total),
    total,
    units: unitCount(cart),
  }
}

export function toSaleLines(cart: CartLine[]): SaleLine[] {
  return cart.map((l) => ({ ...l, lineTotal: round2(l.unitPrice * l.qty) }))
}

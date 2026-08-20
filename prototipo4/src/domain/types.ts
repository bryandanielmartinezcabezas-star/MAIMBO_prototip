/** Shape of the data the whole app agrees on. No React, no framework, no I/O. */

export type ProductKind = 'calzado' | 'prenda' | 'accesorio'

export interface SizeStock {
  size: string
  stock: number
}

export interface Product {
  id: string
  name: string
  category: string
  kind: ProductKind
  brand: string
  /** Sale price in Bolivianos, IVA included (how prices are quoted in Bolivia). */
  price: number
  /** What the store paid for it. Drives the margin figures on the dashboard. */
  cost: number
  image: string
  description: string
  rating: number
  sizes: SizeStock[]
}

/** One line of the ticket: a product in a specific size. */
export interface CartLine {
  productId: string
  size: string
  qty: number
  /** Copied at add-time so a later price edit never rewrites an open ticket. */
  unitPrice: number
  name: string
  image: string
}

export type PaymentMethod = 'efectivo' | 'qr' | 'tarjeta'

export interface SaleLine extends CartLine {
  lineTotal: number
}

export interface Sale {
  id: string
  /** Human-facing correlative shown on the receipt, e.g. 000042. */
  number: string
  /** ISO timestamp. */
  date: string
  lines: SaleLine[]
  subtotal: number
  discount: number
  /** Portion of the total that is IVA, since prices already include it. */
  iva: number
  total: number
  payment: PaymentMethod
  customer: string
}

export interface Totals {
  subtotal: number
  discount: number
  iva: number
  total: number
  units: number
}

/** Everything that gets persisted between sessions. */
export interface StoreState {
  products: Product[]
  cart: CartLine[]
  sales: Sale[]
  discountPct: number
  /** Local day the demo data was built on, used to spot a stale seed. */
  seededOn: string
}

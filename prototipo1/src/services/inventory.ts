/**
 * Stock rules. Every function is pure and returns new data, so React state
 * updates stay predictable and the logic can be tested without a browser.
 */

import type { Product, SaleLine, SizeStock } from '../domain/types'

export const LOW_STOCK_THRESHOLD = 3

export function totalStock(product: Product): number {
  return product.sizes.reduce((sum, s) => sum + s.stock, 0)
}

export function stockFor(product: Product, size: string): number {
  return product.sizes.find((s) => s.size === size)?.stock ?? 0
}

export function inventoryValue(products: Product[]): number {
  return products.reduce((sum, p) => sum + totalStock(p) * p.cost, 0)
}

export function retailValue(products: Product[]): number {
  return products.reduce((sum, p) => sum + totalStock(p) * p.price, 0)
}

export function categoriesOf(products: Product[]): string[] {
  return [...new Set(products.map((p) => p.category))].sort()
}

/** Models that are out of stock in every size. */
export function outOfStock(products: Product[]): Product[] {
  return products.filter((p) => totalStock(p) === 0)
}

/** Sizes running low but not yet empty — what the owner needs to reorder. */
export function lowStockSizes(
  products: Product[],
  threshold = LOW_STOCK_THRESHOLD,
): Array<{ product: Product; size: string; stock: number }> {
  const rows: Array<{ product: Product; size: string; stock: number }> = []
  for (const product of products) {
    for (const s of product.sizes) {
      if (s.stock > 0 && s.stock <= threshold) {
        rows.push({ product, size: s.size, stock: s.stock })
      }
    }
  }
  return rows.sort((a, b) => a.stock - b.stock)
}

export interface SearchCriteria {
  term?: string
  category?: string
  /** Hide models with nothing left in any size. */
  onlyAvailable?: boolean
}

export function search(products: Product[], criteria: SearchCriteria): Product[] {
  const term = criteria.term?.trim().toLowerCase() ?? ''
  return products.filter((p) => {
    if (criteria.category && criteria.category !== 'Todo' && p.category !== criteria.category) {
      return false
    }
    if (criteria.onlyAvailable && totalStock(p) === 0) return false
    if (!term) return true
    return (
      p.name.toLowerCase().includes(term) ||
      p.id.toLowerCase().includes(term) ||
      p.brand.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    )
  })
}

/** Subtract sold units. Stock never goes below zero even on inconsistent input. */
export function applySale(products: Product[], lines: SaleLine[]): Product[] {
  const byProduct = new Map<string, Map<string, number>>()
  for (const line of lines) {
    const sizes = byProduct.get(line.productId) ?? new Map<string, number>()
    sizes.set(line.size, (sizes.get(line.size) ?? 0) + line.qty)
    byProduct.set(line.productId, sizes)
  }

  return products.map((product) => {
    const sold = byProduct.get(product.id)
    if (!sold) return product
    return {
      ...product,
      sizes: product.sizes.map((s) => ({
        ...s,
        stock: Math.max(0, s.stock - (sold.get(s.size) ?? 0)),
      })),
    }
  })
}

/** Manual stock correction for one size — receiving goods, fixing a miscount. */
export function setStock(
  products: Product[],
  productId: string,
  size: string,
  stock: number,
): Product[] {
  return products.map((p) =>
    p.id !== productId
      ? p
      : {
          ...p,
          sizes: p.sizes.map((s) => (s.size === size ? { ...s, stock: Math.max(0, stock) } : s)),
        },
  )
}

/** Insert when the id is new, replace when it already exists. */
export function upsert(products: Product[], product: Product): Product[] {
  const index = products.findIndex((p) => p.id === product.id)
  if (index === -1) return [product, ...products]
  const next = [...products]
  next[index] = product
  return next
}

export function remove(products: Product[], productId: string): Product[] {
  return products.filter((p) => p.id !== productId)
}

/** Next free id for a category prefix, e.g. ZPH-014. */
export function nextId(products: Product[], prefix: string): string {
  const used = products
    .filter((p) => p.id.startsWith(`${prefix}-`))
    .map((p) => Number(p.id.split('-')[1]))
    .filter((n) => !Number.isNaN(n))
  const next = used.length ? Math.max(...used) + 1 : 1
  return `${prefix}-${String(next).padStart(3, '0')}`
}

export const SIZE_PRESETS: Record<Product['kind'], string[]> = {
  calzado: ['38', '39', '40', '41', '42', '43'],
  prenda: ['S', 'M', 'L', 'XL'],
  accesorio: ['Unica'],
}

export function blankSizes(kind: Product['kind']): SizeStock[] {
  return SIZE_PRESETS[kind].map((size) => ({ size, stock: 0 }))
}

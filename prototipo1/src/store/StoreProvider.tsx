/**
 * Composition root: wires the pure services to React state and persistence.
 * Components never import a service's mutating logic directly — they call these
 * actions, which keeps every screen honest about how data changes.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ivaContainedIn } from '../domain/money'
import type { CartLine, PaymentMethod, Product, Sale, StoreState, Totals } from '../domain/types'
import * as CartService from '../services/cart'
import * as InventoryService from '../services/inventory'
import { LocalStorageRepository, type StateRepository } from '../services/storage'
import { buildInitialState, isStale, nextSaleNumber } from '../services/seed'

export interface CheckoutInput {
  payment: PaymentMethod
  customer: string
}

export interface ActionResult {
  ok: boolean
  message: string
}

interface StoreContextValue {
  products: Product[]
  cart: CartLine[]
  sales: Sale[]
  discountPct: number
  totals: Totals
  addToCart(product: Product, size: string): ActionResult
  updateQty(productId: string, size: string, qty: number): void
  removeFromCart(productId: string, size: string): void
  clearCart(): void
  setDiscountPct(pct: number): void
  checkout(input: CheckoutInput): Sale | null
  saveProduct(product: Product): ActionResult
  deleteProduct(productId: string): void
  adjustStock(productId: string, size: string, stock: number): void
  resetDemo(): void
}

const StoreContext = createContext<StoreContextValue | null>(null)

const repository: StateRepository = new LocalStorageRepository()

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(() => {
    const stored = repository.load()
    // A seed from a previous day would leave the dashboard reading zero today.
    return stored && !isStale(stored) ? stored : buildInitialState()
  })

  // Skip the very first write so a fresh seed is not persisted before the user acts.
  const hydrated = useRef(false)
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true
      return
    }
    repository.save(state)
  }, [state])

  const totals = useMemo(
    () => CartService.totals(state.cart, state.discountPct),
    [state.cart, state.discountPct],
  )

  const addToCart = useCallback((product: Product, size: string): ActionResult => {
    let result: ActionResult = { ok: true, message: '' }

    setState((prev) => {
      const outcome = CartService.addLine(prev.cart, product, size)
      if (!outcome.ok) {
        result = { ok: false, message: outcome.reason }
        return prev
      }
      result = { ok: true, message: `${product.name} · talla ${size}` }
      return { ...prev, cart: outcome.cart }
    })

    return result
  }, [])

  const updateQty = useCallback((productId: string, size: string, qty: number) => {
    setState((prev) => ({
      ...prev,
      cart: CartService.setQty(prev.cart, prev.products, productId, size, qty),
    }))
  }, [])

  const removeFromCart = useCallback((productId: string, size: string) => {
    setState((prev) => ({ ...prev, cart: CartService.removeLine(prev.cart, productId, size) }))
  }, [])

  const clearCart = useCallback(() => {
    setState((prev) => ({ ...prev, cart: CartService.clear(), discountPct: 0 }))
  }, [])

  const setDiscountPct = useCallback((pct: number) => {
    setState((prev) => ({ ...prev, discountPct: Math.min(Math.max(pct, 0), 100) }))
  }, [])

  /** Records the sale, subtracts the stock and empties the ticket in one step. */
  const checkout = useCallback((input: CheckoutInput): Sale | null => {
    let created: Sale | null = null

    setState((prev) => {
      if (!prev.cart.length) return prev

      const lines = CartService.toSaleLines(prev.cart)
      const money = CartService.totals(prev.cart, prev.discountPct)

      const sale: Sale = {
        id: `sale-${Date.now()}`,
        number: nextSaleNumber(prev.sales),
        date: new Date().toISOString(),
        lines,
        subtotal: money.subtotal,
        discount: money.discount,
        iva: ivaContainedIn(money.total),
        total: money.total,
        payment: input.payment,
        customer: input.customer.trim(),
      }

      created = sale
      return {
        ...prev,
        products: InventoryService.applySale(prev.products, lines),
        sales: [sale, ...prev.sales],
        cart: [],
        discountPct: 0,
      }
    })

    return created
  }, [])

  const saveProduct = useCallback((product: Product): ActionResult => {
    let result: ActionResult = { ok: true, message: '' }

    setState((prev) => {
      const isNew = !prev.products.some((p) => p.id === product.id)
      result = { ok: true, message: isNew ? 'Producto creado' : 'Producto actualizado' }
      return { ...prev, products: InventoryService.upsert(prev.products, product) }
    })

    return result
  }, [])

  const deleteProduct = useCallback((productId: string) => {
    setState((prev) => ({
      ...prev,
      products: InventoryService.remove(prev.products, productId),
      cart: prev.cart.filter((l) => l.productId !== productId),
    }))
  }, [])

  const adjustStock = useCallback((productId: string, size: string, stock: number) => {
    setState((prev) => ({
      ...prev,
      products: InventoryService.setStock(prev.products, productId, size, stock),
    }))
  }, [])

  const resetDemo = useCallback(() => {
    repository.clear()
    setState(buildInitialState())
  }, [])

  const value = useMemo<StoreContextValue>(
    () => ({
      products: state.products,
      cart: state.cart,
      sales: state.sales,
      discountPct: state.discountPct,
      totals,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      setDiscountPct,
      checkout,
      saveProduct,
      deleteProduct,
      adjustStock,
      resetDemo,
    }),
    [
      state, totals, addToCart, updateQty, removeFromCart, clearCart,
      setDiscountPct, checkout, saveProduct, deleteProduct, adjustStock, resetDemo,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>')
  return ctx
}

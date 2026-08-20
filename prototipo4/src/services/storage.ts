/**
 * Persistence behind an interface, so swapping localStorage for a real backend
 * later is a one-line change at the composition root and nothing else moves.
 */

import type { StoreState } from '../domain/types'

export interface StateRepository {
  load(): StoreState | null
  save(state: StoreState): void
  clear(): void
}

const KEY = 'mainbo.store.v1'

export class LocalStorageRepository implements StateRepository {
  constructor(private readonly key: string = KEY) {}

  load(): StoreState | null {
    try {
      const raw = window.localStorage.getItem(this.key)
      if (!raw) return null
      const parsed = JSON.parse(raw) as StoreState
      // Guard against a half-written or outdated payload.
      if (!Array.isArray(parsed?.products) || !Array.isArray(parsed?.sales)) return null
      return parsed
    } catch {
      return null
    }
  }

  save(state: StoreState): void {
    try {
      window.localStorage.setItem(this.key, JSON.stringify(state))
    } catch {
      // A full or blocked quota must never take the shop floor down.
    }
  }

  clear(): void {
    try {
      window.localStorage.removeItem(this.key)
    } catch {
      /* ignore */
    }
  }
}

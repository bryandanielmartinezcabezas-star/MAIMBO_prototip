/** Money rules for Bolivia. Kept apart from the UI so both skins bill identically. */

/** IVA rate. In Bolivia the posted price already contains it. */
export const IVA_RATE = 0.13

export const CURRENCY = 'Bs'

/** Bolivianos are quoted to two decimals: Bs 1.234,50 */
export function formatBs(amount: number): string {
  return `${CURRENCY} ${amount.toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/** Compact form for tiles where the cents are noise: Bs 12,4k */
export function formatBsShort(amount: number): string {
  if (Math.abs(amount) >= 1000) {
    return `${CURRENCY} ${(amount / 1000).toLocaleString('es-BO', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}k`
  }
  return `${CURRENCY} ${Math.round(amount)}`
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

/**
 * The IVA contained in a gross amount — not 13% added on top.
 * gross = net + net * 0.13, so iva = gross * 0.13 / 1.13.
 */
export function ivaContainedIn(gross: number): number {
  return round2((gross * IVA_RATE) / (1 + IVA_RATE))
}

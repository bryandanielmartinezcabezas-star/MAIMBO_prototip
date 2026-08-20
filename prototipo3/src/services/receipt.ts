/**
 * Receipt generation. Produces an 80 mm roll ticket — the format a shop counter
 * printer actually takes — from a completed sale.
 */

import { jsPDF } from 'jspdf'
import { STORE_INFO } from '../config/store-info'
import { IVA_RATE, formatBs } from '../domain/money'
import type { Sale } from '../domain/types'

const WIDTH = 80
const MARGIN = 5
const CONTENT = WIDTH - MARGIN * 2

const PAYMENT_LABEL: Record<Sale['payment'], string> = {
  efectivo: 'Efectivo',
  qr: 'QR / Transferencia',
  tarjeta: 'Tarjeta',
}

function formatDate(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    time: d.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
  }
}

/** Height depends on how many lines the ticket carries, so it is measured first. */
function estimateHeight(sale: Sale): number {
  const perLine = 8
  return 105 + sale.lines.length * perLine
}

export function buildReceipt(sale: Sale): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: [WIDTH, estimateHeight(sale)] })
  const { date, time } = formatDate(sale.date)
  const center = WIDTH / 2
  let y = 9

  const rule = (dashed = false) => {
    doc.setLineWidth(0.2)
    if (dashed) doc.setLineDashPattern([0.6, 0.6], 0)
    doc.line(MARGIN, y, WIDTH - MARGIN, y)
    doc.setLineDashPattern([], 0)
    y += 4
  }

  const row = (left: string, right: string, size = 7.5, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(size)
    doc.text(left, MARGIN, y)
    doc.text(right, WIDTH - MARGIN, y, { align: 'right' })
    y += size * 0.55
  }

  // Header — the shop's identity.
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(STORE_INFO.name, center, y, { align: 'center' })
  y += 5

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text(STORE_INFO.tagline.split('').join(' '), center, y, { align: 'center' })
  y += 5

  doc.setFontSize(6.5)
  for (const line of [STORE_INFO.address, STORE_INFO.addressExtra, STORE_INFO.city, `Tel. ${STORE_INFO.phone}`]) {
    doc.text(line, center, y, { align: 'center', maxWidth: CONTENT })
    y += 3
  }
  y += 1.5
  rule()

  // Ticket identity.
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text(`BOLETA DE VENTA  N° ${sale.number}`, center, y, { align: 'center' })
  y += 5

  row('Fecha', date, 7)
  row('Hora', time, 7)
  row('Cliente', sale.customer || 'Sin nombre', 7)
  y += 1.5
  rule(true)

  // Items.
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.text('CANT  DESCRIPCION', MARGIN, y)
  doc.text('IMPORTE', WIDTH - MARGIN, y, { align: 'right' })
  y += 3
  rule(true)

  doc.setFont('helvetica', 'normal')
  for (const line of sale.lines) {
    doc.setFontSize(7)
    const title = doc.splitTextToSize(`${line.qty} x ${line.name}`, CONTENT - 18) as string[]
    doc.text(title, MARGIN, y)
    doc.text(formatBs(line.lineTotal), WIDTH - MARGIN, y, { align: 'right' })
    y += title.length * 3

    doc.setFontSize(6)
    doc.setTextColor(110)
    doc.text(`Talla ${line.size}  ·  ${formatBs(line.unitPrice)} c/u  ·  ${line.productId}`, MARGIN, y)
    doc.setTextColor(0)
    y += 4.5
  }

  y += 0.5
  rule()

  // Money.
  row('Subtotal', formatBs(sale.subtotal))
  if (sale.discount > 0) row('Descuento', `- ${formatBs(sale.discount)}`)
  y += 1.5

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('TOTAL', MARGIN, y)
  doc.text(formatBs(sale.total), WIDTH - MARGIN, y, { align: 'right' })
  y += 5

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(110)
  doc.text(`IVA ${(IVA_RATE * 100).toFixed(0)}% incluido: ${formatBs(sale.iva)}`, MARGIN, y)
  doc.setTextColor(0)
  y += 4

  row('Forma de pago', PAYMENT_LABEL[sale.payment], 7)
  row('Articulos', String(sale.lines.reduce((n, l) => n + l.qty, 0)), 7)
  y += 2
  rule()

  // Footer.
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.text('GRACIAS POR SU COMPRA', center, y, { align: 'center' })
  y += 4
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.setTextColor(110)
  doc.text('Cambios dentro de 7 dias con esta boleta', center, y, { align: 'center' })
  y += 3
  doc.text('Envios a toda Bolivia  ·  facebook.com/MAINBO', center, y, { align: 'center' })

  return doc
}

export function fileNameFor(sale: Sale): string {
  return `boleta-mainbo-${sale.number}.pdf`
}

export function downloadReceipt(sale: Sale): void {
  buildReceipt(sale).save(fileNameFor(sale))
}

/** Opens the ticket in a new tab with the print dialog already up. */
export function printReceipt(sale: Sale): void {
  const doc = buildReceipt(sale)
  doc.autoPrint()
  const url = doc.output('bloburl')
  window.open(url, '_blank')
}

/** Inline preview without leaving the app. */
export function receiptDataUrl(sale: Sale): string {
  return buildReceipt(sale).output('datauristring')
}

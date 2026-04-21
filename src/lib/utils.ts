import { clsx, type ClassValue } from 'clsx'

export function exportCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const escape = (v: any) => {
    const s = String(v ?? '').replace(/"/g, '""')
    return s.includes(',') || s.includes('\n') || s.includes('"') ? `"${s}"` : s
  }
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `${filename}.csv`; a.click()
  URL.revokeObjectURL(url)
}

/**
 * Merge Tailwind CSS classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/**
 * Format a number as Guinean Francs
 * Example: 1500000 → "1 500 000 GNF"
 */
export function formatGNF(amount: number): string {
  return (
    new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0,
    }).format(amount) + ' GNF'
  )
}

/**
 * Format a date string in French
 * Example: "2026-01-15" → "15 janvier 2026"
 */
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

/**
 * Format a date string as short French date
 * Example: "2026-01-15" → "15/01/2026"
 */
export function formatDateShort(date: string): string {
  return new Intl.DateTimeFormat('fr-FR').format(new Date(date))
}

/**
 * Get stock status label and Tailwind color classes
 */
export function getStockLabel(qty: number, threshold = 10): {
  label: string
  color: string
  bg: string
} {
  if (qty <= 0) {
    return { label: 'Rupture de stock', color: 'text-red-600', bg: 'bg-red-100' }
  }
  if (qty <= threshold) {
    return { label: 'Stock limité', color: 'text-orange-600', bg: 'bg-orange-100' }
  }
  return { label: 'En stock', color: 'text-green-600', bg: 'bg-green-100' }
}

/**
 * Get order status label and color
 */
export function getOrderStatusLabel(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    nouveau: { label: 'Nouveau', color: 'blue' },
    en_cours: { label: 'En cours', color: 'yellow' },
    confirme: { label: 'Confirmé', color: 'purple' },
    livre: { label: 'Livré', color: 'green' },
    annule: { label: 'Annulé', color: 'red' },
  }
  return map[status] ?? { label: status, color: 'gray' }
}

/**
 * Get invoice status label and color
 */
export function getInvoiceStatusLabel(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    en_attente: { label: 'En attente', color: 'yellow' },
    partiel: { label: 'Partiel', color: 'orange' },
    paye: { label: 'Payé', color: 'green' },
  }
  return map[status] ?? { label: status, color: 'gray' }
}

/**
 * Build a WhatsApp link with optional message
 */
export function buildWhatsAppLink(
  number: string,
  message?: string
): string {
  const base = `https://wa.me/${number}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}

/**
 * WhatsApp helpers
 */
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '224620000000'
export const WHATSAPP_DEFAULT_MESSAGE =
  process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ||
  'Bonjour Master Oil Guinée, je souhaite passer une commande.'

export function getWhatsAppLink(message?: string): string {
  const msg = message || WHATSAPP_DEFAULT_MESSAGE
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
}

/**
 * Truncate text to a given length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '…'
}

/**
 * Generate a slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

'use client'
import { useState, useEffect } from 'react'
import { formatGNF, formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { FileText, Plus, X, Loader2, CheckCircle2, Download, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Invoice {
  id: string
  invoice_number: string
  status: string
  created_at: string
  order: {
    id: string
    total_gnf: number
    client: { name: string; phone: string | null } | null
  } | null
}

interface Order {
  id: string
  total_gnf: number
  created_at: string
  client: { name: string } | null
}

function buildMessage(invoice: Invoice): string {
  const name = invoice.order?.client?.name ?? 'client'
  const amount = invoice.order?.total_gnf ?? 0
  return `Bonjour ${name},\n\nVeuillez trouver ci-joint votre facture *N° ${invoice.invoice_number}* d'un montant de *${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} GNF*.\n\nMerci pour votre confiance.\nMaster Oil Guinée`
}

const statusConfig: Record<string, { label: string; variant: any }> = {
  en_attente: { label: 'En attente', variant: 'yellow' },
  paye:       { label: 'Payé',       variant: 'green' },
  annule:     { label: 'Annulé',     variant: 'red' },
}

export default function AdminFacturesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [sharing, setSharing] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchInvoices() }, [])

  async function fetchInvoices() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('invoices')
      .select('*, order:orders(id, total_gnf, client:clients(name, phone))')
      .order('created_at', { ascending: false })
    setInvoices(data ?? [])
    setLoading(false)
  }

  async function openForm() {
    const supabase = createClient()
    // Commandes sans facture
    const { data: existingInvoices } = await supabase.from('invoices').select('order_id')
    const usedOrderIds = (existingInvoices ?? []).map((i: any) => i.order_id)

    const { data } = await supabase
      .from('orders')
      .select('id, total_gnf, created_at, client:clients(name)')
      .order('created_at', { ascending: false })

    const available = (data ?? []).filter((o: any) => !usedOrderIds.includes(o.id))
    setOrders(available)
    setSelectedOrder('')
    setError('')
    setShowForm(true)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedOrder) { setError('Sélectionnez une commande'); return }
    setSaving(true)

    const supabase = createClient()

    // Générer numéro de facture : MO-YYYY-XXXX
    const year = new Date().getFullYear()
    const { count } = await supabase.from('invoices').select('*', { count: 'exact', head: true })
    const num = String((count ?? 0) + 1).padStart(4, '0')
    const invoice_number = `MO-${year}-${num}`

    const { error: err } = await supabase.from('invoices').insert({
      order_id: selectedOrder,
      invoice_number,
      status: 'en_attente',
    })

    setSaving(false)
    if (err) { setError(err.message); return }
    setShowForm(false)
    fetchInvoices()
  }

  async function shareInvoice(invoice: Invoice) {
    setSharing(invoice.id)
    try {
      const res = await fetch(`/api/admin/invoice/${invoice.id}`)
      const blob = await res.blob()
      const file = new File([blob], `${invoice.invoice_number}.pdf`, { type: 'application/pdf' })
      const msg = buildMessage(invoice)

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: msg, title: `Facture ${invoice.invoice_number}` })
      } else {
        // Fallback desktop : téléchargement + copie du message
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${invoice.invoice_number}.pdf`
        a.click()
        URL.revokeObjectURL(url)
        await navigator.clipboard.writeText(msg).catch(() => {})
        alert('PDF téléchargé. Le message a été copié dans le presse-papiers.')
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') alert('Erreur lors du partage')
    } finally {
      setSharing(null)
    }
  }

  async function updateStatus(id: string, status: string) {
    const supabase = createClient()
    await supabase.from('invoices').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    setInvoices((prev) => prev.map((inv) => inv.id === id ? { ...inv, status } : inv))
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-brand-cream mb-1">Factures</h1>
          <p className="text-zinc-400 text-sm">{invoices.length} facture(s) générée(s)</p>
        </div>
        <button onClick={openForm} className="btn-primary text-sm py-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nouvelle facture</span>
          <span className="sm:hidden">Nouveau</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-brand-gold animate-spin" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500 mb-4">Aucune facture générée.</p>
          <button onClick={openForm} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Créer une facture</button>
        </div>
      ) : (
        <>
          {/* Mobile */}
          <div className="md:hidden space-y-2">
            {invoices.map((invoice) => {
              const sc = statusConfig[invoice.status] ?? { label: invoice.status, variant: 'gray' }
              return (
                <div key={invoice.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-brand-gold shrink-0" />
                      <span className="text-brand-cream text-sm font-mono font-bold truncate">{invoice.invoice_number}</span>
                    </div>
                    <Badge variant={sc.variant}>{sc.label}</Badge>
                  </div>
                  <p className="text-zinc-400 text-sm mb-1">{invoice.order?.client?.name || 'Client inconnu'}</p>
                  <div className="mt-3 pt-3 border-t border-zinc-800">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-brand-gold font-semibold text-sm">{formatGNF(invoice.order?.total_gnf ?? 0)}</span>
                      <span className="text-zinc-500 text-xs">{formatDate(invoice.created_at)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <a href={`/api/admin/invoice/${invoice.id}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-medium active:bg-zinc-700 transition-colors">
                        <Download className="w-3.5 h-3.5" />PDF
                      </a>
                      <button onClick={() => shareInvoice(invoice)} disabled={sharing === invoice.id}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-900/30 text-green-400 text-xs font-medium active:bg-green-900/50 transition-colors disabled:opacity-50">
                        {sharing === invoice.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageCircle className="w-3.5 h-3.5" />}
                        Envoyer
                      </button>
                      {invoice.status === 'en_attente' ? (
                        <button onClick={() => updateStatus(invoice.id, 'paye')}
                          className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-yellow-900/30 text-yellow-400 text-xs font-medium active:bg-yellow-900/50 transition-colors">
                          <CheckCircle2 className="w-3.5 h-3.5" />Payé
                        </button>
                      ) : (
                        <div className="flex items-center justify-center py-2 rounded-lg bg-zinc-800/50 text-zinc-600 text-xs">Payé</div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop */}
          <div className="hidden md:block bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">N° Facture</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Client</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Commande</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Montant</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Statut</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Date</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const sc = statusConfig[invoice.status] ?? { label: invoice.status, variant: 'gray' }
                  return (
                    <tr key={invoice.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-brand-gold shrink-0" />
                          <span className="text-brand-cream text-sm font-mono font-bold">{invoice.invoice_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-brand-cream text-sm">{invoice.order?.client?.name || '—'}</td>
                      <td className="px-6 py-4">
                        {invoice.order?.id && (
                          <Link href={`/admin/commandes/${invoice.order.id}`}
                            className="text-zinc-400 hover:text-brand-gold text-sm transition-colors">
                            Voir commande
                          </Link>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-brand-gold font-semibold text-sm">{formatGNF(invoice.order?.total_gnf ?? 0)}</span>
                      </td>
                      <td className="px-6 py-4"><Badge variant={sc.variant}>{sc.label}</Badge></td>
                      <td className="px-6 py-4 text-zinc-400 text-sm">{formatDate(invoice.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-4">
                          <a href={`/api/admin/invoice/${invoice.id}`} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-brand-gold text-sm transition-colors">
                            <Download className="w-4 h-4" />PDF
                          </a>
                          <button onClick={() => shareInvoice(invoice)} disabled={sharing === invoice.id}
                            className="inline-flex items-center gap-1.5 text-green-500 hover:text-green-400 text-sm transition-colors disabled:opacity-50">
                            {sharing === invoice.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                            Envoyer
                          </button>
                          {invoice.status === 'en_attente' && (
                            <button onClick={() => updateStatus(invoice.id, 'paye')}
                              className="inline-flex items-center gap-1.5 text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors">
                              <CheckCircle2 className="w-4 h-4" />Marquer payé
                            </button>
                          )}
                          {invoice.status === 'paye' && (
                            <span className="text-zinc-500 text-sm">Payé</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal nouvelle facture */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center sm:px-4">
          <div className="bg-zinc-900 border border-zinc-800 sm:rounded-2xl rounded-t-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-brand-cream font-black text-lg">Nouvelle facture</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Commande <span className="text-brand-gold">*</span>
                </label>
                {orders.length === 0 ? (
                  <p className="text-zinc-500 text-sm bg-zinc-800 rounded-lg px-4 py-3">
                    Toutes les commandes ont déjà une facture.
                  </p>
                ) : (
                  <select value={selectedOrder} onChange={(e) => setSelectedOrder(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-brand-cream focus:border-brand-gold focus:outline-none text-sm">
                    <option value="">— Sélectionner une commande —</option>
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.client?.name ?? 'Client inconnu'} — {formatGNF(o.total_gnf)} — {formatDate(o.created_at)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-secondary py-2.5 justify-center text-sm">
                  Annuler
                </button>
                <button type="submit" disabled={saving || orders.length === 0}
                  className="flex-1 btn-primary py-2.5 justify-center text-sm disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Générer la facture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

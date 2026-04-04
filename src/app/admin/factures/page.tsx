import { formatGNF, formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { FileText, Download } from 'lucide-react'
import Link from 'next/link'
import { MOCK_INVOICES } from '@/lib/mockData'

export default function AdminFacturesPage() {
  const invoices = MOCK_INVOICES

  const statusConfig: Record<string, { label: string; variant: any }> = {
    en_attente: { label: 'En attente', variant: 'yellow' },
    partiel: { label: 'Paiement partiel', variant: 'orange' },
    paye: { label: 'Payé', variant: 'green' },
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-black text-brand-cream mb-1">Factures</h1>
        <p className="text-zinc-400 text-sm">{invoices?.length ?? 0} facture(s) générée(s)</p>
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden space-y-2">
        {(invoices || []).map((invoice) => {
          const sc = statusConfig[invoice.status] || { label: invoice.status, variant: 'gray' }
          return (
            <div key={invoice.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-brand-gold shrink-0" />
                  <span className="text-brand-cream text-sm font-mono font-bold truncate">{invoice.invoice_number}</span>
                </div>
                <Badge variant={sc.variant}>{sc.label}</Badge>
              </div>
              <p className="text-zinc-400 text-sm mb-1">{(invoice.order as any)?.client?.name || 'Client inconnu'}</p>
              {invoice.order_id && (
                <Link href={`/admin/commandes/${invoice.order_id}`} className="text-zinc-500 text-xs hover:text-brand-gold transition-colors">
                  Voir commande
                </Link>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
                <div>
                  <span className="text-brand-gold font-semibold text-sm">{formatGNF((invoice.order as any)?.total_gnf || 0)}</span>
                  <span className="text-zinc-500 text-xs ml-2">{formatDate(invoice.created_at)}</span>
                </div>
                <a href={`/api/admin/invoice/${invoice.id}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-brand-gold transition-colors text-sm font-medium">
                  <Download className="w-4 h-4" />PDF
                </a>
              </div>
            </div>
          )
        })}
        {(!invoices || invoices.length === 0) && (
          <p className="text-center text-zinc-500 text-sm py-12">Aucune facture générée</p>
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950">
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">N° Facture</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Client</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Montant</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Statut</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Date</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(invoices || []).map((invoice) => {
                const sc = statusConfig[invoice.status] || { label: invoice.status, variant: 'gray' }
                return (
                  <tr key={invoice.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand-gold flex-shrink-0" />
                        <span className="text-brand-cream text-sm font-mono font-bold">{invoice.invoice_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-brand-cream text-sm">{(invoice.order as any)?.client?.name || 'Client inconnu'}</p>
                      {invoice.order_id && (
                        <Link href={`/admin/commandes/${invoice.order_id}`} className="text-zinc-500 text-xs hover:text-brand-gold transition-colors">
                          Voir commande
                        </Link>
                      )}
                    </td>
                    <td className="px-6 py-4"><span className="text-brand-gold font-semibold text-sm">{formatGNF((invoice.order as any)?.total_gnf || 0)}</span></td>
                    <td className="px-6 py-4"><Badge variant={sc.variant}>{sc.label}</Badge></td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">{formatDate(invoice.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <a href={`/api/admin/invoice/${invoice.id}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-brand-gold transition-colors text-sm font-medium">
                        <Download className="w-4 h-4" />PDF
                      </a>
                    </td>
                  </tr>
                )
              })}
              {(!invoices || invoices.length === 0) && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500 text-sm">Aucune facture générée. Créez une facture depuis le détail d&apos;une commande.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

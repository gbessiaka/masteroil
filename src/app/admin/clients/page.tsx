import { formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import { MOCK_CLIENTS, MOCK_ORDERS } from '@/lib/mockData'

export default function AdminClientsPage() {
  const clients = MOCK_CLIENTS

  const typeConfig: Record<string, { label: string; variant: any }> = {
    particulier: { label: 'Particulier', variant: 'gray' },
    garage: { label: 'Garage', variant: 'blue' },
    entreprise: { label: 'Entreprise', variant: 'gold' },
    flotte: { label: 'Flotte', variant: 'purple' },
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-black text-brand-cream mb-1">Clients</h1>
        <p className="text-zinc-400 text-sm">{clients?.length ?? 0} client(s) enregistré(s)</p>
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden space-y-2">
        {(clients || []).map((client) => {
          const tc = typeConfig[client.client_type] || { label: client.client_type, variant: 'gray' }
          const orderCount = MOCK_ORDERS.filter((o) => o.client_id === client.id).length
          return (
            <div key={client.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <p className="text-brand-cream text-sm font-semibold truncate">{client.name}</p>
                  {client.notes && <p className="text-zinc-500 text-xs mt-0.5 line-clamp-1">{client.notes}</p>}
                </div>
                <Badge variant={tc.variant}>{tc.label}</Badge>
              </div>
              <div className="space-y-1 mb-3">
                {client.phone && (
                  <a href={`tel:${client.phone}`} className="flex items-center gap-2 text-zinc-400 hover:text-brand-gold text-sm transition-colors">
                    <Phone className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                    {client.phone}
                  </a>
                )}
                {client.email && (
                  <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-zinc-400 hover:text-brand-gold text-sm transition-colors">
                    <Mail className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </a>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>{orderCount} commande(s)</span>
                <span>Depuis {formatDate(client.created_at)}</span>
                <Link href={`/admin/commandes?client=${client.id}`} className="text-brand-gold hover:text-brand-gold-light transition-colors">
                  Voir commandes
                </Link>
              </div>
            </div>
          )
        })}
        {(!clients || clients.length === 0) && (
          <p className="text-center text-zinc-500 text-sm py-12">Aucun client enregistré</p>
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950">
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Nom</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Contact</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Commandes</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Client depuis</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(clients || []).map((client) => {
                const tc = typeConfig[client.client_type] || { label: client.client_type, variant: 'gray' }
                return (
                  <tr key={client.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-brand-cream text-sm font-semibold">{client.name}</p>
                      {client.notes && <p className="text-zinc-500 text-xs mt-0.5 line-clamp-1">{client.notes}</p>}
                    </td>
                    <td className="px-6 py-4">
                      {client.phone && (
                        <div className="flex items-center gap-1.5 text-zinc-400 text-sm mb-1">
                          <Phone className="w-3.5 h-3.5 text-brand-gold" />
                          <a href={`tel:${client.phone}`} className="hover:text-brand-gold transition-colors">{client.phone}</a>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
                          <Mail className="w-3.5 h-3.5 text-brand-gold" />
                          <a href={`mailto:${client.email}`} className="hover:text-brand-gold transition-colors">{client.email}</a>
                        </div>
                      )}
                      {!client.phone && !client.email && <span className="text-zinc-600 text-sm">—</span>}
                    </td>
                    <td className="px-6 py-4"><Badge variant={tc.variant}>{tc.label}</Badge></td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">{MOCK_ORDERS.filter((o) => o.client_id === client.id).length} commande(s)</td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">{formatDate(client.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/commandes?client=${client.id}`} className="text-zinc-400 hover:text-brand-gold text-sm transition-colors">
                        Voir commandes
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {(!clients || clients.length === 0) && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500 text-sm">Aucun client enregistré</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

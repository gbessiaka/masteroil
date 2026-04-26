'use client'
import { useState, useEffect } from 'react'
import { formatDate, exportCSV } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { Phone, Mail, Plus, X, Loader2, Pencil, Search, Download } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Client {
  id: string
  name: string
  phone: string | null
  email: string | null
  client_type: string
  notes: string | null
  created_at: string
  order_count?: number
}

const typeConfig: Record<string, { label: string; variant: any }> = {
  particulier: { label: 'Particulier', variant: 'gray' },
  garage:      { label: 'Garage',      variant: 'blue' },
  entreprise:  { label: 'Entreprise',  variant: 'gold' },
  flotte:      { label: 'Flotte',      variant: 'purple' },
}

const emptyForm = { name: '', phone: '', email: '', client_type: 'particulier', notes: '' }

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const PAGE_SIZE = 20
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchClients() }, [])

  async function fetchClients() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('clients')
      .select('*, orders(id)')
      .order('created_at', { ascending: false })

    setClients(
      (data ?? []).map((c: any) => ({
        ...c,
        order_count: c.orders?.length ?? 0,
      }))
    )
    setLoading(false)
  }

  function openAdd() {
    setEditingClient(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  function openEdit(client: Client) {
    setEditingClient(client)
    setForm({
      name: client.name,
      phone: client.phone ?? '',
      email: client.email ?? '',
      client_type: client.client_type,
      notes: client.notes ?? '',
    })
    setError('')
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Le nom est requis'); return }
    setSaving(true)
    const supabase = createClient()

    const payload = {
      name: form.name,
      phone: form.phone || null,
      email: form.email || null,
      client_type: form.client_type,
      notes: form.notes || null,
    }

    if (editingClient) {
      await supabase.from('clients').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editingClient.id)
    } else {
      await supabase.from('clients').insert(payload)
    }

    setSaving(false)
    setShowForm(false)
    fetchClients()
  }

  const q = search.toLowerCase()
  const filteredClients = search
    ? clients.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      )
    : clients
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / PAGE_SIZE))
  const paginatedClients = filteredClients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-brand-cream mb-1">Clients</h1>
          <p className="text-gray-500 dark:text-zinc-400 text-sm">{clients.length} client(s) enregistré(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportCSV('clients', clients.map((c) => ({
            Nom: c.name,
            Téléphone: c.phone ?? '',
            Email: c.email ?? '',
            Type: c.client_type,
            Commandes: c.order_count ?? 0,
            Notes: c.notes ?? '',
            Depuis: formatDate(c.created_at),
          })))} className="btn-secondary text-sm py-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exporter</span>
          </button>
          <button onClick={openAdd} className="btn-primary text-sm py-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau client</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Rechercher par nom, téléphone ou email..."
          className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-gray-900 dark:text-brand-cream placeholder-gray-400 dark:placeholder-zinc-500 focus:border-brand-gold focus:outline-none text-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-zinc-500 hover:text-gray-600 dark:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-brand-gold animate-spin" />
        </div>
      ) : (
        <>
          {clients.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 dark:text-zinc-500 mb-4">Aucun client enregistré.</p>
              <button onClick={openAdd} className="btn-primary text-sm">
                <Plus className="w-4 h-4" /> Ajouter le premier client
              </button>
            </div>
          ) : (
          <>
          {/* Mobile */}
          <div className="md:hidden space-y-2">
            {paginatedClients.map((client) => {
              const tc = typeConfig[client.client_type] ?? { label: client.client_type, variant: 'gray' }
              return (
                <div key={client.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm dark:shadow-none p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <Link href={`/admin/clients/${client.id}`} className="text-gray-900 dark:text-brand-cream text-sm font-semibold truncate hover:text-brand-gold transition-colors">{client.name}</Link>
                      {client.notes && <p className="text-gray-500 dark:text-zinc-500 text-xs mt-0.5 line-clamp-1">{client.notes}</p>}
                    </div>
                    <Badge variant={tc.variant}>{tc.label}</Badge>
                  </div>
                  <div className="space-y-1 mb-3">
                    {client.phone && (
                      <a href={`tel:${client.phone}`} className="flex items-center gap-2 text-gray-500 dark:text-zinc-400 hover:text-brand-gold text-sm transition-colors">
                        <Phone className="w-3.5 h-3.5 text-brand-gold shrink-0" />{client.phone}
                      </a>
                    )}
                    {client.email && (
                      <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-gray-500 dark:text-zinc-400 hover:text-brand-gold text-sm transition-colors">
                        <Mail className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </a>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-500">
                    <span>{client.order_count} commande(s)</span>
                    <span>Depuis {formatDate(client.created_at)}</span>
                    <button onClick={() => openEdit(client)} className="text-brand-gold hover:underline">Modifier</button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop */}
          <div className="hidden md:block bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm dark:shadow-none overflow-hidden">
            {filteredClients.length === 0 && (
              <p className="text-gray-500 dark:text-zinc-500 text-sm text-center py-8">Aucun résultat pour &quot;{search}&quot;</p>
            )}
            {filteredClients.length > 0 && <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wide">Nom</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wide">Contact</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wide">Commandes</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wide">Client depuis</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedClients.map((client) => {
                  const tc = typeConfig[client.client_type] ?? { label: client.client_type, variant: 'gray' }
                  return (
                    <tr key={client.id} className="border-b border-gray-200 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/admin/clients/${client.id}`} className="text-gray-900 dark:text-brand-cream text-sm font-semibold hover:text-brand-gold transition-colors">{client.name}</Link>
                        {client.notes && <p className="text-gray-500 dark:text-zinc-500 text-xs mt-0.5 line-clamp-1">{client.notes}</p>}
                      </td>
                      <td className="px-6 py-4">
                        {client.phone && (
                          <div className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-400 text-sm mb-1">
                            <Phone className="w-3.5 h-3.5 text-brand-gold" />
                            <a href={`tel:${client.phone}`} className="hover:text-brand-gold transition-colors">{client.phone}</a>
                          </div>
                        )}
                        {client.email && (
                          <div className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-400 text-sm">
                            <Mail className="w-3.5 h-3.5 text-brand-gold" />
                            <a href={`mailto:${client.email}`} className="hover:text-brand-gold transition-colors">{client.email}</a>
                          </div>
                        )}
                        {!client.phone && !client.email && <span className="text-gray-400 dark:text-zinc-600 text-sm">—</span>}
                      </td>
                      <td className="px-6 py-4"><Badge variant={tc.variant}>{tc.label}</Badge></td>
                      <td className="px-6 py-4 text-gray-500 dark:text-zinc-400 text-sm">{client.order_count} commande(s)</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-zinc-400 text-sm">{formatDate(client.created_at)}</td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                        <button onClick={() => openEdit(client)} className="text-gray-500 dark:text-zinc-400 hover:text-brand-gold text-sm transition-colors flex items-center gap-1">
                          <Pencil className="w-3.5 h-3.5" />Modifier
                        </button>
                        <Link href={`/admin/commandes?client=${client.id}`} className="text-gray-500 dark:text-zinc-400 hover:text-brand-gold text-sm transition-colors">
                          Commandes
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>}
          </div>
          </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-1">
              <p className="text-gray-500 dark:text-zinc-500 text-sm">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredClients.length)} sur {filteredClients.length}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(1)} disabled={page === 1}
                  className="px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-brand-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors">«</button>
                <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-brand-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Préc.</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | '...')[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i-1] as number) > 1) acc.push('...')
                    acc.push(p); return acc
                  }, [])
                  .map((p, i) => p === '...'
                    ? <span key={`e${i}`} className="px-2 text-gray-400 dark:text-zinc-600 text-xs">…</span>
                    : <button key={p} onClick={() => setPage(p as number)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${page === p ? 'bg-brand-gold/10 border-brand-gold/50 text-brand-gold font-bold' : 'border-gray-300 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-brand-cream'}`}>{p}</button>
                  )}
                <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-brand-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Suiv.</button>
                <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                  className="px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-brand-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors">»</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal ajout / modification */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center sm:px-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 sm:rounded-2xl rounded-t-2xl p-6 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900 dark:text-brand-cream font-black text-lg">
                {editingClient ? 'Modifier le client' : 'Nouveau client'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-500 dark:text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1.5">Nom complet <span className="text-brand-gold">*</span></label>
                <input type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Garage Central Conakry"
                  className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-brand-cream placeholder-gray-400 dark:placeholder-zinc-500 focus:border-brand-gold focus:outline-none text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1.5">Type de client</label>
                <select value={form.client_type} onChange={(e) => setForm({ ...form, client_type: e.target.value })}
                  className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-brand-cream focus:border-brand-gold focus:outline-none text-sm">
                  <option value="particulier">Particulier</option>
                  <option value="garage">Garage</option>
                  <option value="entreprise">Entreprise</option>
                  <option value="flotte">Flotte</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1.5">Téléphone</label>
                <input type="tel" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+224 6XX XX XX XX"
                  className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-brand-cream placeholder-gray-400 dark:placeholder-zinc-500 focus:border-brand-gold focus:outline-none text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1.5">Email</label>
                <input type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="client@example.com"
                  className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-brand-cream placeholder-gray-400 dark:placeholder-zinc-500 focus:border-brand-gold focus:outline-none text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2} placeholder="Infos supplémentaires..."
                  className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-brand-cream placeholder-gray-400 dark:placeholder-zinc-500 focus:border-brand-gold focus:outline-none text-sm resize-none" />
              </div>

              {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-secondary py-2.5 justify-center text-sm">
                  Annuler
                </button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 justify-center text-sm disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingClient ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

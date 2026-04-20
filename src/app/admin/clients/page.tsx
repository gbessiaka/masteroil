'use client'
import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { Phone, Mail, Plus, X, Loader2, Pencil, Search } from 'lucide-react'
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
  const [showForm, setShowForm] = useState(false)
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

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-brand-cream mb-1">Clients</h1>
          <p className="text-zinc-400 text-sm">{clients.length} client(s) enregistré(s)</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-sm py-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nouveau client</span>
          <span className="sm:hidden">Nouveau</span>
        </button>
      </div>

      {/* Recherche */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom, téléphone ou email..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-brand-cream placeholder-zinc-500 focus:border-brand-gold focus:outline-none text-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
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
              <p className="text-zinc-500 mb-4">Aucun client enregistré.</p>
              <button onClick={openAdd} className="btn-primary text-sm">
                <Plus className="w-4 h-4" /> Ajouter le premier client
              </button>
            </div>
          ) : (() => {
            const q = search.toLowerCase()
            const filteredClients = search
              ? clients.filter((c) =>
                  c.name.toLowerCase().includes(q) ||
                  c.phone?.toLowerCase().includes(q) ||
                  c.email?.toLowerCase().includes(q)
                )
              : clients
            return (
          <>
          {/* Mobile */}
          <div className="md:hidden space-y-2">
            {filteredClients.map((client) => {
              const tc = typeConfig[client.client_type] ?? { label: client.client_type, variant: 'gray' }
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
                        <Phone className="w-3.5 h-3.5 text-brand-gold shrink-0" />{client.phone}
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
                    <span>{client.order_count} commande(s)</span>
                    <span>Depuis {formatDate(client.created_at)}</span>
                    <button onClick={() => openEdit(client)} className="text-brand-gold hover:underline">Modifier</button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop */}
          <div className="hidden md:block bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {filteredClients.length === 0 && (
              <p className="text-zinc-500 text-sm text-center py-8">Aucun résultat pour &quot;{search}&quot;</p>
            )}
            {filteredClients.length > 0 && <table className="w-full">
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
                {filteredClients.map((client) => {
                  const tc = typeConfig[client.client_type] ?? { label: client.client_type, variant: 'gray' }
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
                      <td className="px-6 py-4 text-zinc-400 text-sm">{client.order_count} commande(s)</td>
                      <td className="px-6 py-4 text-zinc-400 text-sm">{formatDate(client.created_at)}</td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                        <button onClick={() => openEdit(client)} className="text-zinc-400 hover:text-brand-gold text-sm transition-colors flex items-center gap-1">
                          <Pencil className="w-3.5 h-3.5" />Modifier
                        </button>
                        <Link href={`/admin/commandes?client=${client.id}`} className="text-zinc-400 hover:text-brand-gold text-sm transition-colors">
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
            )
          })()}
        </>
      )}

      {/* Modal ajout / modification */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-brand-cream font-black text-lg">
                {editingClient ? 'Modifier le client' : 'Nouveau client'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Nom complet <span className="text-brand-gold">*</span></label>
                <input type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Garage Central Conakry"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-brand-cream placeholder-zinc-500 focus:border-brand-gold focus:outline-none text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Type de client</label>
                <select value={form.client_type} onChange={(e) => setForm({ ...form, client_type: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-brand-cream focus:border-brand-gold focus:outline-none text-sm">
                  <option value="particulier">Particulier</option>
                  <option value="garage">Garage</option>
                  <option value="entreprise">Entreprise</option>
                  <option value="flotte">Flotte</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Téléphone</label>
                <input type="tel" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+224 6XX XX XX XX"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-brand-cream placeholder-zinc-500 focus:border-brand-gold focus:outline-none text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
                <input type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="client@example.com"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-brand-cream placeholder-zinc-500 focus:border-brand-gold focus:outline-none text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2} placeholder="Infos supplémentaires..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-brand-cream placeholder-zinc-500 focus:border-brand-gold focus:outline-none text-sm resize-none" />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

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

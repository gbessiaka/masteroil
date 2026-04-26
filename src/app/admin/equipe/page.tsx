'use client'
import { useState, useEffect } from 'react'
import { UserPlus, Shield, Briefcase, TrendingUp, MoreVertical, X, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAdminProfile, type AdminRole } from '@/hooks/useAdminProfile'
import { createClient } from '@/lib/supabase/client'

interface AdminUser {
  id: string
  name: string
  email?: string
  role: AdminRole
  active: boolean
  created_at: string
}

const ROLE_CONFIG: Record<AdminRole, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  super_admin:  { label: 'Super Admin',  color: 'text-brand-gold', bg: 'bg-brand-gold/10 border-brand-gold/30',  icon: Shield },
  gestionnaire: { label: 'Gestionnaire', color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/30',       icon: Briefcase },
  commercial:   { label: 'Commercial',   color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700/30',     icon: TrendingUp },
}

function RoleBadge({ role }: { role: AdminRole }) {
  const cfg = ROLE_CONFIG[role]
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

export default function EquipePage() {
  const { profile: currentProfile } = useAdminProfile()
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'gestionnaire' as AdminRole })
  const [error, setError] = useState('')

  const isSuperAdmin = currentProfile?.role === 'super_admin'

  useEffect(() => {
    fetchAdmins()
  }, [])

  async function getToken() {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  }

  async function fetchAdmins() {
    setLoading(true)
    const token = await getToken()
    const res = await fetch('/api/admin/users', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (res.ok) setAdmins(await res.json())
    setLoading(false)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    const token = await getToken()
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(form),
    })

    setSaving(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Une erreur est survenue.')
      return
    }

    setForm({ name: '', email: '', password: '', role: 'gestionnaire' })
    setShowForm(false)
    fetchAdmins()
  }

  const toggleActive = async (admin: AdminUser) => {
    const token = await getToken()
    await fetch(`/api/admin/users/${admin.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ active: !admin.active }),
    })
    setMenuOpen(null)
    fetchAdmins()
  }

  const deleteAdmin = async (id: string) => {
    if (!confirm('Supprimer cet administrateur ?')) return
    const token = await getToken()
    await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    setMenuOpen(null)
    fetchAdmins()
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 dark:text-brand-cream text-2xl font-black">Équipe & Accès</h1>
          <p className="text-gray-500 dark:text-zinc-500 text-sm mt-1">{admins.length} administrateur{admins.length > 1 ? 's' : ''}</p>
        </div>
        {isSuperAdmin && (
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm py-2.5 px-4">
            <UserPlus className="w-4 h-4" />
            Ajouter
          </button>
        )}
      </div>

      {/* Role counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {(Object.entries(ROLE_CONFIG) as [AdminRole, typeof ROLE_CONFIG[AdminRole]][]).map(([key, cfg]) => {
          const Icon = cfg.icon
          const count = admins.filter((a) => a.role === key).length
          return (
            <div key={key} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm dark:shadow-none p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${cfg.bg}`}>
                <Icon className={`w-4 h-4 ${cfg.color}`} />
              </div>
              <div>
                <p className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</p>
                <p className="text-gray-500 dark:text-zinc-500 text-xs">{count} membre{count > 1 ? 's' : ''}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* List */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-brand-gold animate-spin" />
          </div>
        ) : admins.length === 0 ? (
          <p className="text-gray-500 dark:text-zinc-500 text-sm text-center py-12">Aucun administrateur</p>
        ) : (
          admins.map((admin, i) => (
            <div
              key={admin.id}
              className={`flex items-center justify-between px-5 py-4 gap-4 ${i !== admins.length - 1 ? 'border-b border-gray-200 dark:border-zinc-800' : ''} ${!admin.active ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 flex items-center justify-center shrink-0">
                  <span className="text-brand-gold text-sm font-black">{admin.name.charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-gray-900 dark:text-brand-cream text-sm font-semibold truncate">{admin.name}</p>
                  {admin.email && <p className="text-gray-500 dark:text-zinc-500 text-xs truncate">{admin.email}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <RoleBadge role={admin.role} />
                {!admin.active && (
                  <span className="text-xs text-gray-500 dark:text-zinc-500 border border-gray-300 dark:border-zinc-700 px-2 py-0.5 rounded-full hidden sm:inline">
                    Inactif
                  </span>
                )}
                {isSuperAdmin && admin.id !== currentProfile?.id && (
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === admin.id ? null : admin.id)}
                      className="p-1.5 text-gray-500 dark:text-zinc-500 hover:text-gray-600 dark:text-zinc-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {menuOpen === admin.id && (
                      <div className="absolute right-0 top-8 z-20 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl shadow-xl w-44 py-1">
                        <button
                          onClick={() => toggleActive(admin)}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-white transition-colors"
                        >
                          {admin.active ? 'Désactiver' : 'Réactiver'}
                        </button>
                        {admin.role !== 'super_admin' && (
                          <button
                            onClick={() => deleteAdmin(admin.id)}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900 dark:text-brand-cream font-black text-lg">Nouvel administrateur</h2>
              <button onClick={() => { setShowForm(false); setError('') }} className="p-1.5 text-gray-500 dark:text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1.5">Nom complet</label>
                <input
                  type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Prénom Nom"
                  className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-brand-cream placeholder-gray-400 dark:placeholder-zinc-500 focus:border-brand-gold focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1.5">Email</label>
                <input
                  type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="prenom@masteroilguinee.com"
                  className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-brand-cream placeholder-gray-400 dark:placeholder-zinc-500 focus:border-brand-gold focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1.5">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} required value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 pr-10 text-gray-900 dark:text-brand-cream placeholder-gray-400 dark:placeholder-zinc-500 focus:border-brand-gold focus:outline-none text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-zinc-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1.5">Rôle</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole })}
                  className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-brand-cream focus:border-brand-gold focus:outline-none text-sm"
                >
                  <option value="gestionnaire">Gestionnaire</option>
                  <option value="commercial">Commercial</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 rounded-lg p-3">
                  <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setError('') }} className="flex-1 btn-secondary py-2.5 justify-center text-sm">
                  Annuler
                </button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 justify-center text-sm disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

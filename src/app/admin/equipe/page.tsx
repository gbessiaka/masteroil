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
  gestionnaire: { label: 'Gestionnaire', color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/30',   icon: Briefcase },
  commercial:   { label: 'Commercial',   color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700/30', icon: TrendingUp },
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

const inputCls = 'w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-brand-cream placeholder-gray-400 dark:placeholder-zinc-500 focus:border-brand-gold focus:outline-none text-sm'

export default function EquipePage() {
  const { profile: currentProfile } = useAdminProfile()
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Add modal
  const [showAdd, setShowAdd] = useState(false)
  const [showAddPwd, setShowAddPwd] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', role: 'gestionnaire' as AdminRole })

  // Edit role modal
  const [editRoleTarget, setEditRoleTarget] = useState<AdminUser | null>(null)
  const [editRole, setEditRole] = useState<AdminRole>('gestionnaire')

  // Edit password modal
  const [editPwdTarget, setEditPwdTarget] = useState<AdminUser | null>(null)
  const [editPwd, setEditPwd] = useState('')
  const [showEditPwd, setShowEditPwd] = useState(false)

  const isSuperAdmin = currentProfile?.role === 'super_admin'

  useEffect(() => { fetchAdmins() }, [])

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

  function flashSuccess(msg: string) {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 3000)
  }

  async function patch(id: string, body: object) {
    const token = await getToken()
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    })
    return res
  }

  // ── Add ──
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    const token = await getToken()
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(addForm),
    })
    setSaving(false)
    if (!res.ok) { setError((await res.json()).error ?? 'Erreur'); return }
    setAddForm({ name: '', email: '', password: '', role: 'gestionnaire' })
    setShowAdd(false)
    fetchAdmins()
    flashSuccess('Administrateur ajouté')
  }

  // ── Toggle active ──
  const toggleActive = async (admin: AdminUser) => {
    setMenuOpen(null)
    await patch(admin.id, { active: !admin.active })
    fetchAdmins()
    flashSuccess(admin.active ? 'Compte désactivé' : 'Compte réactivé')
  }

  // ── Delete ──
  const deleteAdmin = async (id: string) => {
    setMenuOpen(null)
    if (!confirm('Supprimer cet administrateur ?')) return
    const token = await getToken()
    await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    fetchAdmins()
    flashSuccess('Administrateur supprimé')
  }

  // ── Save role ──
  const handleSaveRole = async () => {
    if (!editRoleTarget) return
    setSaving(true)
    setError('')
    const res = await patch(editRoleTarget.id, { role: editRole })
    setSaving(false)
    if (!res.ok) { setError((await res.json()).error ?? 'Erreur'); return }
    setEditRoleTarget(null)
    fetchAdmins()
    flashSuccess('Rôle mis à jour')
  }

  // ── Save password ──
  const handleSavePwd = async () => {
    if (!editPwdTarget || editPwd.length < 6) { setError('6 caractères minimum'); return }
    setSaving(true)
    setError('')
    const res = await patch(editPwdTarget.id, { password: editPwd })
    setSaving(false)
    if (!res.ok) { setError((await res.json()).error ?? 'Erreur'); return }
    setEditPwdTarget(null)
    setEditPwd('')
    flashSuccess('Mot de passe mis à jour')
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 dark:text-brand-cream text-2xl font-black">Équipe & Accès</h1>
          <p className="text-gray-500 dark:text-zinc-500 text-sm mt-1">{admins.length} administrateur{admins.length > 1 ? 's' : ''}</p>
        </div>
        {isSuperAdmin && (
          <button onClick={() => { setShowAdd(true); setError('') }} className="btn-primary text-sm py-2.5 px-4">
            <UserPlus className="w-4 h-4" />
            Ajouter
          </button>
        )}
      </div>

      {/* Success toast */}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 rounded-lg px-4 py-3">
          <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
        </div>
      )}

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
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm dark:shadow-none">
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
                      className="p-1.5 text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {menuOpen === admin.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                        <div className="absolute right-0 top-9 z-20 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl w-52 py-1 overflow-hidden">
                          <button
                            onClick={() => { setEditRoleTarget(admin); setEditRole(admin.role); setMenuOpen(null); setError('') }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            Changer le rôle
                          </button>
                          <button
                            onClick={() => { setEditPwdTarget(admin); setEditPwd(''); setMenuOpen(null); setError('') }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            Changer le mot de passe
                          </button>
                          <div className="my-1 border-t border-gray-200 dark:border-zinc-800" />
                          <button
                            onClick={() => toggleActive(admin)}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            {admin.active ? 'Désactiver' : 'Réactiver'}
                          </button>
                          {admin.role !== 'super_admin' && (
                            <button
                              onClick={() => deleteAdmin(admin.id)}
                              className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              Supprimer
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Modal: Add admin ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900 dark:text-brand-cream font-black text-lg">Nouvel administrateur</h2>
              <button onClick={() => { setShowAdd(false); setError('') }} className="p-1.5 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1.5">Nom complet</label>
                <input type="text" required value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="Prénom Nom" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1.5">Email</label>
                <input type="email" required value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="prenom@masteroilguinee.com" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1.5">Mot de passe</label>
                <div className="relative">
                  <input type={showAddPwd ? 'text' : 'password'} required value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="••••••••"
                    className={inputCls + ' pr-10'} />
                  <button type="button" onClick={() => setShowAddPwd(!showAddPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-zinc-400">
                    {showAddPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1.5">Rôle</label>
                <select value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value as AdminRole })} className={inputCls}>
                  <option value="gestionnaire">Gestionnaire</option>
                  <option value="commercial">Commercial</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              {error && <p className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAdd(false); setError('') }} className="flex-1 btn-secondary py-2.5 justify-center text-sm">Annuler</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 justify-center text-sm disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Change role ── */}
      {editRoleTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-gray-900 dark:text-brand-cream font-black text-lg">Changer le rôle</h2>
                <p className="text-gray-500 dark:text-zinc-400 text-sm mt-0.5">{editRoleTarget.name}</p>
              </div>
              <button onClick={() => { setEditRoleTarget(null); setError('') }} className="p-1.5 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 mb-5">
              {(Object.entries(ROLE_CONFIG) as [AdminRole, typeof ROLE_CONFIG[AdminRole]][]).map(([key, cfg]) => {
                const Icon = cfg.icon
                return (
                  <button key={key} type="button" onClick={() => setEditRole(key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                      editRole === key
                        ? `${cfg.bg} border-current ${cfg.color} font-semibold`
                        : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
                    }`}>
                    <Icon className="w-4 h-4 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{cfg.label}</p>
                    </div>
                    {editRole === key && <span className="ml-auto text-xs font-bold">✓</span>}
                  </button>
                )
              })}
            </div>
            {error && <p className="text-red-500 dark:text-red-400 text-sm mb-3">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => { setEditRoleTarget(null); setError('') }} className="flex-1 btn-secondary py-2.5 justify-center text-sm">Annuler</button>
              <button onClick={handleSaveRole} disabled={saving || editRole === editRoleTarget.role} className="flex-1 btn-primary py-2.5 justify-center text-sm disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Change password ── */}
      {editPwdTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-gray-900 dark:text-brand-cream font-black text-lg">Changer le mot de passe</h2>
                <p className="text-gray-500 dark:text-zinc-400 text-sm mt-0.5">{editPwdTarget.name}</p>
              </div>
              <button onClick={() => { setEditPwdTarget(null); setError('') }} className="p-1.5 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1.5">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showEditPwd ? 'text' : 'password'}
                  value={editPwd}
                  onChange={(e) => { setEditPwd(e.target.value); setError('') }}
                  placeholder="••••••••  (6 caractères min.)"
                  className={inputCls + ' pr-10'}
                  autoFocus
                />
                <button type="button" onClick={() => setShowEditPwd(!showEditPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-zinc-400">
                  {showEditPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 dark:text-red-400 text-sm mb-3">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => { setEditPwdTarget(null); setError('') }} className="flex-1 btn-secondary py-2.5 justify-center text-sm">Annuler</button>
              <button onClick={handleSavePwd} disabled={saving || editPwd.length < 6} className="flex-1 btn-primary py-2.5 justify-center text-sm disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

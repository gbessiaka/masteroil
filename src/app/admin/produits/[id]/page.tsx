'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface PackagingForm {
  id?: string
  volume_liters: string
  price_gnf: string
  sku: string
}

interface ProductForm {
  name: string
  category: string
  description: string
  viscosity: string
  type: string
  is_active: boolean
  show_price: boolean
}

const emptyForm: ProductForm = {
  name: '', category: 'automobile', description: '',
  viscosity: '', type: '', is_active: true, show_price: true,
}

export default function AdminProductEditPage() {
  const params = useParams()
  const id = params.id as string
  const isNew = id === 'new'
  const router = useRouter()

  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [packagings, setPackagings] = useState<PackagingForm[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isNew) return
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*, packagings(*)')
        .eq('id', id)
        .single()

      if (data) {
        setForm({
          name: data.name,
          category: data.category,
          description: data.description || '',
          viscosity: data.viscosity || '',
          type: data.type || '',
          is_active: data.is_active,
          show_price: data.show_price,
        })
        setPackagings(
          (data.packagings || []).map((p: any) => ({
            id: p.id,
            volume_liters: String(p.volume_liters),
            price_gnf: String(p.price_gnf),
            sku: p.sku || '',
          }))
        )
      }
      setLoading(false)
    }
    load()
  }, [id, isNew])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSave = async () => {
    setError('')
    if (!form.name.trim()) { setError('Le nom du produit est requis'); return }
    setSaving(true)

    const supabase = createClient()

    if (isNew) {
      // Create product
      const { data: product, error: err } = await supabase
        .from('products')
        .insert({ ...form, type: form.type || null })
        .select()
        .single()

      if (err || !product) { setError(err?.message ?? 'Erreur'); setSaving(false); return }

      // Create packagings
      if (packagings.length > 0) {
        const pkgs = packagings
          .filter((p) => p.volume_liters && p.price_gnf)
          .map((p) => ({
            product_id: product.id,
            volume_liters: parseFloat(p.volume_liters),
            price_gnf: parseInt(p.price_gnf),
            sku: p.sku || null,
          }))
        await supabase.from('packagings').insert(pkgs)
      }
    } else {
      // Update product
      const { error: err } = await supabase
        .from('products')
        .update({ ...form, type: form.type || null, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (err) { setError(err.message); setSaving(false); return }

      // Delete old packagings and re-insert
      await supabase.from('packagings').delete().eq('product_id', id)
      if (packagings.length > 0) {
        const pkgs = packagings
          .filter((p) => p.volume_liters && p.price_gnf)
          .map((p) => ({
            product_id: id,
            volume_liters: parseFloat(p.volume_liters),
            price_gnf: parseInt(p.price_gnf),
            sku: p.sku || null,
          }))
        await supabase.from('packagings').insert(pkgs)
      }
    }

    setSaving(false)
    router.push('/admin/produits')
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-brand-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/produits" className="text-zinc-400 hover:text-brand-cream transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-brand-cream">
            {isNew ? 'Nouveau produit' : 'Modifier le produit'}
          </h1>
          <p className="text-zinc-500 text-sm">{isNew ? 'Créer un nouveau produit' : form.name}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Infos générales */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-brand-cream font-bold">Informations générales</h2>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Nom du produit <span className="text-brand-gold">*</span></label>
            <input name="name" value={form.name} onChange={handleChange}
              placeholder="Ex: Super M7 5W-30"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-brand-cream placeholder-zinc-500 focus:border-brand-gold focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Catégorie</label>
              <select name="category" value={form.category} onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-brand-cream focus:border-brand-gold focus:outline-none">
                <option value="automobile">Automobile</option>
                <option value="industriel">Industriel</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Type</label>
              <select name="type" value={form.type} onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-brand-cream focus:border-brand-gold focus:outline-none">
                <option value="">— Non spécifié —</option>
                <option value="synthetique">100% Synthétique</option>
                <option value="semi-synthetique">Semi-Synthétique</option>
                <option value="mineral">Minérale</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Viscosité</label>
            <input name="viscosity" value={form.viscosity} onChange={handleChange}
              placeholder="Ex: 5W-30"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-brand-cream placeholder-zinc-500 focus:border-brand-gold focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4}
              placeholder="Description du produit..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-brand-cream placeholder-zinc-500 focus:border-brand-gold focus:outline-none resize-none" />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 accent-brand-gold" />
              <span className="text-zinc-300 text-sm">Produit actif</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="show_price" checked={form.show_price} onChange={handleChange} className="w-4 h-4 accent-brand-gold" />
              <span className="text-zinc-300 text-sm">Afficher les prix</span>
            </label>
          </div>
        </div>

        {/* Conditionnements */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-brand-cream font-bold">Conditionnements</h2>
            <button type="button" onClick={() => setPackagings((p) => [...p, { volume_liters: '', price_gnf: '', sku: '' }])}
              className="btn-secondary text-sm py-2 px-3">
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          </div>
          <div className="space-y-3">
            {packagings.map((pkg, i) => (
              <div key={i} className="grid grid-cols-3 gap-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Volume (L)</label>
                  <input type="number" step="0.1" min="0.1" value={pkg.volume_liters}
                    onChange={(e) => setPackagings((p) => p.map((x, j) => j === i ? { ...x, volume_liters: e.target.value } : x))}
                    placeholder="Ex: 5"
                    className="w-full bg-zinc-900 border border-zinc-600 rounded-lg px-3 py-2 text-brand-cream text-sm focus:border-brand-gold focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Prix (GNF)</label>
                  <input type="number" min="0" value={pkg.price_gnf}
                    onChange={(e) => setPackagings((p) => p.map((x, j) => j === i ? { ...x, price_gnf: e.target.value } : x))}
                    placeholder="Ex: 395000"
                    className="w-full bg-zinc-900 border border-zinc-600 rounded-lg px-3 py-2 text-brand-cream text-sm focus:border-brand-gold focus:outline-none" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-zinc-400 mb-1">SKU</label>
                    <input type="text" value={pkg.sku}
                      onChange={(e) => setPackagings((p) => p.map((x, j) => j === i ? { ...x, sku: e.target.value } : x))}
                      placeholder="Ex: SM7-5L"
                      className="w-full bg-zinc-900 border border-zinc-600 rounded-lg px-3 py-2 text-brand-cream text-sm focus:border-brand-gold focus:outline-none" />
                  </div>
                  <button type="button" onClick={() => setPackagings((p) => p.filter((_, j) => j !== i))}
                    className="mt-5 p-2 text-zinc-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {packagings.length === 0 && (
              <p className="text-zinc-500 text-sm text-center py-4">Aucun conditionnement. Cliquez sur "Ajouter".</p>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <Link href="/admin/produits" className="btn-secondary flex-1 justify-center py-3">Annuler</Link>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center py-3 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

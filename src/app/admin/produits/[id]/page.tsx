'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Save, Loader2, ImagePlus, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface PackagingForm {
  id?: string
  volume_liters: string
  price_gnf: string
  sku: string
  image_url: string
  uploading?: boolean
}

interface ProductForm {
  name: string
  category: string
  description: string
  viscosity: string
  type: string
  is_active: boolean
  show_price: boolean
  image_url: string
}

const emptyForm: ProductForm = {
  name: '', category: 'automobile', description: '',
  viscosity: '', type: '', is_active: true, show_price: true, image_url: '',
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
  const [uploading, setUploading] = useState(false)
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
          image_url: data.image_url || '',
        })
        setPackagings(
          (data.packagings || []).map((p: any) => ({
            id: p.id,
            volume_liters: String(p.volume_liters),
            price_gnf: String(p.price_gnf),
            sku: p.sku || '',
            image_url: p.image_url || '',
          }))
        )
      }
      setLoading(false)
    }
    load()
  }, [id, isNew])

  async function handlePackagingImageUpload(e: React.ChangeEvent<HTMLInputElement>, i: number) {
    const file = e.target.files?.[0]
    if (!file) return
    setPackagings((prev) => prev.map((p, j) => j === i ? { ...p, uploading: true } : p))
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const fileName = `pkg-${Date.now()}.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { upsert: true })
    if (uploadErr) { setError('Erreur upload : ' + uploadErr.message); setPackagings((prev) => prev.map((p, j) => j === i ? { ...p, uploading: false } : p)); return }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName)
    setPackagings((prev) => prev.map((p, j) => j === i ? { ...p, image_url: publicUrl, uploading: false } : p))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { upsert: true })
    if (uploadErr) { setError('Erreur upload : ' + uploadErr.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName)
    setForm((prev) => ({ ...prev, image_url: publicUrl }))
    setUploading(false)
  }

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
            image_url: p.image_url || null,
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

      // Récupérer les IDs des packagings actuels en base
      const { data: existingPkgs } = await supabase
        .from('packagings').select('id').eq('product_id', id)
      const existingIds = (existingPkgs ?? []).map((p: any) => p.id)
      const keptIds = packagings.filter((p) => p.id).map((p) => p.id!)

      // Supprimer uniquement ceux qui ont été retirés du formulaire
      const toDelete = existingIds.filter((eid) => !keptIds.includes(eid))
      if (toDelete.length > 0) {
        const { error: delErr } = await supabase
          .from('packagings').delete().in('id', toDelete)
        if (delErr) {
          setError('Impossible de supprimer un conditionnement utilisé dans des commandes existantes.')
          setSaving(false)
          return
        }
      }

      // Mettre à jour les existants et insérer les nouveaux
      for (const p of packagings.filter((p) => p.volume_liters && p.price_gnf)) {
        const payload = {
          product_id: id,
          volume_liters: parseFloat(p.volume_liters),
          price_gnf: parseInt(p.price_gnf),
          sku: p.sku || null,
          image_url: p.image_url || null,
        }
        if (p.id) {
          await supabase.from('packagings').update(payload).eq('id', p.id)
        } else {
          await supabase.from('packagings').insert(payload)
        }
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
        <Link href="/admin/produits" className="text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-brand-cream transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-brand-cream">
            {isNew ? 'Nouveau produit' : 'Modifier le produit'}
          </h1>
          <p className="text-gray-500 dark:text-zinc-500 text-sm">{isNew ? 'Créer un nouveau produit' : form.name}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Photo produit */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6">
          <h2 className="text-gray-900 dark:text-brand-cream font-bold mb-4">Photo du produit</h2>
          <div className="flex items-start gap-4">
            {form.image_url ? (
              <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-gray-300 dark:border-zinc-700 shrink-0">
                <Image src={form.image_url} alt="Photo produit" fill className="object-cover" />
                <button onClick={() => setForm((p) => ({ ...p, image_url: '' }))}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 dark:border-zinc-700 flex items-center justify-center shrink-0 bg-gray-100 dark:bg-zinc-800/50">
                <ImagePlus className="w-8 h-8 text-gray-400 dark:text-zinc-600" />
              </div>
            )}
            <div>
              <label className={`flex items-center gap-2 cursor-pointer btn-secondary text-sm py-2 px-4 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                {uploading ? 'Upload...' : form.image_url ? 'Changer la photo' : 'Ajouter une photo'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
              <p className="text-gray-500 dark:text-zinc-500 text-xs mt-2">JPG, PNG, WEBP — max 5 Mo</p>
            </div>
          </div>
        </div>

        {/* Infos générales */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-gray-900 dark:text-brand-cream font-bold">Informations générales</h2>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1">Nom du produit <span className="text-brand-gold">*</span></label>
            <input name="name" value={form.name} onChange={handleChange}
              placeholder="Ex: Super M7 5W-30"
              className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-3 text-gray-900 dark:text-brand-cream placeholder-gray-400 dark:placeholder-zinc-500 focus:border-brand-gold focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1">Catégorie</label>
              <select name="category" value={form.category} onChange={handleChange}
                className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-3 text-gray-900 dark:text-brand-cream focus:border-brand-gold focus:outline-none">
                <option value="automobile">Automobile</option>
                <option value="industriel">Industriel</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1">Type</label>
              <select name="type" value={form.type} onChange={handleChange}
                className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-3 text-gray-900 dark:text-brand-cream focus:border-brand-gold focus:outline-none">
                <option value="">— Non spécifié —</option>
                <option value="synthetique">100% Synthétique</option>
                <option value="semi-synthetique">Semi-Synthétique</option>
                <option value="mineral">Minérale</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1">Viscosité</label>
            <input name="viscosity" value={form.viscosity} onChange={handleChange}
              placeholder="Ex: 5W-30"
              className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-3 text-gray-900 dark:text-brand-cream placeholder-gray-400 dark:placeholder-zinc-500 focus:border-brand-gold focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-zinc-300 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4}
              placeholder="Description du produit..."
              className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-3 text-gray-900 dark:text-brand-cream placeholder-gray-400 dark:placeholder-zinc-500 focus:border-brand-gold focus:outline-none resize-none" />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 accent-brand-gold" />
              <span className="text-gray-600 dark:text-zinc-300 text-sm">Produit actif</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="show_price" checked={form.show_price} onChange={handleChange} className="w-4 h-4 accent-brand-gold" />
              <span className="text-gray-600 dark:text-zinc-300 text-sm">Afficher les prix</span>
            </label>
          </div>
        </div>

        {/* Conditionnements */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900 dark:text-brand-cream font-bold">Conditionnements</h2>
            <button type="button" onClick={() => setPackagings((p) => [...p, { volume_liters: '', price_gnf: '', sku: '' }])}
              className="btn-secondary text-sm py-2 px-3">
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          </div>
          <div className="space-y-3">
            {packagings.map((pkg, i) => (
              <div key={i} className="p-3 bg-gray-100 dark:bg-zinc-800 rounded-lg border border-gray-300 dark:border-zinc-700 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-zinc-400 mb-1">Volume (L)</label>
                    <input type="number" step="0.1" min="0.1" value={pkg.volume_liters}
                      onChange={(e) => setPackagings((p) => p.map((x, j) => j === i ? { ...x, volume_liters: e.target.value } : x))}
                      placeholder="Ex: 5"
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-600 rounded-lg px-3 py-2 text-gray-900 dark:text-brand-cream text-sm focus:border-brand-gold focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-zinc-400 mb-1">Prix (GNF)</label>
                    <input type="number" min="0" value={pkg.price_gnf}
                      onChange={(e) => setPackagings((p) => p.map((x, j) => j === i ? { ...x, price_gnf: e.target.value } : x))}
                      placeholder="Ex: 395000"
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-600 rounded-lg px-3 py-2 text-gray-900 dark:text-brand-cream text-sm focus:border-brand-gold focus:outline-none" />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 dark:text-zinc-400 mb-1">SKU</label>
                      <input type="text" value={pkg.sku}
                        onChange={(e) => setPackagings((p) => p.map((x, j) => j === i ? { ...x, sku: e.target.value } : x))}
                        placeholder="Ex: SM7-5L"
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-600 rounded-lg px-3 py-2 text-gray-900 dark:text-brand-cream text-sm focus:border-brand-gold focus:outline-none" />
                    </div>
                    <button type="button" onClick={() => setPackagings((p) => p.filter((_, j) => j !== i))}
                      className="mt-5 p-2 text-gray-500 dark:text-zinc-500 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {/* Photo du conditionnement */}
                <div className="flex items-center gap-3">
                  {pkg.image_url ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-zinc-600 shrink-0">
                      <Image src={pkg.image_url} alt={`${pkg.volume_liters}L`} fill className="object-cover" />
                      <button type="button" onClick={() => setPackagings((p) => p.map((x, j) => j === i ? { ...x, image_url: '' } : x))}
                        className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-white dark:bg-zinc-900 border border-dashed border-zinc-600 shrink-0 flex items-center justify-center">
                      <ImagePlus className="w-5 h-5 text-gray-400 dark:text-zinc-600" />
                    </div>
                  )}
                  <label className={`flex items-center gap-1.5 cursor-pointer text-xs text-gray-500 dark:text-zinc-400 hover:text-brand-gold transition-colors ${pkg.uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {pkg.uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
                    {pkg.uploading ? 'Upload...' : pkg.image_url ? 'Changer la photo' : 'Ajouter une photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePackagingImageUpload(e, i)} disabled={pkg.uploading} />
                  </label>
                </div>
              </div>
            ))}
            {packagings.length === 0 && (
              <p className="text-gray-500 dark:text-zinc-500 text-sm text-center py-4">Aucun conditionnement. Cliquez sur "Ajouter".</p>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
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

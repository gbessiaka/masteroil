'use client'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import Link from 'next/link'
import { ProductCategory, ProductType } from '@/types'
import { MOCK_PRODUCTS } from '@/lib/mockData'

interface PackagingForm {
  id?: string
  volume_liters: string
  price_gnf: string
  sku: string
}

interface ProductForm {
  name: string
  category: ProductCategory
  description: string
  viscosity: string
  type: ProductType | ''
  is_active: boolean
  show_price: boolean
}

const initialForm: ProductForm = {
  name: '',
  category: 'automobile',
  description: '',
  viscosity: '',
  type: '',
  is_active: true,
  show_price: true,
}

export default function AdminProductEditPage() {
  const params = useParams()
  const id = params.id as string
  const isNew = id === 'new'
  const router = useRouter()

  const existingProduct = !isNew ? MOCK_PRODUCTS.find((p) => p.id === id) : null

  const [form, setForm] = useState<ProductForm>(
    existingProduct
      ? {
          name: existingProduct.name,
          category: existingProduct.category as ProductCategory,
          description: existingProduct.description || '',
          viscosity: existingProduct.viscosity || '',
          type: (existingProduct.type as ProductType) || '',
          is_active: existingProduct.is_active,
          show_price: existingProduct.show_price,
        }
      : initialForm
  )
  const [packagings, setPackagings] = useState<PackagingForm[]>(
    existingProduct?.packagings?.map((p) => ({
      id: p.id,
      volume_liters: String(p.volume_liters),
      price_gnf: String(p.price_gnf),
      sku: p.sku || '',
    })) || []
  )
  const [loading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const addPackaging = () => {
    setPackagings((prev) => [
      ...prev,
      { volume_liters: '', price_gnf: '', sku: '' },
    ])
  }

  const removePackaging = (index: number) => {
    setPackagings((prev) => prev.filter((_, i) => i !== index))
  }

  const updatePackaging = (index: number, field: keyof PackagingForm, value: string) => {
    setPackagings((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    )
  }

  const handleSave = () => {
    setError('')
    if (!form.name.trim()) {
      setError('Le nom du produit est requis')
      return
    }
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      router.push('/admin/produits')
    }, 800)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-zinc-400">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/produits"
          className="text-zinc-400 hover:text-brand-cream transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-brand-cream">
            {isNew ? 'Nouveau produit' : 'Modifier le produit'}
          </h1>
          <p className="text-zinc-500 text-sm">
            {isNew ? 'Créer un nouveau produit dans le catalogue' : form.name}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Infos de base */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-brand-cream font-bold mb-4">Informations générales</h2>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Nom du produit <span className="text-brand-gold">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ex: Super M7 5W-30 Full Synthétique"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-brand-cream placeholder-zinc-500 focus:border-brand-gold focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Catégorie</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-brand-cream focus:border-brand-gold focus:outline-none"
              >
                <option value="automobile">Automobile</option>
                <option value="industriel">Industriel</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-brand-cream focus:border-brand-gold focus:outline-none"
              >
                <option value="">— Non spécifié —</option>
                <option value="synthetique">100% Synthétique</option>
                <option value="semi-synthetique">Semi-Synthétique</option>
                <option value="mineral">Minérale</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Viscosité</label>
            <input
              name="viscosity"
              value={form.viscosity}
              onChange={handleChange}
              placeholder="Ex: 5W-30"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-brand-cream placeholder-zinc-500 focus:border-brand-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Description du produit, caractéristiques, usages recommandés..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-brand-cream placeholder-zinc-500 focus:border-brand-gold focus:outline-none resize-none"
            />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="w-4 h-4 accent-brand-gold"
              />
              <span className="text-zinc-300 text-sm">Produit actif (visible sur le site)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="show_price"
                checked={form.show_price}
                onChange={handleChange}
                className="w-4 h-4 accent-brand-gold"
              />
              <span className="text-zinc-300 text-sm">Afficher les prix</span>
            </label>
          </div>
        </div>

        {/* Packagings */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-brand-cream font-bold">Conditionnements</h2>
            <button
              type="button"
              onClick={addPackaging}
              className="btn-secondary text-sm py-2 px-3"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </div>
          <div className="space-y-3">
            {packagings.map((pkg, i) => (
              <div
                key={i}
                className="grid grid-cols-3 gap-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700"
              >
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Volume (L)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={pkg.volume_liters}
                    onChange={(e) => updatePackaging(i, 'volume_liters', e.target.value)}
                    placeholder="Ex: 4"
                    className="w-full bg-zinc-900 border border-zinc-600 rounded-lg px-3 py-2 text-brand-cream text-sm focus:border-brand-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Prix (GNF)</label>
                  <input
                    type="number"
                    min="0"
                    value={pkg.price_gnf}
                    onChange={(e) => updatePackaging(i, 'price_gnf', e.target.value)}
                    placeholder="Ex: 320000"
                    className="w-full bg-zinc-900 border border-zinc-600 rounded-lg px-3 py-2 text-brand-cream text-sm focus:border-brand-gold focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-zinc-400 mb-1">SKU</label>
                    <input
                      type="text"
                      value={pkg.sku}
                      onChange={(e) => updatePackaging(i, 'sku', e.target.value)}
                      placeholder="Ex: SM7-4L"
                      className="w-full bg-zinc-900 border border-zinc-600 rounded-lg px-3 py-2 text-brand-cream text-sm focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePackaging(i)}
                    className="mt-5 p-2 text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {packagings.length === 0 && (
              <p className="text-zinc-500 text-sm text-center py-4">
                Aucun conditionnement. Cliquez sur &ldquo;Ajouter&rdquo; pour en créer un.
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <Link href="/admin/produits" className="btn-secondary flex-1 justify-center py-3">
            Annuler
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex-1 justify-center py-3 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

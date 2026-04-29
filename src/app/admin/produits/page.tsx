'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Loader2, Package, Star, Check } from 'lucide-react'
import Image from 'next/image'
import { formatGNF } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import { useAdminProfile } from '@/hooks/useAdminProfile'

interface Packaging { id: string; volume_liters: number; price_gnf: number; sku: string }
interface Product {
  id: string; name: string; category: string; description: string
  viscosity: string; type: string; is_active: boolean; show_price: boolean
  image_url: string | null
  packagings: Packaging[]
}
interface FeaturedSlot {
  position: number
  product_id: string | null
  products: { id: string; name: string; image_url: string | null } | null
}

const typeLabel: Record<string, string> = {
  synthetique: 'Synthétique',
  'semi-synthetique': 'Semi-Synthétique',
  mineral: 'Minérale',
}

async function getToken() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

/* ── Best-sellers section ── */
function BestSellersSection({ products }: { products: Product[] }) {
  const [slots, setSlots] = useState<FeaturedSlot[]>([])
  const [saving, setSaving] = useState<number | null>(null)
  const [saved, setSaved] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const activeProducts = products.filter((p) => p.is_active)

  const fetchSlots = useCallback(async () => {
    const res = await fetch('/api/admin/featured')
    if (res.ok) setSlots(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchSlots() }, [fetchSlots])

  async function updateSlot(position: number, product_id: string) {
    setSaving(position)
    const token = await getToken()
    await fetch('/api/admin/featured', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ position, product_id: product_id || null }),
    })
    await fetchSlots()
    setSaving(null)
    setSaved(position)
    setTimeout(() => setSaved(null), 2000)
  }

  if (loading) return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm dark:shadow-none p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-4 h-4 text-brand-gold" />
        <h2 className="text-gray-900 dark:text-brand-cream font-bold text-sm">Produits mis en avant (Best-sellers)</h2>
      </div>
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 text-brand-gold animate-spin" />
      </div>
    </div>
  )

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm dark:shadow-none p-5 mb-8">
      <div className="flex items-center gap-2 mb-1">
        <Star className="w-4 h-4 text-brand-gold fill-brand-gold" />
        <h2 className="text-gray-900 dark:text-brand-cream font-bold text-sm">Produits mis en avant</h2>
        <span className="text-xs text-gray-400 dark:text-zinc-500 ml-1">— affichés en best-sellers sur la page d'accueil</span>
      </div>
      <p className="text-xs text-gray-400 dark:text-zinc-500 mb-5">Choisissez exactement 3 produits à mettre en avant.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((pos) => {
          const slot = slots.find((s) => s.position === pos)
          const currentId = slot?.product_id ?? ''
          const currentProduct = slot?.products

          return (
            <div key={pos} className="border border-gray-200 dark:border-zinc-700 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wide">Slot {pos}</span>
                {saved === pos && (
                  <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-semibold">
                    <Check className="w-3 h-3" /> Enregistré
                  </span>
                )}
              </div>

              {/* Current product preview */}
              {currentProduct ? (
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 overflow-hidden shrink-0">
                    {currentProduct.image_url ? (
                      <Image src={currentProduct.image_url} alt={currentProduct.name} fill className="object-contain p-1" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-300 dark:text-zinc-600" />
                      </div>
                    )}
                  </div>
                  <p className="text-gray-900 dark:text-brand-cream text-xs font-semibold leading-snug line-clamp-2 flex-1">{currentProduct.name}</p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-zinc-800 border border-dashed border-gray-300 dark:border-zinc-600 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-gray-300 dark:text-zinc-600" />
                  </div>
                  <p className="text-gray-400 dark:text-zinc-500 text-xs italic">Aucun produit sélectionné</p>
                </div>
              )}

              {/* Selector */}
              <div className="relative">
                <select
                  value={currentId}
                  onChange={(e) => updateSlot(pos, e.target.value)}
                  disabled={saving === pos}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-gray-900 dark:text-brand-cream text-xs focus:border-brand-gold focus:outline-none pr-8 disabled:opacity-60"
                >
                  <option value="">— Choisir un produit —</option>
                  {activeProducts.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}{p.viscosity ? ` (${p.viscosity})` : ''}</option>
                  ))}
                </select>
                {saving === pos && (
                  <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-gold animate-spin pointer-events-none" />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Main page ── */
export default function AdminProduitsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { profile } = useAdminProfile()
  const isSuperAdmin = profile?.role === 'super_admin'

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*, packagings(*)')
        .order('created_at', { ascending: false })
      setProducts(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-brand-cream mb-1">Produits</h1>
          <p className="text-gray-500 dark:text-zinc-400 text-sm">{products.length} produit(s) dans le catalogue</p>
        </div>
        <Link href="/admin/produits/new" className="btn-primary text-sm py-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nouveau produit</span>
          <span className="sm:hidden">Nouveau</span>
        </Link>
      </div>

      {/* Best-sellers section — super admin only */}
      {isSuperAdmin && !loading && <BestSellersSection products={products} />}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-brand-gold animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-zinc-500 mb-4">Aucun produit pour l'instant.</p>
          <Link href="/admin/produits/new" className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> Créer le premier produit
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => {
            const minPrice = product.packagings?.length
              ? Math.min(...product.packagings.map((p) => p.price_gnf))
              : null

            return (
              <div
                key={product.id}
                className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm dark:shadow-none overflow-hidden flex flex-col group"
              >
                <div className="relative w-full aspect-[4/3] bg-gray-50 dark:bg-zinc-800 border-b border-gray-100 dark:border-zinc-800 overflow-hidden">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-200 dark:text-zinc-700" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant={product.is_active ? 'green' : 'red'}>
                      {product.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col flex-1 p-4">
                  <div className="mb-3">
                    <h3 className="text-gray-900 dark:text-brand-cream font-bold text-sm leading-snug mb-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant={product.category === 'automobile' ? 'gold' : 'blue'}>
                        {product.category}
                      </Badge>
                      {product.viscosity && (
                        <span className="text-xs font-mono bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 px-2 py-0.5 rounded">
                          {product.viscosity}
                        </span>
                      )}
                    </div>
                  </div>

                  {product.type && (
                    <p className="text-xs text-gray-400 dark:text-zinc-500 mb-3">
                      {typeLabel[product.type] || product.type}
                    </p>
                  )}

                  {product.packagings?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.packagings
                        .sort((a, b) => a.volume_liters - b.volume_liters)
                        .map((pkg) => (
                          <span
                            key={pkg.id}
                            className="text-xs font-mono bg-brand-gold/10 dark:bg-brand-gold/10 border border-brand-gold/25 text-brand-gold px-2 py-0.5 rounded"
                          >
                            {pkg.volume_liters}L
                          </span>
                        ))}
                    </div>
                  )}

                  <div className="flex-1" />

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-zinc-800 mt-2">
                    <div>
                      {product.show_price && minPrice ? (
                        <div>
                          <p className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase tracking-wide">À partir de</p>
                          <p className="text-brand-gold font-black text-sm">{formatGNF(minPrice)}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 dark:text-zinc-500">Prix sur demande</p>
                      )}
                    </div>
                    <Link
                      href={`/admin/produits/${product.id}`}
                      className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-zinc-400 hover:text-brand-gold dark:hover:text-brand-gold transition-colors bg-gray-100 dark:bg-zinc-800 hover:bg-brand-gold/10 dark:hover:bg-brand-gold/10 px-3 py-1.5 rounded-lg"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Modifier
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

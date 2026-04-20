'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Loader2 } from 'lucide-react'
import { formatGNF } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'

interface Packaging { id: string; volume_liters: number; price_gnf: number; sku: string }
interface Product {
  id: string; name: string; category: string; description: string
  viscosity: string; type: string; is_active: boolean; show_price: boolean
  packagings: Packaging[]
}

const typeLabel: Record<string, string> = {
  synthetique: 'Synthétique',
  'semi-synthetique': 'Semi-Synt.',
  mineral: 'Minérale',
}

export default function AdminProduitsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

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
          <h1 className="text-xl sm:text-2xl font-black text-brand-cream mb-1">Produits</h1>
          <p className="text-zinc-400 text-sm">{products.length} produit(s) dans le catalogue</p>
        </div>
        <Link href="/admin/produits/new" className="btn-primary text-sm py-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nouveau produit</span>
          <span className="sm:hidden">Nouveau</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-brand-gold animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500 mb-4">Aucun produit pour l'instant.</p>
          <Link href="/admin/produits/new" className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> Créer le premier produit
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="md:hidden space-y-2">
            {products.map((product) => (
              <div key={product.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="text-brand-cream text-sm font-semibold">{product.name}</p>
                    {product.description && <p className="text-zinc-500 text-xs mt-0.5 line-clamp-1">{product.description}</p>}
                  </div>
                  <Badge variant={product.is_active ? 'green' : 'red'}>{product.is_active ? 'Actif' : 'Inactif'}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant={product.category === 'automobile' ? 'gold' : 'blue'}>{product.category}</Badge>
                  {product.viscosity && <span className="text-zinc-300 text-xs font-mono bg-zinc-800 px-2 py-0.5 rounded">{product.viscosity}</span>}
                  {product.type && <span className="text-zinc-500 text-xs">{typeLabel[product.type] || product.type}</span>}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {(product.packagings || []).map((pkg) => (
                      <span key={pkg.id} className="text-xs bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded font-mono">{pkg.volume_liters}L</span>
                    ))}
                  </div>
                  <Link href={`/admin/produits/${product.id}`} className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-brand-gold transition-colors text-sm font-medium">
                    <Pencil className="w-4 h-4" />Modifier
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Produit</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Viscosité / Type</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Conditionnements</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Prix</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Statut</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-brand-cream text-sm font-semibold">{product.name}</p>
                      {product.description && <p className="text-zinc-500 text-xs mt-0.5 line-clamp-1 max-w-xs">{product.description}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-zinc-300 text-sm font-mono">{product.viscosity || '—'}</p>
                      {product.type && <p className="text-zinc-500 text-xs mt-0.5">{typeLabel[product.type]}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(product.packagings || []).map((pkg) => (
                          <span key={pkg.id} className="text-xs bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded font-mono">{pkg.volume_liters}L</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {product.show_price && product.packagings?.length > 0 ? (
                        <span className="text-brand-gold text-xs font-semibold">
                          À partir de {formatGNF(Math.min(...product.packagings.map((p) => p.price_gnf)))}
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-xs">Sur demande</span>
                      )}
                    </td>
                    <td className="px-6 py-4"><Badge variant={product.is_active ? 'green' : 'red'}>{product.is_active ? 'Actif' : 'Inactif'}</Badge></td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/produits/${product.id}`} className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-brand-gold transition-colors text-sm font-medium">
                        <Pencil className="w-4 h-4" />Modifier
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

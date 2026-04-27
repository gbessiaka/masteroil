'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Loader2, Package } from 'lucide-react'
import Image from 'next/image'
import { formatGNF } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'

interface Packaging { id: string; volume_liters: number; price_gnf: number; sku: string }
interface Product {
  id: string; name: string; category: string; description: string
  viscosity: string; type: string; is_active: boolean; show_price: boolean
  image_url: string | null
  packagings: Packaging[]
}

const typeLabel: Record<string, string> = {
  synthetique: 'Synthétique',
  'semi-synthetique': 'Semi-Synthétique',
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
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-brand-cream mb-1">Produits</h1>
          <p className="text-gray-500 dark:text-zinc-400 text-sm">{products.length} produit(s) dans le catalogue</p>
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
                {/* Image */}
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
                  {/* Status badge overlay */}
                  <div className="absolute top-3 right-3">
                    <Badge variant={product.is_active ? 'green' : 'red'}>
                      {product.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-4">
                  {/* Name + category */}
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

                  {/* Type */}
                  {product.type && (
                    <p className="text-xs text-gray-400 dark:text-zinc-500 mb-3">
                      {typeLabel[product.type] || product.type}
                    </p>
                  )}

                  {/* Packagings */}
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

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Footer: price + edit */}
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

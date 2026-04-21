'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ProductCard from './ProductCard'

interface Packaging {
  id: string
  product_id: string
  volume_liters: number
  price_gnf: number
  sku: string | null
  image_url: string | null
  created_at: string
}

interface Product {
  id: string
  name: string
  category: string
  description: string | null
  viscosity: string | null
  type: string | null
  image_url: string | null
  is_active: boolean
  show_price: boolean
  created_at: string
  updated_at: string
  packagings: Packaging[]
  stockTotal: number
}

interface Props {
  initialProducts: Product[]
  initialStockMap: Record<string, number>
}

export default function ProductsClient({ initialProducts, initialStockMap }: Props) {
  const [stockMap, setStockMap] = useState<Record<string, number>>(initialStockMap)
  const [categoryFilter, setCategoryFilter] = useState<string>('tous')
  const [viscosityFilter, setViscosityFilter] = useState<string>('tous')

  // Catégories et viscosités uniques
  const categories = ['tous', ...Array.from(new Set(initialProducts.map((p) => p.category).filter(Boolean)))]
  const viscosities = ['tous', ...Array.from(new Set(initialProducts.map((p) => p.viscosity).filter(Boolean) as string[]))]

  // Realtime stock
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`stock-public-${Math.random()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_movements' }, () => {
        // Recharge le stock depuis la DB
        supabase
          .from('stock_movements')
          .select('packaging_id, type, quantity')
          .then(({ data }) => {
            const map: Record<string, number> = {}
            for (const mv of data ?? []) {
              if (!map[mv.packaging_id]) map[mv.packaging_id] = 0
              if (mv.type === 'in') map[mv.packaging_id] += mv.quantity
              else if (mv.type === 'out') map[mv.packaging_id] -= mv.quantity
              else map[mv.packaging_id] = mv.quantity
            }
            setStockMap(map)
          })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // Stock total par produit depuis stockMap
  // Si aucun mouvement enregistré pour le produit → stock inconnu → on assume disponible (999)
  // Si des mouvements existent → on utilise le vrai solde
  const products = initialProducts.map((p) => {
    const hasMovements = p.packagings.some((pkg) => stockMap[pkg.id] !== undefined)
    const stockTotal = hasMovements
      ? p.packagings.reduce((sum, pkg) => sum + (stockMap[pkg.id] ?? 0), 0)
      : 999
    return { ...p, stockTotal }
  })

  // Filtrage
  const filtered = products.filter((p) => {
    if (categoryFilter !== 'tous' && p.category !== categoryFilter) return false
    if (viscosityFilter !== 'tous' && p.viscosity !== viscosityFilter) return false
    return true
  })

  if (filtered.length === 0 && initialProducts.length === 0) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden animate-pulse">
            <div className="w-full h-44 lg:h-56 bg-gray-100" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-100 rounded-full w-3/4" />
              <div className="h-3 bg-gray-100 rounded-full w-1/2" />
              <div className="h-3 bg-gray-100 rounded-full w-full" />
              <div className="h-3 bg-gray-100 rounded-full w-2/3" />
              <div className="h-10 bg-gray-100 rounded-xl mt-4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {filtered.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

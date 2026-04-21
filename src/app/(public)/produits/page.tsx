import { createClient } from '@/lib/supabase/server'
import ProductsClient from '@/components/products/ProductsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Catalogue Produits',
  description:
    "Gamme complète d'huiles moteur synthétiques Super M7 : 0W-20, 5W-20, 5W-30, 5W-40. Disponibles en 1L, 4L et 5L à Conakry, Guinée.",
  keywords: [
    'catalogue huile moteur guinée',
    'super m7 5w30 conakry',
    'super m7 5w40 guinée',
    'huile synthétique prix guinée',
    'acheter huile moteur conakry',
  ],
  openGraph: {
    title: 'Catalogue Produits — Master Oil Guinée',
    description:
      "Huiles moteur synthétiques Super M7 : 0W-20, 5W-20, 5W-30, 5W-40. Disponibles en 1L, 4L et 5L.",
    url: 'https://www.masteroilguinee.com/produits',
  },
  alternates: {
    canonical: 'https://www.masteroilguinee.com/produits',
  },
}

export default async function ProduitsPage() {
  const supabase = createClient()

  const [{ data: products }, { data: movements }] = await Promise.all([
    supabase
      .from('products')
      .select('*, packagings(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('stock_movements')
      .select('packaging_id, type, quantity'),
  ])

  // Calcul du stock initial par packaging
  const stockMap: Record<string, number> = {}
  for (const mv of movements ?? []) {
    if (!stockMap[mv.packaging_id]) stockMap[mv.packaging_id] = 0
    if (mv.type === 'in') stockMap[mv.packaging_id] += mv.quantity
    else if (mv.type === 'out') stockMap[mv.packaging_id] -= mv.quantity
    else stockMap[mv.packaging_id] = mv.quantity
  }

  const productsWithStock = (products ?? []).map((p) => ({
    ...p,
    stockTotal: (p.packagings ?? []).reduce(
      (sum: number, pkg: any) => sum + (stockMap[pkg.id] ?? 0),
      0
    ),
  }))

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="section-subtitle">Notre gamme</p>
          <h1 className="section-title">Catalogue de produits</h1>
          <div className="gold-line mb-4" />
          <p className="text-gray-500 max-w-xl">
            Huiles moteur synthétiques canadiennes Super M7, importées directement,
            disponibles à Conakry.
          </p>
        </div>

        <ProductsClient
          initialProducts={productsWithStock}
          initialStockMap={stockMap}
        />
      </div>
    </div>
  )
}

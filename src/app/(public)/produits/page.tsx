import { createClient } from '@/lib/supabase/server'
import ProductsClient from '@/components/products/ProductsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Huiles Moteur Super M7 en Guinée | 5W-30, 5W-40, 0W-20',
  description:
    "Achetez les huiles moteur synthétiques Super M7 en Guinée : 0W-20, 5W-20, 5W-30, 5W-40. Lubrifiant moteur canadien disponible en 1L, 4L et 5L à Conakry.",
  keywords: [
    'huile moteur guinée prix',
    'acheter huile moteur conakry',
    'lubrifiant moteur super m7',
    'super m7 5w30 guinée',
    'super m7 5w40 conakry',
    'huile synthétique 5w30 guinée',
    'lubrifiant moteur guinée',
    'lubrifiant canadien guinée',
  ],
  openGraph: {
    title: 'Huiles Moteur Super M7 — 5W-30, 5W-40, 0W-20 | Master Oil Guinée',
    description:
      "Achetez les huiles moteur synthétiques Super M7 en Guinée : 0W-20, 5W-20, 5W-30, 5W-40. Disponibles en 1L, 4L et 5L à Conakry.",
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
          <h1 className="section-title">Huiles Moteur Synthétiques Super M7 en Guinée</h1>
          <div className="gold-line mb-4" />
          <p className="text-gray-500 max-w-xl">
            Lubrifiants moteur canadiens Super M7 — 5W-30, 5W-40, 0W-20 — importés directement,
            disponibles en 1L, 4L et 5L à Conakry.
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

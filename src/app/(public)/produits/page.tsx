import ProductCard from '@/components/products/ProductCard'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Catalogue Produits | Master Oil Guinée',
  description:
    "Gamme complète d'huiles moteur synthétiques Super M7. Disponibles en 1L, 4L, 5L à Conakry.",
}

export default async function ProduitsPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select('*, packagings(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const products = data ?? []

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}

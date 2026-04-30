import Link from 'next/link'
import Image from 'next/image'
import { MessageCircle, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getWhatsAppLink } from '@/lib/utils'
import CommanderButton from '@/components/products/CommanderButton'

export default async function FeaturedProducts() {
  const supabase = createClient()

  // Load featured slots
  const { data: featuredRaw } = await supabase
    .from('featured_products')
    .select('position, product_id')
    .order('position')

  const featured = (featuredRaw ?? []) as { position: number; product_id: string | null }[]
  const productIds = featured.map((f) => f.product_id).filter(Boolean) as string[]

  let products: any[] = []

  if (productIds.length > 0) {
    const { data } = await supabase
      .from('products')
      .select('*, packagings(*)')
      .in('id', productIds)
      .eq('is_active', true)

    // Respect the slot order defined by the admin
    const map = Object.fromEntries((data ?? []).map((p: any) => [p.id, p]))
    products = productIds.map((id) => map[id]).filter(Boolean)
  }

  // Fallback: last 3 active products if no featured slots configured
  if (products.length === 0) {
    const { data } = await supabase
      .from('products')
      .select('*, packagings(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(3)
    products = data ?? []
  }

  return (
    <section className="py-14 sm:py-20 bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <p className="section-subtitle">Notre gamme</p>
            <h2 className="section-title mb-0">Nos Best-sellers en Guinée</h2>
            <div className="gold-line mt-3" />
          </div>
          <Link href="/produits" className="text-brand-gold hover:text-brand-gold-dark font-semibold flex items-center gap-2 transition-colors text-sm">
            Voir tout le catalogue <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((p) => {
            const packagings = (p.packagings ?? []).sort((a: any, b: any) => a.volume_liters - b.volume_liters)
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-brand-gold/30 transition-all group flex flex-col overflow-hidden">
                <div className="flex justify-between items-center px-5 pt-5 mb-3">
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
                    {p.type === 'synthetique' ? '100% Synthétique' : p.type === 'semi-synthetique' ? 'Semi-Synthétique' : p.type === 'mineral' ? 'Minérale' : ''}
                  </span>
                  {p.viscosity && (
                    <span className="text-gray-400 text-xs font-mono border border-gray-200 px-2 py-1 rounded bg-gray-50">
                      {p.viscosity}
                    </span>
                  )}
                </div>

                <div className="mx-5 h-52 sm:h-56 rounded-xl mb-4 overflow-hidden relative bg-white border border-gray-100 flex items-center justify-center">
                  {p.image_url ? (
                    <Image
                      src={p.image_url}
                      alt={p.name}
                      fill
                      className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg=="
                    />
                  ) : (
                    <span className="text-6xl">🛢️</span>
                  )}
                </div>

                <div className="px-5 pb-5 flex flex-col flex-1">
                  <h3 className="text-gray-900 font-black text-lg mb-3">{p.name}</h3>
                  {p.description && (
                    <p className="text-gray-500 text-sm leading-relaxed mb-5 flex-1 line-clamp-3">{p.description}</p>
                  )}
                  <div className="flex flex-col gap-2 mt-auto">
                    <CommanderButton packagings={packagings} showPrice={p.show_price} productName={p.name} />
                    <div className="flex gap-2">
                      <Link href={`/produits/${p.id}`} className="btn-secondary flex-1 text-sm py-2 justify-center">
                        Voir le produit
                      </Link>
                      <a
                        href={getWhatsAppLink(`Bonjour, je souhaite des informations sur : ${p.name}${p.viscosity ? ` (${p.viscosity})` : ''}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-500 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

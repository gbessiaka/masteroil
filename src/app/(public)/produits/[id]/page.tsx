import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { formatGNF, getWhatsAppLink } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import CommanderButton from '@/components/products/CommanderButton'
import type { Metadata } from 'next'

interface Props {
  params: { id: string }
}

const typeLabel: Record<string, string> = {
  synthetique: '100% Synthétique',
  'semi-synthetique': 'Semi-Synthétique',
  mineral: 'Minérale',
}

async function getProduct(id: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select('*, packagings(*)')
    .eq('id', id)
    .eq('is_active', true)
    .single()
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.id)
  if (!product) return { title: 'Produit non trouvé' }
  const description = product.description
    || `${product.name} — huile moteur synthétique Super M7 disponible en 1L, 4L et 5L à Conakry, Guinée.`
  const url = `https://www.masteroilguinee.com/produits/${params.id}`
  return {
    title: product.name,
    description,
    keywords: [
      product.name,
      product.viscosity,
      'huile moteur guinée',
      'super m7',
      'lubrifiant conakry',
    ].filter(Boolean) as string[],
    openGraph: {
      title: `${product.name} — Master Oil Guinée`,
      description,
      url,
      images: product.image_url ? [{ url: product.image_url, alt: product.name }] : undefined,
    },
    alternates: { canonical: url },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProduct(params.id)
  if (!product) notFound()

  const packagings = (product.packagings ?? []).sort((a: any, b: any) => a.volume_liters - b.volume_liters)
  const minPrice = packagings.length > 0 ? Math.min(...packagings.map((p: any) => p.price_gnf)) : null

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/produits" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Retour au catalogue
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Image */}
          <div className="w-full aspect-square bg-white rounded-2xl overflow-hidden relative flex items-center justify-center border border-gray-200 shadow-sm">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-contain p-8"
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg=="
                priority
              />
            ) : (
              <span className="text-8xl">🛢️</span>
            )}
          </div>

          {/* Info */}
          <div>
            {product.viscosity && (
              <span className="inline-block text-gray-500 text-xs font-mono bg-gray-100 px-3 py-1 rounded-full mb-3">
                {product.viscosity}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
              {product.name}
            </h1>

            {product.type && (
              <p className="text-gray-500 text-sm mb-4">{typeLabel[product.type] || product.type}</p>
            )}

            {product.description && (
              <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>
            )}

            {/* Prix */}
            {product.show_price && minPrice !== null && (
              <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 mb-6 inline-block">
                <p className="text-gray-500 text-xs mb-0.5">À partir de</p>
                <p className="text-gray-900 font-black text-2xl">{formatGNF(minPrice)}</p>
              </div>
            )}

            {/* Conditionnements */}
            {packagings.length > 0 && (
              <div className="mb-6">
                <h3 className="text-gray-700 font-bold text-sm mb-3">Formats disponibles</h3>
                <div className="grid grid-cols-3 gap-3">
                  {packagings.map((pkg: any) => (
                    <div key={pkg.id} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                      <p className="text-gray-900 font-black text-lg">{pkg.volume_liters}L</p>
                      {product.show_price && (
                        <p className="text-gray-600 text-xs font-semibold mt-1">{formatGNF(pkg.price_gnf)}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <CommanderButton packagings={packagings} showPrice={product.show_price} productName={product.name} />
              <a
                href={getWhatsAppLink(`Bonjour, je souhaite commander : ${product.name}${product.viscosity ? ` (${product.viscosity})` : ''}. Pouvez-vous me donner votre disponibilité et vos tarifs ?`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex-1 justify-center py-4"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </a>
            </div>

            {!product.show_price && (
              <p className="text-gray-400 text-xs mt-3 text-center">Prix sur demande. Contactez-nous pour un devis.</p>
            )}
          </div>
        </div>

        {/* Infos bas */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Livraison', text: 'Livraison disponible à Conakry et dans les principales villes de Guinée.' },
            { title: 'Authenticité', text: 'Produit 100% authentique importé directement du fabricant canadien Canada Master Oil.' },
            { title: 'Volume / B2B', text: 'Tarifs préférentiels pour les commandes en gros. Contactez-nous pour un partenariat.' },
          ].map((item) => (
            <div key={item.title} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-gray-900 font-bold mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

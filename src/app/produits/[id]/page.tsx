import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { formatGNF, getWhatsAppLink } from '@/lib/utils'
import StockIndicator from '@/components/ui/StockIndicator'
import Badge from '@/components/ui/Badge'
import { MOCK_PRODUCTS } from '@/lib/mockData'
import type { Metadata } from 'next'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = MOCK_PRODUCTS.find((p) => p.id === params.id)
  if (!product) return { title: 'Produit non trouvé | Master Oil Guinée' }
  return {
    title: `${product.name} | Master Oil Guinée`,
    description:
      product.description ||
      `${product.name}, huile moteur synthétique Super M7 disponible à Conakry.`,
  }
}

export default function ProductDetailPage({ params }: Props) {
  const product = MOCK_PRODUCTS.find((p) => p.id === params.id)
  if (!product) notFound()

  const totalStock = product.stockTotal ?? 999

  const typeLabel: Record<string, string> = {
    synthetique: '100% Synthétique',
    'semi-synthetique': 'Semi-Synthétique',
    mineral: 'Minérale',
  }

  return (
    <div className="min-h-screen bg-brand-black pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/produits"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-brand-gold transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au catalogue
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="w-full aspect-square bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl overflow-hidden relative flex items-center justify-center border border-zinc-700">
            {product.image_url ? (
              <Image src={product.image_url} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="text-center">
                <div className="text-8xl mb-4">🛢️</div>
                <span className="text-brand-gold text-xl font-black">Super M7</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-start gap-3 mb-4 flex-wrap">
              <Badge variant={product.category === 'automobile' ? 'gold' : 'blue'}>
                {product.category === 'automobile' ? 'Automobile' : product.category}
              </Badge>
              {product.viscosity && (
                <span className="text-zinc-400 text-sm font-mono bg-zinc-800 px-3 py-1 rounded-full border border-zinc-700">
                  {product.viscosity}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-brand-cream mb-2">
              {product.name}
            </h1>

            {product.type && (
              <p className="text-brand-gold text-lg font-semibold mb-4">
                {typeLabel[product.type] || product.type}
              </p>
            )}

            <div className="mb-6">
              <StockIndicator quantity={totalStock} />
            </div>

            {product.description && (
              <p className="text-zinc-300 leading-relaxed mb-8">{product.description}</p>
            )}

            {/* Packagings */}
            {product.packagings && product.packagings.length > 0 && (
              <div className="mb-8">
                <h3 className="text-brand-cream font-bold text-sm uppercase tracking-wide mb-4">
                  Conditionnements disponibles
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {product.packagings
                    .sort((a, b) => a.volume_liters - b.volume_liters)
                    .map((pkg) => (
                      <div
                        key={pkg.id}
                        className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-center hover:border-brand-gold/40 transition-colors"
                      >
                        <p className="text-brand-cream font-black text-lg">{pkg.volume_liters}L</p>
                        {product.show_price && (
                          <p className="text-brand-gold text-sm font-semibold mt-1">
                            {formatGNF(pkg.price_gnf)}
                          </p>
                        )}
                        {pkg.sku && (
                          <p className="text-zinc-600 text-xs mt-1 font-mono">{pkg.sku}</p>
                        )}
                        <div className="mt-2">
                          <StockIndicator quantity={totalStock > 0 ? 50 : 0} />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={getWhatsAppLink(
                  `Bonjour, je souhaite commander : ${product.name}${product.viscosity ? ` (${product.viscosity})` : ''}. Pouvez-vous me donner votre disponibilité et vos tarifs ?`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex-1 justify-center py-4"
              >
                <MessageCircle className="w-5 h-5" />
                Commander sur WhatsApp
              </a>
            </div>

            {!product.show_price && (
              <p className="text-zinc-500 text-xs mt-3 text-center">
                Prix sur demande. Contactez-nous pour un devis personnalisé.
              </p>
            )}
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-dark">
            <h3 className="text-brand-gold font-bold mb-2">Livraison</h3>
            <p className="text-zinc-400 text-sm">
              Livraison disponible à Conakry et dans les principales villes de Guinée.
              Délai selon stock disponible.
            </p>
          </div>
          <div className="card-dark">
            <h3 className="text-brand-gold font-bold mb-2">Authenticité</h3>
            <p className="text-zinc-400 text-sm">
              Produit 100% authentique importé directement du fabricant canadien Canada
              Master Oil. Garantie d&apos;origine.
            </p>
          </div>
          <div className="card-dark">
            <h3 className="text-brand-gold font-bold mb-2">Volume / B2B</h3>
            <p className="text-zinc-400 text-sm">
              Tarifs préférentiels pour les commandes en gros. Contactez-nous pour un
              partenariat commercial.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

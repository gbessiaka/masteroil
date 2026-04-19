import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/types'
import { formatGNF, getWhatsAppLink } from '@/lib/utils'
import StockIndicator from '@/components/ui/StockIndicator'
import Badge from '@/components/ui/Badge'
import { MessageCircle, Eye } from 'lucide-react'

interface ProductCardProps {
  product: Product & { stockTotal?: number }
}

export default function ProductCard({ product }: ProductCardProps) {
  const stockQty = product.stockTotal ?? 999
  const minPrice =
    product.packagings && product.packagings.length > 0
      ? Math.min(...product.packagings.map((p) => p.price_gnf))
      : null

  return (
    <div className="card-dark hover:border-brand-gold/30 transition-all duration-300 group flex flex-col">
      {/* Image */}
      <div className="w-full h-52 bg-white rounded-xl mb-4 overflow-hidden relative flex items-center justify-center border border-gray-200">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-contain p-3" />
        ) : (
          <div className="text-center">
            <div className="text-5xl mb-2">🛢️</div>
            <span className="text-brand-gold text-xs font-bold">Super M7</span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge variant={product.category === 'automobile' ? 'gold' : 'blue'}>
            {product.category === 'automobile' ? 'Auto' : product.category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-brand-cream font-black text-base leading-tight group-hover:text-brand-gold transition-colors">
            {product.name}
          </h3>
          {product.viscosity && (
            <span className="text-zinc-500 text-xs font-mono bg-zinc-800 px-2 py-1 rounded shrink-0">
              {product.viscosity}
            </span>
          )}
        </div>

        {product.type && (
          <p className="text-brand-gold text-sm font-semibold mb-3">
            {product.type === 'synthetique' ? '100% Synthétique' : product.type === 'semi-synthetique' ? 'Semi-Synthétique' : 'Minérale'}
          </p>
        )}

        {product.description && (
          <p className="text-zinc-400 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
            {product.description}
          </p>
        )}

        {/* Packagings */}
        {product.packagings && product.packagings.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {product.packagings.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-zinc-800 rounded-lg px-2 py-1 text-center min-w-[56px]"
              >
                <p className="text-zinc-300 text-xs font-bold">{pkg.volume_liters}L</p>
                {product.show_price && (
                  <p className="text-brand-gold text-xs">{formatGNF(pkg.price_gnf)}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stock + Price */}
        <div className="flex items-center justify-between mb-4">
          <StockIndicator quantity={stockQty} />
          {product.show_price && minPrice !== null && (
            <span className="text-zinc-400 text-xs">
              À partir de{' '}
              <span className="text-brand-gold font-bold">{formatGNF(minPrice)}</span>
            </span>
          )}
        </div>

        {/* CTAs */}
        <div className="flex gap-2 mt-auto">
          <a
            href={getWhatsAppLink(`Bonjour, je souhaite un devis pour : ${product.name}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 btn-primary text-sm py-2 justify-center"
          >
            <MessageCircle className="w-4 h-4" />
            Devis
          </a>
          <Link href={`/produits/${product.id}`} className="btn-secondary text-sm py-2 px-3">
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

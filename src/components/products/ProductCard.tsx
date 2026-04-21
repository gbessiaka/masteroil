'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Product } from '@/types'
import { formatGNF } from '@/lib/utils'
import StockIndicator from '@/components/ui/StockIndicator'
import Badge from '@/components/ui/Badge'
import { ShoppingCart, Eye, X, Check } from 'lucide-react'

interface ProductCardProps {
  product: Product & { stockTotal?: number }
}

function fmtGNF(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' GNF'
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null)
  const [added, setAdded] = useState(false)

  const stockQty = product.stockTotal ?? 999
  const minPrice =
    product.packagings && product.packagings.length > 0
      ? Math.min(...product.packagings.map((p) => p.price_gnf))
      : null

  function handleCommander() {
    if (!product.packagings || product.packagings.length === 0) {
      router.push('/commande')
      return
    }
    if (product.packagings.length === 1) {
      addToCartAndRedirect(product.packagings[0].id)
      return
    }
    setSelectedPkg(product.packagings[0].id)
    setModalOpen(true)
  }

  function addToCartAndRedirect(pkgId: string) {
    const cart = JSON.parse(sessionStorage.getItem('commande_cart') || '[]')
    const existing = cart.find((i: any) => i.packaging_id === pkgId)
    if (existing) {
      existing.quantity += 1
    } else {
      cart.push({ packaging_id: pkgId, quantity: 1 })
    }
    sessionStorage.setItem('commande_cart', JSON.stringify(cart))
    setAdded(true)
    setTimeout(() => {
      setModalOpen(false)
      setAdded(false)
      router.push('/commande')
    }, 600)
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden">
        {/* Image */}
        <div className="w-full h-44 lg:h-56 bg-gray-50 relative flex items-center justify-center border-b border-gray-100">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-contain p-4"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg=="
            />
          ) : (
            <span className="text-6xl">🛢️</span>
          )}
        </div>

        {/* Contenu */}
        <div className="flex-1 flex flex-col p-4 lg:p-5">
          {/* Titre + viscosité */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-gray-900 font-black text-sm lg:text-base leading-tight">
              {product.name}
            </h3>
            {product.viscosity && (
              <span className="text-gray-400 text-xs font-mono bg-gray-100 px-2 py-0.5 rounded shrink-0">
                {product.viscosity}
              </span>
            )}
          </div>

          {/* Type */}
          {product.type && (
            <span className="inline-block text-gray-500 text-xs bg-gray-100 px-2 py-0.5 rounded-full w-fit mb-2">
              {product.type === 'synthetique' ? '100% Synthétique' : product.type === 'semi-synthetique' ? 'Semi-Synthétique' : 'Minérale'}
            </span>
          )}

          {/* Description */}
          {product.description && (
            <p className="text-gray-800 text-xs lg:text-sm leading-relaxed mb-3 line-clamp-2 flex-1">
              {product.description}
            </p>
          )}

          {/* Formats disponibles */}
          {product.packagings && product.packagings.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {product.packagings.map((pkg) => (
                <span key={pkg.id} className="text-xs text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded font-medium">
                  {pkg.volume_liters}L
                </span>
              ))}
            </div>
          )}

          {/* Prix */}
          {product.show_price && minPrice !== null && (
            <p className="text-gray-900 font-black text-sm lg:text-base mb-2">
              <span className="text-gray-400 font-normal text-xs">À partir de </span>
              {formatGNF(minPrice)}
            </p>
          )}

          {/* Stock */}
          {stockQty <= 0 && (
            <p className="text-red-500 text-xs font-semibold mb-2">Rupture de stock</p>
          )}

          {/* CTAs */}
          <div className="flex gap-2 mt-auto">
            <button
              onClick={handleCommander}
              disabled={stockQty <= 0}
              className="flex-1 min-w-0 btn-primary text-xs py-2.5 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Commander</span>
            </button>
            <Link
              href={`/produits/${product.id}`}
              className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-brand-gold hover:border-brand-gold transition-colors"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Modal sélection format */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div className="bg-zinc-900 border border-zinc-800 sm:rounded-2xl rounded-t-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-brand-cream font-black text-lg">{product.name}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-zinc-400 text-sm mb-5">Choisissez un format</p>

            <div className="space-y-2 mb-5">
              {product.packagings!.map((pkg) => (
                <button key={pkg.id} onClick={() => setSelectedPkg(pkg.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                    selectedPkg === pkg.id
                      ? 'border-brand-gold bg-brand-gold/10 text-brand-cream'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                  }`}>
                  <span className="font-semibold">{pkg.volume_liters}L</span>
                  <div className="flex items-center gap-3">
                    {product.show_price && <span className="text-brand-gold font-bold text-sm">{fmtGNF(pkg.price_gnf)}</span>}
                    {selectedPkg === pkg.id && <Check className="w-4 h-4 text-brand-gold" />}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => selectedPkg && addToCartAndRedirect(selectedPkg)}
              disabled={!selectedPkg || added}
              className="w-full bg-brand-gold text-zinc-950 font-black py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 text-sm">
              {added ? <><Check className="w-4 h-4" /> Ajouté !</> : <><ShoppingCart className="w-4 h-4" /> Ajouter au panier</>}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

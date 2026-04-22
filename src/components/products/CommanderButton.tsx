'use client'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { ShoppingCart, X, Check } from 'lucide-react'

interface Packaging {
  id: string
  volume_liters: number
  price_gnf: number
}

interface CommanderButtonProps {
  packagings: Packaging[]
  showPrice: boolean
  productName: string
}

function fmtGNF(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' GNF'
}

export default function CommanderButton({ packagings, showPrice, productName }: CommanderButtonProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPkg, setSelectedPkg] = useState<string | null>(packagings[0]?.id ?? null)
  const [added, setAdded] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  function handleCommander() {
    if (packagings.length === 0) { router.push('/commande'); return }
    if (packagings.length === 1) { addToCartAndRedirect(packagings[0].id); return }
    setModalOpen(true)
  }

  function addToCartAndRedirect(pkgId: string) {
    const cart = JSON.parse(sessionStorage.getItem('commande_cart') || '[]')
    const existing = cart.find((i: any) => i.packaging_id === pkgId)
    if (existing) { existing.quantity += 1 } else { cart.push({ packaging_id: pkgId, quantity: 1 }) }
    sessionStorage.setItem('commande_cart', JSON.stringify(cart))
    setAdded(true)
    setTimeout(() => { setModalOpen(false); setAdded(false); router.push('/commande') }, 600)
  }

  return (
    <>
      <button onClick={handleCommander} className="btn-primary flex-1 justify-center py-4">
        <ShoppingCart className="w-5 h-5" />
        Commander
      </button>

      {mounted && modalOpen && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}
        >
          <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-gray-900 font-black text-lg">{productName}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-500 text-sm mb-5">Choisissez un format</p>
            <div className="space-y-2 mb-5">
              {packagings.map((pkg) => (
                <button key={pkg.id} onClick={() => setSelectedPkg(pkg.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                    selectedPkg === pkg.id
                      ? 'border-brand-gold bg-amber-50 text-gray-900'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                  }`}>
                  <span className="font-semibold">{pkg.volume_liters}L</span>
                  <div className="flex items-center gap-3">
                    {showPrice && <span className="text-brand-gold font-bold text-sm">{fmtGNF(pkg.price_gnf)}</span>}
                    {selectedPkg === pkg.id && <Check className="w-4 h-4 text-brand-gold" />}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => selectedPkg && addToCartAndRedirect(selectedPkg)}
              disabled={!selectedPkg || added}
              className="w-full bg-brand-gold text-white font-black py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-gold-dark transition-all disabled:opacity-50 text-sm">
              {added ? <><Check className="w-4 h-4" /> Ajouté !</> : <><ShoppingCart className="w-4 h-4" /> Ajouter au panier</>}
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

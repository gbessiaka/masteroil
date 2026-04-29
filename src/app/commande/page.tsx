'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Minus, Trash2, Loader2, ShoppingCart, ChevronRight, ArrowLeft, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LOGO_URL } from '@/lib/mockData'

interface Packaging {
  id: string
  volume_liters: number
  price_gnf: number
  sku: string | null
  image_url: string | null
  product_id: string
  product: { name: string; description: string | null; image_url: string | null }
}

interface ProductGroup {
  product_id: string
  product_name: string
  product_image: string | null
  packagings: Packaging[]
}

interface CartItem {
  packaging: Packaging
  quantity: number
}

function fmtGNF(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' GNF'
}

export default function CommandePage() {
  const router = useRouter()
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<'products' | 'info'>('products')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [recapOpen, setRecapOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let savedCartEntries: { packaging_id: string; quantity: number }[] = []
    try {
      const saved = sessionStorage.getItem('commande_cart')
      if (saved) savedCartEntries = JSON.parse(saved)
    } catch {}

    const supabase = createClient()
    supabase
      .from('packagings')
      .select('id, product_id, volume_liters, price_gnf, sku, image_url, product:products(name, description, image_url, display_order, is_active)')
      .order('volume_liters')
      .then(({ data }) => {
        const pkgs = (data ?? []).filter((pkg: any) => pkg.product?.is_active !== false)
        const map: Record<string, ProductGroup> = {}
        for (const pkg of pkgs) {
          if (!map[pkg.product_id]) {
            map[pkg.product_id] = {
              product_id: pkg.product_id,
              product_name: pkg.product?.name ?? '—',
              product_image: pkg.product?.image_url ?? null,
              packagings: [],
            }
          }
          map[pkg.product_id].packagings.push(pkg)
        }
        // Sort groups by display_order then by product name as fallback
        const groups = Object.values(map).sort((a: any, b: any) => {
          const orderA = pkgs.find((p: any) => p.product_id === a.product_id)?.product?.display_order ?? 0
          const orderB = pkgs.find((p: any) => p.product_id === b.product_id)?.product?.display_order ?? 0
          return orderA - orderB
        })
        setProductGroups(groups)

        if (savedCartEntries.length > 0) {
          const preCart: CartItem[] = []
          for (const entry of savedCartEntries) {
            const pkg = pkgs.find((p) => p.id === entry.packaging_id)
            if (pkg && entry.quantity > 0) preCart.push({ packaging: pkg, quantity: entry.quantity })
          }
          if (preCart.length > 0) {
            setCart(preCart)
            sessionStorage.removeItem('commande_cart')
          }
        }

        setLoading(false)
      })
  }, [])

  function addToCart(pkg: Packaging) {
    setCart((prev) => {
      const existing = prev.find((i) => i.packaging.id === pkg.id)
      if (existing) return prev.map((i) => i.packaging.id === pkg.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { packaging: pkg, quantity: 1 }]
    })
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) => prev
      .map((i) => i.packaging.id === id ? { ...i, quantity: i.quantity + delta } : i)
      .filter((i) => i.quantity > 0)
    )
  }

  const total = cart.reduce((s, i) => s + i.packaging.price_gnf * i.quantity, 0)
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Veuillez entrer votre nom'); return }
    if (!phone.trim()) { setError('Veuillez entrer votre numéro de téléphone'); return }
    if (!address.trim()) { setError('Veuillez entrer votre adresse de livraison'); return }
    if (cart.length === 0) { setError('Votre panier est vide'); return }

    setSaving(true)

    const res = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), phone: phone.trim(), address: address.trim(), notes: notes.trim(), cart, total }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Une erreur est survenue'); setSaving(false); return }

    const orderId = data.orderId

    fetch('/api/orders/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderId,
        clientName: name.trim(),
        clientPhone: phone.trim(),
        clientAddress: address.trim(),
        totalGnf: total,
        items: cart.map((i) => ({
          name: i.packaging.product?.name ?? '',
          volume: i.packaging.volume_liters,
          quantity: i.quantity,
          price: i.packaging.price_gnf,
        })),
      }),
    }).catch(() => {})

    setSaving(false)
    router.push(`/commande/confirmation?order=${orderId}&name=${encodeURIComponent(name.trim())}`)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-brand-gold animate-spin" />
    </div>
  )

  /* ── Panier sidebar (desktop) ── */
  const CartSidebar = () => (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-20 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart className="w-4 h-4 text-brand-gold" />
        <h2 className="text-gray-900 font-bold text-sm">Panier</h2>
        {totalItems > 0 && (
          <span className="ml-auto bg-brand-gold text-white text-xs font-black px-2 py-0.5 rounded-full">{totalItems}</span>
        )}
      </div>

      {cart.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-6">Votre panier est vide</p>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {cart.map((item) => (
              <div key={item.packaging.id} className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-800 text-xs font-medium truncate">{item.packaging.product?.name}</p>
                  <p className="text-gray-400 text-xs">{item.packaging.volume_liters}L</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => updateQty(item.packaging.id, -1)}
                    className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                    {item.quantity === 1 ? <Trash2 className="w-2.5 h-2.5 text-red-400" /> : <Minus className="w-2.5 h-2.5" />}
                  </button>
                  <span className="text-gray-900 font-black text-sm w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item.packaging.id, 1)}
                    className="w-6 h-6 rounded-full bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold hover:bg-brand-gold/20 transition-colors">
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
                <span className="text-gray-700 text-xs font-semibold shrink-0 w-24 text-right">
                  {fmtGNF(item.packaging.price_gnf * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm font-semibold">Total</span>
              <span className="text-gray-900 font-black text-lg">{fmtGNF(total)}</span>
            </div>
          </div>
          <button onClick={() => setStep('info')}
            className="w-full btn-primary py-3 justify-center text-sm">
            Commander
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 shrink-0">
              <Image src={LOGO_URL} alt="Master Oil" fill className="object-contain" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-brand-gold font-black text-sm">MASTER OIL</span>
              <span className="text-gray-900 font-black text-sm">GUINÉE</span>
            </div>
          </Link>

          {/* Indicateur d'étapes */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold">
            <span className={step === 'products' ? 'text-brand-gold' : 'text-gray-400'}>
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full mr-1.5 text-[10px] font-black ${step === 'products' ? 'bg-brand-gold text-white' : 'bg-gray-200 text-gray-500'}`}>1</span>
              Produits
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className={step === 'info' ? 'text-brand-gold' : 'text-gray-400'}>
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full mr-1.5 text-[10px] font-black ${step === 'info' ? 'bg-brand-gold text-white' : 'bg-gray-200 text-gray-500'}`}>2</span>
              Informations
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-300">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full mr-1.5 text-[10px] font-black bg-gray-200 text-gray-400">3</span>
              Confirmation
            </span>
          </div>
          {cart.length > 0 && step === 'products' && (
            <button onClick={() => setStep('info')}
              className="md:hidden flex items-center gap-1.5 text-gray-500 text-sm">
              <ShoppingCart className="w-4 h-4" />
              <span className="text-brand-gold font-bold">{fmtGNF(total)}</span>
            </button>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        {step === 'products' ? (
          <div className="flex gap-8">
            {/* Colonne produits */}
            <div className="flex-1 min-w-0">
              <div className="mb-6">
                <Link href="/produits" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-4 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Retour au catalogue
                </Link>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Passer une commande</h1>
                <p className="text-gray-500 text-sm mt-1">Sélectionnez vos produits et quantités</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-28 md:mb-8">
                {productGroups.flatMap((group) =>
                  group.packagings.map((pkg) => {
                    const cartItem = cart.find((i) => i.packaging.id === pkg.id)
                    const imgSrc = pkg.image_url || group.product_image
                    return (
                      <div key={pkg.id} className={`bg-white border rounded-2xl overflow-hidden flex flex-col transition-all shadow-sm ${cartItem ? 'border-brand-gold shadow-brand-gold/10' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className="relative w-full aspect-square bg-gray-50">
                          {imgSrc ? (
                            <Image src={imgSrc} alt={`${group.product_name} ${pkg.volume_liters}L`} fill className="object-contain p-3" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-gray-300 font-mono text-2xl font-black">{pkg.volume_liters}L</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3 flex flex-col flex-1">
                          <p className="text-gray-900 font-bold text-xs sm:text-sm leading-snug line-clamp-2 mb-1">{group.product_name}</p>
                          <p className="text-gray-400 text-xs font-mono mb-2">{pkg.volume_liters}L</p>
                          <p className="text-gray-900 font-black text-sm mb-3">{fmtGNF(pkg.price_gnf)}</p>
                          {cartItem ? (
                            <div className="flex items-center justify-between mt-auto">
                              <button onClick={() => updateQty(pkg.id, -1)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:bg-gray-300 transition-colors">
                                {cartItem.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-400" /> : <Minus className="w-3.5 h-3.5" />}
                              </button>
                              <span className="text-gray-900 font-black text-lg">{cartItem.quantity}</span>
                              <button onClick={() => updateQty(pkg.id, 1)}
                                className="w-8 h-8 rounded-full bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold hover:bg-brand-gold/20 active:bg-brand-gold/30 transition-colors">
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => addToCart(pkg)}
                              className="mt-auto w-full btn-primary text-xs py-2 justify-center">
                              Ajouter
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Panier sidebar desktop */}
            <div className="hidden md:block w-72 shrink-0">
              <CartSidebar />
            </div>
          </div>
        ) : (
          /* ── Étape 2 : infos client ── */
          <div className="max-w-2xl mx-auto">
            <button onClick={() => setStep('products')} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Retour aux produits
            </button>

            {/* Récap mobile collapsible */}
            <div className="md:hidden bg-white border border-gray-200 rounded-2xl mb-6 shadow-sm overflow-hidden">
              <button
                onClick={() => setRecapOpen(!recapOpen)}
                className="w-full flex items-center justify-between px-5 py-4"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-brand-gold" />
                  <span className="text-gray-900 font-semibold text-sm">{totalItems} article{totalItems > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 font-black">{fmtGNF(total)}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${recapOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>
              {recapOpen && (
                <div className="px-5 pb-4 border-t border-gray-100 pt-3 space-y-3">
                  {cart.map((item) => (
                    <div key={item.packaging.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-gray-800 text-sm font-medium truncate">{item.packaging.product?.name}</p>
                        <p className="text-gray-400 text-xs">{item.packaging.volume_liters}L × {item.quantity}</p>
                      </div>
                      <span className="text-gray-700 text-sm font-semibold shrink-0">{fmtGNF(item.packaging.price_gnf * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="md:grid md:grid-cols-2 md:gap-8">
              {/* Récap desktop */}
              <div className="hidden md:block">
                <h2 className="text-gray-900 font-black text-xl mb-4">Récapitulatif</h2>
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.packaging.id} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-gray-800 text-sm font-medium truncate">{item.packaging.product?.name}</p>
                          <p className="text-gray-400 text-xs">{item.packaging.volume_liters}L × {item.quantity}</p>
                        </div>
                        <span className="text-gray-700 text-sm font-semibold shrink-0">{fmtGNF(item.packaging.price_gnf * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 mt-4 pt-4 flex items-center justify-between">
                    <span className="text-gray-500 font-semibold">Total</span>
                    <span className="text-gray-900 font-black text-xl">{fmtGNF(total)}</span>
                  </div>
                </div>
              </div>

              {/* Formulaire */}
              <div>
                <h2 className="text-gray-900 font-black text-xl mb-4">Vos informations</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet <span className="text-brand-gold">*</span></label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                      placeholder="Ex: Moustapha Camara"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-brand-gold focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone <span className="text-brand-gold">*</span></label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
                      placeholder="+224 6XX XX XX XX"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-brand-gold focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse de livraison <span className="text-brand-gold">*</span></label>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required
                      placeholder="Quartier, commune, point de repère..."
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-brand-gold focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Remarques <span className="text-gray-400 font-normal">(optionnel)</span></label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                      placeholder="Précisions supplémentaires..."
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-brand-gold focus:outline-none text-sm resize-none" />
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <button type="submit" disabled={saving}
                    className="w-full btn-primary py-4 justify-center disabled:opacity-50 text-base">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmer la commande'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Barre panier mobile fixe en bas */}
      {cart.length > 0 && step === 'products' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3 shadow-lg">
          <button onClick={() => setStep('info')}
            className="w-full btn-primary py-3.5 justify-between px-5">
            <span>{totalItems} article{totalItems > 1 ? 's' : ''}</span>
            <span className="flex items-center gap-2">{fmtGNF(total)}<ChevronRight className="w-5 h-5" /></span>
          </button>
        </div>
      )}
    </div>
  )
}

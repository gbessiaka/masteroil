'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Minus, Trash2, Loader2, ShoppingCart, ChevronRight, ArrowLeft } from 'lucide-react'
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
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Read synchronously before async fetch so the closure captures it even
    // if sessionStorage is cleared by a concurrent effect (React Strict Mode)
    let savedCartEntries: { packaging_id: string; quantity: number }[] = []
    try {
      const saved = sessionStorage.getItem('commande_cart')
      if (saved) savedCartEntries = JSON.parse(saved)
    } catch {}

    const supabase = createClient()
    supabase
      .from('packagings')
      .select('id, product_id, volume_liters, price_gnf, sku, image_url, product:products(name, description, image_url)')
      .order('volume_liters')
      .then(({ data }) => {
        const pkgs = data ?? []
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
        setProductGroups(Object.values(map))

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
    if (cart.length === 0) { setError('Votre panier est vide'); return }

    setSaving(true)
    const supabase = createClient()

    let clientId: string
    const { data: existing } = await supabase.from('clients').select('id').eq('phone', phone.trim()).maybeSingle()
    if (existing) {
      clientId = existing.id
      await supabase.from('clients').update({ name: name.trim() }).eq('id', clientId)
    } else {
      const { data: newClient, error: clientErr } = await supabase
        .from('clients').insert({ name: name.trim(), phone: phone.trim(), client_type: 'particulier' })
        .select('id').single()
      if (clientErr || !newClient) { setError('Erreur lors de la création du client'); setSaving(false); return }
      clientId = newClient.id
    }

    const { data: order, error: orderErr } = await supabase
      .from('orders').insert({ client_id: clientId, status: 'nouveau', total_gnf: total, notes: notes || null })
      .select('id').single()
    if (orderErr || !order) { setError('Erreur lors de la création de la commande'); setSaving(false); return }

    const { error: itemsErr } = await supabase.from('order_items').insert(
      cart.map((i) => ({ order_id: order.id, packaging_id: i.packaging.id, quantity: i.quantity, unit_price_gnf: i.packaging.price_gnf }))
    )
    if (itemsErr) { setError("Erreur lors de l'enregistrement des articles"); setSaving(false); return }

    setSaving(false)
    router.push(`/commande/confirmation?order=${order.id}&name=${encodeURIComponent(name.trim())}`)
  }

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-brand-gold animate-spin" />
    </div>
  )

  /* ── Panier sidebar (desktop) ── */
  const CartSidebar = () => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sticky top-20">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart className="w-4 h-4 text-brand-gold" />
        <h2 className="text-brand-cream font-bold text-sm">Panier</h2>
        {totalItems > 0 && (
          <span className="ml-auto bg-brand-gold text-zinc-950 text-xs font-black px-2 py-0.5 rounded-full">{totalItems}</span>
        )}
      </div>

      {cart.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-6">Votre panier est vide</p>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {cart.map((item) => (
              <div key={item.packaging.id} className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-brand-cream text-xs font-medium truncate">{item.packaging.product?.name}</p>
                  <p className="text-zinc-500 text-xs">{item.packaging.volume_liters}L</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => updateQty(item.packaging.id, -1)}
                    className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-700 transition-colors">
                    {item.quantity === 1 ? <Trash2 className="w-2.5 h-2.5 text-red-400" /> : <Minus className="w-2.5 h-2.5" />}
                  </button>
                  <span className="text-brand-cream font-black text-sm w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item.packaging.id, 1)}
                    className="w-6 h-6 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold hover:bg-brand-gold/30 transition-colors">
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
                <span className="text-brand-gold text-xs font-semibold shrink-0 w-24 text-right">
                  {fmtGNF(item.packaging.price_gnf * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-zinc-800 pt-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm font-semibold">Total</span>
              <span className="text-brand-gold font-black text-lg">{fmtGNF(total)}</span>
            </div>
          </div>
          <button onClick={() => setStep('info')}
            className="w-full bg-brand-gold text-zinc-950 font-black py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-sm">
            Commander
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 shrink-0">
              <Image src={LOGO_URL} alt="Master Oil" fill className="object-contain" />
            </div>
            <span className="text-brand-gold font-black text-sm">MASTER OIL</span>
            <span className="text-zinc-600 hidden sm:inline text-xs ml-1">— Commande en ligne</span>
          </div>
          {/* Panier résumé mobile */}
          {cart.length > 0 && step === 'products' && (
            <button onClick={() => setStep('info')}
              className="md:hidden flex items-center gap-1.5 text-zinc-400 text-sm">
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
                <Link href="/produits" className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-brand-cream text-sm mb-4 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Retour au catalogue
                </Link>
                <h1 className="text-2xl sm:text-3xl font-black text-brand-cream">Passer une commande</h1>
                <p className="text-zinc-400 text-sm mt-1">Sélectionnez vos produits et quantités</p>
              </div>

              <div className="space-y-8 mb-28 md:mb-8">
                {productGroups.map((group) => (
                  <div key={group.product_id}>
                    <h2 className="text-brand-cream font-black text-lg mb-3 pb-2 border-b border-zinc-800">{group.product_name}</h2>
                    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(group.packagings.length, 4)}, minmax(0, 1fr))` }}>
                      {group.packagings.map((pkg) => {
                        const cartItem = cart.find((i) => i.packaging.id === pkg.id)
                        const imgSrc = pkg.image_url || group.product_image
                        return (
                          <div key={pkg.id} className={`bg-zinc-900 border rounded-2xl overflow-hidden flex flex-col transition-all ${cartItem ? 'border-brand-gold/50 shadow-lg shadow-brand-gold/5' : 'border-zinc-800 hover:border-zinc-700'}`}>
                            <div className="relative w-full aspect-square bg-zinc-800">
                              {imgSrc ? (
                                <Image src={imgSrc} alt={`${group.product_name} ${pkg.volume_liters}L`} fill className="object-contain p-4" />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-zinc-600 font-mono text-2xl font-black">{pkg.volume_liters}L</span>
                                </div>
                              )}
                            </div>
                            <div className="p-3 flex flex-col flex-1">
                              <p className="text-zinc-400 text-xs font-mono">{pkg.volume_liters}L</p>
                              <p className="text-brand-gold font-black text-sm mt-0.5 mb-3">{fmtGNF(pkg.price_gnf)}</p>
                              {cartItem ? (
                                <div className="flex items-center justify-between mt-auto">
                                  <button onClick={() => updateQty(pkg.id, -1)}
                                    className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-700 active:bg-zinc-600 transition-colors">
                                    {cartItem.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-400" /> : <Minus className="w-3.5 h-3.5" />}
                                  </button>
                                  <span className="text-brand-cream font-black text-lg">{cartItem.quantity}</span>
                                  <button onClick={() => updateQty(pkg.id, 1)}
                                    className="w-8 h-8 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold hover:bg-brand-gold/30 active:bg-brand-gold/40 transition-colors">
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button onClick={() => addToCart(pkg)}
                                  className="mt-auto w-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-semibold py-2 rounded-xl hover:bg-brand-gold/20 active:bg-brand-gold/20 transition-colors">
                                  Ajouter
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
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
            <button onClick={() => setStep('products')} className="flex items-center gap-1.5 text-zinc-400 hover:text-brand-cream text-sm mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Retour aux produits
            </button>

            <div className="md:grid md:grid-cols-2 md:gap-8">
              {/* Récap */}
              <div>
                <h2 className="text-brand-cream font-black text-xl mb-4">Récapitulatif</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6 md:mb-0">
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.packaging.id} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-brand-cream text-sm font-medium truncate">{item.packaging.product?.name}</p>
                          <p className="text-zinc-500 text-xs">{item.packaging.volume_liters}L × {item.quantity}</p>
                        </div>
                        <span className="text-brand-gold text-sm font-semibold shrink-0">{fmtGNF(item.packaging.price_gnf * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-zinc-800 mt-4 pt-4 flex items-center justify-between">
                    <span className="text-zinc-400 font-semibold">Total</span>
                    <span className="text-brand-gold font-black text-xl">{fmtGNF(total)}</span>
                  </div>
                </div>
              </div>

              {/* Formulaire */}
              <div>
                <h2 className="text-brand-cream font-black text-xl mb-4">Vos informations</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Nom complet <span className="text-brand-gold">*</span></label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                      placeholder="Ex: Mamadou Barry"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-brand-cream placeholder-zinc-500 focus:border-brand-gold focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Téléphone <span className="text-brand-gold">*</span></label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
                      placeholder="+224 6XX XX XX XX"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-brand-cream placeholder-zinc-500 focus:border-brand-gold focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Instructions de livraison <span className="text-zinc-600">(optionnel)</span></label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                      placeholder="Adresse, quartier, précisions..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-brand-cream placeholder-zinc-500 focus:border-brand-gold focus:outline-none text-sm resize-none" />
                  </div>
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <button type="submit" disabled={saving}
                    className="w-full bg-brand-gold text-zinc-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 text-base">
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
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 px-4 py-3">
          <button onClick={() => setStep('info')}
            className="w-full bg-brand-gold text-zinc-950 font-black py-3.5 rounded-xl flex items-center justify-between px-5 active:opacity-90 transition-opacity">
            <span>{totalItems} article{totalItems > 1 ? 's' : ''}</span>
            <span className="flex items-center gap-2">{fmtGNF(total)}<ChevronRight className="w-5 h-5" /></span>
          </button>
        </div>
      )}
    </div>
  )
}

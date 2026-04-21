'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { Plus, Minus, Trash2, Loader2, ShoppingCart, ChevronRight } from 'lucide-react'
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
  const [packagings, setPackagings] = useState<Packaging[]>([])
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
    const supabase = createClient()
    supabase
      .from('packagings')
      .select('id, product_id, volume_liters, price_gnf, sku, image_url, product:products(name, description, image_url)')
      .order('volume_liters')
      .then(({ data }) => {
        const pkgs = data ?? []
        setPackagings(pkgs)

        // Grouper par produit
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

    // Créer ou trouver le client
    let clientId: string
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('phone', phone.trim())
      .maybeSingle()

    if (existing) {
      clientId = existing.id
      // Mettre à jour le nom si changé
      await supabase.from('clients').update({ name: name.trim() }).eq('id', clientId)
    } else {
      const { data: newClient, error: clientErr } = await supabase
        .from('clients')
        .insert({ name: name.trim(), phone: phone.trim(), client_type: 'particulier' })
        .select('id')
        .single()
      if (clientErr || !newClient) { setError('Erreur lors de la création du client'); setSaving(false); return }
      clientId = newClient.id
    }

    // Créer la commande
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({ client_id: clientId, status: 'nouveau', total_gnf: total, notes: notes || null })
      .select('id')
      .single()

    if (orderErr || !order) { setError('Erreur lors de la création de la commande'); setSaving(false); return }

    // Créer les articles
    const { error: itemsErr } = await supabase.from('order_items').insert(
      cart.map((i) => ({
        order_id: order.id,
        packaging_id: i.packaging.id,
        quantity: i.quantity,
        unit_price_gnf: i.packaging.price_gnf,
      }))
    )

    if (itemsErr) { setError('Erreur lors de l\'enregistrement des articles'); setSaving(false); return }

    setSaving(false)
    router.push(`/commande/confirmation?order=${order.id}&name=${encodeURIComponent(name.trim())}`)
  }

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-brand-gold animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 shrink-0">
              <Image src={LOGO_URL} alt="Master Oil" fill className="object-contain" />
            </div>
            <span className="text-brand-gold font-black text-sm">MASTER OIL</span>
          </div>
          {cart.length > 0 && step === 'products' && (
            <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
              <ShoppingCart className="w-4 h-4" />
              <span>{totalItems} article{totalItems > 1 ? 's' : ''}</span>
              <span className="text-brand-gold font-bold ml-1">{fmtGNF(total)}</span>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {step === 'products' ? (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-black text-brand-cream">Passer une commande</h1>
              <p className="text-zinc-400 text-sm mt-1">Sélectionnez vos produits</p>
            </div>

            <div className="space-y-6 mb-24">
              {productGroups.map((group) => (
                <div key={group.product_id}>
                  {/* Nom du produit */}
                  <h2 className="text-brand-cream font-black text-base mb-3">{group.product_name}</h2>
                  {/* Colonnes = conditionnements */}
                  <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(group.packagings.length, 3)}, 1fr)` }}>
                    {group.packagings.map((pkg) => {
                      const cartItem = cart.find((i) => i.packaging.id === pkg.id)
                      const imgSrc = pkg.image_url || group.product_image
                      return (
                        <div key={pkg.id} className={`bg-zinc-900 border rounded-2xl overflow-hidden flex flex-col transition-all ${cartItem ? 'border-brand-gold/50' : 'border-zinc-800'}`}>
                          {/* Image */}
                          <div className="relative w-full aspect-square bg-zinc-800">
                            {imgSrc ? (
                              <Image src={imgSrc} alt={`${group.product_name} ${pkg.volume_liters}L`} fill className="object-contain p-3" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-zinc-600 font-mono text-xl font-black">{pkg.volume_liters}L</span>
                              </div>
                            )}
                          </div>
                          {/* Infos */}
                          <div className="p-2.5 flex flex-col flex-1">
                            <p className="text-zinc-400 text-xs font-mono">{pkg.volume_liters}L</p>
                            <p className="text-brand-gold font-black text-sm mt-0.5 mb-2">{fmtGNF(pkg.price_gnf)}</p>
                            {cartItem ? (
                              <div className="flex items-center justify-between mt-auto">
                                <button onClick={() => updateQty(pkg.id, -1)}
                                  className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 active:bg-zinc-700 transition-colors">
                                  {cartItem.quantity === 1 ? <Trash2 className="w-3 h-3 text-red-400" /> : <Minus className="w-3 h-3" />}
                                </button>
                                <span className="text-brand-cream font-black text-base">{cartItem.quantity}</span>
                                <button onClick={() => updateQty(pkg.id, 1)}
                                  className="w-7 h-7 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold active:bg-brand-gold/30 transition-colors">
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => addToCart(pkg)}
                                className="mt-auto w-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-semibold py-1.5 rounded-lg active:bg-brand-gold/20 transition-colors">
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

            {/* Barre panier fixe en bas */}
            {cart.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 px-4 py-3">
                <div className="max-w-2xl mx-auto">
                  <button onClick={() => setStep('info')}
                    className="w-full bg-brand-gold text-zinc-950 font-black py-3.5 rounded-xl flex items-center justify-between px-5 active:opacity-90 transition-opacity">
                    <span>{totalItems} article{totalItems > 1 ? 's' : ''}</span>
                    <span className="flex items-center gap-2">
                      {fmtGNF(total)}
                      <ChevronRight className="w-5 h-5" />
                    </span>
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-6">
              <button onClick={() => setStep('products')} className="text-zinc-400 hover:text-brand-cream text-sm mb-4 flex items-center gap-1">
                ← Retour
              </button>
              <h1 className="text-2xl font-black text-brand-cream">Vos informations</h1>
              <p className="text-zinc-400 text-sm mt-1">Pour confirmer votre commande</p>
            </div>

            {/* Récap commande */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wide mb-3">Récapitulatif</p>
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.packaging.id} className="flex items-center justify-between">
                    <span className="text-brand-cream text-sm">{item.packaging.product?.name} {item.packaging.volume_liters}L × {item.quantity}</span>
                    <span className="text-brand-gold text-sm font-semibold">{fmtGNF(item.packaging.price_gnf * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-zinc-800 mt-3 pt-3 flex items-center justify-between">
                <span className="text-zinc-400 font-semibold text-sm">Total</span>
                <span className="text-brand-gold font-black text-lg">{fmtGNF(total)}</span>
              </div>
            </div>

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
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                  placeholder="Adresse, quartier, précisions..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-brand-cream placeholder-zinc-500 focus:border-brand-gold focus:outline-none text-sm resize-none" />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button type="submit" disabled={saving}
                className="w-full bg-brand-gold text-zinc-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 active:opacity-90 transition-opacity disabled:opacity-50 text-base mt-2">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmer la commande'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

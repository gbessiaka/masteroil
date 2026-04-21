'use client'
import { useState } from 'react'
import { MapPin, MessageCircle, Phone, Send, CheckCircle2 } from 'lucide-react'
import { getWhatsAppLink } from '@/lib/utils'

type RequestType = 'particulier' | 'garage' | 'entreprise'

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    request_type: 'particulier' as RequestType,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur serveur')
      setSuccess(true)
      setForm({ name: '', phone: '', email: '', message: '', request_type: 'particulier' })
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '224620000000'

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <p className="section-subtitle">Prenons contact</p>
          <h1 className="section-title">Contactez-nous</h1>
          <div className="gold-line mb-4" />
          <p className="text-gray-500 max-w-xl">
            Demande de devis, renseignements sur nos produits, partenariat. Nous répondons
            rapidement, généralement sous 24h.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form */}
          <div className="lg:col-span-2">
            {success ? (
              <div className="card-dark border-green-800 bg-green-900/10 text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-gray-900 font-black text-2xl mb-3">
                  Message envoyé !
                </h2>
                <p className="text-gray-500 mb-6">
                  Nous avons bien reçu votre message et vous répondrons dans les plus brefs
                  délais. Pour une réponse immédiate, contactez-nous sur WhatsApp.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setSuccess(false)}
                    className="btn-secondary justify-center"
                  >
                    Envoyer un autre message
                  </button>
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary justify-center"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card-dark space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-zinc-300 mb-2"
                    >
                      Nom complet <span className="text-brand-gold">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Moustapha Camara"
                      className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-zinc-500 focus:border-brand-gold focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-zinc-300 mb-2"
                    >
                      Téléphone
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+224 6XX XXX XXX"
                      className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-zinc-500 focus:border-brand-gold focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-zinc-300 mb-2"
                  >
                    Adresse email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="exemple@email.com"
                    className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-zinc-500 focus:border-brand-gold focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="request_type"
                    className="block text-sm font-medium text-zinc-300 mb-2"
                  >
                    Type de demande
                  </label>
                  <select
                    id="request_type"
                    name="request_type"
                    value={form.request_type}
                    onChange={handleChange}
                    className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-brand-gold focus:outline-none transition-colors"
                  >
                    <option value="particulier">Particulier</option>
                    <option value="garage">Garage / Atelier mécanique</option>
                    <option value="entreprise">Entreprise / Flotte / Organisation</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-zinc-300 mb-2"
                  >
                    Message <span className="text-brand-gold">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    required
                    placeholder="Décrivez votre besoin : produit souhaité, quantité, fréquence de commande..."
                    className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-zinc-500 focus:border-brand-gold focus:outline-none transition-colors resize-none"
                  />
                </div>

                {error && (
                  <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    'Envoi en cours...'
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Envoyer le message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* WhatsApp */}
            <div className="card-dark">
              <h3 className="text-gray-900 font-bold mb-4">Réponse immédiate</h3>
              <p className="text-gray-500 text-sm mb-4">
                Pour une réponse rapide, contactez-nous directement sur WhatsApp. Nous
                répondons généralement en moins d&apos;une heure.
              </p>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-xl transition-colors w-full justify-center"
              >
                <MessageCircle className="w-5 h-5" />
                Ouvrir WhatsApp
              </a>
            </div>

            {/* Contact info */}
            <div className="card-dark space-y-4">
              <h3 className="text-gray-900 font-bold mb-4">Nos coordonnées</h3>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-gold mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-900 text-sm font-medium">Adresse</p>
                  <p className="text-gray-500 text-sm">Conakry, République de Guinée</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-brand-gold mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-900 text-sm font-medium">Téléphone / WhatsApp</p>
                  <a
                    href={`tel:+${whatsappNumber}`}
                    className="text-gray-500 text-sm hover:text-brand-gold transition-colors"
                  >
                    +{whatsappNumber}
                  </a>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="card-dark">
              <h3 className="text-gray-900 font-bold mb-4">Horaires</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Lundi au Vendredi</span>
                  <span className="text-gray-900">08h à 18h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Samedi</span>
                  <span className="text-gray-900">08h à 13h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Dimanche</span>
                  <span className="text-zinc-500">Fermé</span>
                </div>
              </div>
              <p className="text-zinc-500 text-xs mt-4">
                * WhatsApp disponible 7j/7 pour les urgences
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

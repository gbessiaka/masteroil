'use client'

import { MessageCircle } from 'lucide-react'
import { getWhatsAppLink } from '@/lib/utils'

export function WhatsAppButton() {
  const whatsappLink = getWhatsAppLink()

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter sur WhatsApp"
      className="fixed bottom-6 right-6 z-50 group"
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-green-500 opacity-30 animate-ping" />
      <span className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-pulse-slow" />

      {/* Button */}
      <span className="relative flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-110">
        <MessageCircle size={26} className="text-white" />
      </span>

      {/* Tooltip */}
      <span className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-brand-black text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-dark">
        Commander sur WhatsApp
        <span className="absolute top-full right-4 border-4 border-transparent border-t-brand-black" />
      </span>
    </a>
  )
}

export default WhatsAppButton

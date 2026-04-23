'use client'
import { useEffect } from 'react'

export default function AdminManifest() {
  useEffect(() => {
    const isSubdomain = window.location.hostname.startsWith('admin.')
    const manifestHref = isSubdomain ? '/admin-subdomain-manifest.json' : '/admin-manifest.json'

    // Remplace le manifest public par le manifest admin
    const existing = document.querySelector('link[rel="manifest"]')
    if (existing) {
      existing.setAttribute('href', manifestHref)
    } else {
      const link = document.createElement('link')
      link.rel = 'manifest'
      link.href = manifestHref
      document.head.appendChild(link)
    }
    // Nettoyage : remettre le manifest public quand on quitte l'admin
    return () => {
      const el = document.querySelector('link[rel="manifest"]')
      if (el) el.setAttribute('href', '/manifest.webmanifest')
    }
  }, [])

  return null
}

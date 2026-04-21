import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Master Oil Guinée',
    short_name: 'Master Oil',
    description: "Distributeur exclusif de l'huile moteur synthétique Super M7 en Guinée",
    start_url: '/',
    display: 'standalone',
    background_color: '#FAFAF8',
    theme_color: '#C8952A',
    orientation: 'portrait',
    lang: 'fr',
    categories: ['shopping', 'business'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Commander',
        short_name: 'Commander',
        description: 'Passer une commande rapidement',
        url: '/commande',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Catalogue',
        short_name: 'Produits',
        description: 'Voir tous nos produits',
        url: '/produits',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
    ],
  }
}

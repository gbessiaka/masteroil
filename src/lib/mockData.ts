import { Product, Order, Client, Invoice, StockLevel } from '@/types'

export const PRODUCT_IMAGES = {
  '0w20': '/images/0w20.webp',
  '5w20': '/images/5w20.jpeg',
  '5w30': '/images/5w30.jpeg',
  '5w40': '/images/5w40.jpeg',
}

export const LOGO_URL = 'https://cdn.prod.website-files.com/687c617d655908a58fa33213/687c6867a76c4ca17e574d50_logo-master-oil.avif'

export const MOCK_PRODUCTS: (Product & { stockTotal: number })[] = [
  {
    id: '1',
    name: 'Super M7 5W-30',
    category: 'automobile',
    description:
      "L'équilibre parfait entre performance, protection et polyvalence. Huile moteur 100% synthétique idéale pour la plupart des véhicules modernes essence et diesel. Protège efficacement dans les conditions climatiques extrêmes de la Guinée.",
    viscosity: '5W-30',
    type: 'synthetique',
    image_url: PRODUCT_IMAGES['5w30'],
    is_active: true,
    show_price: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    stockTotal: 120,
    packagings: [
      { id: 'p1', product_id: '1', volume_liters: 1, price_gnf: 85000, sku: 'SM7-5W30-1L', created_at: '2026-01-01T00:00:00Z' },
      { id: 'p2', product_id: '1', volume_liters: 4, price_gnf: 320000, sku: 'SM7-5W30-4L', created_at: '2026-01-01T00:00:00Z' },
      { id: 'p3', product_id: '1', volume_liters: 5, price_gnf: 395000, sku: 'SM7-5W30-5L', created_at: '2026-01-01T00:00:00Z' },
    ],
  },
  {
    id: '2',
    name: 'Super M7 5W-40',
    category: 'automobile',
    description:
      'Conçue pour les conditions les plus exigeantes, offrant une protection renforcée à haute température. Recommandée pour les moteurs turbo, les flottes intensives et les environnements à forte chaleur comme en Guinée.',
    viscosity: '5W-40',
    type: 'synthetique',
    image_url: PRODUCT_IMAGES['5w40'],
    is_active: true,
    show_price: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    stockTotal: 8,
    packagings: [
      { id: 'p4', product_id: '2', volume_liters: 1, price_gnf: 92000, sku: 'SM7-5W40-1L', created_at: '2026-01-01T00:00:00Z' },
      { id: 'p5', product_id: '2', volume_liters: 4, price_gnf: 345000, sku: 'SM7-5W40-4L', created_at: '2026-01-01T00:00:00Z' },
      { id: 'p6', product_id: '2', volume_liters: 5, price_gnf: 425000, sku: 'SM7-5W40-5L', created_at: '2026-01-01T00:00:00Z' },
    ],
  },
  {
    id: '3',
    name: 'Super M7 5W-20',
    category: 'automobile',
    description:
      'Parfaite pour les moteurs récents, alliant fluidité à froid et protection à chaud. Formulation synthétique avancée pour économie de carburant optimale. Certifiée pour les véhicules nécessitant une faible viscosité.',
    viscosity: '5W-20',
    type: 'synthetique',
    image_url: PRODUCT_IMAGES['5w20'],
    is_active: true,
    show_price: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    stockTotal: 45,
    packagings: [
      { id: 'p7', product_id: '3', volume_liters: 1, price_gnf: 90000, sku: 'SM7-5W20-1L', created_at: '2026-01-01T00:00:00Z' },
      { id: 'p8', product_id: '3', volume_liters: 4, price_gnf: 340000, sku: 'SM7-5W20-4L', created_at: '2026-01-01T00:00:00Z' },
      { id: 'p9', product_id: '3', volume_liters: 5, price_gnf: 420000, sku: 'SM7-5W20-5L', created_at: '2026-01-01T00:00:00Z' },
    ],
  },
  {
    id: '4',
    name: 'Super M7 0W-20',
    category: 'automobile',
    description:
      'Idéale pour une économie de carburant maximale et un démarrage à froid ultra rapide. La viscosité la plus faible de la gamme Super M7, conçue pour les moteurs hybrides et les véhicules dernière génération.',
    viscosity: '0W-20',
    type: 'synthetique',
    image_url: PRODUCT_IMAGES['0w20'],
    is_active: true,
    show_price: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    stockTotal: 30,
    packagings: [
      { id: 'p10', product_id: '4', volume_liters: 1, price_gnf: 95000, sku: 'SM7-0W20-1L', created_at: '2026-01-01T00:00:00Z' },
      { id: 'p11', product_id: '4', volume_liters: 4, price_gnf: 360000, sku: 'SM7-0W20-4L', created_at: '2026-01-01T00:00:00Z' },
      { id: 'p12', product_id: '4', volume_liters: 5, price_gnf: 445000, sku: 'SM7-0W20-5L', created_at: '2026-01-01T00:00:00Z' },
    ],
  },
]

export const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'Moustapha Camara', phone: '+224 620 00 01', email: 'moustapha@example.com', client_type: 'particulier', notes: null, created_at: '2026-01-10T08:00:00Z', updated_at: '2026-01-10T08:00:00Z' },
  { id: 'c2', name: 'Garage Central Conakry', phone: '+224 621 00 02', email: null, client_type: 'garage', notes: 'Client régulier', created_at: '2026-01-15T09:00:00Z', updated_at: '2026-01-15T09:00:00Z' },
  { id: 'c3', name: 'Société Minière de Guinée', phone: '+224 622 00 03', email: 'achats@smg.gn', client_type: 'entreprise', notes: 'Commande mensuelle', created_at: '2026-02-01T10:00:00Z', updated_at: '2026-02-01T10:00:00Z' },
  { id: 'c4', name: 'ONG Santé Guinée', phone: '+224 623 00 04', email: null, client_type: 'flotte', notes: '12 véhicules', created_at: '2026-02-20T11:00:00Z', updated_at: '2026-02-20T11:00:00Z' },
]

export const MOCK_ORDERS: (Order & { client?: Client; order_items?: any[] })[] = [
  {
    id: 'o1', client_id: 'c1', status: 'livre', total_gnf: 395000, notes: 'Livré au domicile',
    created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-02T10:00:00Z',
    client: MOCK_CLIENTS[0],
    order_items: [{ id: 'oi1', order_id: 'o1', packaging_id: 'p3', quantity: 1, unit_price_gnf: 395000, created_at: '2026-03-01T10:00:00Z' }],
  },
  {
    id: 'o2', client_id: 'c2', status: 'confirme', total_gnf: 1625000, notes: 'Commande garage',
    created_at: '2026-03-15T09:00:00Z', updated_at: '2026-03-16T09:00:00Z',
    client: MOCK_CLIENTS[1],
    order_items: [
      { id: 'oi2', order_id: 'o2', packaging_id: 'p5', quantity: 5, unit_price_gnf: 265000, created_at: '2026-03-15T09:00:00Z' },
      { id: 'oi3', order_id: 'o2', packaging_id: 'p4', quantity: 5, unit_price_gnf: 70000, created_at: '2026-03-15T09:00:00Z' },
    ],
  },
  {
    id: 'o3', client_id: 'c3', status: 'en_cours', total_gnf: 3950000, notes: null,
    created_at: '2026-03-20T11:00:00Z', updated_at: '2026-03-20T11:00:00Z',
    client: MOCK_CLIENTS[2],
    order_items: [{ id: 'oi4', order_id: 'o3', packaging_id: 'p3', quantity: 10, unit_price_gnf: 395000, created_at: '2026-03-20T11:00:00Z' }],
  },
  {
    id: 'o4', client_id: 'c4', status: 'nouveau', total_gnf: 1680000, notes: 'Flotte ONG',
    created_at: '2026-03-28T14:00:00Z', updated_at: '2026-03-28T14:00:00Z',
    client: MOCK_CLIENTS[3],
    order_items: [
      { id: 'oi5', order_id: 'o4', packaging_id: 'p2', quantity: 4, unit_price_gnf: 320000, created_at: '2026-03-28T14:00:00Z' },
      { id: 'oi6', order_id: 'o4', packaging_id: 'p7', quantity: 4, unit_price_gnf: 90000, created_at: '2026-03-28T14:00:00Z' },
    ],
  },
]

export const MOCK_INVOICES: (Invoice & { order?: typeof MOCK_ORDERS[0] })[] = [
  { id: 'f1', order_id: 'o1', invoice_number: 'MO-2026-0001', status: 'paye', pdf_url: null, created_at: '2026-03-02T10:00:00Z', updated_at: '2026-03-02T10:00:00Z', order: MOCK_ORDERS[0] },
  { id: 'f2', order_id: 'o2', invoice_number: 'MO-2026-0002', status: 'en_attente', pdf_url: null, created_at: '2026-03-16T09:00:00Z', updated_at: '2026-03-16T09:00:00Z', order: MOCK_ORDERS[1] },
]

export const MOCK_STOCK_LEVELS: StockLevel[] = [
  { packaging_id: 'p1', product_id: '1', volume_liters: 1, sku: 'SM7-5W30-1L', product_name: 'Super M7 5W-30', quantity_available: 50 },
  { packaging_id: 'p2', product_id: '1', volume_liters: 4, sku: 'SM7-5W30-4L', product_name: 'Super M7 5W-30', quantity_available: 40 },
  { packaging_id: 'p3', product_id: '1', volume_liters: 5, sku: 'SM7-5W30-5L', product_name: 'Super M7 5W-30', quantity_available: 30 },
  { packaging_id: 'p4', product_id: '2', volume_liters: 1, sku: 'SM7-5W40-1L', product_name: 'Super M7 5W-40', quantity_available: 3 },
  { packaging_id: 'p5', product_id: '2', volume_liters: 4, sku: 'SM7-5W40-4L', product_name: 'Super M7 5W-40', quantity_available: 5 },
  { packaging_id: 'p6', product_id: '2', volume_liters: 5, sku: 'SM7-5W40-5L', product_name: 'Super M7 5W-40', quantity_available: 0 },
  { packaging_id: 'p7', product_id: '3', volume_liters: 1, sku: 'SM7-5W20-1L', product_name: 'Super M7 5W-20', quantity_available: 20 },
  { packaging_id: 'p8', product_id: '3', volume_liters: 4, sku: 'SM7-5W20-4L', product_name: 'Super M7 5W-20', quantity_available: 15 },
  { packaging_id: 'p9', product_id: '3', volume_liters: 5, sku: 'SM7-5W20-5L', product_name: 'Super M7 5W-20', quantity_available: 10 },
  { packaging_id: 'p10', product_id: '4', volume_liters: 1, sku: 'SM7-0W20-1L', product_name: 'Super M7 0W-20', quantity_available: 12 },
  { packaging_id: 'p11', product_id: '4', volume_liters: 4, sku: 'SM7-0W20-4L', product_name: 'Super M7 0W-20', quantity_available: 8 },
  { packaging_id: 'p12', product_id: '4', volume_liters: 5, sku: 'SM7-0W20-5L', product_name: 'Super M7 0W-20', quantity_available: 10 },
]

export const MOCK_MOVEMENTS = [
  { id: 'm1', packaging_id: 'p1', type: 'in', quantity: 100, note: 'Livraison initiale', created_at: '2026-01-05T08:00:00Z', packaging: { volume_liters: 1, product: { name: 'Super M7 5W-30 Full Synthétique' } } },
  { id: 'm2', packaging_id: 'p4', type: 'in', quantity: 50, note: 'Livraison initiale', created_at: '2026-01-05T08:00:00Z', packaging: { volume_liters: 1, product: { name: 'Super M7 10W-40 Semi-Synthétique' } } },
  { id: 'm3', packaging_id: 'p1', type: 'out', quantity: 50, note: 'Ventes janvier', created_at: '2026-01-31T18:00:00Z', packaging: { volume_liters: 1, product: { name: 'Super M7 5W-30 Full Synthétique' } } },
  { id: 'm4', packaging_id: 'p3', type: 'out', quantity: 10, note: 'Commande MO-2026-0001', created_at: '2026-03-02T10:00:00Z', packaging: { volume_liters: 5, product: { name: 'Super M7 5W-30 Full Synthétique' } } },
  { id: 'm5', packaging_id: 'p5', type: 'out', quantity: 5, note: 'Commande MO-2026-0002', created_at: '2026-03-16T09:00:00Z', packaging: { volume_liters: 4, product: { name: 'Super M7 10W-40 Semi-Synthétique' } } },
]

// ============================================================
// Master Oil Guinée SARL — TypeScript Types
// ============================================================

export type OilType = 'synthétique' | 'semi-synthétique' | 'minérale' | 'autre'
export type ClientType = 'particulier' | 'garage' | 'entreprise' | 'flotte'
export type OrderStatus = 'nouveau' | 'en_cours' | 'confirme' | 'livre' | 'annule'
export type InvoiceStatus = 'en_attente' | 'partiel' | 'paye'
export type ContactRequestType = 'particulier' | 'garage' | 'entreprise'
export type StockMovementType = 'entree' | 'sortie' | 'ajustement'

export interface Packaging {
  id: string
  product_id: string
  volume: string
  unite: string
  prix_gnf: number | null
  prix_usd: number | null
  reference: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  nom: string
  slug: string
  description: string | null
  categorie: string
  viscosity: string | null
  oil_type: OilType
  marque: string
  image_url: string | null
  is_active: boolean
  show_price: boolean
  specifications: Record<string, unknown> | null
  created_at: string
  updated_at: string
  packagings?: Packaging[]
}

export interface StockMovement {
  id: string
  packaging_id: string
  type: StockMovementType
  quantite: number
  quantite_avant: number | null
  notes: string | null
  reference_commande: string | null
  created_by: string | null
  created_at: string
}

export interface StockLevel {
  packaging_id: string
  product_id: string
  product_nom: string
  volume: string
  unite: string
  stock_actuel: number
  seuil_alerte: number
}

export interface StockAlert {
  id: string
  packaging_id: string
  seuil_alerte: number
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  nom: string
  prenom: string | null
  email: string | null
  telephone: string | null
  adresse: string | null
  ville: string
  client_type: ClientType
  entreprise_nom: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  packaging_id: string
  quantite: number
  prix_unitaire_gnf: number
  remise_pct: number
  sous_total_gnf: number
  created_at: string
  // Joined
  packaging?: Packaging & { product?: Product }
}

export interface Order {
  id: string
  client_id: string | null
  numero_commande: string | null
  statut: OrderStatus
  date_commande: string
  date_livraison_prevue: string | null
  date_livraison_reelle: string | null
  adresse_livraison: string | null
  notes: string | null
  remise_pct: number
  total_gnf: number | null
  created_at: string
  updated_at: string
  // Joined
  client?: Client
  order_items?: OrderItem[]
}

export interface Invoice {
  id: string
  order_id: string
  client_id: string | null
  numero_facture: string
  statut: InvoiceStatus
  date_emission: string
  date_echeance: string | null
  montant_total_gnf: number
  montant_paye_gnf: number
  notes: string | null
  pdf_url: string | null
  created_at: string
  updated_at: string
  // Joined
  order?: Order
  client?: Client
}

export interface ContactRequest {
  id: string
  nom: string
  prenom: string | null
  email: string | null
  telephone: string | null
  entreprise: string | null
  request_type: ContactRequestType
  sujet: string | null
  message: string
  is_read: boolean
  created_at: string
}

// ============================================================
// Database type for Supabase
// ============================================================

export type Database = {
  public: {
    Tables: {
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'packagings'>
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at' | 'packagings'>>
      }
      packagings: {
        Row: Packaging
        Insert: Omit<Packaging, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Packaging, 'id' | 'created_at' | 'updated_at'>>
      }
      stock_movements: {
        Row: StockMovement
        Insert: Omit<StockMovement, 'id' | 'created_at'>
        Update: Partial<Omit<StockMovement, 'id' | 'created_at'>>
      }
      stock_alerts: {
        Row: StockAlert
        Insert: Omit<StockAlert, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<StockAlert, 'id' | 'created_at' | 'updated_at'>>
      }
      clients: {
        Row: Client
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'client' | 'order_items'>
        Update: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at' | 'client' | 'order_items'>>
      }
      order_items: {
        Row: OrderItem
        Insert: Omit<OrderItem, 'id' | 'created_at' | 'packaging'>
        Update: Partial<Omit<OrderItem, 'id' | 'created_at' | 'packaging'>>
      }
      invoices: {
        Row: Invoice
        Insert: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'order' | 'client'>
        Update: Partial<Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'order' | 'client'>>
      }
      contact_requests: {
        Row: ContactRequest
        Insert: Omit<ContactRequest, 'id' | 'created_at' | 'is_read'>
        Update: Partial<Omit<ContactRequest, 'id' | 'created_at'>>
      }
    }
    Views: {
      stock_levels: {
        Row: StockLevel
      }
    }
  }
}

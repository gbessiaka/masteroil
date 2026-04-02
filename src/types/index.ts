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
    volume_liters?: number
    unite?: string
    prix_gnf?: number | null
    prix_usd?: number | null
    price_gnf?: number | null
    reference?: string | null
    sku?: string | null
    is_active?: boolean
    created_at: string
    updated_at?: string
}

export interface Product {
    id: string
    nom?: string
    name?: string
    slug?: string
    description: string | null
    categorie?: string
    category?: string
    viscosity: string | null
    oil_type?: OilType
    type?: string
    marque?: string
    image_url: string | null
    is_active: boolean
    show_price: boolean
    specifications?: Record<string, unknown> | null
    created_at: string
    updated_at: string
    packagings?: Packaging[]
    stockTotal?: number
}

export interface StockMovement {
    id: string
    packaging_id: string
    type: StockMovementType | string
    quantite?: number
    quantity?: number
    quantite_avant?: number | null
    notes?: string | null
    note?: string | null
    reference_commande?: string | null
    created_by?: string | null
    created_at: string
    packaging?: any
}

export interface StockLevel {
    packaging_id: string
    product_id: string
    product_nom?: string
    product_name?: string
    volume?: string
    volume_liters?: number
    unite?: string
    sku?: string
    stock_actuel?: number
    quantity_available?: number
    seuil_alerte?: number
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
    name: string
    phone: string | null
    email: string | null
    client_type: ClientType
    notes: string | null
    created_at: string
    updated_at: string
}

export interface OrderItem {
    id: string
    order_id: string
    packaging_id: string
    quantite?: number
    quantity?: number
    prix_unitaire_gnf?: number
    unit_price_gnf?: number
    remise_pct?: number
    sous_total_gnf?: number
    created_at: string
    // Joined
  packaging?: Packaging & { product?: Product }
}

export interface Order {
    id: string
    client_id: string | null
    numero_commande?: string | null
    statut?: OrderStatus
    status?: string
    date_commande?: string
    date_livraison_prevue?: string | null
    date_livraison_reelle?: string | null
    adresse_livraison?: string | null
    notes: string | null
    remise_pct?: number
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
    client_id?: string | null
    numero_facture?: string
    invoice_number?: string
    statut?: InvoiceStatus
    status?: string
    date_emission?: string
    date_echeance?: string | null
    montant_total_gnf?: number
    montant_paye_gnf?: number
    notes?: string | null
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
                            Insert: Partial<Product>
                            Update: Partial<Product>
                  }
                  packagings: {
                    Row: Packaging
                    Insert: Partial<Packaging>
                    Update: Partial<Packaging>
                  }
                  stock_movements: {
                    Row: StockMovement
                    Insert: Partial<StockMovement>
                    Update: Partial<StockMovement>
                  }
                  stock_alerts: {
                    Row: StockAlert
                    Insert: Partial<StockAlert>
                    Update: Partial<StockAlert>
                  }
                  clients: {
                    Row: Client
                    Insert: Partial<Client>
                    Update: Partial<Client>
                  }
                  orders: {
                    Row: Order
                    Insert: Partial<Order>
                    Update: Partial<Order>
                  }
                  order_items: {
                    Row: OrderItem
                    Insert: Partial<OrderItem>
                    Update: Partial<OrderItem>
                  }
                  invoices: {
                    Row: Invoice
                    Insert: Partial<Invoice>
                    Update: Partial<Invoice>
                  }
                  contact_requests: {
                    Row: ContactRequest
                    Insert: Partial<ContactRequest>
                    Update: Partial<ContactRequest>
                  }
          }
          Views: {
            stock_levels: {
              Row: StockLevel
            }
          }
    }
}

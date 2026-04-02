-- ============================================================
-- Master Oil Guinée SARL — Supabase Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- SEQUENCES
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- ============================================================
-- TABLES
-- ============================================================

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255),
  email VARCHAR(255),
  telephone VARCHAR(50),
  adresse TEXT,
  ville VARCHAR(100) DEFAULT 'Conakry',
  client_type VARCHAR(20) NOT NULL DEFAULT 'particulier'
    CHECK (client_type IN ('particulier', 'garage', 'entreprise', 'flotte')),
  entreprise_nom VARCHAR(255),
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  categorie VARCHAR(100) NOT NULL DEFAULT 'moteur',
  viscosity VARCHAR(50),
  oil_type VARCHAR(20) DEFAULT 'synthétique'
    CHECK (oil_type IN ('synthétique', 'semi-synthétique', 'minérale', 'autre')),
  marque VARCHAR(100) DEFAULT 'Super M7',
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  show_price BOOLEAN DEFAULT FALSE,
  specifications JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Packagings (conditionnements)
CREATE TABLE IF NOT EXISTS packagings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  volume VARCHAR(50) NOT NULL,
  unite VARCHAR(20) DEFAULT 'L',
  prix_gnf BIGINT,
  prix_usd NUMERIC(10,2),
  reference VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock Movements
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  packaging_id UUID NOT NULL REFERENCES packagings(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('entree', 'sortie', 'ajustement')),
  quantite INTEGER NOT NULL,
  quantite_avant INTEGER,
  notes TEXT,
  reference_commande UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock Alerts config
CREATE TABLE IF NOT EXISTS stock_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  packaging_id UUID NOT NULL UNIQUE REFERENCES packagings(id) ON DELETE CASCADE,
  seuil_alerte INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  numero_commande VARCHAR(50) UNIQUE,
  statut VARCHAR(20) NOT NULL DEFAULT 'nouveau'
    CHECK (statut IN ('nouveau', 'en_cours', 'confirme', 'livre', 'annule')),
  date_commande TIMESTAMPTZ DEFAULT NOW(),
  date_livraison_prevue DATE,
  date_livraison_reelle TIMESTAMPTZ,
  adresse_livraison TEXT,
  notes TEXT,
  remise_pct NUMERIC(5,2) DEFAULT 0,
  total_gnf BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  packaging_id UUID NOT NULL REFERENCES packagings(id),
  quantite INTEGER NOT NULL,
  prix_unitaire_gnf BIGINT NOT NULL,
  remise_pct NUMERIC(5,2) DEFAULT 0,
  sous_total_gnf BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  numero_facture VARCHAR(50) UNIQUE NOT NULL,
  statut VARCHAR(20) NOT NULL DEFAULT 'en_attente'
    CHECK (statut IN ('en_attente', 'partiel', 'paye')),
  date_emission TIMESTAMPTZ DEFAULT NOW(),
  date_echeance DATE,
  montant_total_gnf BIGINT NOT NULL,
  montant_paye_gnf BIGINT DEFAULT 0,
  notes TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Requests
CREATE TABLE IF NOT EXISTS contact_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255),
  email VARCHAR(255),
  telephone VARCHAR(50),
  entreprise VARCHAR(255),
  request_type VARCHAR(20) NOT NULL DEFAULT 'particulier'
    CHECK (request_type IN ('particulier', 'garage', 'entreprise')),
  sujet VARCHAR(255),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VIEWS
-- ============================================================

-- Stock levels computed from movements
CREATE OR REPLACE VIEW stock_levels AS
SELECT
  p.id AS packaging_id,
  p.product_id,
  pr.nom AS product_nom,
  p.volume,
  p.unite,
  COALESCE(
    SUM(
      CASE
        WHEN sm.type = 'entree' THEN sm.quantite
        WHEN sm.type = 'sortie' THEN -sm.quantite
        WHEN sm.type = 'ajustement' THEN sm.quantite
        ELSE 0
      END
    ),
    0
  ) AS stock_actuel,
  COALESCE(sa.seuil_alerte, 10) AS seuil_alerte
FROM packagings p
JOIN products pr ON pr.id = p.product_id
LEFT JOIN stock_movements sm ON sm.packaging_id = p.id
LEFT JOIN stock_alerts sa ON sa.packaging_id = p.id
WHERE p.is_active = TRUE
GROUP BY p.id, p.product_id, pr.nom, p.volume, p.unite, sa.seuil_alerte;

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER packagings_updated_at BEFORE UPDATE ON packagings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER stock_alerts_updated_at BEFORE UPDATE ON stock_alerts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero_commande IS NULL THEN
    NEW.numero_commande := 'CMD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_number BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Auto-generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero_facture IS NULL THEN
    NEW.numero_facture := 'MO-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoices_number BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- Auto-calculate order item subtotal
CREATE OR REPLACE FUNCTION calculate_order_item_subtotal()
RETURNS TRIGGER AS $$
BEGIN
  NEW.sous_total_gnf := ROUND(NEW.quantite * NEW.prix_unitaire_gnf * (1 - COALESCE(NEW.remise_pct, 0) / 100));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_items_subtotal BEFORE INSERT OR UPDATE ON order_items
  FOR EACH ROW EXECUTE FUNCTION calculate_order_item_subtotal();

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_packagings_product_id ON packagings(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_packaging_id ON stock_movements(packaging_id);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_statut ON orders(statut);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_statut ON invoices(statut);
CREATE INDEX IF NOT EXISTS idx_contact_requests_is_read ON contact_requests(is_read);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE packagings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

-- Products: public can SELECT active products
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Authenticated can manage products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- Packagings: public can SELECT active packagings
CREATE POLICY "Public can view active packagings" ON packagings
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Authenticated can manage packagings" ON packagings
  FOR ALL USING (auth.role() = 'authenticated');

-- Stock movements: authenticated only
CREATE POLICY "Authenticated can manage stock movements" ON stock_movements
  FOR ALL USING (auth.role() = 'authenticated');

-- Stock alerts: authenticated only
CREATE POLICY "Authenticated can manage stock alerts" ON stock_alerts
  FOR ALL USING (auth.role() = 'authenticated');

-- Clients: authenticated only
CREATE POLICY "Authenticated can manage clients" ON clients
  FOR ALL USING (auth.role() = 'authenticated');

-- Orders: authenticated only
CREATE POLICY "Authenticated can manage orders" ON orders
  FOR ALL USING (auth.role() = 'authenticated');

-- Order items: authenticated only
CREATE POLICY "Authenticated can manage order items" ON order_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Invoices: authenticated only
CREATE POLICY "Authenticated can manage invoices" ON invoices
  FOR ALL USING (auth.role() = 'authenticated');

-- Contact requests: public can INSERT, authenticated can SELECT/UPDATE
CREATE POLICY "Public can submit contact requests" ON contact_requests
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Authenticated can manage contact requests" ON contact_requests
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- SEED DATA (demo products)
-- ============================================================

INSERT INTO products (nom, slug, description, categorie, viscosity, oil_type, marque, is_active, show_price)
VALUES
  (
    'Super M7 5W-30 Full Synthétique',
    'super-m7-5w30-full-synthetique',
    'Huile moteur 100% synthétique de haute performance. Conçue pour une protection maximale du moteur dans toutes les conditions climatiques, idéale pour les moteurs modernes à essence et diesel.',
    'moteur',
    '5W-30',
    'synthétique',
    'Super M7',
    TRUE,
    FALSE
  ),
  (
    'Super M7 10W-40 Semi-Synthétique',
    'super-m7-10w40-semi-synthetique',
    'Huile moteur semi-synthétique polyvalente. Excellente protection pour les moteurs d''ancienne et nouvelle génération. Idéale pour les garages et les parcs automobiles.',
    'moteur',
    '10W-40',
    'semi-synthétique',
    'Super M7',
    TRUE,
    FALSE
  ),
  (
    'Super M7 5W-20 Full Synthétique',
    'super-m7-5w20-full-synthetique',
    'Huile moteur synthétique légère à faible viscosité, conçue pour les moteurs haute performance et les véhicules nécessitant une huile de spécification SP. Réduit la consommation de carburant.',
    'moteur',
    '5W-20',
    'synthétique',
    'Super M7',
    TRUE,
    FALSE
  ),
  (
    'Super M7 15W-40 Minérale',
    'super-m7-15w40-minerale',
    'Huile moteur minérale robuste pour moteurs diesel et essence classiques. Particulièrement adaptée aux véhicules utilitaires, camions et moteurs à forte sollicitation.',
    'moteur',
    '15W-40',
    'minérale',
    'Super M7',
    TRUE,
    FALSE
  )
ON CONFLICT (slug) DO NOTHING;

-- Insert packagings for each product
INSERT INTO packagings (product_id, volume, unite, is_active)
SELECT id, '1', 'L', TRUE FROM products WHERE slug = 'super-m7-5w30-full-synthetique'
ON CONFLICT DO NOTHING;

INSERT INTO packagings (product_id, volume, unite, is_active)
SELECT id, '4', 'L', TRUE FROM products WHERE slug = 'super-m7-5w30-full-synthetique'
ON CONFLICT DO NOTHING;

INSERT INTO packagings (product_id, volume, unite, is_active)
SELECT id, '5', 'L', TRUE FROM products WHERE slug = 'super-m7-5w30-full-synthetique'
ON CONFLICT DO NOTHING;

INSERT INTO packagings (product_id, volume, unite, is_active)
SELECT id, '20', 'L', TRUE FROM products WHERE slug = 'super-m7-5w30-full-synthetique'
ON CONFLICT DO NOTHING;

INSERT INTO packagings (product_id, volume, unite, is_active)
SELECT id, '1', 'L', TRUE FROM products WHERE slug = 'super-m7-10w40-semi-synthetique'
ON CONFLICT DO NOTHING;

INSERT INTO packagings (product_id, volume, unite, is_active)
SELECT id, '4', 'L', TRUE FROM products WHERE slug = 'super-m7-10w40-semi-synthetique'
ON CONFLICT DO NOTHING;

INSERT INTO packagings (product_id, volume, unite, is_active)
SELECT id, '5', 'L', TRUE FROM products WHERE slug = 'super-m7-10w40-semi-synthetique'
ON CONFLICT DO NOTHING;

INSERT INTO packagings (product_id, volume, unite, is_active)
SELECT id, '20', 'L', TRUE FROM products WHERE slug = 'super-m7-10w40-semi-synthetique'
ON CONFLICT DO NOTHING;

INSERT INTO packagings (product_id, volume, unite, is_active)
SELECT id, '1', 'L', TRUE FROM products WHERE slug = 'super-m7-5w20-full-synthetique'
ON CONFLICT DO NOTHING;

INSERT INTO packagings (product_id, volume, unite, is_active)
SELECT id, '4', 'L', TRUE FROM products WHERE slug = 'super-m7-5w20-full-synthetique'
ON CONFLICT DO NOTHING;

INSERT INTO packagings (product_id, volume, unite, is_active)
SELECT id, '5', 'L', TRUE FROM products WHERE slug = 'super-m7-5w20-full-synthetique'
ON CONFLICT DO NOTHING;

INSERT INTO packagings (product_id, volume, unite, is_active)
SELECT id, '1', 'L', TRUE FROM products WHERE slug = 'super-m7-15w40-minerale'
ON CONFLICT DO NOTHING;

INSERT INTO packagings (product_id, volume, unite, is_active)
SELECT id, '5', 'L', TRUE FROM products WHERE slug = 'super-m7-15w40-minerale'
ON CONFLICT DO NOTHING;

INSERT INTO packagings (product_id, volume, unite, is_active)
SELECT id, '20', 'L', TRUE FROM products WHERE slug = 'super-m7-15w40-minerale'
ON CONFLICT DO NOTHING;

INSERT INTO packagings (product_id, volume, unite, is_active)
SELECT id, '200', 'L', TRUE FROM products WHERE slug = 'super-m7-15w40-minerale'
ON CONFLICT DO NOTHING;

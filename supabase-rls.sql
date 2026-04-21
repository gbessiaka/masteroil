-- ============================================================
-- RLS : Row Level Security — Master Oil Guinée
-- À coller dans Supabase > SQL Editor et exécuter
-- ============================================================

-- 1. Activer RLS sur toutes les tables
ALTER TABLE public.products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packagings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes politiques si elles existent
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- ============================================================
-- PRODUITS & PACKAGINGS : lecture publique (site vitrine)
-- écriture réservée aux admins connectés
-- ============================================================
CREATE POLICY "produits_lecture_publique"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "produits_ecriture_admin"
  ON public.products FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "packagings_lecture_publique"
  ON public.packagings FOR SELECT
  USING (true);

CREATE POLICY "packagings_ecriture_admin"
  ON public.packagings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- CLIENTS : uniquement les admins connectés
-- ============================================================
CREATE POLICY "clients_admin_seulement"
  ON public.clients FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- COMMANDES : uniquement les admins connectés
-- ============================================================
CREATE POLICY "orders_admin_seulement"
  ON public.orders FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- ARTICLES DE COMMANDE : uniquement les admins connectés
-- ============================================================
CREATE POLICY "order_items_admin_seulement"
  ON public.order_items FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- STOCK : uniquement les admins connectés
-- ============================================================
CREATE POLICY "stock_movements_admin_seulement"
  ON public.stock_movements FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- FACTURES : uniquement les admins connectés
-- ============================================================
CREATE POLICY "invoices_admin_seulement"
  ON public.invoices FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- PROFILES : chaque admin voit son propre profil
-- super_admin voit tous les profils
-- ============================================================
CREATE POLICY "profiles_lecture_propre"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

CREATE POLICY "profiles_ecriture_super_admin"
  ON public.profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

CREATE POLICY "profiles_modification_super_admin"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

CREATE POLICY "profiles_suppression_super_admin"
  ON public.profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

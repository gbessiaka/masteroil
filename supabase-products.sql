-- Insertion des 4 produits Super M7
INSERT INTO public.products (id, name, category, description, viscosity, type, is_active, show_price)
VALUES
  ('11111111-0000-0000-0000-000000000001', 'Super M7 5W-30', 'automobile',
   'L''équilibre parfait entre performance, protection et polyvalence. Huile moteur 100% synthétique idéale pour la plupart des véhicules modernes essence et diesel. Protège efficacement dans les conditions climatiques extrêmes de la Guinée.',
   '5W-30', 'synthetique', true, true),

  ('11111111-0000-0000-0000-000000000002', 'Super M7 5W-40', 'automobile',
   'Conçue pour les conditions les plus exigeantes, offrant une protection renforcée à haute température. Recommandée pour les moteurs turbo, les flottes intensives et les environnements à forte chaleur comme en Guinée.',
   '5W-40', 'synthetique', true, true),

  ('11111111-0000-0000-0000-000000000003', 'Super M7 5W-20', 'automobile',
   'Parfaite pour les moteurs récents, alliant fluidité à froid et protection à chaud. Formulation synthétique avancée pour économie de carburant optimale. Certifiée pour les véhicules nécessitant une faible viscosité.',
   '5W-20', 'synthetique', true, true),

  ('11111111-0000-0000-0000-000000000004', 'Super M7 0W-20', 'automobile',
   'Idéale pour une économie de carburant maximale et un démarrage à froid ultra rapide. La viscosité la plus faible de la gamme Super M7, conçue pour les moteurs hybrides et les véhicules dernière génération.',
   '0W-20', 'synthetique', true, true);

-- Conditionnements (1L, 4L, 5L pour chaque produit)
INSERT INTO public.packagings (id, product_id, volume_liters, price_gnf, sku)
VALUES
  -- 5W-30
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 1, 85000,  'SM7-5W30-1L'),
  ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 4, 320000, 'SM7-5W30-4L'),
  ('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', 5, 395000, 'SM7-5W30-5L'),
  -- 5W-40
  ('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000002', 1, 92000,  'SM7-5W40-1L'),
  ('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000002', 4, 345000, 'SM7-5W40-4L'),
  ('22222222-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000002', 5, 425000, 'SM7-5W40-5L'),
  -- 5W-20
  ('22222222-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000003', 1, 90000,  'SM7-5W20-1L'),
  ('22222222-0000-0000-0000-000000000008', '11111111-0000-0000-0000-000000000003', 4, 340000, 'SM7-5W20-4L'),
  ('22222222-0000-0000-0000-000000000009', '11111111-0000-0000-0000-000000000003', 5, 420000, 'SM7-5W20-5L'),
  -- 0W-20
  ('22222222-0000-0000-0000-000000000010', '11111111-0000-0000-0000-000000000004', 1, 95000,  'SM7-0W20-1L'),
  ('22222222-0000-0000-0000-000000000011', '11111111-0000-0000-0000-000000000004', 4, 360000, 'SM7-0W20-4L'),
  ('22222222-0000-0000-0000-000000000012', '11111111-0000-0000-0000-000000000004', 5, 445000, 'SM7-0W20-5L');

-- Stock initial : 50 bidons de chaque conditionnement
INSERT INTO public.stock_movements (packaging_id, type, quantity, note)
VALUES
  ('22222222-0000-0000-0000-000000000001', 'in', 50, 'Stock initial'),
  ('22222222-0000-0000-0000-000000000002', 'in', 50, 'Stock initial'),
  ('22222222-0000-0000-0000-000000000003', 'in', 50, 'Stock initial'),
  ('22222222-0000-0000-0000-000000000004', 'in', 50, 'Stock initial'),
  ('22222222-0000-0000-0000-000000000005', 'in', 50, 'Stock initial'),
  ('22222222-0000-0000-0000-000000000006', 'in', 50, 'Stock initial'),
  ('22222222-0000-0000-0000-000000000007', 'in', 50, 'Stock initial'),
  ('22222222-0000-0000-0000-000000000008', 'in', 50, 'Stock initial'),
  ('22222222-0000-0000-0000-000000000009', 'in', 50, 'Stock initial'),
  ('22222222-0000-0000-0000-000000000010', 'in', 50, 'Stock initial'),
  ('22222222-0000-0000-0000-000000000011', 'in', 50, 'Stock initial'),
  ('22222222-0000-0000-0000-000000000012', 'in', 50, 'Stock initial');

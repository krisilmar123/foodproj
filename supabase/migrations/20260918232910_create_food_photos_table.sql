/*
# Create food_photos table (single-tenant, no auth)

## Summary
This migration creates the `food_photos` table that stores food photographs
submitted for review, along with their review status, reviewer notes, cuisine
tags, and photographer attribution. It also inserts seed data with real food
photography URLs so the dashboard is immediately usable after setup.

## New Tables
- `food_photos`
  - `id` (uuid, primary key) — unique identifier for each photo
  - `image_url` (text, not null) — URL to the food photograph
  - `caption` (text, not null) — short title / description of the dish
  - `cuisine` (text, not null) — cuisine category (e.g. Italian, Japanese, Mexican)
  - `photographer` (text, not null) — name of the photographer
  - `review_status` (text, not null, default 'pending') — one of: pending, approved, rejected
  - `review_notes` (text, nullable) — reviewer's notes when approving or rejecting
  - `reviewed_at` (timestamptz, nullable) — timestamp of the most recent review action
  - `created_at` (timestamptz, default now()) — when the photo was submitted

## Security
- Enable RLS on `food_photos`.
- Allow anon + authenticated CRUD because the dashboard is intentionally
  public/shared (single-tenant app with no sign-in screen).

## Important Notes
1. The app has no sign-in screen, so all policies list `anon` to ensure the
   anon-key frontend can read and write its own data.
2. `review_status` is constrained to pending / approved / rejected via CHECK.
3. Seed data uses real Pexels image URLs that are guaranteed to load.
*/

CREATE TABLE IF NOT EXISTS food_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text NOT NULL,
  cuisine text NOT NULL,
  photographer text NOT NULL,
  review_status text NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'approved', 'rejected')),
  review_notes text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE food_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_food_photos" ON food_photos;
CREATE POLICY "anon_select_food_photos" ON food_photos FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_food_photos" ON food_photos;
CREATE POLICY "anon_insert_food_photos" ON food_photos FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_food_photos" ON food_photos;
CREATE POLICY "anon_update_food_photos" ON food_photos FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_food_photos" ON food_photos;
CREATE POLICY "anon_delete_food_photos" ON food_photos FOR DELETE
  TO anon, authenticated USING (true);

-- Index for filtering by review_status (common dashboard query)
CREATE INDEX IF NOT EXISTS idx_food_photos_review_status
  ON food_photos (review_status);

-- Index for filtering by cuisine
CREATE INDEX IF NOT EXISTS idx_food_photos_cuisine
  ON food_photos (cuisine);

/*
# Seed food_photos with sample data
Inserts 12 sample food photos with real Pexels image URLs covering a variety
of cuisines and initial review statuses so the dashboard has content to show.
*/
INSERT INTO food_photos (image_url, caption, cuisine, photographer, review_status, review_notes, reviewed_at, created_at) VALUES
  ('https://images.pexels.com/photos/1327393/pexels-photo-1327393.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Heirloom vegetable plate with saffron sauce', 'French', 'Rene Terp', 'pending', NULL, NULL, '2026-09-10T09:30:00Z'),
  ('https://images.pexels.com/photos/24289165/pexels-photo-24289165.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Garlic shrimp appetizer with vegetable ribbons', 'Mediterranean', 'Adriano Bragi', 'pending', NULL, NULL, '2026-09-10T10:15:00Z'),
  ('https://images.pexels.com/photos/15671371/pexels-photo-15671371.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Steamed clams with fresh herbs', 'Italian', 'Luis Becerra', 'approved', 'Beautiful lighting and composition.', '2026-09-12T14:00:00Z', '2026-09-09T08:00:00Z'),
  ('https://images.pexels.com/photos/23644633/pexels-photo-23644633.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Minimalist white-plate appetizer', 'Modern', 'Amar Preciado', 'pending', NULL, NULL, '2026-09-11T11:45:00Z'),
  ('https://images.pexels.com/photos/17237180/pexels-photo-17237180.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Grilled meat with roasted vegetables', 'American', 'Luca Luperto', 'rejected', 'Plating looks cluttered, try fewer elements.', '2026-09-13T16:30:00Z', '2026-09-08T12:00:00Z'),
  ('https://images.pexels.com/photos/12107010/pexels-photo-12107010.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Seared scallop with cream sauce and roe', 'Japanese', 'Nadin Sh', 'pending', NULL, NULL, '2026-09-11T13:20:00Z'),
  ('https://images.pexels.com/photos/8194817/pexels-photo-8194817.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Rich sauce plated dish with microgreens', 'French', 'Pelageia Zelenina', 'approved', 'Excellent color contrast.', '2026-09-14T09:10:00Z', '2026-09-07T15:00:00Z'),
  ('https://images.pexels.com/photos/28448379/pexels-photo-28448379.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Eggs with roasted tomatoes and garnish', 'Spanish', 'Nano Erdozain', 'pending', NULL, NULL, '2026-09-12T08:30:00Z'),
  ('https://images.pexels.com/photos/9637021/pexels-photo-9637021.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Huitlacoche soup with crispy vegetables', 'Mexican', 'Miguel Del Cano', 'pending', NULL, NULL, '2026-09-13T10:00:00Z'),
  ('https://images.pexels.com/photos/27612507/pexels-photo-27612507.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Artistic colorful sauce plating', 'Modern', 'Collab Media', 'pending', NULL, NULL, '2026-09-14T11:30:00Z'),
  ('https://images.pexels.com/photos/37068830/pexels-photo-37068830.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Grilled octopus on textured white plate', 'Mediterranean', 'Paolo Bici', 'approved', 'Great texture and depth.', '2026-09-15T13:45:00Z', '2026-09-06T09:00:00Z'),
  ('https://images.pexels.com/photos/34520947/pexels-photo-34520947.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Brazilian dessert with chocolate and mango', 'Brazilian', 'Matheus Bertelli', 'pending', NULL, NULL, '2026-09-15T14:00:00Z')
ON CONFLICT DO NOTHING;

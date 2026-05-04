-- ============================================================
-- Vinyl Shop — Seed Data
-- ============================================================

-- ------------------------------------------------------------
-- Categories
-- ------------------------------------------------------------
INSERT INTO categories (name, slug, description, sort_order) VALUES
    ('Vinyls',        'vinyls',        'Vinyl records in all formats (LP, EP, 7")',  1),
    ('CDs',           'cds',           'Compact discs — albums and singles',         2),
    ('Cassettes',     'cassettes',     'Audio cassettes and tapes',                  3);

-- ------------------------------------------------------------
-- Genres
-- ------------------------------------------------------------
INSERT INTO genres (name, slug, sort_order) VALUES
    ('Rock',          'rock',          1),
    ('Metal',         'metal',         2),
    ('Hip-Hop',       'hip-hop',       3),
    ('Jazz',          'jazz',          4),
    ('Pop',           'pop',           5),
    ('Electronic',    'electronic',    6),
    ('Punk',          'punk',          7),
    ('Blues',          'blues',         8),
    ('Classical',     'classical',     9),
    ('Folk',          'folk',          10),
    ('Reggae',        'reggae',        11),
    ('R&B / Soul',    'rnb-soul',      12);

-- ------------------------------------------------------------
-- Regions
-- ------------------------------------------------------------
INSERT INTO regions (name, slug) VALUES
    ('International', 'international'),
    ('EX-YU',         'ex-yu');

-- ------------------------------------------------------------
-- Products — Vinyl Records
-- ------------------------------------------------------------
INSERT INTO products (title, artist, description, price, compare_price, category_id, genre_id, region_id, stock_count, image_url, label, release_year, condition) VALUES
    -- International Vinyls
    ('The Dark Side of the Moon',  'Pink Floyd',       'One of the greatest albums ever made. 50th anniversary remaster on 180g vinyl.', 45.00, NULL,  1, 1, 1, 15, '/images/products/dark-side.jpg',     'Harvest',        1973, 'New'),
    ('Rumours',                     'Fleetwood Mac',    'The definitive soft-rock masterpiece. Includes "Dreams" and "Go Your Own Way".', 38.50, 42.00, 1, 1, 1, 10, '/images/products/rumours.jpg',       'Warner Bros.',   1977, 'New'),
    ('Abbey Road',                  'The Beatles',      'The iconic album with the famous crosswalk cover. 2019 Anniversary Mix.',       52.00, NULL,  1, 1, 1, 8,  '/images/products/abbey-road.jpg',    'Apple',          1969, 'Mint'),
    ('OK Computer',                 'Radiohead',        'A landmark album that redefined alternative rock for the digital age.',         35.00, NULL,  1, 1, 1, 12, '/images/products/ok-computer.jpg',   'Parlophone',     1997, 'New'),
    ('Master of Puppets',           'Metallica',        'Thrash metal at its absolute finest. 180g audiophile pressing.',                 40.00, NULL,  1, 2, 1, 6,  '/images/products/master-puppets.jpg','Elektra',        1986, 'New'),
    ('The Miseducation of Lauryn Hill','Lauryn Hill',   'A genre-defying hip-hop and soul masterpiece.',                                 32.00, 36.00, 1, 3, 1, 18, '/images/products/lauryn-hill.jpg',   'Ruffhouse',      1998, 'New'),
    ('Kind of Blue',                'Miles Davis',      'The best-selling jazz album of all time. Essential listening.',                  42.00, NULL,  1, 4, 1, 5,  '/images/products/kind-of-blue.jpg',  'Columbia',       1959, 'Mint'),
    ('Random Access Memories',      'Daft Punk',        'Grammy-winning electronic masterpiece. Includes "Get Lucky".',                  36.00, NULL,  1, 6, 1, 20, '/images/products/ram.jpg',           'Columbia',       2013, 'New'),
    ('Thriller',                    'Michael Jackson',  'The best-selling album of all time. Remastered on 180g vinyl.',                 34.00, 38.00, 1, 5, 1, 25, '/images/products/thriller.jpg',      'Epic',           1982, 'New'),
    ('Led Zeppelin IV',             'Led Zeppelin',     'Features "Stairway to Heaven". Deluxe remastered edition.',                     44.00, NULL,  1, 1, 1, 7,  '/images/products/led-zep-iv.jpg',    'Atlantic',       1971, 'New'),
    ('Nevermind',                   'Nirvana',          'The album that launched grunge into the mainstream. 30th anniversary.',          39.00, NULL,  1, 1, 1, 14, '/images/products/nevermind-vinyl.jpg','DGC',           1991, 'New'),
    ('To Pimp a Butterfly',        'Kendrick Lamar',   'A modern hip-hop opus blending jazz, funk, and spoken word.',                    33.00, NULL,  1, 3, 1, 22, '/images/products/tpab.jpg',          'Aftermath',      2015, 'New'),

    -- EX-YU Vinyls
    ('Bitanga i princeza',          'Bijelo Dugme',     'Yugoslav rock at its finest. Original pressing reissue.',                       32.00, NULL,  1, 1, 2, 5,  '/images/products/bitanga.jpg',       'Jugoton',        1979, 'New'),
    ('Odbrana i poslednji dani',    'Idoli',            'A cult classic of the Yugoslav New Wave movement.',                             40.00, NULL,  1, 1, 2, 3,  '/images/products/odbrana.jpg',       'Jugoton',        1982, 'Mint'),
    ('Doživjeti stotu',             'Bijelo Dugme',     'One of the greatest Yugoslav rock albums of all time.',                         35.00, NULL,  1, 1, 2, 4,  '/images/products/dozivjeti.jpg',     'Jugoton',        1980, 'New'),
    ('Tajno ime',                   'Haustor',          'New wave and art rock from Zagreb. A hidden gem.',                              38.00, 42.00, 1, 1, 2, 2,  '/images/products/tajno-ime.jpg',     'Jugoton',        1988, 'Mint'),
    ('Da li si čuo',                'Riblja Čorba',     'Hard-driving Serbian rock. An absolute classic.',                               30.00, NULL,  1, 1, 2, 6,  '/images/products/da-li-si-cuo.jpg',  'PGP-RTB',        1980, 'New'),
    ('Svi marš napolje',            'Električni Orgazam','Punk energy meets new wave sophistication.',                                   28.00, NULL,  1, 7, 2, 8,  '/images/products/svi-mars.jpg',      'Jugoton',        1981, 'New');

-- ------------------------------------------------------------
-- Products — CDs
-- ------------------------------------------------------------
INSERT INTO products (title, artist, description, price, compare_price, category_id, genre_id, region_id, stock_count, image_url, label, release_year, condition) VALUES
    ('Nevermind',                   'Nirvana',          'The album that changed rock forever. Remastered CD.',                           15.99, NULL,  2, 1, 1, 100, '/images/products/nevermind-cd.jpg',  'DGC',            1991, 'New'),
    ('The Marshall Mathers LP',     'Eminem',           'A hip-hop classic. Explicit content warning.',                                  12.50, 15.00, 2, 3, 1, 40,  '/images/products/mmlp-cd.jpg',      'Aftermath',      2000, 'New'),
    ('Back in Black',               'AC/DC',            'One of the best-selling albums ever. Hard rock perfection.',                    13.99, NULL,  2, 1, 1, 55,  '/images/products/back-in-black.jpg', 'Albert',         1980, 'New'),
    ('Hybrid Theory',               'Linkin Park',      'Nu-metal landmark. Features "In the End" and "Crawling".',                     14.50, NULL,  2, 2, 1, 70,  '/images/products/hybrid-theory.jpg', 'Warner Bros.',   2000, 'New'),
    ('21',                          'Adele',            'Global pop phenomenon. Includes "Rolling in the Deep".',                        11.99, 14.00, 2, 5, 1, 90,  '/images/products/adele-21.jpg',     'XL',             2011, 'New'),
    ('A Night at the Opera',        'Queen',            'Features "Bohemian Rhapsody". Remastered deluxe edition.',                      16.00, NULL,  2, 1, 1, 35,  '/images/products/night-opera.jpg',  'EMI',            1975, 'New'),
    ('The Slim Shady LP',           'Eminem',           'The debut album that introduced the world to Slim Shady.',                      11.00, NULL,  2, 3, 1, 30,  '/images/products/slim-shady.jpg',   'Aftermath',      1999, 'New'),
    ('Appetite for Destruction',    'Guns N'' Roses',   'Debut album. Features "Sweet Child O'' Mine" and "Welcome to the Jungle".',     13.50, NULL,  2, 1, 1, 45,  '/images/products/appetite.jpg',     'Geffen',         1987, 'New'),

    -- EX-YU CDs
    ('Niko nema ovakav šou',        'Disciplina Kičme', 'Serbian post-punk legends. Essential EX-YU listening.',                         10.00, NULL,  2, 7, 2, 15,  '/images/products/disciplina.jpg',   'Metropolis',     1991, 'New'),
    ('Paket aranžman',              'Various Artists',  'The legendary compilation that launched Yugoslav new wave.',                     18.00, 22.00, 2, 1, 2, 8,   '/images/products/paket.jpg',        'Jugoton',        1981, 'Mint'),
    ('Ludilo',                      'EKV',              'Ekatarina Velika at their creative peak.',                                      12.00, NULL,  2, 1, 2, 20,  '/images/products/ludilo.jpg',        'Komuna',         1989, 'New'),
    ('Mrtva priroda',               'Laibach',          'Industrial pioneers from Ljubljana.',                                           14.00, NULL,  2, 6, 2, 10,  '/images/products/mrtva-priroda.jpg', 'Dallas',         1985, 'New');

-- ------------------------------------------------------------
-- Product Gallery Images  (extra images for some products)
-- ------------------------------------------------------------
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
    (1, '/images/gallery/dark-side-1.jpg', 1),
    (1, '/images/gallery/dark-side-2.jpg', 2),
    (2, '/images/gallery/rumours-1.jpg',   1),
    (3, '/images/gallery/abbey-1.jpg',     1),
    (3, '/images/gallery/abbey-2.jpg',     2),
    (5, '/images/gallery/master-1.jpg',    1),
    (9, '/images/gallery/thriller-1.jpg',  1),
    (13, '/images/gallery/bitanga-1.jpg',  1),
    (14, '/images/gallery/odbrana-1.jpg',  1);

-- ------------------------------------------------------------
-- Featured Products  (homepage carousel assignments)
-- ------------------------------------------------------------
-- Recent Arrivals
INSERT INTO featured_products (product_id, section, sort_order) VALUES
    (8,  'recent_arrivals', 1),   -- Random Access Memories
    (12, 'recent_arrivals', 2),   -- To Pimp a Butterfly
    (9,  'recent_arrivals', 3),   -- Thriller
    (4,  'recent_arrivals', 4),   -- OK Computer
    (24, 'recent_arrivals', 5),   -- Hybrid Theory
    (11, 'recent_arrivals', 6);   -- Nevermind (vinyl)

-- Top Vinyl
INSERT INTO featured_products (product_id, section, sort_order) VALUES
    (1,  'top_vinyl', 1),   -- Dark Side of the Moon
    (2,  'top_vinyl', 2),   -- Rumours
    (3,  'top_vinyl', 3),   -- Abbey Road
    (10, 'top_vinyl', 4),   -- Led Zeppelin IV
    (5,  'top_vinyl', 5),   -- Master of Puppets
    (7,  'top_vinyl', 6);   -- Kind of Blue

-- Top CDs
INSERT INTO featured_products (product_id, section, sort_order) VALUES
    (19, 'top_cd', 1),   -- Nevermind CD
    (20, 'top_cd', 2),   -- Marshall Mathers LP
    (21, 'top_cd', 3),   -- Back in Black
    (25, 'top_cd', 4),   -- Adele 21
    (26, 'top_cd', 5),   -- A Night at the Opera
    (24, 'top_cd', 6);   -- Hybrid Theory

-- EX-YU Selections
INSERT INTO featured_products (product_id, section, sort_order) VALUES
    (13, 'ex_yu', 1),   -- Bitanga i princeza
    (14, 'ex_yu', 2),   -- Odbrana i poslednji dani
    (17, 'ex_yu', 3),   -- Da li si čuo
    (18, 'ex_yu', 4),   -- Svi marš napolje
    (29, 'ex_yu', 5),   -- Ludilo (EKV)
    (28, 'ex_yu', 6);   -- Paket aranžman

-- ------------------------------------------------------------
-- Admin User  (password: Admin123!)
-- bcrypt hash for 'Admin123!' with 10 rounds
-- ------------------------------------------------------------
INSERT INTO users (name, email, password_hash, role) VALUES
    ('Admin', 'admin@vinylshop.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin');

-- Sample customer
INSERT INTO users (name, email, password_hash, role, phone) VALUES
    ('Marko Petrović', 'marko@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'customer', '+381 64 1234567');

-- Sample addresses
INSERT INTO user_addresses (user_id, label, full_name, street, city, postal_code, country, phone, is_default) VALUES
    (2, 'Home',  'Marko Petrović', 'Knez Mihailova 12', 'Belgrade', '11000', 'Serbia', '+381 64 1234567', 1),
    (2, 'Work',  'Marko Petrović', 'Bulevar Mihajla Pupina 6', 'Novi Sad', '21000', 'Serbia', '+381 64 1234567', 0);

-- ------------------------------------------------------------
-- Store Locations
-- ------------------------------------------------------------
INSERT INTO store_locations (name, address, city, phone, lat, lng) VALUES
    ('Vinyl Shop — Belgrade Center', 'Balkanska 13',       'Belgrade',  '+381 11 1234567', 44.8125, 20.4612),
    ('Vinyl Shop — Novi Sad',        'Zmaj Jovina 22',     'Novi Sad',  '+381 21 9876543', 45.2551, 19.8451),
    ('Vinyl Shop — Niš',             'Obrenovićeva 15',    'Niš',       '+381 18 5551234', 43.3209, 21.8954);

-- Store inventory (sample — Belgrade store has everything, others partial)
INSERT INTO store_inventory (store_id, product_id, quantity)
SELECT 1, id, stock_count / 2 FROM products WHERE stock_count > 0;

INSERT INTO store_inventory (store_id, product_id, quantity)
SELECT 2, id, stock_count / 4 FROM products WHERE stock_count > 4 AND id % 2 = 0;

INSERT INTO store_inventory (store_id, product_id, quantity)
SELECT 3, id, stock_count / 5 FROM products WHERE stock_count > 5 AND id % 3 = 0;

-- ------------------------------------------------------------
-- Settings (footer / site-wide)
-- ------------------------------------------------------------
INSERT INTO settings (key, value) VALUES
    ('site_name',           'Vinyl Shop'),
    ('site_tagline',        'Premium Records & CDs since 2020'),
    ('contact_email',       'info@vinylshop.com'),
    ('contact_phone',       '+381 11 1234567'),
    ('physical_address',    'Balkanska 13, 11000 Belgrade, Serbia'),
    ('facebook_url',        'https://facebook.com/vinylshop'),
    ('instagram_url',       'https://instagram.com/vinylshop'),
    ('twitter_url',         'https://twitter.com/vinylshop'),
    ('tiktok_url',          'https://tiktok.com/@vinylshop'),
    ('working_hours',       'Mon–Fri 10:00–20:00, Sat 10:00–16:00'),
    ('shipping_info',       'Free shipping on orders over 5000 RSD. Standard delivery 2–4 business days.'),
    ('return_policy',       '14-day return policy on all sealed items.');

-- ------------------------------------------------------------
-- Sample Order  (for the admin dashboard)
-- ------------------------------------------------------------
INSERT INTO orders (user_id, status, payment_method, subtotal, shipping_cost, total, ship_name, ship_street, ship_city, ship_postal, ship_country, ship_phone) VALUES
    (2, 'Completed', 'credit_card', 83.50, 5.00, 88.50, 'Marko Petrović', 'Knez Mihailova 12', 'Belgrade', '11000', 'Serbia', '+381 64 1234567');

INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
    (1, 1, 1, 45.00, 45.00),
    (1, 2, 1, 38.50, 38.50);

INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, note) VALUES
    (1, NULL,          'New',        NULL, 'Order placed by customer'),
    (1, 'New',         'Processing', 1,    'Payment confirmed'),
    (1, 'Processing',  'Shipped',    1,    'Shipped via PostExpress'),
    (1, 'Shipped',     'Completed',  1,    'Delivered successfully');

-- Second order (pending)
INSERT INTO orders (user_id, status, payment_method, subtotal, shipping_cost, total, ship_name, ship_street, ship_city, ship_postal, ship_country, ship_phone) VALUES
    (2, 'New', 'cash', 32.00, 5.00, 37.00, 'Marko Petrović', 'Knez Mihailova 12', 'Belgrade', '11000', 'Serbia', '+381 64 1234567');

INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
    (2, 13, 1, 32.00, 32.00);

INSERT INTO order_status_history (order_id, old_status, new_status, note) VALUES
    (2, NULL, 'New', 'Order placed by customer');

-- Wishlist entries
INSERT INTO wishlist (user_id, product_id) VALUES
    (2, 7),
    (2, 14),
    (2, 8);

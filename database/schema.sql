-- ============================================================
-- Vinyl Shop — SQLite Schema
-- ============================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------
-- Users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL,
    email           TEXT    NOT NULL UNIQUE,
    password_hash   TEXT    NOT NULL,
    role            TEXT    NOT NULL DEFAULT 'customer',   -- customer | admin
    phone           TEXT,
    status          TEXT    NOT NULL DEFAULT 'active',     -- active | suspended
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------
-- User Addresses  (one user can store many)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_addresses (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label           TEXT    NOT NULL DEFAULT 'Home',       -- Home, Work, etc.
    full_name       TEXT    NOT NULL,
    street          TEXT    NOT NULL,
    city            TEXT    NOT NULL,
    postal_code     TEXT    NOT NULL,
    country         TEXT    NOT NULL DEFAULT 'Serbia',
    phone           TEXT,
    is_default      INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------
-- Categories  (Vinyls, CDs — extensible for future types)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL UNIQUE,
    slug            TEXT    NOT NULL UNIQUE,
    description     TEXT,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------
-- Genres
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS genres (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL UNIQUE,
    slug            TEXT    NOT NULL UNIQUE,
    sort_order      INTEGER NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- Region Tags  (International, EX-YU, etc.)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS regions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL UNIQUE,
    slug            TEXT    NOT NULL UNIQUE
);

-- ------------------------------------------------------------
-- Products
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT    NOT NULL,
    artist          TEXT    NOT NULL,
    description     TEXT,
    price           REAL    NOT NULL CHECK (price >= 0),
    compare_price   REAL,                                  -- original / strike-through price
    category_id     INTEGER NOT NULL REFERENCES categories(id),
    genre_id        INTEGER REFERENCES genres(id),
    region_id       INTEGER REFERENCES regions(id),
    stock_count     INTEGER NOT NULL DEFAULT 0 CHECK (stock_count >= 0),
    image_url       TEXT,                                  -- primary image
    label           TEXT,                                  -- record label
    release_year    INTEGER,
    condition       TEXT    DEFAULT 'New',                  -- New, Mint, Used
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_genre    ON products(genre_id);
CREATE INDEX idx_products_region   ON products(region_id);
CREATE INDEX idx_products_artist   ON products(artist);

-- ------------------------------------------------------------
-- Product Images  (gallery — many per product)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_images (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url       TEXT    NOT NULL,
    sort_order      INTEGER NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- Featured Sections  (which products appear in which homepage carousel)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS featured_products (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    section         TEXT    NOT NULL,                      -- recent_arrivals | top_vinyl | top_cd | ex_yu
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(product_id, section)
);

CREATE INDEX idx_featured_section ON featured_products(section);

-- ------------------------------------------------------------
-- Wishlist
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wishlist (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, product_id)
);

-- ------------------------------------------------------------
-- Orders
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER REFERENCES users(id),          -- NULL = guest order
    status          TEXT    NOT NULL DEFAULT 'New',         -- New | Processing | Shipped | Completed | Cancelled
    payment_method  TEXT    NOT NULL,                       -- credit_card | cash | local_pickup
    subtotal        REAL    NOT NULL,
    shipping_cost   REAL    NOT NULL DEFAULT 0,
    total           REAL    NOT NULL,
    -- delivery snapshot
    ship_name       TEXT    NOT NULL,
    ship_street     TEXT    NOT NULL,
    ship_city       TEXT    NOT NULL,
    ship_postal     TEXT    NOT NULL,
    ship_country    TEXT    NOT NULL DEFAULT 'Serbia',
    ship_phone      TEXT,
    -- guest-only fields
    guest_email     TEXT,
    notes           TEXT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_orders_user   ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ------------------------------------------------------------
-- Order Items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id        INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      INTEGER NOT NULL REFERENCES products(id),
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    unit_price      REAL    NOT NULL,
    total_price     REAL    NOT NULL
);

-- ------------------------------------------------------------
-- Order Status History  (audit trail)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_status_history (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id        INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    old_status      TEXT,
    new_status      TEXT    NOT NULL,
    changed_by      INTEGER REFERENCES users(id),
    note            TEXT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------
-- Site Settings  (key-value for footer, contact, socials, etc.)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
    key             TEXT    PRIMARY KEY,
    value           TEXT    NOT NULL,
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------
-- Store Locations  (for "find in store" feature)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS store_locations (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL,
    address         TEXT    NOT NULL,
    city            TEXT    NOT NULL,
    phone           TEXT,
    lat             REAL,
    lng             REAL,
    is_active       INTEGER NOT NULL DEFAULT 1
);

-- ------------------------------------------------------------
-- Store Inventory  (per-store stock for "find in store")
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS store_inventory (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id        INTEGER NOT NULL REFERENCES store_locations(id) ON DELETE CASCADE,
    product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity        INTEGER NOT NULL DEFAULT 0,
    UNIQUE(store_id, product_id)
);

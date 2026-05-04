#!/bin/bash
# ============================================================
# Vinyl Shop — Database Init Script
# Creates (or recreates) the SQLite database from schema + seed
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DB_PATH="$SCRIPT_DIR/../vinylshop.db"

echo "🗄️  Vinyl Shop Database Initializer"
echo "──────────────────────────────────"

# Remove existing DB if present
if [ -f "$DB_PATH" ]; then
    echo "⚠️  Removing existing database..."
    rm "$DB_PATH"
fi

echo "📐 Applying schema..."
sqlite3 "$DB_PATH" < "$SCRIPT_DIR/schema.sql"

echo "🌱 Seeding data..."
sqlite3 "$DB_PATH" < "$SCRIPT_DIR/seed.sql"

echo ""
echo "✅ Database created at: $DB_PATH"
echo ""

# Quick verification
echo "📊 Verification:"
sqlite3 "$DB_PATH" "SELECT '   Categories: ' || count(*) FROM categories;"
sqlite3 "$DB_PATH" "SELECT '   Genres:      ' || count(*) FROM genres;"
sqlite3 "$DB_PATH" "SELECT '   Regions:     ' || count(*) FROM regions;"
sqlite3 "$DB_PATH" "SELECT '   Products:    ' || count(*) FROM products;"
sqlite3 "$DB_PATH" "SELECT '   Users:       ' || count(*) FROM users;"
sqlite3 "$DB_PATH" "SELECT '   Orders:      ' || count(*) FROM orders;"
sqlite3 "$DB_PATH" "SELECT '   Settings:    ' || count(*) FROM settings;"
sqlite3 "$DB_PATH" "SELECT '   Stores:      ' || count(*) FROM store_locations;"
sqlite3 "$DB_PATH" "SELECT '   Featured:    ' || count(*) FROM featured_products;"
echo ""
echo "🚀 Done! Database is ready."

#!/usr/bin/env node
// Run after seed.sql to hash plaintext passwords
const bcrypt = require('bcryptjs');
const db = require('./config/db');

const users = db.prepare('SELECT id, email, password_hash FROM users').all();
for (const user of users) {
  // Skip if already hashed (bcrypt hashes start with $2)
  if (user.password_hash.startsWith('$2')) continue;
  const hash = bcrypt.hashSync(user.password_hash, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id);
  console.log(`  Hashed password for ${user.email}`);
}
console.log('Done.');

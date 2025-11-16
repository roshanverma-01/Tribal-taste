// db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.sqlite');

const db = new sqlite3.Database(DB_PATH);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function init() {
  // create tables
  await run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      image TEXT,
      category TEXT,
      origin TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS stories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      excerpt TEXT,
      image TEXT,
      author TEXT,
      read_time TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS carts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cart_token TEXT NOT NULL,
      items_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // seed products if empty
  const rows = await all(`SELECT id FROM products LIMIT 1`);
  if (!rows || rows.length === 0) {
    const seedProducts = [
      {
        name: 'Wild Forest Honey',
        description: 'Pure, unprocessed honey harvested from tribal forest communities in the Western Ghats',
        price: 450,
        image: 'https://images.unsplash.com/photo-1645549826194-1956802d83c2?q=80&w=1080&auto=format&fit=crop',
        category: 'Sweeteners',
        origin: 'Western Ghats, Karnataka'
      },
      {
        name: 'Red Rice',
        description: 'Nutrient-rich indigenous rice variety grown by tribal farmers using traditional methods',
        price: 180,
        image: 'https://images.unsplash.com/photo-1613728913341-8f29b02b8253?q=80&w=1080&auto=format&fit=crop',
        category: 'Grains',
        origin: 'Odisha Tribal Regions'
      },
      {
        name: 'Organic Turmeric',
        description: 'High-curcumin turmeric powder from indigenous farming communities of Northeast India',
        price: 220,
        image: 'https://images.unsplash.com/photo-1633881614907-8587c9b93c2f?q=80&w=1080&auto=format&fit=crop',
        category: 'Spices',
        origin: 'Meghalaya'
      },
      {
        name: 'Herbal Tea Blend',
        description: 'Traditional medicinal herb tea blend prepared by tribal healers',
        price: 320,
        image: 'https://images.unsplash.com/photo-1689402059850-eaff40b7b994?q=80&w=1080&auto=format&fit=crop',
        category: 'Beverages',
        origin: 'Arunachal Pradesh'
      },
      {
        name: 'Forest Spice Mix',
        description: 'Authentic blend of wild-harvested spices used in tribal cuisine for centuries',
        price: 280,
        image: 'https://images.unsplash.com/photo-1700227280140-ee5a75cc096b?q=80&w=1080&auto=format&fit=crop',
        category: 'Spices',
        origin: 'Jharkhand'
      },
      {
        name: 'Bamboo Shoot Pickle',
        description: 'Traditional fermented bamboo shoot pickle made by Naga tribal communities',
        price: 240,
        image: 'https://images.unsplash.com/photo-1626572984401-83cbf7bfb3f3?q=80&w=1080&auto=format&fit=crop',
        category: 'Preserves',
        origin: 'Nagaland'
      }
    ];

    for (const p of seedProducts) {
      await run(
        `INSERT INTO products (name, description, price, image, category, origin) VALUES (?, ?, ?, ?, ?, ?)`,
        [p.name, p.description, p.price, p.image, p.category, p.origin]
      );
    }
    console.log('Seeded products');
  }

  // seed stories if empty
  const srows = await all(`SELECT id FROM stories LIMIT 1`);
  if (!srows || srows.length === 0) {
    const seedStories = [
      {
        title: 'The Ancient Art of Wild Honey Harvesting',
        excerpt: 'Deep in the forests of the Western Ghats, tribal honey hunters continue a tradition that has been passed down through generations...',
        image: 'https://images.unsplash.com/photo-1606239763507-f44d0c248629?q=80&w=1080&auto=format&fit=crop',
        author: 'Priya Sharma',
        read_time: '5 min read'
      },
      {
        title: 'Red Rice: The Forgotten Superfood',
        excerpt: 'Discover how tribal communities in Odisha have been cultivating this nutrient-dense grain for over a thousand years...',
        image: 'https://images.unsplash.com/photo-1758812818698-4814bdfed2d5?q=80&w=1080&auto=format&fit=crop',
        author: 'Rajesh Kumar',
        read_time: '7 min read'
      },
      {
        title: 'Empowering Women Through Spice Cooperatives',
        excerpt: 'Meet the women-led self-help groups transforming the spice trade in Northeast India and reclaiming their heritage...',
        image: 'https://images.unsplash.com/photo-1700227280140-ee5a75cc096b?q=80&w=1080&auto=format&fit=crop',
        author: 'Anita Devi',
        read_time: '6 min read'
      }
    ];

    for (const s of seedStories) {
      await run(
        `INSERT INTO stories (title, excerpt, image, author, read_time) VALUES (?, ?, ?, ?, ?)`,
        [s.title, s.excerpt, s.image, s.author, s.read_time]
      );
    }
    console.log('Seeded stories');
  }
}

module.exports = { db, run, all, get, init };

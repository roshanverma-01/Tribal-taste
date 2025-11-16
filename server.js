// server.js
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { run, all, get, init } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: true })); // adjust origin for production
app.use(bodyParser.json({ limit: '200kb' }));

// simple rate-limiter
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120
});
app.use(limiter);

// initialize DB and seed
init().catch(err => {
  console.error('DB init error', err);
  process.exit(1);
});

// --- PRODUCTS ---
// GET /api/products?category=Spices
app.get('/api/products', async (req, res) => {
  try {
    const { category, q } = req.query;
    let sql = 'SELECT * FROM products';
    const params = [];
    if (category) {
      sql += ' WHERE category = ?';
      params.push(category);
    } else if (q) {
      sql += ' WHERE name LIKE ? OR description LIKE ?';
      params.push(`%${q}%`, `%${q}%`);
    }
    sql += ' ORDER BY created_at DESC';
    const rows = await all(sql, params);
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const row = await get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ ok: false, error: 'not_found' });
    res.json({ ok: true, data: row });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const rows = await all('SELECT DISTINCT category FROM products');
    res.json({ ok: true, data: rows.map(r => r.category) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});

// create/update product (admin) — NOTE: add auth before using in production
app.post('/api/admin/products', async (req, res) => {
  try {
    const { name, description, price, image, category, origin } = req.body;
    if (!name || !price) return res.status(400).json({ ok: false, error: 'name_and_price_required' });
    const result = await run(
      'INSERT INTO products (name, description, price, image, category, origin) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description || '', price, image || '', category || '', origin || '']
    );
    res.json({ ok: true, id: result.lastID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});

app.put('/api/admin/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description, price, image, category, origin } = req.body;
    await run(
      `UPDATE products SET name = COALESCE(?, name), description = COALESCE(?, description), price = COALESCE(?, price), image = COALESCE(?, image), category = COALESCE(?, category), origin = COALESCE(?, origin) WHERE id = ?`,
      [name, description, price, image, category, origin, id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});

// --- STORIES ---
app.get('/api/stories', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM stories ORDER BY created_at DESC');
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});

app.get('/api/stories/:id', async (req, res) => {
  try {
    const row = await get('SELECT * FROM stories WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ ok: false, error: 'not_found' });
    res.json({ ok: true, data: row });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});

// admin stories
app.post('/api/admin/stories', async (req, res) => {
  try {
    const { title, excerpt, image, author, read_time } = req.body;
    if (!title) return res.status(400).json({ ok: false, error: 'title_required' });
    const r = await run(
      'INSERT INTO stories (title, excerpt, image, author, read_time) VALUES (?, ?, ?, ?, ?)',
      [title, excerpt || '', image || '', author || '', read_time || '']
    );
    res.json({ ok: true, id: r.lastID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});

// --- FORMS: JOIN, PARTNER, SUBSCRIBE, CONTACT ---
// Stored as generic payload in forms table
app.post('/api/forms/:type', async (req, res) => {
  try {
    const type = req.params.type; // expected: join, partner, subscribe, contact
    const payload = req.body;
    // minimal validation
    if (type === 'subscribe' && !payload.email) {
      return res.status(400).json({ ok: false, error: 'email_required' });
    }
    // store as JSON string
    await run('INSERT INTO forms (type, payload) VALUES (?, ?)', [type, JSON.stringify(payload)]);
    // TODO: optionally trigger email or webhook
    res.json({ ok: true, message: 'received' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});

// --- CART (simple) ---
// create or update cart by token
app.post('/api/cart', async (req, res) => {
  try {
    const { cart_token, items } = req.body;
    if (!cart_token || !items) return res.status(400).json({ ok: false, error: 'token_and_items_required' });

    // check existing
    const existing = await get('SELECT id FROM carts WHERE cart_token = ?', [cart_token]);
    if (!existing) {
      const r = await run('INSERT INTO carts (cart_token, items_json) VALUES (?, ?)', [cart_token, JSON.stringify(items)]);
      res.json({ ok: true, id: r.lastID });
    } else {
      await run('UPDATE carts SET items_json = ?, updated_at = CURRENT_TIMESTAMP WHERE cart_token = ?', [JSON.stringify(items), cart_token]);
      res.json({ ok: true, updated: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});

app.get('/api/cart/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const row = await get('SELECT * FROM carts WHERE cart_token = ?', [token]);
    if (!row) return res.json({ ok: true, data: null });
    res.json({ ok: true, data: JSON.parse(row.items_json) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});

// health
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.listen(PORT, () => console.log(`SuperFood API listening on http://localhost:${PORT}`));

fetch('package.json')
  .then(res => res.json())
  .then(data => {
    console.log("Loaded JSON:", data);
  });

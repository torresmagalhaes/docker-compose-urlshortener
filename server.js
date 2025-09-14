const express = require('express');
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateToken, JWT_SECRET } = require('./middleware/auth');

const port = 3000;
const app = express();
app.use(express.json());

// Healthcheck
app.get('/', (req, res) => {
  res.sendStatus(200);
});

// Signup
app.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExists = await pool.query(
      'SELECT 1 FROM users WHERE email = $1',
      [email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, passwordHash]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: newUser.rows[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.rows[0].id, email: user.rows[0].email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Setup DB
app.get('/setup', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS urls (
        id SERIAL PRIMARY KEY,
        original_url TEXT NOT NULL,
        short_code VARCHAR(6) UNIQUE NOT NULL,
        user_id INT REFERENCES users(id),
        clicks INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP NULL
      );
    `);

    res.status(200).send("Tables created");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// List active users
app.get('/users', async (req, res) => {
  try {
    const data = await pool.query('SELECT id, email, created_at FROM users WHERE deleted_at IS NULL');
    res.json(data.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

// Generate short code
function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 })
    .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
    .join('');
}

// Shorten URL
app.post('/shorten', authenticateToken, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    let shortCode;
    let exists;
    do {
      shortCode = generateShortCode();
      exists = await pool.query('SELECT 1 FROM urls WHERE short_code = $1', [shortCode]);
    } while (exists.rows.length > 0);

    const result = await pool.query(
      'INSERT INTO urls (original_url, short_code, user_id) VALUES ($1, $2, $3) RETURNING *',
      [url, shortCode, req.user?.userId || null]
    );

    res.status(201).json({
      original_url: url,
      short_url: `http://localhost:${port}/${shortCode}`,
      short_code: shortCode,
      created_at: result.rows[0].created_at
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while shortening URL' });
  }
});

// Get all active URLs
app.get('/urls', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM urls WHERE deleted_at IS NULL');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error fetching URLs' });
  }
});

// Redirect
app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const result = await pool.query(
      'UPDATE urls SET clicks = clicks + 1 WHERE short_code = $1 RETURNING original_url',
      [shortCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    res.redirect(result.rows[0].original_url);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error during redirect' });
  }
});

// Soft delete user
app.patch('/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date();

    // Check if user exists and is not already deleted
    const userExists = await pool.query(
      'SELECT 1 FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (userExists.rows.length === 0) {
      return res.status(404).json({ error: 'User not found or already deleted' });
    }

    // Perform soft delete
    await pool.query(
      'UPDATE users SET deleted_at = $1, updated_at = $1 WHERE id = $2 RETURNING id',
      [now, id]
    );

    res.json({ message: 'User successfully deleted', deleted_at: now });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while deleting user' });
  }
});

// Soft delete URL
app.patch('/urls/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date();

    // Check if URL exists and is not already deleted
    const urlExists = await pool.query(
      'SELECT user_id FROM urls WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (urlExists.rows.length === 0) {
      return res.status(404).json({ error: 'URL not found or already deleted' });
    }

    // Check authorization:
    // - If URL has a user_id, only that user can delete it
    // - If URL has no user_id (is public), any authenticated user can delete it
    if (urlExists.rows[0].user_id !== null && urlExists.rows[0].user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this URL' });
    }

    // Perform soft delete
    await pool.query(
      'UPDATE urls SET deleted_at = $1, updated_at = $1 WHERE id = $2 RETURNING id',
      [now, id]
    );

    res.json({ message: 'URL successfully deleted', deleted_at: now });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while deleting URL' });
  }
});

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));

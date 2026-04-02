const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

function register(req, res) {
  try {
    const { name, email, password, phone, blood_group, age, district, latitude, longitude } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const password_hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, phone, blood_group, age, district, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, email, password_hash, phone || null, blood_group || null, age || null, district || null, latitude || 27.7172, longitude || 85.3240);

    const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed.' });
  }
}

function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const { password_hash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
}

function getMe(req, res) {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const { password_hash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user.' });
  }
}

module.exports = { register, login, getMe };

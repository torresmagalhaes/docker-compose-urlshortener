// app.js
const express = require('express');
const { authenticateToken, JWT_SECRET } = require('./infrastructure/middleware/auth');
const pool = require('./infrastructure/database/connection');

// Repositories
const PostgresUserRepository = require('./infrastructure/database/PostgresUserRepository');
const PostgresUrlRepository = require('./infrastructure/database/PostgresUrlRepository');

// Services
const AuthService = require('./application/services/AuthService');
const UrlService = require('./application/services/UrlService');

// Controllers
const AuthController = require('./interfaces/http/AuthController');
const UrlController = require('./interfaces/http/UrlController');

// Database initialization
const initDatabase = require('./infrastructure/database/init'); // cria as tabelas

const app = express();
app.use(express.json());

// Initialize repositories
const userRepository = new PostgresUserRepository(pool);
const urlRepository = new PostgresUrlRepository(pool);

// Initialize services
const authService = new AuthService(userRepository);
const urlService = new UrlService(urlRepository);

// Initialize controllers
const authController = new AuthController(authService);
const urlController = new UrlController(urlService);

// Routes
app.get('/', (req, res) => res.sendStatus(200));

// Database setup route
app.get('/setup', async (req, res) => {
    try {
        await initDatabase(); // cria as tabelas se não existirem
        res.json({ message: 'Database initialized successfully' });
    } catch (err) {
        console.error('Error during setup:', err);
        res.status(500).json({ error: err.message });
    }
});

// Auth routes
app.post('/signup', (req, res) => authController.signup(req, res));
app.post('/login', (req, res) => authController.login(req, res));
app.patch('/users/:id', authenticateToken, (req, res) => authController.deleteUser(req, res));

// URL routes
app.post('/shorten', authenticateToken, (req, res) => urlController.shorten(req, res));
app.get('/urls', (req, res) => urlController.listUrls(req, res)); // Novo endpoint de listagem
app.patch('/urls/:id', authenticateToken, (req, res) => urlController.delete(req, res));
app.get('/:shortCode', (req, res) => urlController.redirect(req, res));

// Start server
const port = 3000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));

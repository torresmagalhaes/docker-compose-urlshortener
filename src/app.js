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

// Initialize repositories
const userRepository = new PostgresUserRepository(pool);
const urlRepository = new PostgresUrlRepository(pool);

// Initialize services
const authService = new AuthService(userRepository);
const urlService = new UrlService(urlRepository);

// Initialize controllers
const authController = new AuthController(authService);
const urlController = new UrlController(urlService);

const app = express();
app.use(express.json());

// Routes
app.get('/', (req, res) => res.sendStatus(200));

// Auth routes
app.post('/signup', (req, res) => authController.signup(req, res));
app.post('/login', (req, res) => authController.login(req, res));

// URL routes
app.post('/shorten', authenticateToken, (req, res) => urlController.shorten(req, res));
app.get('/urls', authenticateToken, (req, res) => urlController.listActive(req, res));
app.patch('/urls/:id', authenticateToken, (req, res) => urlController.delete(req, res));
app.get('/:shortCode', (req, res) => urlController.redirect(req, res));

const port = 3000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
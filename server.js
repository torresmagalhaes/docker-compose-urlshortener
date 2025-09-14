const express = require('express');
const pool = require('./db');
const bcrypt = require('bcrypt');
const port = 3000;

const app = express(); 
app.use(express.json()); 

app.get('/', async (req, res) => {
    res.sendStatus(200);
});

app.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate if email exists
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ 
                error: 'User already exists with this email' 
            });
        }

        // Hash the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const newUser = await pool.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
            [email, passwordHash]
        );

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser.rows[0].id,
                email: newUser.rows[0].email,
                created_at: newUser.rows[0].created_at
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error during signup' });
    }
});

app.post('/', async (req, res) => {
    const { name, location } = req.body;  
    res.status(200).send({
        message: 'Your keys were ${name} and ${location}'});
});

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
                user_id INT NULL REFERENCES users(id),
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


app.listen(port, () => console.log("Server is running on port " + port));
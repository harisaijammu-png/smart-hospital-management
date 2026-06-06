const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hospital_db',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    max: 10,
    idleTimeoutMillis: 30000,
});

// Patient Routes
app.post('/api/patients', async (req, res) => {
    const { displayToken, tokenNumber, name, phone, age, deptId, complaint } = req.body;
    await pool.query(
        'INSERT INTO patients (displaytoken, tokennumber, name, phone, age, deptid, complaint) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [displayToken, tokenNumber, name, phone, age, deptId, complaint]
    );
    res.sendStatus(201);
});

app.get('/api/patients', async (req, res) => {
    const result = await pool.query('SELECT * FROM patients ORDER BY id DESC');
    res.json(result.rows);
});

// Lab Routes
app.post('/api/lab', async (req, res) => {
    const { token, tests } = req.body;
    await pool.query('INSERT INTO lab_requests (token, tests) VALUES ($1, $2)', [token, tests]);
    res.sendStatus(201);
});

app.get('/api/lab', async (req, res) => {
    const result = await pool.query('SELECT * FROM lab_requests ORDER BY id DESC');
    res.json(result.rows);
});

// Pharmacy Routes
app.post('/api/pharmacy', async (req, res) => {
    const { token, medicines } = req.body;
    await pool.query('INSERT INTO prescriptions (token, medicines) VALUES ($1, $2)', [token, medicines]);
    res.sendStatus(201);
});

app.get('/api/pharmacy', async (req, res) => {
    const result = await pool.query('SELECT * FROM prescriptions ORDER BY id DESC');
    res.json(result.rows);
});

// Reset System
app.delete('/api/reset', async (req, res) => {
    await pool.query('DELETE FROM patients');
    await pool.query('DELETE FROM lab_requests');
    await pool.query('DELETE FROM prescriptions');
    res.sendStatus(204);
});

const PORT = process.env.PORT || 5000;
const buildPath = path.join(__dirname, 'build');

// Serve React build if it exists
if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(buildPath, 'index.html'));
    });
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
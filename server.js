const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hospital_db',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Patient Routes
app.post('/api/patients', async (req, res) => {
    const { displayToken, tokenNumber, name, phone, age, deptId, complaint } = req.body;
    await pool.execute('INSERT INTO patients (displayToken, tokenNumber, name, phone, age, deptId, complaint) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [displayToken, tokenNumber, name, phone, age, deptId, complaint]);
    res.sendStatus(201);
});

app.get('/api/patients', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM patients ORDER BY id DESC');
    res.json(rows);
});

// Lab Routes
app.post('/api/lab', async (req, res) => {
    const { token, tests } = req.body;
    await pool.execute('INSERT INTO lab_requests (token, tests) VALUES (?, ?)', [token, tests]);
    res.sendStatus(201);
});

app.get('/api/lab', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM lab_requests ORDER BY id DESC');
    res.json(rows);
});

// Pharmacy Routes
app.post('/api/pharmacy', async (req, res) => {
    const { token, medicines } = req.body;
    await pool.execute('INSERT INTO prescriptions (token, medicines) VALUES (?, ?)', [token, medicines]);
    res.sendStatus(201);
});

app.get('/api/pharmacy', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM prescriptions ORDER BY id DESC');
    res.json(rows);
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
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Create MySQL connection pool
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

// Initialize database tables if they don't exist
const initDatabase = async () => {
    try {
        const connection = await pool.getConnection();

        await connection.query(`
            CREATE TABLE IF NOT EXISTS patients (
                id INT AUTO_INCREMENT PRIMARY KEY,
                displaytoken VARCHAR(50),
                tokennumber VARCHAR(50),
                name VARCHAR(100),
                phone VARCHAR(20),
                age INT,
                gender VARCHAR(20),
                address TEXT,
                deptid VARCHAR(50),
                complaint TEXT,
                status VARCHAR(50) DEFAULT 'WAITING',
                time_joined VARCHAR(50),
                lab_tests TEXT,
                lab_requested_at VARCHAR(50),
                lab_completed_at VARCHAR(50),
                lab_results TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS lab_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                token VARCHAR(50),
                tests TEXT,
                status VARCHAR(50) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS prescriptions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                token VARCHAR(50),
                medicines TEXT,
                status VARCHAR(50) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS dept_counters (
                dept_id VARCHAR(50) PRIMARY KEY,
                current_count INT DEFAULT 1
            )
        `);

        connection.release();
        console.log('Database tables initialized');
    } catch (err) {
        console.error('Failed to initialize database:', err);
    }
};

// Initialize database on startup
initDatabase();

// Init counters endpoint
app.post('/api/init-counters', async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const DEPARTMENTS = ['CARD', 'GYN', 'OPH', 'PED', 'ORTHO', 'DERM', 'NEURO', 'ENT', 'DENT', 'GEN'];

        for (const dept of DEPARTMENTS) {
            try {
                await connection.query(
                    'INSERT INTO dept_counters (dept_id, current_count) VALUES (?, ?) ON DUPLICATE KEY UPDATE current_count = current_count',
                    [dept, 1]
                );
            } catch (err) {
                // Ignore if already exists
            }
        }

        connection.release();
        res.json({ message: 'Counters initialized' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get department counter
app.get('/api/dept-counter/:deptId', async (req, res) => {
    try {
        const { deptId } = req.params;
        const connection = await pool.getConnection();

        const [result] = await connection.query('SELECT current_count FROM dept_counters WHERE dept_id = ?', [deptId]);

        if (result.length === 0) {
            await connection.query('INSERT INTO dept_counters (dept_id, current_count) VALUES (?, ?)', [deptId, 1]);
            connection.release();
            res.json({ current_count: 1 });
        } else {
            connection.release();
            res.json({ current_count: result[0].current_count });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update department counter
app.put('/api/dept-counter/:deptId', async (req, res) => {
    try {
        const { deptId } = req.params;
        const { currentCount } = req.body;
        const connection = await pool.getConnection();

        await connection.query('UPDATE dept_counters SET current_count = ? WHERE dept_id = ?', [currentCount, deptId]);

        connection.release();
        res.json({ updated: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Patient Routes
app.post('/api/patients', async (req, res) => {
    try {
        const { displayToken, tokenNumber, name, phone, age, gender, address, complaint, deptId, status, time_joined } = req.body;
        const connection = await pool.getConnection();

        await connection.query(
            'INSERT INTO patients (displaytoken, tokennumber, name, phone, age, gender, address, complaint, deptid, status, time_joined) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [displayToken, tokenNumber, name, phone, age, gender, address, complaint, deptId, status || 'WAITING', time_joined]
        );

        connection.release();
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/patients', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query('SELECT * FROM patients ORDER BY id DESC');

        const patients = result.map(p => ({
            id: p.id,
            display_token: p.displaytoken,
            token_number: p.tokennumber,
            name: p.name,
            phone: p.phone,
            age: p.age,
            gender: p.gender,
            address: p.address,
            complaint: p.complaint,
            dept_id: p.deptid,
            status: p.status,
            time_joined: p.time_joined,
            lab_tests: p.lab_tests,
            lab_requested_at: p.lab_requested_at,
            lab_completed_at: p.lab_completed_at,
            lab_results: p.lab_results
        }));

        connection.release();
        res.json(patients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update patient status
app.put('/api/patients/token/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { status, lab_tests, lab_requested_at, lab_completed_at, lab_results } = req.body;

        const updates = [];
        const values = [];

        if (status) {
            updates.push('status = ?');
            values.push(status);
        }
        if (lab_tests) {
            updates.push('lab_tests = ?');
            values.push(lab_tests);
        }
        if (lab_requested_at) {
            updates.push('lab_requested_at = ?');
            values.push(lab_requested_at);
        }
        if (lab_completed_at) {
            updates.push('lab_completed_at = ?');
            values.push(lab_completed_at);
        }
        if (lab_results) {
            updates.push('lab_results = ?');
            values.push(lab_results);
        }

        values.push(token);

        if (updates.length === 0) {
            return res.json({ success: true });
        }

        const connection = await pool.getConnection();
        await connection.query(
            `UPDATE patients SET ${updates.join(', ')} WHERE displaytoken = ?`,
            values
        );

        connection.release();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lab Routes
app.post('/api/lab', async (req, res) => {
    try {
        const { token, tests, dept_id, status } = req.body;
        const connection = await pool.getConnection();

        await connection.query(
            'INSERT INTO lab_requests (token, tests) VALUES (?, ?)',
            [token, tests]
        );

        connection.release();
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/lab', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query('SELECT * FROM lab_requests ORDER BY id DESC');

        const labRequests = result.map(r => ({
            id: r.id,
            token: r.token,
            tests: r.tests,
            status: r.status || 'Pending'
        }));

        connection.release();
        res.json(labRequests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/lab/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const connection = await pool.getConnection();

        await connection.query('UPDATE lab_requests SET status = ? WHERE id = ?', [status, id]);

        connection.release();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Pharmacy Routes
app.post('/api/pharmacy', async (req, res) => {
    try {
        const { token, medicines } = req.body;
        const connection = await pool.getConnection();

        await connection.query(
            'INSERT INTO prescriptions (token, medicines) VALUES (?, ?)',
            [token, medicines]
        );

        connection.release();
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/pharmacy', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query('SELECT * FROM prescriptions ORDER BY id DESC');

        const prescriptions = result.map(p => ({
            id: p.id,
            token: p.token,
            medicines: p.medicines,
            status: p.status || 'Pending',
            timestamp: p.created_at ? new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
        }));

        connection.release();
        res.json(prescriptions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/pharmacy/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const connection = await pool.getConnection();

        await connection.query('UPDATE prescriptions SET status = ? WHERE id = ?', [status, id]);

        connection.release();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reset System
app.delete('/api/reset', async (req, res) => {
    try {
        const connection = await pool.getConnection();

        await connection.query('DELETE FROM patients');
        await connection.query('DELETE FROM lab_requests');
        await connection.query('DELETE FROM prescriptions');

        const DEPARTMENTS = ['CARD', 'GYN', 'OPH', 'PED', 'ORTHO', 'DERM', 'NEURO', 'ENT', 'DENT', 'GEN'];
        for (const dept of DEPARTMENTS) {
            await connection.query('UPDATE dept_counters SET current_count = 1 WHERE dept_id = ?', [dept]);
        }

        connection.release();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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
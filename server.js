const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const poolConfig = process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
} : {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hospital_db',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432
};

const pool = new Pool(poolConfig);

const initDatabase = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS patients (
                id SERIAL PRIMARY KEY,
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

        await pool.query(`
            CREATE TABLE IF NOT EXISTS lab_requests (
                id SERIAL PRIMARY KEY,
                token VARCHAR(50),
                tests TEXT,
                status VARCHAR(50) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS prescriptions (
                id SERIAL PRIMARY KEY,
                token VARCHAR(50),
                medicines TEXT,
                status VARCHAR(50) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS dept_counters (
                dept_id VARCHAR(50) PRIMARY KEY,
                current_count INT DEFAULT 1
            )
        `);

        console.log('Database tables initialized');
    } catch (err) {
        console.error('Failed to initialize database:', err);
    }
};

initDatabase();

app.post('/api/init-counters', async (req, res) => {
    try {
        const DEPARTMENTS = ['CARD', 'GYN', 'OPH', 'PED', 'ORTHO', 'DERM', 'NEURO', 'ENT', 'DENT', 'GEN'];

        for (const dept of DEPARTMENTS) {
            try {
                await pool.query(
                    'INSERT INTO dept_counters (dept_id, current_count) VALUES ($1, $2) ON CONFLICT (dept_id) DO UPDATE SET current_count = EXCLUDED.current_count',
                    [dept, 1]
                );
            } catch (err) {
                // Ignore
            }
        }

        res.json({ message: 'Counters initialized' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/dept-counter/:deptId', async (req, res) => {
    try {
        const { deptId } = req.params;
        const { rows } = await pool.query('SELECT current_count FROM dept_counters WHERE dept_id = $1', [deptId]);

        if (rows.length === 0) {
            await pool.query('INSERT INTO dept_counters (dept_id, current_count) VALUES ($1, $2)', [deptId, 1]);
            res.json({ current_count: 1 });
        } else {
            res.json({ current_count: rows[0].current_count });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/dept-counter/:deptId', async (req, res) => {
    try {
        const { deptId } = req.params;
        const { currentCount } = req.body;
        await pool.query('UPDATE dept_counters SET current_count = $1 WHERE dept_id = $2', [currentCount, deptId]);
        res.json({ updated: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/patients', async (req, res) => {
    try {
        const { displayToken, tokenNumber, name, phone, age, gender, address, complaint, deptId, status, time_joined } = req.body;
        await pool.query(
            'INSERT INTO patients (displaytoken, tokennumber, name, phone, age, gender, address, complaint, deptid, status, time_joined) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
            [displayToken, tokenNumber, name, phone, age, gender, address, complaint, deptId, status || 'WAITING', time_joined]
        );
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/patients', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM patients ORDER BY id DESC');
        const patients = rows.map(p => ({
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
        res.json(patients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/patients/token/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { status, lab_tests, lab_requested_at, lab_completed_at, lab_results } = req.body;

        const updates = [];
        const values = [];
        let paramCount = 1;

        if (status) {
            updates.push(`status = $${paramCount++}`);
            values.push(status);
        }
        if (lab_tests) {
            updates.push(`lab_tests = $${paramCount++}`);
            values.push(lab_tests);
        }
        if (lab_requested_at) {
            updates.push(`lab_requested_at = $${paramCount++}`);
            values.push(lab_requested_at);
        }
        if (lab_completed_at) {
            updates.push(`lab_completed_at = $${paramCount++}`);
            values.push(lab_completed_at);
        }
        if (lab_results) {
            updates.push(`lab_results = $${paramCount++}`);
            values.push(lab_results);
        }

        if (updates.length === 0) {
            return res.json({ success: true });
        }

        values.push(token);
        
        await pool.query(
            `UPDATE patients SET ${updates.join(', ')} WHERE displaytoken = $${paramCount}`,
            values
        );

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/lab', async (req, res) => {
    try {
        const { token, tests } = req.body;
        await pool.query('INSERT INTO lab_requests (token, tests) VALUES ($1, $2)', [token, tests]);
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/lab', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM lab_requests ORDER BY id DESC');
        const labRequests = rows.map(r => ({
            id: r.id,
            token: r.token,
            tests: r.tests,
            status: r.status || 'Pending'
        }));
        res.json(labRequests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/lab/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await pool.query('UPDATE lab_requests SET status = $1 WHERE id = $2', [status, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/pharmacy', async (req, res) => {
    try {
        const { token, medicines } = req.body;
        await pool.query('INSERT INTO prescriptions (token, medicines) VALUES ($1, $2)', [token, medicines]);
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/pharmacy', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM prescriptions ORDER BY id DESC');
        const prescriptions = rows.map(p => ({
            id: p.id,
            token: p.token,
            medicines: p.medicines,
            status: p.status || 'Pending',
            timestamp: p.created_at ? new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
        }));
        res.json(prescriptions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/pharmacy/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await pool.query('UPDATE prescriptions SET status = $1 WHERE id = $2', [status, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/reset', async (req, res) => {
    try {
        await pool.query('DELETE FROM patients');
        await pool.query('DELETE FROM lab_requests');
        await pool.query('DELETE FROM prescriptions');

        const DEPARTMENTS = ['CARD', 'GYN', 'OPH', 'PED', 'ORTHO', 'DERM', 'NEURO', 'ENT', 'DENT', 'GEN'];
        for (const dept of DEPARTMENTS) {
            await pool.query('UPDATE dept_counters SET current_count = 1 WHERE dept_id = $1', [dept]);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
const buildPath = path.join(__dirname, 'build');

if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(buildPath, 'index.html'));
    });
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
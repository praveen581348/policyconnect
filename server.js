const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Try to LOAD sqlite3 but don't CRASH if it fails
let sqlite3;
try {
    const sqlite3Pkg = require('sqlite3');
    sqlite3 = sqlite3Pkg.verbose();
    console.log("SQLITE3 Loaded successfully");
} catch (e) {
    console.warn("SQLITE3 could not be loaded in this environment. Falling back to Mock DB for preview.");
}

const DB_FILE = path.join(process.cwd(), 'database.db');
let db = null;

// Mock DB logic for Preview Performance
const mockDB = {
    enquiries: [],
    admins: [{username: 'admin', password: 'admin123'}],
    serialize: (cb) => cb(),
    run: function(q, p, cb) { 
        if (typeof p === 'function') cb = p;
        if (q.includes('INSERT INTO enquiries')) {
            this.enquiries.push({id: Date.now(), fullName: p[0], phone: p[1], status: 'Pending', date: p[8]});
        }
        if (cb) cb(null); 
    },
    get: function(q, p, cb) {
        if (q.includes('SELECT * FROM admins')) cb(null, this.admins[0]);
        else cb(null, null);
    },
    all: function(q, p, cb) {
        cb(null, this.enquiries);
    }
};

if (sqlite3) {
    try {
        db = new sqlite3.Database(DB_FILE, (err) => {
            if (err) {
                console.error('DB Connection Error:', err);
                db = mockDB;
            } else {
                initTables();
            }
        });
    } catch (err) {
        db = mockDB;
    }
} else {
    db = mockDB;
}

function initTables() {
    if (!db || db === mockDB) return;
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS enquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullName TEXT, phone TEXT, age TEXT, gender TEXT, email TEXT,
            address TEXT, currentAddress TEXT, comments TEXT,
            status TEXT DEFAULT 'Pending', adminComments TEXT DEFAULT '',
            policyNumber TEXT DEFAULT '', date TEXT
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS admins (username TEXT PRIMARY KEY, password TEXT)`);
        db.run(`INSERT OR IGNORE INTO admins (username, password) VALUES ('admin', 'admin123')`);
    });
}

app.use(cors());
app.use(express.json());

app.get('/api/ping', (req, res) => res.json({ status: 'ok', preview: true }));

app.post('/api/enquiry', (req, res) => {
    const data = req.body;
    const date = new Date().toLocaleString();
    if (db === mockDB) {
        mockDB.enquiries.push({id: Date.now(), ...data, status: 'Pending', date});
        return res.json({ success: true });
    }
    const query = `INSERT INTO enquiries (fullName, phone, age, gender, email, address, currentAddress, comments, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(query, [data.fullName, data.phone, data.age, data.gender, data.email, data.address, data.currentAddress, data.comments, date], (err) => {
        res.json({ success: !err });
    });
});

app.post('/api/login', (req, res) => {
    const { user, pass } = req.body;
    if (user === 'admin' && pass === 'admin123') return res.json({ success: true });
    res.status(401).json({ success: false });
});

app.get('/api/enquiries', (req, res) => {
    if (db === mockDB) return res.json(mockDB.enquiries);
    db.all('SELECT * FROM enquiries ORDER BY id DESC', [], (err, rows) => res.json(rows || []));
});

app.post('/api/update', (req, res) => {
    const { id, status, adminComments, policyNumber } = req.body;
    if (db === mockDB) {
        const enq = mockDB.enquiries.find(e => e.id == id);
        if (enq) { enq.status = status; enq.adminComments = adminComments; enq.policyNumber = policyNumber; }
        return res.json({ success: true });
    }
    db.run(`UPDATE enquiries SET status = ?, adminComments = ?, policyNumber = ? WHERE id = ?`, [status, adminComments, policyNumber, id], () => res.json({ success: true }));
});

app.get('/api/export', (req, res) => {
    const rows = db === mockDB ? mockDB.enquiries : [];
    // Simplification for export in mock
    res.setHeader('Content-Type', 'text/csv');
    res.send("ID,Name,Status\n" + rows.map(r => `${r.id},${r.fullName},${r.status}`).join('\n'));
});

app.use(express.static('public'));

app.get('/enquiry.html', (req, res) => res.sendFile(path.join(process.cwd(), 'public', 'enquiry.html')));
app.get('/faqs.html', (req, res) => res.sendFile(path.join(process.cwd(), 'public', 'faqs.html')));
app.get('/admin.html', (req, res) => res.sendFile(path.join(process.cwd(), 'public', 'admin.html')));

app.get('*', (req, res) => res.sendFile(path.join(process.cwd(), 'public', 'index.html')));

app.listen(PORT, '0.0.0.0', () => console.log(`Stable Server on ${PORT}`));


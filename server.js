const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

const fs = require('fs');

class PersistentJSDB {
    constructor(filePath) {
        this.filePath = filePath;
        this.data = {
            enquiries: [
                {id: 1, fullName: 'Sarah Jenkins', phone: '+1 (555) 123-4567', age: '28', gender: 'Female', email: 'sarah.j@example.com', address: '742 Evergreen Terrace', currentAddress: '742 Evergreen Terrace', comments: 'Looking for a comprehensive family health insurance policy.', status: 'Pending', adminComments: 'Waiting for customer medical documents.', policyNumber: '-', date: '5/20/2026, 10:14:22 AM'},
                {id: 2, fullName: 'Robert Chen', phone: '+1 (555) 987-6543', age: '42', gender: 'Male', email: 'bchen@example.org', address: '120 Science Drive', currentAddress: '120 Science Drive', comments: 'Auto-insurance for Tesla Model Y. Quote for standard vs premium coverage.', status: 'Processing', adminComments: 'In discussions with underwriter regarding EV premium discounts.', policyNumber: '-', date: '5/21/2026, 11:20:15 AM'},
                {id: 3, fullName: 'Michael Rossi', phone: '+1 (555) 246-8102', age: '35', gender: 'Male', email: 'mrossi@example.net', address: '405 Oak Avenue', currentAddress: '405 Oak Avenue', comments: 'Term life insurance with high coverage for my children.', status: 'Accepted', adminComments: 'Verified medical clearance. Approved and issued policy.', policyNumber: 'POL-99482-10', date: '5/22/2026, 9:30:00 AM'},
                {id: 4, fullName: 'Emily Davis', phone: '+1 (555) 135-7913', age: '50', gender: 'Female', email: 'emdav@example.com', address: '888 Pine Road', currentAddress: '888 Pine Road', comments: 'Mutual Funds SIP investment advisor request.', status: 'Rejected', adminComments: 'Candidate requested coverage levels that exceed risk tolerance profile thresholds.', policyNumber: '-', date: '5/18/2026, 4:15:45 PM'},
                {id: 5, fullName: 'David Alao', phone: '+1 (555) 604-3210', age: '31', gender: 'Other', email: 'dalao@example.com', address: '91 Maple Court', currentAddress: '9 Maple Court', comments: 'Homeowner association liability discount questions.', status: 'Pending', adminComments: 'Initial inquiry submitted.', policyNumber: '-', date: '5/22/2026, 2:10:11 PM'}
            ],
            admins: [{username: 'admin', password: 'admin123'}],
            users: []
        };
        this.load();
    }

    load() {
        try {
            if (fs.existsSync(this.filePath)) {
                const content = fs.readFileSync(this.filePath, 'utf8');
                const parsed = JSON.parse(content);
                if (parsed && Array.isArray(parsed.enquiries)) {
                    this.data = parsed;
                }
                if (!this.data.users || !Array.isArray(this.data.users)) {
                    this.data.users = [];
                }
            } else {
                this.save();
            }
        } catch (e) {
            console.warn("Could not load persistent database, using defaults:", e);
        }
    }

    save() {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
        } catch (e) {
            console.error("Failed to write to persistent database:", e);
        }
    }

    serialize(cb) {
        cb();
    }

    run(query, params, cb) {
        if (typeof params === 'function') {
            cb = params;
            params = [];
        }
        
        // Handle INSERT
        if (query.includes('INSERT INTO enquiries') || query.includes('INSERT INTO  enquiries')) {
            let record = {};
            if (params.length === 9) {
                record = {
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    fullName: params[0],
                    phone: params[1],
                    age: params[2],
                    gender: params[3],
                    email: params[4],
                    address: params[5],
                    currentAddress: params[6],
                    comments: params[7],
                    status: 'Pending',
                    adminComments: '',
                    policyNumber: '',
                    date: params[8]
                };
            } else if (params.length === 12) {
                record = {
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    fullName: params[0],
                    phone: params[1],
                    age: params[2],
                    gender: params[3],
                    email: params[4],
                    address: params[5],
                    currentAddress: params[6],
                    comments: params[7],
                    status: params[8] || 'Pending',
                    adminComments: params[9] || '',
                    policyNumber: params[10] || '',
                    date: params[11]
                };
            } else {
                record = {
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    fullName: params[0] || '',
                    phone: params[1] || '',
                    age: params[2] || '',
                    gender: params[3] || '',
                    email: params[4] || '',
                    address: params[5] || '',
                    currentAddress: params[6] || '',
                    comments: params[7] || '',
                    status: 'Pending',
                    adminComments: '',
                    policyNumber: '',
                    date: new Date().toLocaleString()
                };
            }
            this.data.enquiries.push(record);
            this.save();
        } 
        // Handle UPDATE
        else if (query.includes('UPDATE enquiries')) {
            const [status, adminComments, policyNumber, id] = params;
            const item = this.data.enquiries.find(e => e.id == id);
            if (item) {
                item.status = status;
                item.adminComments = adminComments;
                item.policyNumber = policyNumber;
                this.save();
            }
        }
        
        if (cb) cb(null);
    }

    get(query, params, cb) {
        if (typeof params === 'function') {
            cb = params;
            params = [];
        }

        if (query.includes('COUNT(*)')) {
            cb(null, { count: this.data.enquiries.length });
        } else if (query.includes('SELECT * FROM admins')) {
            cb(null, this.data.admins[0]);
        } else {
            cb(null, null);
        }
    }

    all(query, params, cb) {
        if (typeof params === 'function') {
            cb = params;
            params = [];
        }
        cb(null, [...this.data.enquiries]);
    }

    prepare(query) {
        const self = this;
        return {
            run: function(params, cb) {
                self.run(query, params, cb);
            },
            finalize: function() {
                // Noop
            }
        };
    }
}

const DB_FILE = path.join(process.cwd(), 'persistent_database.json');
const db = new PersistentJSDB(DB_FILE);

function safeAll(query, params, cb) {
    db.all(query, params, cb);
}

function safeGet(query, params, cb) {
    db.get(query, params, cb);
}

function safeRun(query, params, cb) {
    db.run(query, params, cb);
}

app.use(cors());
app.use(express.json());

app.get('/api/ping', (req, res) => res.json({ status: 'ok', preview: true }));

app.post('/api/enquiry', (req, res) => {
    const data = req.body;
    const date = new Date().toLocaleString();
    const query = `INSERT INTO enquiries (fullName, phone, age, gender, email, address, currentAddress, comments, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    safeRun(query, [data.fullName, data.phone, data.age, data.gender, data.email, data.address, data.currentAddress, data.comments, date], (err) => {
        res.json({ success: !err });
    });
});

app.post('/api/login', (req, res) => {
    const { user, pass } = req.body;
    if (user === 'admin' && pass === 'admin123') return res.json({ success: true });
    res.status(401).json({ success: false });
});

app.post('/api/user/register', (req, res) => {
    const { fullName, phone, email, password } = req.body;
    
    if (!fullName || !phone || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const emailLower = email.trim().toLowerCase();
    const phoneTrim = phone.trim();

    // Check if user already exists (by email or phone)
    const exists = db.data.users.find(u => 
        (u.email && u.email.toLowerCase() === emailLower) || 
        (u.phone && u.phone === phoneTrim)
    );

    if (exists) {
        return res.status(400).json({ success: false, message: 'An account with this Email or Phone number already exists.' });
    }

    const newUser = {
        id: Date.now(),
        fullName: fullName.trim(),
        phone: phoneTrim,
        email: emailLower,
        password: password
    };

    db.data.users.push(newUser);
    db.save();

    res.json({ success: true, message: 'Registration successful! Please log in.' });
});

app.post('/api/user/login', (req, res) => {
    const { identifier, password } = req.body;
    
    if (!identifier || !password) {
        return res.status(400).json({ success: false, message: 'Email/Phone and Password are required.' });
    }

    const idLower = identifier.trim().toLowerCase();
    const user = db.data.users.find(u => 
        ((u.email && u.email.toLowerCase() === idLower) || (u.phone && u.phone === identifier.trim())) && 
        u.password === password
    );

    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid Email/Phone or Password.' });
    }

    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
});

app.get('/api/user/enquiries', (req, res) => {
    const email = req.query.email;
    const phone = req.query.phone;
    
    if (!email && !phone) {
        return res.status(400).json({ success: false, message: 'Email or phone query parameters are required.' });
    }

    const emailLower = email ? email.trim().toLowerCase() : '';
    const phoneTrim = phone ? phone.trim() : '';

    safeAll('SELECT * FROM enquiries ORDER BY id DESC', [], (err, rows) => {
        if (err) {
            // Backup direct query
            const filtered = db.data.enquiries.filter(e => {
                const matchEmail = emailLower && e.email && e.email.toLowerCase() === emailLower;
                const matchPhone = phoneTrim && e.phone && e.phone === phoneTrim;
                return matchEmail || matchPhone;
            });
            return res.json(filtered);
        }
        
        const filtered = (rows || []).filter(e => {
            const matchEmail = emailLower && e.email && e.email.toLowerCase() === emailLower;
            const matchPhone = phoneTrim && e.phone && e.phone === phoneTrim;
            return matchEmail || matchPhone;
        });
        res.json(filtered);
    });
});

app.post('/api/enquiry/comment', (req, res) => {
    const { id, userComment } = req.body;
    
    if (!id || !userComment || !userComment.trim()) {
        return res.status(400).json({ success: false, message: 'ID and user comment are required.' });
    }

    const cleanComment = userComment.trim();
    const dateStr = new Date().toLocaleString();

    // Query DB first
    safeAll('SELECT comments FROM enquiries WHERE id = ?', [id], (err, rows) => {
        if (err || !rows || rows.length === 0) {
            // Fallback: try direct persistent store update
            const item = db.data.enquiries.find(e => e.id == id);
            if (item) {
                item.comments = ((item.comments || '') + `\n\n[User message - ${dateStr}]: ${cleanComment}`).trim();
                db.save();
                return res.json({ success: true });
            }
            return res.status(404).json({ success: false, message: 'Enquiry not found.' });
        }

        const currentComments = rows[0].comments || '';
        const updatedComments = (currentComments + `\n\n[User message - ${dateStr}]: ${cleanComment}`).trim();

        // Update DB
        safeRun('UPDATE enquiries SET comments = ? WHERE id = ?', [updatedComments, id], (err2) => {
            if (err2) {
                // If SQL write failed, update memory cache & save file
                const item = db.data.enquiries.find(e => e.id == id);
                if (item) {
                    item.comments = updatedComments;
                    db.save();
                    return res.json({ success: true });
                }
                return res.status(500).json({ success: false, message: 'Failed to update database comments.' });
            }
            
            // Also keep JS Datastore in sync
            const item = db.data.enquiries.find(e => e.id == id);
            if (item) {
                item.comments = updatedComments;
                db.save();
            }
            res.json({ success: true });
        });
    });
});

app.get('/api/enquiries', (req, res) => {
    safeAll('SELECT * FROM enquiries ORDER BY id DESC', [], (err, rows) => {
        res.json(rows || []);
    });
});

app.post('/api/update', (req, res) => {
    const { id, status, adminComments, policyNumber } = req.body;
    safeRun(`UPDATE enquiries SET status = ?, adminComments = ?, policyNumber = ? WHERE id = ?`, [status, adminComments, policyNumber, id], () => {
        res.json({ success: true });
    });
});

app.get('/api/export', (req, res) => {
    safeAll('SELECT * FROM enquiries ORDER BY id DESC', [], (err, rows) => {
        const exportRows = rows || [];
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="enquiries.csv"');
        const headers = "ID,Name,Phone,Age,Gender,Email,Address,CurrentAddress,Status,PolicyNumber,Remarks,Date\n";
        const body = exportRows.map(r => `"${r.id}","${r.fullName || ''}","${r.phone || ''}","${r.age || ''}","${r.gender || ''}","${r.email || ''}","${r.address || ''}","${r.currentAddress || ''}","${r.status || ''}","${r.policyNumber || ''}","${r.adminComments || ''}","${r.date || ''}"`).join('\n');
        res.send(headers + body);
    });
});

app.use(express.static('public'));

app.get('/enquiry.html', (req, res) => res.sendFile(path.join(process.cwd(), 'public', 'enquiry.html')));
app.get('/faqs.html', (req, res) => res.sendFile(path.join(process.cwd(), 'public', 'faqs.html')));
app.get('/admin.html', (req, res) => res.sendFile(path.join(process.cwd(), 'public', 'admin.html')));

app.get('*', (req, res) => res.sendFile(path.join(process.cwd(), 'public', 'index.html')));

app.listen(PORT, '0.0.0.0', () => console.log(`Stable Server on ${PORT}`));


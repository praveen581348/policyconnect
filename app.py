import sqlite3
import csv
import io
import os
from flask import Flask, request, jsonify, send_from_directory, Response
from datetime import datetime

app = Flask(__name__, static_folder='public')
DB_FILE = 'database.db'

def get_db():
    conn = sqlite3.connect(DB_FILE, timeout=2.0)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute('''CREATE TABLE IF NOT EXISTS enquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT, fullName TEXT, phone TEXT, age TEXT, 
        gender TEXT, email TEXT, address TEXT, currentAddress TEXT, comments TEXT, 
        status TEXT DEFAULT 'Pending', adminComments TEXT DEFAULT '', policyNumber TEXT DEFAULT '', date TEXT)''')
    conn.execute('''CREATE TABLE IF NOT EXISTS admins (username TEXT PRIMARY KEY, password TEXT)''')
    conn.execute("INSERT OR IGNORE INTO admins (username, password) VALUES ('admin', 'admin123')")
    conn.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT,
        phone TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT
    )''')
    conn.commit()
    conn.close()

init_db()

@app.route('/')
@app.route('/index.html')
def home():
    return send_from_directory('public', 'index.html')

@app.route('/enquiry.html')
def enquiry_page():
    return send_from_directory('public', 'enquiry.html')

@app.route('/faqs.html')
def faqs_page():
    return send_from_directory('public', 'faqs.html')

@app.route('/admin.html')
def admin_page():
    return send_from_directory('public', 'admin.html')

@app.route('/<path:path>')
def static_files(path):
    if os.path.exists(os.path.join('public', path)):
        return send_from_directory('public', path)
    return send_from_directory('public', 'index.html')

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    conn = get_db()
    admin = conn.execute('SELECT * FROM admins WHERE username=? AND password=?', (data['user'], data['pass'])).fetchone()
    conn.close()
    if admin: 
        return jsonify({"success": True})
    return jsonify({"success": False}), 401

@app.route('/api/user/register', methods=['POST'])
def register_user():
    data = request.json or {}
    fullName = data.get('fullName', '').strip()
    phone = data.get('phone', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not fullName or not phone or not email or not password:
        return jsonify({"success": False, "message": "All fields are required."}), 400

    conn = get_db()
    try:
        user_check = conn.execute('SELECT * FROM users WHERE LOWER(email) = ? OR phone = ?', (email, phone)).fetchone()
        if user_check:
            conn.close()
            return jsonify({"success": False, "message": "An account with this Email or Phone number already exists."}), 400

        conn.execute('INSERT INTO users (fullName, phone, email, password) VALUES (?, ?, ?, ?)', (fullName, phone, email, password))
        conn.commit()
    except Exception as e:
        conn.close()
        return jsonify({"success": False, "message": f"Database error: {str(e)}"}), 500
        
    conn.close()
    return jsonify({"success": True, "message": "Registration successful! Please log in."})

@app.route('/api/user/login', methods=['POST'])
def login_user():
    data = request.json or {}
    identifier = data.get('identifier', '').strip()
    password = data.get('password', '')

    if not identifier or not password:
        return jsonify({"success": False, "message": "Email/Phone and Password are required."}), 400

    conn = get_db()
    try:
        id_lower = identifier.lower()
        user = conn.execute('SELECT * FROM users WHERE (LOWER(email) = ? OR phone = ?) AND password = ?', (id_lower, identifier, password)).fetchone()
        if not user:
            conn.close()
            return jsonify({"success": False, "message": "Invalid Email/Phone or Password."}), 401

        user_dict = dict(user)
        user_dict.pop('password', None)
    except Exception as e:
        conn.close()
        return jsonify({"success": False, "message": f"Database error: {str(e)}"}), 500

    conn.close()
    return jsonify({"success": True, "user": user_dict})

@app.route('/api/user/enquiries', methods=['GET'])
def get_user_enquiries():
    email = request.args.get('email', '').strip().lower()
    phone = request.args.get('phone', '').strip()
    
    if not email and not phone:
        return jsonify({"success": False, "message": "Email or phone required"}), 400

    conn = get_db()
    try:
        rows = conn.execute('SELECT * FROM enquiries WHERE LOWER(email) = ? OR phone = ? ORDER BY id DESC', (email, phone)).fetchall()
        enquiries = [dict(row) for row in rows]
    except Exception as e:
        conn.close()
        return jsonify({"success": False, "message": f"Database error: {str(e)}"}), 500
    
    conn.close()
    return jsonify(enquiries)

@app.route('/api/enquiry/comment', methods=['POST'])
def add_enquiry_comment():
    data = request.json or {}
    enq_id = data.get('id')
    user_comment = data.get('userComment', '').strip()

    if not enq_id or not user_comment:
        return jsonify({"success": False, "message": "ID and comment text are required."}), 400

    conn = get_db()
    try:
        enq = conn.execute('SELECT comments FROM enquiries WHERE id = ?', (enq_id,)).fetchone()
        if not enq:
            conn.close()
            return jsonify({"success": False, "message": "Enquiry not found."}), 404
        
        current_comments = enq['comments'] or ''
        date_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        updated_comments = (current_comments + f"\n\n[User message - {date_str}]: {user_comment}").strip()
        
        conn.execute('UPDATE enquiries SET comments = ? WHERE id = ?', (updated_comments, enq_id))
        conn.commit()
    except Exception as e:
        conn.close()
        return jsonify({"success": False, "message": f"Database error: {str(e)}"}), 500

    conn.close()
    return jsonify({"success": True})

@app.route('/api/enquiries', methods=['GET'])
def get_enquiries():
    conn = get_db()
    rows = conn.execute('SELECT * FROM enquiries ORDER BY id DESC').fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route('/api/enquiry', methods=['POST'])
def submit_enquiry():
    data = request.json
    conn = get_db()
    conn.execute('''INSERT INTO enquiries (fullName, phone, age, gender, email, address, currentAddress, comments, date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''', 
                    (data['fullName'], data['phone'], data['age'], data['gender'], data['email'], 
                     data['address'], data['currentAddress'], data['comments'], datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route('/api/update', methods=['POST'])
def update_enquiry():
    data = request.json
    conn = get_db()
    conn.execute('UPDATE enquiries SET status=?, adminComments=?, policyNumber=? WHERE id=?', 
                 (data['status'], data['adminComments'], data['policyNumber'], data['id']))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route('/api/export', methods=['GET'])
def export_csv():
    conn = get_db()
    rows = conn.execute('SELECT * FROM enquiries ORDER BY id DESC').fetchall()
    conn.close()
    si = io.StringIO()
    cw = csv.writer(si)
    if rows:
        cw.writerow(rows[0].keys())
        cw.writerows(rows)
    return Response(si.getvalue(), mimetype="text/csv", headers={"Content-disposition": "attachment; filename=export.csv"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)

import sqlite3
import csv
import io
import os
from flask import Flask, request, jsonify, send_from_directory, Response
from datetime import datetime

app = Flask(__name__, static_folder='public')
DB_FILE = 'database.db'

def get_db():
    conn = sqlite3.connect(DB_FILE)
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

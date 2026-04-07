

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)
DB_PATH = 'submissions.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    # Add new columns if they don't exist
    c.execute('''CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        phone TEXT,
        location TEXT,
        urgency TEXT,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    # Add columns to existing table if missing
    try:
        c.execute('ALTER TABLE submissions ADD COLUMN phone TEXT')
    except sqlite3.OperationalError:
        pass
    try:
        c.execute('ALTER TABLE submissions ADD COLUMN location TEXT')
    except sqlite3.OperationalError:
        pass
    try:
        c.execute('ALTER TABLE submissions ADD COLUMN urgency TEXT')
    except sqlite3.OperationalError:
        pass
    conn.commit()
    conn.close()

@app.route('/api/submit', methods=['POST'])
def submit():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    location = data.get('location')
    urgency = data.get('urgency')
    message = data.get('message')
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''INSERT INTO submissions (name, email, phone, location, urgency, message) VALUES (?, ?, ?, ?, ?, ?)''',
              (name, email, phone, location, urgency, message))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success'})

@app.route('/admin/submissions', methods=['GET'])
def view_submissions():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT id, name, email, phone, location, urgency, message, created_at FROM submissions ORDER BY created_at DESC')
    rows = c.fetchall()
    conn.close()
    submissions = [
        {
            'id': row[0],
            'name': row[1],
            'email': row[2],
            'phone': row[3],
            'location': row[4],
            'urgency': row[5],
            'message': row[6],
            'created_at': row[7]
        }
        for row in rows
    ]
    return jsonify(submissions)

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=8000)

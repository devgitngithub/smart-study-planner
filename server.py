"""
StudyFlow — Flask + SQLite Backend
Run: python server.py
Visit: http://localhost:5000
"""

import os, json, sqlite3, secrets
from datetime import datetime
from functools import wraps
from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'studyflow.db')

app = Flask(__name__, static_folder=BASE_DIR)
app.secret_key = 'studyflow_dev_secret_key_123'
CORS(app, supports_credentials=True)

# ─── DATABASE ───────────────────────────────────────────────

def get_db():
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA journal_mode=WAL")
    db.execute("PRAGMA foreign_keys=ON")
    return db

def init_db():
    db = get_db()
    db.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            edu_level TEXT DEFAULT '',
            institution TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            subject TEXT DEFAULT '',
            priority TEXT DEFAULT 'med',
            due TEXT DEFAULT '',
            done INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT DEFAULT 'Untitled',
            body TEXT DEFAULT '',
            subject TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS resources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            url TEXT NOT NULL,
            type TEXT DEFAULT 'Link',
            subject TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            target INTEGER DEFAULT 10,
            current INTEGER DEFAULT 0,
            color TEXT DEFAULT 'var(--gold)',
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS flashcards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS stats (
            user_id INTEGER PRIMARY KEY,
            focus_sessions INTEGER DEFAULT 0,
            study_hours REAL DEFAULT 0.0,
            streak INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    """)
    db.commit()
    db.close()

def row_to_dict(row):
    return dict(row) if row else None

def rows_to_list(rows):
    return [dict(r) for r in rows]

# ─── AUTH MIDDLEWARE ─────────────────────────────────────────

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Not authenticated'}), 401
        return f(*args, **kwargs)
    return decorated

# ─── AUTH ROUTES ────────────────────────────────────────────

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    edu_level = data.get('eduLevel') or ''
    institution = (data.get('institution') or '').strip()

    if not name: return jsonify({'error': 'Name is required'}), 400
    if not email or '@' not in email: return jsonify({'error': 'Valid email required'}), 400
    if len(password) < 4: return jsonify({'error': 'Password must be at least 4 characters'}), 400

    db = get_db()
    existing = db.execute("SELECT id FROM users WHERE email=?", (email,)).fetchone()
    if existing:
        db.close()
        return jsonify({'error': 'An account with this email already exists'}), 409

    pw_hash = generate_password_hash(password)
    cursor = db.execute(
        "INSERT INTO users (name, email, password_hash, edu_level, institution) VALUES (?,?,?,?,?)",
        (name, email, pw_hash, edu_level, institution)
    )
    user_id = cursor.lastrowid
    db.execute("INSERT INTO stats (user_id) VALUES (?)", (user_id,))

    # Insert default flashcards
    defaults = [
        ("What is the derivative of x²?", "2x"),
        ("Newton's Second Law?", "F = ma"),
        ("What is photosynthesis?", "Process by which plants convert light energy into chemical energy"),
        ("Quadratic Formula?", "x = (-b ± √(b²-4ac)) / 2a"),
    ]
    for q, a in defaults:
        db.execute("INSERT INTO flashcards (user_id, question, answer) VALUES (?,?,?)", (user_id, q, a))

    db.commit()

    avatar = ''.join(w[0] for w in name.split() if w).upper()[:2]
    session['user_id'] = user_id
    db.close()

    return jsonify({
        'ok': True,
        'user': {'id': user_id, 'name': name, 'email': email, 'eduLevel': edu_level,
                 'institution': institution, 'avatar': avatar}
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    db = get_db()
    user = db.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
    db.close()

    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid email or password'}), 401

    session['user_id'] = user['id']
    avatar = ''.join(w[0] for w in user['name'].split() if w).upper()[:2]

    return jsonify({
        'ok': True,
        'user': {'id': user['id'], 'name': user['name'], 'email': user['email'],
                 'eduLevel': user['edu_level'], 'institution': user['institution'], 'avatar': avatar}
    })

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'ok': True})

@app.route('/api/me', methods=['GET'])
@login_required
def me():
    db = get_db()
    user = db.execute("SELECT * FROM users WHERE id=?", (session['user_id'],)).fetchone()
    db.close()
    if not user: return jsonify({'error': 'User not found'}), 404
    avatar = ''.join(w[0] for w in user['name'].split() if w).upper()[:2]
    return jsonify({
        'user': {'id': user['id'], 'name': user['name'], 'email': user['email'],
                 'eduLevel': user['edu_level'], 'institution': user['institution'], 'avatar': avatar}
    })

# ─── TASKS ──────────────────────────────────────────────────

@app.route('/api/tasks', methods=['GET'])
@login_required
def get_tasks():
    db = get_db()
    rows = db.execute("SELECT * FROM tasks WHERE user_id=? ORDER BY created_at DESC", (session['user_id'],)).fetchall()
    db.close()
    return jsonify(rows_to_list(rows))

@app.route('/api/tasks', methods=['POST'])
@login_required
def add_task():
    data = request.json or {}
    db = get_db()
    cursor = db.execute(
        "INSERT INTO tasks (user_id, name, subject, priority, due) VALUES (?,?,?,?,?)",
        (session['user_id'], data.get('name',''), data.get('subject',''), data.get('priority','med'), data.get('due',''))
    )
    db.commit()
    task = db.execute("SELECT * FROM tasks WHERE id=?", (cursor.lastrowid,)).fetchone()
    db.close()
    return jsonify(row_to_dict(task)), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
@login_required
def update_task(task_id):
    data = request.json or {}
    db = get_db()
    db.execute("UPDATE tasks SET done=? WHERE id=? AND user_id=?",
               (1 if data.get('done') else 0, task_id, session['user_id']))
    db.commit()
    task = db.execute("SELECT * FROM tasks WHERE id=?", (task_id,)).fetchone()
    db.close()
    return jsonify(row_to_dict(task))

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
@login_required
def delete_task(task_id):
    db = get_db()
    db.execute("DELETE FROM tasks WHERE id=? AND user_id=?", (task_id, session['user_id']))
    db.commit()
    db.close()
    return jsonify({'ok': True})

# ─── NOTES ──────────────────────────────────────────────────

@app.route('/api/notes', methods=['GET'])
@login_required
def get_notes():
    db = get_db()
    rows = db.execute("SELECT * FROM notes WHERE user_id=? ORDER BY created_at DESC", (session['user_id'],)).fetchall()
    db.close()
    return jsonify(rows_to_list(rows))

@app.route('/api/notes', methods=['POST'])
@login_required
def add_note():
    data = request.json or {}
    db = get_db()
    cursor = db.execute(
        "INSERT INTO notes (user_id, title, body, subject) VALUES (?,?,?,?)",
        (session['user_id'], data.get('title','Untitled'), data.get('body',''), data.get('subject',''))
    )
    db.commit()
    note = db.execute("SELECT * FROM notes WHERE id=?", (cursor.lastrowid,)).fetchone()
    db.close()
    return jsonify(row_to_dict(note)), 201

@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
@login_required
def delete_note_api(note_id):
    db = get_db()
    db.execute("DELETE FROM notes WHERE id=? AND user_id=?", (note_id, session['user_id']))
    db.commit()
    db.close()
    return jsonify({'ok': True})

# ─── GOALS ──────────────────────────────────────────────────

@app.route('/api/goals', methods=['GET'])
@login_required
def get_goals():
    db = get_db()
    rows = db.execute("SELECT * FROM goals WHERE user_id=? ORDER BY created_at DESC", (session['user_id'],)).fetchall()
    db.close()
    return jsonify(rows_to_list(rows))

@app.route('/api/goals', methods=['POST'])
@login_required
def add_goal_api():
    data = request.json or {}
    colors = ['var(--gold)','var(--teal)','var(--purple)','var(--green)','var(--red)']
    db = get_db()
    count = db.execute("SELECT COUNT(*) as c FROM goals WHERE user_id=?", (session['user_id'],)).fetchone()['c']
    cursor = db.execute(
        "INSERT INTO goals (user_id, title, target, color) VALUES (?,?,?,?)",
        (session['user_id'], data.get('title',''), data.get('target',10), colors[count % len(colors)])
    )
    db.commit()
    goal = db.execute("SELECT * FROM goals WHERE id=?", (cursor.lastrowid,)).fetchone()
    db.close()
    return jsonify(row_to_dict(goal)), 201

@app.route('/api/goals/<int:goal_id>', methods=['PUT'])
@login_required
def update_goal(goal_id):
    data = request.json or {}
    db = get_db()
    if 'current' in data:
        db.execute("UPDATE goals SET current=? WHERE id=? AND user_id=?",
                   (data['current'], goal_id, session['user_id']))
    db.commit()
    goal = db.execute("SELECT * FROM goals WHERE id=?", (goal_id,)).fetchone()
    db.close()
    return jsonify(row_to_dict(goal))

@app.route('/api/goals/<int:goal_id>', methods=['DELETE'])
@login_required
def delete_goal_api(goal_id):
    db = get_db()
    db.execute("DELETE FROM goals WHERE id=? AND user_id=?", (goal_id, session['user_id']))
    db.commit()
    db.close()
    return jsonify({'ok': True})

# ─── RESOURCES ──────────────────────────────────────────────

@app.route('/api/resources', methods=['GET'])
@login_required
def get_resources():
    db = get_db()
    rows = db.execute("SELECT * FROM resources WHERE user_id=? ORDER BY created_at DESC", (session['user_id'],)).fetchall()
    db.close()
    return jsonify(rows_to_list(rows))

@app.route('/api/resources', methods=['POST'])
@login_required
def add_resource_api():
    data = request.json or {}
    db = get_db()
    cursor = db.execute(
        "INSERT INTO resources (user_id, title, url, type, subject) VALUES (?,?,?,?,?)",
        (session['user_id'], data.get('title',''), data.get('url',''), data.get('type','Link'), data.get('subject',''))
    )
    db.commit()
    resource = db.execute("SELECT * FROM resources WHERE id=?", (cursor.lastrowid,)).fetchone()
    db.close()
    return jsonify(row_to_dict(resource)), 201

@app.route('/api/resources/<int:res_id>', methods=['DELETE'])
@login_required
def delete_resource_api(res_id):
    db = get_db()
    db.execute("DELETE FROM resources WHERE id=? AND user_id=?", (res_id, session['user_id']))
    db.commit()
    db.close()
    return jsonify({'ok': True})

# ─── FLASHCARDS ─────────────────────────────────────────────

@app.route('/api/flashcards', methods=['GET'])
@login_required
def get_flashcards():
    db = get_db()
    rows = db.execute("SELECT * FROM flashcards WHERE user_id=? ORDER BY created_at", (session['user_id'],)).fetchall()
    db.close()
    return jsonify(rows_to_list(rows))

@app.route('/api/flashcards', methods=['POST'])
@login_required
def add_flashcard_api():
    data = request.json or {}
    db = get_db()
    cursor = db.execute(
        "INSERT INTO flashcards (user_id, question, answer) VALUES (?,?,?)",
        (session['user_id'], data.get('question',''), data.get('answer',''))
    )
    db.commit()
    fc = db.execute("SELECT * FROM flashcards WHERE id=?", (cursor.lastrowid,)).fetchone()
    db.close()
    return jsonify(row_to_dict(fc)), 201

@app.route('/api/flashcards/<int:fc_id>', methods=['DELETE'])
@login_required
def delete_flashcard_api(fc_id):
    db = get_db()
    db.execute("DELETE FROM flashcards WHERE id=? AND user_id=?", (fc_id, session['user_id']))
    db.commit()
    db.close()
    return jsonify({'ok': True})

# ─── STATS ──────────────────────────────────────────────────

@app.route('/api/stats', methods=['GET'])
@login_required
def get_stats():
    db = get_db()
    stats = db.execute("SELECT * FROM stats WHERE user_id=?", (session['user_id'],)).fetchone()
    db.close()
    if not stats:
        return jsonify({'focus_sessions': 0, 'study_hours': 0.0, 'streak': 0})
    return jsonify(row_to_dict(stats))

@app.route('/api/stats', methods=['PUT'])
@login_required
def update_stats():
    data = request.json or {}
    db = get_db()
    db.execute("""
        INSERT INTO stats (user_id, focus_sessions, study_hours, streak) VALUES (?,?,?,?)
        ON CONFLICT(user_id) DO UPDATE SET
            focus_sessions=excluded.focus_sessions,
            study_hours=excluded.study_hours,
            streak=excluded.streak
    """, (session['user_id'], data.get('focus_sessions',0), data.get('study_hours',0.0), data.get('streak',0)))
    db.commit()
    db.close()
    return jsonify({'ok': True})

# ─── STATIC FILES ───────────────────────────────────────────

@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(BASE_DIR, path)

# ─── START ──────────────────────────────────────────────────

if __name__ == '__main__':
    init_db()
    print("\n  +-----------------------------------------+", flush=True)
    print("  |  StudyFlow Server Running!              |", flush=True)
    print("  |  URL: http://localhost:5000             |", flush=True)
    print("  |  Database: studyflow.db                 |", flush=True)
    print("  |  Press Ctrl+C to stop                   |", flush=True)
    print("  +-----------------------------------------+\n", flush=True)
    app.run(debug=True, port=5000)

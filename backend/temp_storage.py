import sqlite3
import json
import datetime

DB_NAME = "prismatic.db"

def get_conn():
    return sqlite3.connect(DB_NAME)

def init_db():
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS session_data (
        session_id TEXT,
        data TEXT,
        source TEXT,
        created_at INTEGER
    )
    """)

    conn.commit()
    conn.close()

def store_data(session_id, data, source):
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO session_data (session_id, data, source, created_at)
    VALUES (?, ?, ?, ?)
    """, (
        session_id,
        json.dumps(data),
        source,
        int(datetime.datetime.now().timestamp())
    ))

    conn.commit()
    conn.close()

def get_latest_data(session_id):
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT data FROM session_data
    WHERE session_id = ?
    ORDER BY created_at DESC
    LIMIT 1
    """, (session_id,))

    row = cursor.fetchone()
    conn.close()

    if row:
        return json.loads(row[0])
    
    return None

def cleanup_old_data(minutes=30):
    conn = get_conn()
    cursor = conn.cursor()

    cutoff = int((datetime.datetime.now() - datetime.timedelta(minutes=minutes)).timestamp())

    cursor.execute("""
    DELETE FROM session_data
    WHERE created_at < ?
    """, (cutoff,))

    conn.commit()
    conn.close()
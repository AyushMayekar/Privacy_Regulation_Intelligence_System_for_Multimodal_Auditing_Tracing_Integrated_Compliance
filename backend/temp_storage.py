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

def get_all_findings(session_id):
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT data FROM session_data
    WHERE session_id = ?
    AND source IN ('gmail_scan', 'mongo_scan')
    ORDER BY created_at ASC
    """, (session_id,))

    rows = cursor.fetchall()
    conn.close()

    all_findings = []

    for row in rows:
        try:
            data = json.loads(row[0])

            # ensure it's always a list
            if isinstance(data, list):
                all_findings.extend(data)

            elif isinstance(data, dict):
                # handle tool-style outputs
                findings = data.get("findings") or data.get("results")
                if findings:
                    all_findings.extend(findings)

        except Exception:
            continue

    return all_findings if all_findings else None

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
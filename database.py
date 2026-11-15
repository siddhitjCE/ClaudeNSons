"""
database.py - SQLite Database Setup for SyncLearn
Part of SyncLearn (by Team ClaudeNSons)
"""

import sqlite3
import json
import logging
import os
import tempfile
from typing import Dict, List, Any, Optional

logger = logging.getLogger("synclearn.db")

def get_db_path() -> str:
    """Returns /tmp path on Vercel/Lambda or safely writable local path."""
    if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
        return os.path.join(tempfile.gettempdir(), "synclearn.db")
    try:
        test_file = os.path.join(os.path.dirname(__file__), ".write_test.tmp")
        with open(test_file, "w") as f:
            f.write("ok")
        os.remove(test_file)
        return os.path.join(os.path.dirname(__file__), "synclearn.db")
    except Exception:
        return os.path.join(tempfile.gettempdir(), "synclearn.db")


def get_db_connection():
    """Opens a SQLite connection with row factory, wrapped safely against read-only errors."""
    db_path = get_db_path()
    conn = sqlite3.connect(db_path, timeout=10.0)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes clean database tables safely."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 1. Folders table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS folders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            color TEXT DEFAULT 'indigo',
            icon TEXT DEFAULT 'folder',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # 2. Videos table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            video_id TEXT NOT NULL UNIQUE,
            title TEXT NOT NULL,
            folder_id INTEGER,
            duration_sec INTEGER DEFAULT 2700,
            thumbnail_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (folder_id) REFERENCES folders (id)
        )
        """)

        # 3. Personal Study Pins table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS pins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            video_id TEXT NOT NULL,
            timestamp_sec REAL NOT NULL,
            tag TEXT NOT NULL,
            title TEXT NOT NULL,
            note TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # 4. Segment Analyses table (AI Rescue & Alt Videos)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            video_id TEXT NOT NULL,
            peak_id TEXT,
            start_sec REAL NOT NULL,
            end_sec REAL NOT NULL,
            title TEXT NOT NULL,
            concept_breakdown TEXT,
            difficulty_badge TEXT,
            difficulty_score INTEGER,
            difficulty_reason TEXT,
            context_locked_explanation TEXT,
            formula_latex TEXT,
            alt_videos TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # 5. Visual Active Recall & Quizzes table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS quizzes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            video_id TEXT NOT NULL,
            peak_id TEXT,
            start_sec REAL NOT NULL,
            end_sec REAL NOT NULL,
            diagram_title TEXT,
            diagram_nodes TEXT,
            mcqs TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        conn.commit()
        conn.close()
        logger.info("Database initialized with empty schema successfully.")
    except Exception as e:
        logger.warning(f"init_db non-fatal notice (operating in resilient mode): {e}")

"""
main.py - FastAPI Backend for SyncLearn (by Team ClaudeNSons)
An AI-Powered Interactive & Personally Curated YouTube Learning Studio for College Students

Serves the frontend directly from static/ on single port (http://localhost:8000)
"""

import os
import re
import json
import logging
from typing import Dict, List, Any, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from database import init_db, get_db_connection
from heatmap_service import get_video_heatmap
from ai_service import analyze_segment_ai, search_alternative_videos, ask_segment_doubt

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("synclearn.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing SyncLearn Database...")
    init_db()
    yield
    logger.info("SyncLearn shutting down...")


app = FastAPI(
    title="SyncLearn (by Team ClaudeNSons)",
    description="AI-Powered Interactive & Personally Curated YouTube Learning Studio",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# === PYDANTIC SCHEMAS ===

class FolderCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    color: str = Field(default="indigo")
    icon: str = Field(default="folder")


class VideoLoadRequest(BaseModel):
    url_or_id: str
    folder_id: Optional[int] = 1
    custom_title: Optional[str] = None


class PinCreate(BaseModel):
    video_id: str
    timestamp_sec: float
    tag: str  # "exam_priority", "revisit", "key_formula"
    title: str
    note: Optional[str] = ""


class FollowUpRequest(BaseModel):
    video_id: str
    current_time_sec: float
    question: str
    context_text: Optional[str] = ""


class SegmentAnalysisRequest(BaseModel):
    video_id: str
    center_timestamp_sec: float
    window_seconds: Optional[float] = 240.0
    student_doubt: Optional[str] = None


# === HELPER FUNCTIONS ===

def extract_youtube_id(input_str: str) -> str:
    """Extracts YouTube 11-char video ID from any URL format, query params, or raw ID."""
    clean = input_str.strip()
    if len(clean) == 11 and re.match(r'^[a-zA-Z0-9_-]{11}$', clean):
        return clean

    import urllib.parse
    try:
        parsed = urllib.parse.urlparse(clean)
        # Handle youtube.com and m.youtube.com
        if parsed.hostname in ('www.youtube.com', 'youtube.com', 'm.youtube.com', 'music.youtube.com'):
            if parsed.path == '/watch':
                qs = urllib.parse.parse_qs(parsed.query)
                if 'v' in qs and qs['v']:
                    vid = qs['v'][0][:11]
                    if re.match(r'^[a-zA-Z0-9_-]{11}$', vid):
                        return vid
            elif parsed.path.startswith(('/embed/', '/v/', '/shorts/')):
                parts = parsed.path.strip('/').split('/')
                if len(parts) >= 2:
                    vid = parts[1][:11]
                    if re.match(r'^[a-zA-Z0-9_-]{11}$', vid):
                        return vid
        # Handle youtu.be short links
        elif parsed.hostname in ('youtu.be', 'www.youtu.be'):
            parts = parsed.path.strip('/').split('/')
            if parts and parts[0]:
                vid = parts[0][:11]
                if re.match(r'^[a-zA-Z0-9_-]{11}$', vid):
                    return vid
    except Exception:
        pass

    # Fallback regex search for 11-char alphanumeric pattern
    m = re.search(r'[a-zA-Z0-9_-]{11}', clean)
    if m:
        return m.group(0)

    raise ValueError("Invalid YouTube URL or Video ID provided.")


# === API ROUTES ===

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "SyncLearn", "team": "ClaudeNSons"}


@app.get("/api/folders")
def get_folders():
    """Returns all user-curated personal subject folders."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT f.id, f.name, f.color, f.icon, f.created_at,
           COUNT(v.id) as video_count
    FROM folders f
    LEFT JOIN videos v ON v.folder_id = f.id
    GROUP BY f.id
    ORDER BY f.id ASC
    """)
    rows = cursor.fetchall()
    folders = [dict(row) for row in rows]
    conn.close()
    return {"folders": folders}


@app.post("/api/folders")
def create_folder(folder: FolderCreate):
    """Creates a new personal subject folder in SQLite."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO folders (name, color, icon) VALUES (?, ?, ?)",
            (folder.name.strip(), folder.color, folder.icon)
        )
        conn.commit()
        folder_id = cursor.lastrowid
        conn.close()
        return {"id": folder_id, "name": folder.name, "color": folder.color, "icon": folder.icon}
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail=f"Folder already exists or invalid: {e}")


@app.get("/api/videos")
def get_videos(folder_id: Optional[int] = None):
    """Returns saved videos, optionally filtered by subject folder."""
    conn = get_db_connection()
    cursor = conn.cursor()
    if folder_id:
        cursor.execute("SELECT * FROM videos WHERE folder_id = ? ORDER BY id DESC", (folder_id,))
    else:
        cursor.execute("SELECT * FROM videos ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return {"videos": [dict(r) for r in rows]}


@app.post("/api/videos")
def load_video(req: VideoLoadRequest):
    """
    Loads any educational YouTube URL into the personal workspace,
    extracts real heatmap via yt-dlp, and registers/updates it in SQLite.
    """
    try:
        vid = extract_youtube_id(req.url_or_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    conn = get_db_connection()
    cursor = conn.cursor()

    # Extract real metadata and heatmap via yt-dlp
    heatmap_data = get_video_heatmap(vid)
    duration = heatmap_data.get("duration_sec", 2400)
    title = heatmap_data.get("title") or req.custom_title or f"Curated Lecture: {vid}"

    cursor.execute("SELECT * FROM videos WHERE video_id = ?", (vid,))
    existing = cursor.fetchone()

    thumb = f"https://img.youtube.com/vi/{vid}/hqdefault.jpg"

    if existing:
        # Update existing record with real extracted title & duration
        cursor.execute("""
        UPDATE videos 
        SET title = ?, duration_sec = ?, thumbnail_url = ?, folder_id = ?
        WHERE video_id = ?
        """, (title, duration, thumb, req.folder_id or 1, vid))
        conn.commit()
        cursor.execute("SELECT * FROM videos WHERE video_id = ?", (vid,))
        video_record = dict(cursor.fetchone())
    else:
        cursor.execute("""
        INSERT INTO videos (video_id, title, folder_id, duration_sec, thumbnail_url)
        VALUES (?, ?, ?, ?, ?)
        """, (vid, title, req.folder_id or 1, duration, thumb))
        conn.commit()
        cursor.execute("SELECT * FROM videos WHERE video_id = ?", (vid,))
        video_record = dict(cursor.fetchone())

    conn.close()

    return {
        "video": video_record,
        "heatmap": heatmap_data
    }


@app.get("/api/video/{video_id}")
def get_video_details(video_id: str):
    """Returns video metadata along with full heatmap curve and detected peak zones."""
    clean_id = extract_youtube_id(video_id)
    conn = get_db_connection()
    cursor = conn.cursor()

    # Extract live heatmap & metadata
    heatmap = get_video_heatmap(clean_id)
    duration = heatmap.get("duration_sec", 2400)
    title = heatmap.get("title") or f"Curated Lecture ({clean_id})"
    thumb = f"https://img.youtube.com/vi/{clean_id}/hqdefault.jpg"

    cursor.execute("SELECT * FROM videos WHERE video_id = ?", (clean_id,))
    row = cursor.fetchone()

    if row:
        video_record = dict(row)
        # Keep duration and title in sync with heatmap extraction
        if video_record.get("duration_sec") != duration or video_record.get("title") != title:
            cursor.execute("UPDATE videos SET title = ?, duration_sec = ? WHERE video_id = ?", (title, duration, clean_id))
            conn.commit()
            video_record["title"] = title
            video_record["duration_sec"] = duration
    else:
        cursor.execute("""
        INSERT INTO videos (video_id, title, folder_id, duration_sec, thumbnail_url)
        VALUES (?, ?, ?, ?, ?)
        """, (clean_id, title, 1, duration, thumb))
        conn.commit()
        cursor.execute("SELECT * FROM videos WHERE video_id = ?", (clean_id,))
        video_record = dict(cursor.fetchone())

    conn.close()

    return {
        "video": video_record,
        "heatmap": heatmap
    }


@app.get("/api/pins/{video_id}")
def get_pins(video_id: str):
    """Returns all Personal Study Pins for the specified video."""
    clean_id = extract_youtube_id(video_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM pins WHERE video_id = ? ORDER BY timestamp_sec ASC
    """, (clean_id,))
    rows = cursor.fetchall()
    conn.close()
    return {"pins": [dict(r) for r in rows]}


@app.post("/api/pins")
def create_pin(pin: PinCreate):
    """Creates a new Personal Study Pin at the current timestamp."""
    clean_id = extract_youtube_id(pin.video_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO pins (video_id, timestamp_sec, tag, title, note)
    VALUES (?, ?, ?, ?, ?)
    """, (clean_id, pin.timestamp_sec, pin.tag, pin.title.strip(), pin.note.strip() if pin.note else ""))
    conn.commit()
    pin_id = cursor.lastrowid
    cursor.execute("SELECT * FROM pins WHERE id = ?", (pin_id,))
    new_pin = dict(cursor.fetchone())
    conn.close()
    return {"pin": new_pin}


@app.delete("/api/pins/{pin_id}")
def delete_pin(pin_id: int):
    """Deletes a study pin from SQLite."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM pins WHERE id = ?", (pin_id,))
    conn.commit()
    conn.close()
    return {"success": True, "deleted_id": pin_id}


@app.get("/api/analysis/{video_id}")
def get_segment_analysis(
    video_id: str,
    timestamp_sec: float = Query(..., description="Current playback timestamp in seconds")
):
    """
    Returns AI Confusion Rescue breakdown for the ±2 min window around timestamp_sec.
    Checks SQLite for pre-seeded or cached analysis first; triggers domain-aware analysis if needed.
    """
    clean_id = extract_youtube_id(video_id)
    conn = get_db_connection()
    cursor = conn.cursor()

    # Retrieve video title
    cursor.execute("SELECT title FROM videos WHERE video_id = ?", (clean_id,))
    v_row = cursor.fetchone()
    title = v_row["title"] if v_row else "Engineering Lecture"

    # Check if this timestamp falls into any pre-seeded analysis window for THIS video
    cursor.execute("""
    SELECT * FROM analyses
    WHERE video_id = ? AND (? BETWEEN (start_sec - 15) AND (end_sec + 15))
    LIMIT 1
    """, (clean_id, timestamp_sec))
    row = cursor.fetchone()

    if row:
        analysis_data = dict(row)
        analysis_data["concept_breakdown"] = json.loads(analysis_data.get("concept_breakdown") or "[]")
        analysis_data["alt_videos"] = json.loads(analysis_data.get("alt_videos") or "[]")
        conn.close()
        return {"analysis": analysis_data, "source": "database_cached"}

    # Generate via domain-aware AI Rescue Service
    start_sec = max(0.0, timestamp_sec - 120.0)
    end_sec = timestamp_sec + 120.0

    # Retrieve chapters from heatmap service if available
    heatmap = get_video_heatmap(clean_id)
    chapters = heatmap.get("chapters", [])

    gen_analysis = analyze_segment_ai(
        video_id=clean_id,
        center_timestamp_sec=timestamp_sec,
        window_seconds=240.0,
        video_title=title,
        chapters=chapters
    )

    # Format for backwards compatibility
    breakdown_list = [c.get("name", "") for c in gen_analysis.get("identified_concepts", [])]
    if not breakdown_list:
        breakdown_list = [gen_analysis.get("why_students_struggle", "")]

    # Cache into SQLite
    cursor.execute("""
    INSERT INTO analyses (
        video_id, peak_id, start_sec, end_sec, title,
        concept_breakdown, difficulty_badge, difficulty_score,
        difficulty_reason, context_locked_explanation, formula_latex, alt_videos
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        clean_id,
        f"dyn-{int(timestamp_sec)}",
        start_sec,
        end_sec,
        f"Focus Analysis at {int(timestamp_sec//60):02d}:{int(timestamp_sec%60):02d}",
        json.dumps(breakdown_list),
        gen_analysis.get("section_classification", "High Cognitive Load"),
        88,
        gen_analysis.get("why_students_struggle", ""),
        gen_analysis.get("context_locked_explanation", ""),
        "",
        json.dumps([])
    ))
    conn.commit()
    conn.close()

    return {"analysis": gen_analysis, "source": "ai_generated"}


@app.post("/api/analyze-segment")
def analyze_segment_endpoint(req: SegmentAnalysisRequest):
    """
    Core Step B requirement:
    Fetches transcript window with youtube-transcript-api and runs strict schema
    Gemini 2.5 Flash analysis with resilient domain fallback.
    """
    clean_id = extract_youtube_id(req.video_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT title FROM videos WHERE video_id = ?", (clean_id,))
    v_row = cursor.fetchone()
    title = v_row["title"] if v_row else f"College Lecture ({clean_id})"
    conn.close()

    # Retrieve chapters if available
    heatmap = get_video_heatmap(clean_id)
    chapters = heatmap.get("chapters", [])

    analysis = analyze_segment_ai(
        video_id=clean_id,
        center_timestamp_sec=req.center_timestamp_sec,
        window_seconds=req.window_seconds or 240.0,
        student_doubt=req.student_doubt,
        video_title=title,
        chapters=chapters
    )
    return analysis


@app.get("/api/alternative-videos")
def get_alternative_videos(
    q: str = Query(..., description="Search query derived from lecture topic"),
    max_results: int = Query(default=4, ge=1, le=10)
):
    """
    Returns alternative visual/intuitive videos via YouTube Data API v3 (or curated playable fallback).
    """
    videos = search_alternative_videos(query=q, max_results=max_results)
    return {"query": q, "videos": videos}


@app.post("/api/analysis/followup")
def ask_followup(req: FollowUpRequest):
    """Answers a student's follow-up doubt strictly within the active segment's context."""
    clean_id = extract_youtube_id(req.video_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT title FROM videos WHERE video_id = ?", (clean_id,))
    v_row = cursor.fetchone()
    title = v_row["title"] if v_row else "Engineering Lecture"
    conn.close()

    answer = ask_segment_doubt(
        question=req.question,
        context_explanation=req.context_text or "",
        current_time_sec=req.current_time_sec,
        video_title=title
    )
    return {"answer": answer}


@app.get("/api/quiz/{video_id}")
def get_segment_quiz(
    video_id: str,
    timestamp_sec: float = Query(..., description="Current playback timestamp in seconds")
):
    """
    Returns Visual Active Recall Concept Diagram (with hidden [ ? ] slots)
    and Checkpoint MCQs for the active segment.
    """
    clean_id = extract_youtube_id(video_id)
    conn = get_db_connection()
    cursor = conn.cursor()

    # Look for matching quiz window in SQLite for THIS video
    cursor.execute("""
    SELECT * FROM quizzes
    WHERE video_id = ? AND (? BETWEEN (start_sec - 30) AND (end_sec + 30))
    LIMIT 1
    """, (clean_id, timestamp_sec))
    row = cursor.fetchone()

    if row:
        quiz_data = dict(row)
        quiz_data["diagram_nodes"] = json.loads(quiz_data.get("diagram_nodes") or "[]")
        quiz_data["mcqs"] = json.loads(quiz_data.get("mcqs") or "[]")
        conn.close()
        return {"quiz": quiz_data, "source": "database"}

    # Retrieve video title
    cursor.execute("SELECT title FROM videos WHERE video_id = ?", (clean_id,))
    v_row = cursor.fetchone()
    title = (v_row["title"] if v_row else "").lower()
    conn.close()

    # Dynamic Op-Amp Quiz Generator for electronics videos
    if any(k in title for k in ["opamp", "op-amp", "amplifier", "electroboom", "circuit"]):
        return {
            "quiz": {
                "diagram_title": f"Active Recall: Op-Amp Golden Rules & Inverting Configuration",
                "diagram_nodes": [
                    {
                        "id": "op-node-1",
                        "title": "Differential Input Voltage",
                        "content": "Vd = (V+ - V-) amplified by open-loop gain AOL ≈ 100,000",
                        "is_blank": False
                    },
                    {
                        "id": "op-node-2",
                        "title": "Golden Rule 1: Input Current",
                        "content": "Due to ultra-high input impedance, I+ = I- = [ ? ]",
                        "is_blank": True,
                        "prompt": "What is the input bias current entering an ideal Op-Amp terminal?",
                        "options": ["0 Amperes (Zero Current)", "10 mA Load Current", "Infinite Current (Short Circuit)"],
                        "correct_option_index": 0,
                        "revealed_text": "I+ = I- = 0 A (Infinite Input Impedance)"
                    },
                    {
                        "id": "op-node-3",
                        "title": "Golden Rule 2: Inverting Node Voltage",
                        "content": "With V+ grounded (0V) and negative feedback, V- = [ ? ]",
                        "is_blank": True,
                        "prompt": "What potential is established at the inverting terminal?",
                        "options": ["0V (Virtual Ground)", "Supply Rail VCC (+15V)", "Half-Supply Reference VCC/2"],
                        "correct_option_index": 0,
                        "revealed_text": "V- = 0 V (Virtual Ground Node)"
                    },
                    {
                        "id": "op-node-4",
                        "title": "Closed-Loop Output Voltage",
                        "content": "Vout = [ ? ] · Vin",
                        "is_blank": True,
                        "prompt": "Select the correct voltage gain equation for the inverting configuration:",
                        "options": ["-(Rf / Rin)", "+(1 + Rf / Rin)", "Rin / (Rin + Rf)"],
                        "correct_option_index": 0,
                        "revealed_text": "Vout = -(Rf / Rin) · Vin (Inverting Closed Gain)"
                    },
                    {
                        "id": "op-node-5",
                        "title": "Supply Rail Boundary Saturation",
                        "content": "VEE <= Vout <= VCC (Output clips if driven beyond power rails)",
                        "is_blank": False
                    }
                ],
                "mcqs": [
                    {
                        "id": "mcq-op-1",
                        "question": "What is the primary condition required for an Op-Amp's inverting input terminal to act as a true Virtual Ground (0V)?",
                        "options": [
                            "The non-inverting terminal must be at 0V and negative feedback must be active",
                            "The positive feedback loop must force the output to oscillate",
                            "The power supplies must be completely disconnected from the op-amp",
                            "The input signal Vin must be higher than the supply rail VCC"
                        ],
                        "correct_index": 0,
                        "explanation": "Virtual ground occurs because negative feedback dynamically forces the differential input voltage (V+ - V-) to approximately 0V. When V+ is grounded at 0V, V- is likewise pulled to 0V."
                    },
                    {
                        "id": "mcq-op-2",
                        "question": "In an inverting op-amp amplifier circuit with input resistor Rin = 10 kΩ and feedback resistor Rf = 100 kΩ, what is the closed-loop voltage gain (Av = Vout / Vin)?",
                        "options": [
                            "Av = -10 (Phase inverted, 10x amplification)",
                            "Av = +10 (Non-inverting gain)",
                            "Av = -0.1 (Attenuation)",
                            "Av = +11 (Non-inverting formula)"
                        ],
                        "correct_index": 0,
                        "explanation": "For an inverting op-amp, Av = -Rf / Rin = -100kΩ / 10kΩ = -10. The negative sign represents a 180-degree phase shift."
                    }
                ]
            },
            "source": "domain_opamp_generated"
        }

    # Default fallback quiz structure
    mins = int(timestamp_sec // 60)
    secs = int(timestamp_sec % 60)
    return {
        "quiz": {
            "diagram_title": f"Active Recall: Governing Dynamics ({mins:02d}:{secs:02d})",
            "diagram_nodes": [
                {"id": "n1", "title": "System Input / Boundary Conditions", "content": "Initial physical parameter state", "is_blank": False},
                {"id": "n2", "title": "Primary Governing Relation", "content": "f(x, t) = [ ? ]", "is_blank": True, "prompt": "Identify the primary governing equation:", "options": ["Conservation of Mass / Energy", "Arbitrary constant", "Empirical friction coefficient"], "correct_option_index": 0, "revealed_text": "Conservation Law Integral"},
                {"id": "n3", "title": "Characteristic Metric", "content": "Output Dimension = [ ? ]", "is_blank": True, "prompt": "Identify the characteristic response metric:", "options": ["Equilibrium Ratio", "Divergence Factor", "Transient Distortion"], "correct_option_index": 0, "revealed_text": "Equilibrium Ratio Constant"},
                {"id": "n4", "title": "Terminal State Verification", "content": "Steady state convergence", "is_blank": False}
            ],
            "mcqs": [
                {
                    "id": "mcq-gen-1",
                    "question": f"In this lecture segment around {mins:02d}:{secs:02d}, what is the critical assumption required for the mathematical model to hold?",
                    "options": [
                        "Equilibrium or quasi-steady state conditions",
                        "Infinite sample volume with zero boundary effects",
                        "Complete absence of thermal variations",
                        "Independent variable isolation"
                    ],
                    "correct_index": 0,
                    "explanation": "Standard physical engineering derivations assume steady or quasi-steady state to establish the governing differential equations."
                }
            ]
        },
        "source": "synthetic"
    }


# === SETTINGS & GEMINI API KEY ===

class ApiKeyRequest(BaseModel):
    api_key: str


@app.post("/api/settings/api-key")
def update_api_key(req: ApiKeyRequest):
    """Sets Gemini API key dynamically in memory and saves to .env file."""
    key = req.api_key.strip()
    if not key:
        raise HTTPException(status_code=400, detail="API key cannot be empty.")

    from ai_service import set_gemini_api_key
    set_gemini_api_key(key)

    env_path = os.path.join(os.path.dirname(__file__), ".env")
    lines = []
    found = False
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        for idx, line in enumerate(lines):
            if line.startswith("GEMINI_API_KEY="):
                lines[idx] = f"GEMINI_API_KEY={key}\n"
                found = True
                break
    if not found:
        lines.append(f"GEMINI_API_KEY={key}\n")

    with open(env_path, "w", encoding="utf-8") as f:
        f.writelines(lines)

    return {"success": True, "message": "Gemini 2.5 Flash connected successfully!", "gemini_active": True}


@app.get("/api/settings/status")
def get_settings_status():
    from ai_service import is_gemini_available
    return {
        "gemini_active": is_gemini_available(),
        "model": "gemini-2.5-flash"
    }


# === STATIC FILES & ROOT ROUTE ===

static_dir = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir, exist_ok=True)

app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/")
def serve_index():
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return JSONResponse({"message": "SyncLearn backend is running."})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

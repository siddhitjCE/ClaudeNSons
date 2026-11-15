# SyncLearn (by Team ClaudeNSons)
> **AI-Powered Interactive & Personally Curated YouTube Learning Studio for College Students**

![SyncLearn Banner](https://img.shields.io/badge/SyncLearn-v1.0.0-indigo?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Dark_Mode-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## 🌟 Overview & Key Capabilities

**SyncLearn** is an interactive, dark-mode personal learning studio designed specifically for college students studying dense, derivation-heavy STEM video lectures. It marries crowd behavioral signals (YouTube Most-Replayed Heatmaps) with personalized active recall and contextual AI rescue.

### 1. Top Navigation Bar
- **App Branding:** `SyncLearn | Personal Interactive Study Studio` (by Team ClaudeNSons).
- **Personal Subject Folder Dropdown:**
  - Create and organize custom study subjects with colors & icons (`+ Add To Personal Library`).
- **Universal YouTube Lecture Input:** Paste any educational YouTube URL (e.g., `https://www.youtube.com/watch?v=...`) or video ID to instantly load it into your study studio.

### 2. Main Split-Screen Studio Layout
#### Left Column (60% width):
- **Embedded YouTube IFrame Player:** Full programmatic synchronization with playback rate selector, ±10s jumps, and frame controls.
- **Dual-Signal Scrubber & Heatmap Timeline:**
  - **Replay Intensity Heatmap Curve:** Displays normalized crowd replay density (0.0 to 1.0) with glowing gradient curves.
  - **Potentially Difficult Zones:** Highlighted regions (e.g. `08:00–12:00`, `21:30–24:30`, `36:00–39:30` ±2 min focus windows) where students frequently replay tough material.
  - **Clickable Personal Study Pins:** Overlaid on the timeline with distinct custom badges:
    - 🔥 **Exam Priority** (Red badge)
    - 💡 **Revisit / Tough Concept** (Amber badge)
    - 📐 **Key Formula / Derivation** (Cyan badge)
  - **Click-to-Seek:** Clicking any heatmap peak or pin instantly seeks the YouTube player (`player.seekTo()`) and triggers segment analysis in the Right Column.
- **Action Bar (Directly below timeline):**
  - `🚨 Wait, I'm Confused Here (Analyze Current Segment)`: Grabs current timestamp and performs AI confusion rescue on a ±2 min window.
  - `📌 Drop Personal Pin / Bookmark Here`: Opens an inline modal to tag and annotate the current timestamp, saving it into SQLite.

#### Right Column (40% width) - 3 Interactive Tabs:
1. **Tab 1: 🧠 AI Confusion Rescue & Alt Videos**
   - Active focus segment window header.
   - **Concept Breakdown:** Concise, high-yield bullet takeaways.
   - **Difficulty Assessment:** Cognitive load rating + why students rewind here.
   - **Context-Locked Explanation:** Retains the instructor's exact symbols and notations (rendered with KaTeX LaTeX math).
   - **Terminology-Bridged Alternative Videos:** Curated videos that explain confusing steps without jargon.
   - **Interactive AI Tutor Chat:** Ask follow-up questions about the active video timestamp.
2. **Tab 2: 🎯 Visual Active Recall & Quiz**
   - **Fill-in-the-Blank Concept Diagram:** Interconnected concept cards where 3 key mathematical/conceptual nodes are hidden as clickable `[ ? ]` slots for retrieval practice.
   - **Checkpoint MCQs:** University exam multiple-choice questions with instant correct/incorrect feedback and detailed scientific explanations.
3. **Tab 3: ⚡ Personal Exam Cheat-Sheet**
   - Filterable by tags (All, Exam Priority, Revisit, Formulas).
   - 1-click timestamp jumps back to exact video segments.
   - **Export Cheat-Sheet:** One-click Markdown copy and print-friendly export for pre-exam revision.

---

## 🛠️ Modular Heatmap Hook (`heatmap_service.py`)

A dedicated file `heatmap_service.py` is included with the signature:
```python
def get_video_heatmap(video_id: str, duration_sec: Optional[int] = None, client_title: Optional[str] = None) -> dict:
```
- Extracts live crowd replay intensity data and detected peak zones dynamically for any YouTube video via `yt-dlp`.
- Gracefully falls back to algorithmic synthetic peaks so the timeline scrubber and tricky spot navigator always work smoothly even under datacenter IP restrictions.

---

## 🚀 Running the Studio

### 1. Requirements
Ensure dependencies are installed:
```bash
pip install -r requirements.txt
```

### 2. Launch FastAPI Server
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```
Open **`http://localhost:8000`** in any web browser.

### 3. Optional Gemini API Key
SyncLearn works 100% out of the box with rich pre-seeded data and intelligent analytical fallbacks without an API key. To enable dynamic live Gemini rescue for any pasted video, add your key to `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

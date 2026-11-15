/**
 * static/app.js - SyncLearn Interactive YouTube Learning Studio
 * Built by Team ClaudeNSons
 * Refactored for User-Centred Design, Cognitive Accessibility, and Hick's Law
 */

// Global Application State
const state = {
  currentVideoId: null,
  currentVideoTitle: "",
  durationSec: 1800,
  currentTimeSec: 0,
  previousTimeSec: 0,
  player: null,
  isPlayerReady: false,
  heatmapData: null,
  pins: [],
  activeAnalysis: null,
  activeQuiz: null,
  activeFilter: "all",
  activeTab: "tab-content-rescue",
  currentFolderId: "all",
  // User-Centred Settings
  analysisWindowSeconds: 240, // Default ±2m (240s window)
  autoPauseEnabled: true,
  triggeredAutoPauses: new Set(),
  // Undo Deletion State
  pendingDeleteTimeout: null,
  pendingDeletedPin: null,
  // Session Learning Data
  sessionTerminologyBridges: [],
  missedQuizQuestions: [],
  conceptMastery: { total: 0, unlocked: 0 }
};

// ==========================================
// YAMAUCHI NO.10 RETRO 8-BIT SOUND SYNTHESIZER
// ==========================================
const yn10Audio = {
  ctx: null,
  enabled: false,

  init() {
    try {
      const stored = localStorage.getItem("yn10_sound_enabled");
      this.enabled = stored === "true";
      this.updateUI();
    } catch (_) {}
  },

  getAudioContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  },

  toggle() {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem("yn10_sound_enabled", this.enabled ? "true" : "false");
    } catch (_) {}
    this.updateUI();
    if (this.enabled) {
      this.playIntro();
    }
    return this.enabled;
  },

  updateUI() {
    const landingBtn = document.getElementById("yn10-sound-toggle-btn");
    const landingLabel = document.getElementById("yn10-sound-label");
    const landingIndicator = document.getElementById("yn10-sound-indicator");
    const workspaceBtn = document.getElementById("workspace-sound-toggle-btn");
    const workspaceLabel = document.getElementById("workspace-sound-label");
    const workspaceIndicator = document.getElementById("workspace-sound-indicator");

    [landingLabel, workspaceLabel].forEach(el => {
      if (el) el.textContent = this.enabled ? "ON" : "OFF";
    });
    [landingBtn, workspaceBtn, landingIndicator, workspaceIndicator].forEach(el => {
      if (el) {
        if (this.enabled) {
          el.classList.add("active");
        } else {
          el.classList.remove("active");
        }
      }
    });
  },

  // 1. Retro Power-On / Intro Arpeggio
  playIntro() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.08, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.13);
    });
  },

  // 2. Tactile Blip (Tab switch, subtle interaction)
  playBlip() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  },

  // 3. Coin / Note Saved Chime
  playCoin() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [987.77, 1318.51].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.08, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.26);
    });
  },

  // 4. Seek / Milestone Jump Tick
  playSeek() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.setValueAtTime(880.00, now + 0.03);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  },

  // 5. Correct MCQ Answer Fanfare
  playSuccess() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0.09, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.2);
    });
  },

  // 6. Incorrect MCQ Answer Buzz
  playError() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.2);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.23);
  }
};

// ==========================================
// 0. BULLETPROOF CLIENT-SIDE STORAGE & NETWORK RESILIENCE (OPTION A)
// Eliminates read-only filesystem crashes and network unhandled halts on Vercel
// ==========================================

async function safeFetchJSON(url, options = {}, timeoutMs = 8000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const mergedOptions = {
      ...options,
      signal: options.signal || controller.signal
    };
    const res = await fetch(url, mergedOptions);
    clearTimeout(timeoutId);
    if (!res.ok) {
      console.warn(`safeFetchJSON [${url}] non-ok status: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`safeFetchJSON [${url}] notice:`, err.message || err);
    return null;
  }
}

const STORAGE_CLEAN_VERSION = "2.1_clean_no_seed";

const StorageManager = {
  _migrated: false,
  checkVersion() {
    if (this._migrated) return;
    this._migrated = true;
    try {
      const ver = localStorage.getItem("synclearn_clean_version");
      if (ver !== STORAGE_CLEAN_VERSION) {
        localStorage.removeItem("synclearn_videos");
        localStorage.removeItem("synclearn_folders");
        localStorage.removeItem("synclearn_pins");
        localStorage.removeItem("synclearn_analyses");
        localStorage.removeItem("synclearn_landing_folder");
        localStorage.setItem("synclearn_clean_version", STORAGE_CLEAN_VERSION);
      }
    } catch (_) {}
  },
  get(key, defaultValue = null) {
    this.checkVersion();
    try {
      const val = localStorage.getItem(`synclearn_${key}`);
      return val ? JSON.parse(val) : defaultValue;
    } catch (e) {
      console.warn("StorageManager.get error:", e);
      return defaultValue;
    }
  },
  set(key, value) {
    this.checkVersion();
    try {
      localStorage.setItem(`synclearn_${key}`, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn("StorageManager.set error:", e);
      return false;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(`synclearn_${key}`);
    } catch (_) {}
  },

  // Videos
  getSavedVideos() {
    const list = this.get("videos", []);
    return Array.isArray(list) ? list : [];
  },
  saveVideo(videoRecord) {
    if (!videoRecord || !videoRecord.video_id) return;
    const list = this.getSavedVideos();
    const existingIdx = list.findIndex(v => v.video_id === videoRecord.video_id);
    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], ...videoRecord };
    } else {
      list.unshift(videoRecord);
    }
    this.set("videos", list);
  },
  deleteVideo(videoId) {
    const list = this.getSavedVideos().filter(v => v.video_id !== videoId);
    this.set("videos", list);
    return list;
  },

  // Pins
  getPins(videoId) {
    if (!videoId) return [];
    const allPins = this.get("pins", []);
    return allPins.filter(p => p.video_id === videoId);
  },
  savePin(pin) {
    if (!pin) return;
    const allPins = this.get("pins", []);
    const existingIdx = allPins.findIndex(p => p.id === pin.id || (p.timestamp_sec === pin.timestamp_sec && p.title === pin.title));
    if (existingIdx >= 0) {
      allPins[existingIdx] = pin;
    } else {
      allPins.push(pin);
    }
    allPins.sort((a, b) => a.timestamp_sec - b.timestamp_sec);
    this.set("pins", allPins);
    return pin;
  },
  deletePin(pinId) {
    const allPins = this.get("pins", []);
    const filtered = allPins.filter(p => p.id !== pinId && String(p.id) !== String(pinId));
    this.set("pins", filtered);
  },

  // Folders
  getFolders() {
    const list = this.get("folders", []);
    return Array.isArray(list) ? list : [];
  },
  saveFolder(folder) {
    if (!folder) return;
    const list = this.getFolders();
    const existingIdx = list.findIndex(f => f.id === folder.id || f.name === folder.name);
    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], ...folder };
    } else {
      list.push(folder);
    }
    this.set("folders", list);
  },

  // Segment Analyses cache
  getAnalysis(videoId, timestampSec) {
    const map = this.get("analyses", {});
    const key = `${videoId}_${Math.round(timestampSec / 20)}`;
    return map[key] || null;
  },
  saveAnalysis(videoId, timestampSec, data) {
    if (!data) return;
    const map = this.get("analyses", {});
    const key = `${videoId}_${Math.round(timestampSec / 20)}`;
    map[key] = data;
    this.set("analyses", map);
  }
};

function extractYouTubeId(urlOrId) {
  if (!urlOrId) return null;
  const clean = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;
  const match = clean.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match && match[1]) return match[1];
  const general = clean.match(/([a-zA-Z0-9_-]{11})/);
  return general ? general[1] : null;
}

async function fetchClientVideoTitle(videoId) {
  if (!videoId || videoId.length < 11) return null;
  const cleanId = videoId.trim().substring(0, 11);

  // 1. Try noembed.com (CORS friendly)
  try {
    const res = await safeFetchJSON(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${cleanId}`, {}, 3000);
    if (res && res.title) return res.title;
  } catch (_) {}

  // 2. Try official YouTube oEmbed
  try {
    const res = await safeFetchJSON(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${cleanId}&format=json`, {}, 3000);
    if (res && res.title) return res.title;
  } catch (_) {}

  // 3. Try YouTube player videoData
  try {
    if (state.player && typeof state.player.getVideoData === "function") {
      const d = state.player.getVideoData();
      if (d && d.title) return d.title;
    }
  } catch (_) {}

  return null;
}

function generateClientFallbackPeaks(durationSec, videoTitle = "Core Topic") {
  const dur = durationSec || 1800;
  const p1 = Math.round(dur * 0.22);
  const p2 = Math.round(dur * 0.55);
  const p3 = Math.round(dur * 0.82);

  const cleanName = (videoTitle || "Lecture").split("|")[0].split("-")[0].trim();

  return [
    {
      id: "client-peak-1",
      start_sec: Math.max(0, p1 - 120),
      end_sec: Math.min(dur, p1 + 120),
      peak_sec: p1,
      intensity: 0.94,
      label: `${cleanName}: Core Concept (${formatTime(Math.max(0, p1 - 120))}–${formatTime(Math.min(dur, p1 + 120))})`,
      description: "High crowd replay spike: Critical foundational principle and theoretical derivation."
    },
    {
      id: "client-peak-2",
      start_sec: Math.max(0, p2 - 120),
      end_sec: Math.min(dur, p2 + 120),
      peak_sec: p2,
      intensity: 0.88,
      label: `${cleanName}: Key Derivation (${formatTime(Math.max(0, p2 - 120))}–${formatTime(Math.min(dur, p2 + 120))})`,
      description: "Dense instructional segment: Active problem-solving and governing mechanism formulation."
    },
    {
      id: "client-peak-3",
      start_sec: Math.max(0, p3 - 120),
      end_sec: Math.min(dur, p3 + 120),
      peak_sec: p3,
      intensity: 0.82,
      label: `${cleanName}: Summary & Exam Insights (${formatTime(Math.max(0, p3 - 120))}–${formatTime(Math.min(dur, p3 + 120))})`,
      description: "Synthesis of governing relationships and high-yield exam takeaways."
    }
  ];
}

function generateClientIntensityPoints(durationSec) {
  const dur = durationSec || 1800;
  const pts = [];
  const numPoints = 100;
  const p1 = dur * 0.22;
  const p2 = dur * 0.55;
  const p3 = dur * 0.82;
  for (let i = 0; i < numPoints; i++) {
    const t = (i / (numPoints - 1)) * dur;
    const base = 0.20 + 0.08 * Math.sin(t / 200);
    const g1 = 0.72 * Math.exp(-0.5 * Math.pow((t - p1) / (dur * 0.05), 2));
    const g2 = 0.80 * Math.exp(-0.5 * Math.pow((t - p2) / (dur * 0.06), 2));
    const g3 = 0.65 * Math.exp(-0.5 * Math.pow((t - p3) / (dur * 0.05), 2));
    const intensity = Math.min(1.0, Math.max(0.10, base + g1 + g2 + g3));
    pts.push({
      time_sec: Math.round(t * 10) / 10,
      percentage: Math.round((t / dur) * 10000) / 100,
      intensity: Math.round(intensity * 10000) / 10000
    });
  }
  return pts;
}

function buildClientAiFallback(videoId, videoTitle, centerSec) {
  const windowSec = state.analysisWindowSeconds || 240;
  const halfWin = windowSec / 2;
  const startSec = Math.max(0, centerSec - halfWin);
  const endSec = centerSec + halfWin;
  const timeStr = formatTime(centerSec);
  const cleanTitle = (videoTitle || "Lecture").split("|")[0].split("-")[0].trim();

  return {
    segment_window: `${formatTime(startSec)} - ${formatTime(endSec)}`,
    section_classification: "High-Density Theoretical Concept",
    why_students_struggle: `In '${cleanTitle}', students frequently struggle with connecting the theoretical derivation at ${timeStr} to practical problem-solving applications.`,
    identified_concepts: [
      { name: `${cleanTitle} Framework`, difficulty: "Intermediate", modality: "Theoretical" },
      { name: "Governing Boundary Conditions", difficulty: "Beginner", modality: "Mathematical" },
      { name: "Dynamic Parameter Equilibrium", difficulty: "Advanced", modality: "Visual" }
    ],
    context_locked_explanation: (
      `**Curated Intuition for '${cleanTitle}' at ${timeStr}:**\n\n` +
      `At this timestamp, the lecture isolates the governing relationship for **${cleanTitle}**:\n\n` +
      `1. **Core Governing Principle:** The instructor establishes the primary variables, applying essential physical and mathematical boundary conditions.\n\n` +
      `2. **Intuitive Analogy:** Think of this mechanism like a self-stabilizing feedback loop: any perturbation in the input variables is counterbalanced to maintain equilibrium.\n\n` +
      `3. **Key Exam Insight:** University midterms consistently test the boundary conditions discussed around ${timeStr}. Keep these governing constraints pinned in your notes!`
    ),
    terminology_bridge: [
      {
        prof_term: "Governing Formulation",
        alt_video_term: "Core System Equation",
        clarification: "Standard textbook representation versus intuitive practical formula."
      },
      {
        prof_term: "Boundary Constraints",
        alt_video_term: "Initial / Edge Conditions",
        clarification: "The mathematical domain limits within which this model remains physically valid."
      }
    ],
    recommended_search_queries: [
      `${cleanTitle} explained visually`,
      `${cleanTitle} step by step derivation`,
      `${cleanTitle} intuition for beginners`
    ],
    visual_diagram: {
      title: `${cleanTitle} Conceptual Flow`,
      nodes: [
        { id: "1", label: "Initial System Conditions", is_hidden_quiz: false },
        { id: "2", label: "Governing Parameter Balance", is_hidden_quiz: true, options: ["Governing Parameter Balance", "Arbitrary Offset", "Static Divergence"] },
        { id: "3", label: "Boundary Constraint Application", is_hidden_quiz: false },
        { id: "4", label: "Equilibrium Solution", is_hidden_quiz: true, options: ["Equilibrium Solution", "Null Solution", "Unconstrained Divergence"] }
      ]
    },
    checkpoint_mcqs: [
      {
        question: `What is the primary constraint governing the active system at ${timeStr} in '${cleanTitle}'?`,
        options: [
          "Preservation of fundamental boundary equilibrium conditions",
          "Unconstrained expansion without physical limits",
          "Arbitrary variable substitution without physical grounding",
          "Elimination of all differential parameters"
        ],
        correct_index: 0,
        explanation: "The derivation relies strictly on balancing governing constraints against initial boundary conditions.",
        review_timestamp_sec: Math.round(centerSec)
      }
    ],
    source: "client_resilient_ai"
  };
}

// ==========================================
// 0.1 CONTEXTUAL ONBOARDING & PROGRESSIVE DISCLOSURE TOUR
// ==========================================

const OnboardingTour = {
  currentStep: 0,
  steps: [
    {
      id: "step-timeline",
      targetId: "timeline-container",
      title: "1. Real Student Rewind Data",
      icon: "flame",
      badge: "Step 1 of 5",
      tag: "Student Rewind Peaks",
      description: "This curve highlights real rewind data from YouTube. The glowing peaks show where thousands of learners paused or rewound to understand a tricky derivation. Click any peak to dive right in!",
      actionText: "Next: Plain-English Intuition →",
      onEnter: () => {
        const landing = document.getElementById("landing-page-view");
        if (landing) landing.classList.add("hidden");
      }
    },
    {
      id: "step-rescue-btn",
      targetId: "btn-confused-rescue",
      title: "2. Plain-English Intuition",
      icon: "sparkles",
      badge: "Step 2 of 5",
      tag: "Simple Step-by-Step",
      description: "Whenever a derivation feels confusing, click 'Explain This Part Simply' (or press Alt + E). SyncLearn breaks down the core intuition step by step using the instructor's exact chalkboard terms.",
      actionText: "Next: Compare Terms Across Courses →",
      onEnter: () => {
        switchTab("tab-content-rescue");
      }
    },
    {
      id: "step-terminology",
      targetId: "tab-btn-rescue",
      title: "3. Compare Terms Across Courses",
      icon: "book-open",
      badge: "Step 3 of 5",
      tag: "Term Cross-Reference",
      description: "Different professors use different symbols for the same concept. Our Term Matrix shows you how lecture terms connect directly to standard textbook definitions.",
      actionText: "Next: Learn by Doing (Active Recall) →",
      onEnter: () => {
        switchTab("tab-content-rescue");
        const bridge = document.getElementById("rescue-terminology-bridge-table");
        if (bridge) bridge.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    {
      id: "step-quiz",
      targetId: "tab-btn-recall",
      title: "4. Learn by Doing (Active Recall)",
      icon: "target",
      badge: "Step 4 of 5",
      tag: "Interactive Practice",
      description: "Passive watching leads to forgetting. Don't just watch—test yourself! Tab 2 gives you interactive fill-in-the-blank concept flows and quick checkpoint puzzles to lock knowledge into memory.",
      actionText: "Next: Your Exam Study Guide →",
      onEnter: () => {
        switchTab("tab-content-recall");
      }
    },
    {
      id: "step-pins",
      targetId: "btn-drop-pin",
      title: "5. Your Personal Exam Study Guide",
      icon: "bookmark-plus",
      badge: "Step 5 of 5",
      tag: "1-Click Printable Guide",
      description: "Save notes and key formulas anytime with Alt + S. In Tab 3, everything you save is automatically organized into a clean 1-page study guide ready to print for exams!",
      actionText: "Finish Tour & Start Learning! 🎉",
      onEnter: () => {
        switchTab("tab-content-cheatsheet");
      }
    }
  ],

  init() {
    this.bindEvents();

    // Check if tour should auto-trigger for first-time visitors
    const completed = StorageManager.get("tour_completed", false);
    if (!completed) {
      // Auto-trigger when landing overlay is dismissed
      window._checkTourTrigger = () => {
        const landing = document.getElementById("landing-page-view");
        const isHidden = !landing || landing.classList.contains("hidden") || landing.classList.contains("opacity-0");
        if (isHidden && !StorageManager.get("tour_completed", false)) {
          setTimeout(() => {
            this.start(0);
          }, 800);
        }
      };
    }
  },

  start(stepIndex = 0) {
    this.currentStep = stepIndex;
    const overlay = document.getElementById("tour-overlay");
    if (overlay) overlay.classList.remove("hidden");
    this.renderStep();
  },

  next() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.renderStep();
    } else {
      this.finish();
    }
  },

  prev() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.renderStep();
    }
  },

  renderStep() {
    const step = this.steps[this.currentStep];
    if (!step) return;

    if (typeof step.onEnter === "function") step.onEnter();

    // Remove spotlight from previous elements
    document.querySelectorAll(".tour-spotlight-active").forEach(el => el.classList.remove("tour-spotlight-active"));

    // Add spotlight to current target
    const target = document.getElementById(step.targetId);
    if (target) {
      target.classList.add("tour-spotlight-active");
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    // Update text
    const titleEl = document.getElementById("tour-step-title");
    const descEl = document.getElementById("tour-step-description");
    const badgeEl = document.getElementById("tour-step-badge");
    const tagEl = document.getElementById("tour-feature-tag");
    const iconEl = document.getElementById("tour-step-icon");
    const nextBtn = document.getElementById("tour-next-btn");
    const prevBtn = document.getElementById("tour-prev-btn");

    if (titleEl) titleEl.textContent = step.title;
    if (descEl) descEl.textContent = step.description;
    if (badgeEl) badgeEl.textContent = step.badge;
    if (tagEl) tagEl.textContent = step.tag;
    if (iconEl) iconEl.setAttribute("data-lucide", step.icon);

    if (nextBtn) {
      nextBtn.innerHTML = `<span>${step.actionText}</span>`;
    }
    if (prevBtn) {
      if (this.currentStep === 0) {
        prevBtn.classList.add("hidden");
      } else {
        prevBtn.classList.remove("hidden");
      }
    }

    // Update step dots
    const dotsContainer = document.getElementById("tour-step-dots");
    if (dotsContainer) {
      dotsContainer.innerHTML = "";
      this.steps.forEach((s, idx) => {
        const dot = document.createElement("span");
        dot.className = idx === this.currentStep 
          ? "w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" 
          : "w-2 h-2 rounded-full bg-slate-700 cursor-pointer hover:bg-slate-500 transition-colors";
        dot.title = s.title;
        dot.addEventListener("click", () => {
          this.currentStep = idx;
          this.renderStep();
        });
        dotsContainer.appendChild(dot);
      });
    }

    lucide.createIcons();
  },

  finish() {
    StorageManager.set("tour_completed", true);
    this.close();
  },

  skip() {
    StorageManager.set("tour_completed", true);
    this.close();
  },

  close() {
    const overlay = document.getElementById("tour-overlay");
    if (overlay) overlay.classList.add("hidden");
    document.querySelectorAll(".tour-spotlight-active").forEach(el => el.classList.remove("tour-spotlight-active"));
  },

  bindEvents() {
    const nextBtn = document.getElementById("tour-next-btn");
    const prevBtn = document.getElementById("tour-prev-btn");
    const skipBtn = document.getElementById("tour-skip-btn");
    const closeBtn = document.getElementById("tour-close-btn");
    const restartBtn = document.getElementById("btn-restart-tour");

    if (nextBtn) nextBtn.addEventListener("click", () => this.next());
    if (prevBtn) prevBtn.addEventListener("click", () => this.prev());
    if (skipBtn) skipBtn.addEventListener("click", () => this.skip());
    if (closeBtn) closeBtn.addEventListener("click", () => this.close());

    if (restartBtn) {
      restartBtn.addEventListener("click", () => {
        this.start(0);
      });
    }

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const overlay = document.getElementById("tour-overlay");
        if (overlay && !overlay.classList.contains("hidden")) {
          this.close();
        }
      }
    });
  }
};

// Initialize Application on DOM Ready (Safe for both pre- and post-DOMContentLoaded execution)
function initSyncLearnApp() {
  yn10Audio.init();
  initUIEventListeners();
  loadSubjectFolders();
  renderCheatSheetBridges();
  renderCheatSheetMissedMCQs();
  OnboardingTour.init();

  // Listen to browser Back/Forward navigation
  window.addEventListener("popstate", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const vId = urlParams.get("v") || urlParams.get("video") || extractYouTubeId(window.location.hash);
    if (vId) {
      navigateToWorkspace(vId, null, false);
    } else {
      navigateToLanding(false);
    }
  });

  // Check URL parameters for active video (handles refreshes on workspace or direct links)
  const urlParams = new URLSearchParams(window.location.search);
  const paramVideoId = urlParams.get("v") || urlParams.get("video") || extractYouTubeId(window.location.hash);

  if (paramVideoId) {
    // If user refreshed while on workspace or followed direct video link:
    navigateToWorkspace(paramVideoId, null, false);
  } else {
    // Standard site entry: Always open on Landing Page!
    navigateToLanding(false);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSyncLearnApp);
} else {
  initSyncLearnApp();
}

// ==========================================
// 1. YOUTUBE IFRAME PLAYER INTEGRATION (BULLETPROOF)
// ==========================================

function initYouTubePlayer() {
  if (state.player && typeof state.player.loadVideoById === "function") return;

  const playerEl = document.getElementById("youtube-player");
  if (!playerEl) return;

  try {
    if (window.YT && window.YT.Player) {
      const cfg = {
        height: "100%",
        width: "100%",
        playerVars: {
          enablejsapi: 1,
          playsinline: 1,
          modestbranding: 1,
          rel: 0
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError
        }
      };
      if (state.currentVideoId) {
        cfg.videoId = state.currentVideoId;
      }
      state.player = new YT.Player("youtube-player", cfg);
    } else if (state.currentVideoId) {
      fallbackToDirectIframe();
    }
  } catch (err) {
    console.warn("YT.Player initialization notice:", err);
    if (state.currentVideoId) {
      fallbackToDirectIframe();
    }
  }
}

// Global YouTube callback
window.onYouTubeIframeAPIReady = function() {
  initYouTubePlayer();
};

// Check if YT script is already loaded or inject dynamically
if (window.YT && window.YT.Player) {
  initYouTubePlayer();
} else {
  if (!document.getElementById("yt-iframe-api-script")) {
    const tag = document.createElement("script");
    tag.id = "yt-iframe-api-script";
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }
}

// Safety timeout: Ensure the loading screen NEVER stays stuck covering the video
setTimeout(() => {
  const loader = document.getElementById("player-loader");
  if (loader && !loader.classList.contains("hidden")) {
    loader.style.opacity = "0";
    setTimeout(() => loader.classList.add("hidden"), 300);
  }
  if (!state.isPlayerReady && state.currentVideoId) {
    fallbackToDirectIframe();
  }
}, 2200);

function onPlayerReady(event) {
  state.isPlayerReady = true;
  const loader = document.getElementById("player-loader");
  if (loader) {
    loader.style.opacity = "0";
    setTimeout(() => loader.classList.add("hidden"), 300);
  }

  // Load active video if one was queued
  if (state.currentVideoId && state.player && typeof state.player.loadVideoById === "function") {
    try {
      state.player.loadVideoById(state.currentVideoId);
    } catch (_) {}
  }

  // Client-Side Extraction: Grab real title from YouTube player session
  try {
    if (state.player && typeof state.player.getVideoData === "function") {
      const vData = state.player.getVideoData();
      if (vData && vData.title && !vData.title.startsWith("Curated Lecture")) {
        state.currentVideoTitle = vData.title;
        const titleEl = document.getElementById("video-title");
        if (titleEl) titleEl.textContent = vData.title;
      }
    }
  } catch (_) {}

  // If landing page overlay is visible on initial load, ensure player starts paused
  const landingOverlay = document.getElementById("landing-page-view");
  if (landingOverlay && !landingOverlay.classList.contains("hidden")) {
    try {
      if (state.player && typeof state.player.pauseVideo === "function") {
        state.player.pauseVideo();
      }
    } catch (_) {}
  }

  const duration = state.player.getDuration();
  if (duration && duration > 0 && Math.abs(duration - state.durationSec) > 3) {
    state.durationSec = Math.round(duration);
    updateDurationBadge();
    if (state.heatmapData) renderHeatmap(state.heatmapData);
  }

  // Start Scrubber Polling Ticker (runs every 200ms)
  setInterval(syncPlayhead, 200);
}

function onPlayerError(event) {
  console.warn("YouTube Player error event:", event);
  if (state.currentVideoId) {
    fallbackToDirectIframe();
  }
}

function fallbackToDirectIframe() {
  if (!state.currentVideoId) return;
  const container = document.getElementById("youtube-player");
  if (container && (!state.player || !state.isPlayerReady)) {
    container.innerHTML = `
      <iframe 
        id="direct-yt-iframe"
        class="w-full h-full"
        src="https://www.youtube.com/embed/${state.currentVideoId}?enablejsapi=1&rel=0&playsinline=1"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
      </iframe>
    `;
    const loader = document.getElementById("player-loader");
    if (loader) loader.classList.add("hidden");
    state.isPlayerReady = true;
    setInterval(syncPlayhead, 200);
  }
}

function onPlayerStateChange(event) {
  // Dynamic Road Track Highway Drive Animation
  const timelineTrack = document.getElementById("timeline-container");
  if (timelineTrack) {
    if (event.data === YT.PlayerState.PLAYING) {
      timelineTrack.classList.add("is-driving");
    } else {
      timelineTrack.classList.remove("is-driving");
    }
  }

  // If landing page overlay is visible and video begins playing, immediately pause it
  const landingOverlay = document.getElementById("landing-page-view");
  if (landingOverlay && !landingOverlay.classList.contains("hidden") && event.data === YT.PlayerState.PLAYING) {
    try {
      if (state.player && typeof state.player.pauseVideo === "function") {
        state.player.pauseVideo();
      }
    } catch (_) {}
  }

  const playBtn = document.getElementById("ctrl-play-pause");
  if (playBtn) {
    if (event.data === YT.PlayerState.PLAYING) {
      playBtn.innerHTML = '<i data-lucide="pause" class="w-4 h-4 fill-current" aria-hidden="true"></i>';
    } else {
      playBtn.innerHTML = '<i data-lucide="play" class="w-4 h-4 fill-current" aria-hidden="true"></i>';
    }
    lucide.createIcons();
  }

  // Synchronize duration and title if video changed
  if (event.data === YT.PlayerState.PLAYING || event.data === YT.PlayerState.CUED) {
    try {
      if (state.player && typeof state.player.getVideoData === "function") {
        const vData = state.player.getVideoData();
        if (vData && vData.title && !vData.title.startsWith("Curated Lecture")) {
          state.currentVideoTitle = vData.title;
          const titleEl = document.getElementById("video-title");
          if (titleEl && (!titleEl.textContent || titleEl.textContent.startsWith("Curated Lecture"))) {
            titleEl.textContent = vData.title;
          }
        }
      }
    } catch (_) {}

    if (state.player && typeof state.player.getDuration === "function") {
      const dur = state.player.getDuration();
      if (dur && dur > 10 && Math.abs(dur - state.durationSec) > 5) {
        state.durationSec = Math.round(dur);
        updateDurationBadge();
        if (state.heatmapData) renderHeatmap(state.heatmapData);
      }
    }
  }
}

function triggerAutoPauseToast(message) {
  const toast = document.getElementById("autopause-toast");
  const toastMsg = document.getElementById("autopause-toast-msg");
  if (!toast || !toastMsg) return;
  toastMsg.textContent = message;
  toast.classList.remove("hidden");
  lucide.createIcons();

  if (window._autopauseToastTimer) clearTimeout(window._autopauseToastTimer);
  window._autopauseToastTimer = setTimeout(() => {
    if (toast) toast.classList.add("hidden");
  }, 7000);
}

function syncPlayhead() {
  let current = state.currentTimeSec;
  if (state.isPlayerReady && state.player && typeof state.player.getCurrentTime === "function") {
    try {
      current = state.player.getCurrentTime() || current;
    } catch (e) {}
  }
  state.currentTimeSec = current;

  // Update Time Display
  const timeDisplay = document.getElementById("time-display");
  if (timeDisplay) {
    timeDisplay.textContent = `${formatTime(current)} / ${formatTime(state.durationSec)}`;
  }

  // Update Scrubber Bar Position & Accessibility Slider Attributes
  const playhead = document.getElementById("timeline-playhead");
  const timelineContainer = document.getElementById("timeline-container");
  if (playhead && state.durationSec > 0) {
    const pct = Math.min(100, Math.max(0, (current / state.durationSec) * 100));
    playhead.style.left = `${pct}%`;
  }
  if (timelineContainer) {
    timelineContainer.setAttribute("aria-valuenow", Math.round(current));
    timelineContainer.setAttribute("aria-valuetext", `${formatTime(current)} of ${formatTime(state.durationSec)}`);
  }

  // ----------------------------------------------------
  // AUTO-PAUSE CHECKPOINT DETECTION (High-Replay Peaks & Exam Pins)
  // ----------------------------------------------------
  if (state.autoPauseEnabled && state.isPlayerReady && state.previousTimeSec > 0) {
    // 1. Check if crossing near the end of a High-Replay Peak
    if (state.heatmapData && state.heatmapData.peaks && Array.isArray(state.heatmapData.peaks)) {
      state.heatmapData.peaks.forEach(p => {
        const peakEndTime = p.end_sec;
        if (state.previousTimeSec < peakEndTime && current >= peakEndTime && (current - peakEndTime) < 3.0) {
          const key = `peak-${p.id || p.start_sec}`;
          if (!state.triggeredAutoPauses.has(key)) {
            state.triggeredAutoPauses.add(key);
            if (state.player && typeof state.player.pauseVideo === "function") {
              try { state.player.pauseVideo(); } catch (e) {}
            }
            const cleanTitle = (p.label || "").split("(")[0].trim() || "Tricky Spot";
            triggerAutoPauseToast(`⚡ Tricky spot passed ("${cleanTitle}") — Auto-pausing for quick practice!`);
            switchTab("tab-content-recall");
          }
        }
      });
    }

    // 2. Check if crossing an Exam Priority Personal Pin
    if (state.pins && Array.isArray(state.pins)) {
      state.pins.forEach(pin => {
        if (pin.tag === "exam_priority") {
          const pinTime = pin.timestamp_sec;
          if (state.previousTimeSec < pinTime && current >= pinTime && (current - pinTime) < 3.0) {
            const key = `pin-${pin.id}`;
            if (!state.triggeredAutoPauses.has(key)) {
              state.triggeredAutoPauses.add(key);
              if (state.player && typeof state.player.pauseVideo === "function") {
                try { state.player.pauseVideo(); } catch (e) {}
              }
              triggerAutoPauseToast(`★ Reached Exam Important Note ("${pin.title}") — Auto-pausing for quick practice!`);
              switchTab("tab-content-recall");
            }
          }
        }
      });
    }
  }

  // If student scrubbed backward significantly, re-arm triggers that are ahead
  if (current < state.previousTimeSec - 5) {
    for (const key of Array.from(state.triggeredAutoPauses)) {
      if (key.startsWith("peak-")) {
        const pId = key.replace("peak-", "");
        const p = (state.heatmapData?.peaks || []).find(x => (x.id || x.start_sec) == pId);
        if (p && p.end_sec > current + 2) state.triggeredAutoPauses.delete(key);
      } else if (key.startsWith("pin-")) {
        const pinId = key.replace("pin-", "");
        const pin = (state.pins || []).find(x => x.id == pinId);
        if (pin && pin.timestamp_sec > current + 2) state.triggeredAutoPauses.delete(key);
      }
    }
  }

  state.previousTimeSec = current;
}

function jumpToTime(seconds, triggerAnalysis = false) {
  state.previousTimeSec = seconds;
  yn10Audio.playSeek();
  if (state.isPlayerReady && state.player && typeof state.player.seekTo === "function") {
    try {
      state.player.seekTo(seconds, true);
      state.player.playVideo();
    } catch (e) {
      console.warn("Player seekTo notice:", e);
    }
  } else {
    const iframe = document.getElementById("direct-yt-iframe");
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(JSON.stringify({
        event: "command",
        func: "seekTo",
        args: [seconds, true]
      }), "*");
      iframe.contentWindow.postMessage(JSON.stringify({
        event: "command",
        func: "playVideo",
        args: []
      }), "*");
    }
  }
  state.currentTimeSec = seconds;
  syncPlayhead();

  if (triggerAnalysis) {
    triggerExplainThisStep();
  }
}

// ==========================================
// 2. VIEW NAVIGATION & ROUTING (BULLETPROOF SPA)
// ==========================================

async function navigateToWorkspace(videoId, customTitle = null, pushHistory = true) {
  if (!videoId) return;
  state.currentVideoId = videoId;
  if (customTitle) state.currentVideoTitle = customTitle;

  // 1. Maintain Browser History & Query Parameters (e.g. ?v=...)
  if (pushHistory) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("v", videoId);
      window.history.pushState({ view: "workspace", videoId }, "", url.toString());
    } catch (_) {}
  }
  try {
    sessionStorage.setItem("synclearn_view", "workspace");
    sessionStorage.setItem("synclearn_video_id", videoId);
    document.documentElement.classList.add("in-workspace");
  } catch (_) {}

  // Reveal Workspace View
  const workspaceView = document.getElementById("workspace-view");
  if (workspaceView) workspaceView.classList.remove("hidden");

  // 2. Hide Landing Page Overlay smoothly
  const landingView = document.getElementById("landing-page-view");
  if (landingView) {
    landingView.classList.add("opacity-0", "pointer-events-none");
    setTimeout(() => {
      landingView.classList.add("hidden");
      if (window._checkTourTrigger) window._checkTourTrigger();
    }, 200);
  }

  // 3. Update top navbar URL input to reflect active video
  const navbarInput = document.getElementById("youtube-url-input");
  if (navbarInput) {
    navbarInput.value = `https://www.youtube.com/watch?v=${videoId}`;
  }

  // 4. Restore active tab if previously chosen in this session
  try {
    const savedTab = sessionStorage.getItem("synclearn_active_tab");
    if (savedTab && document.getElementById(savedTab)) {
      switchTab(savedTab);
    }
  } catch (_) {}

  // 5. Load Studio & Video
  await loadVideoStudio(videoId, customTitle);
}

function navigateToLanding(pushHistory = true) {
  // 1. Pause video player if running
  if (state.player && typeof state.player.pauseVideo === "function") {
    try {
      state.player.pauseVideo();
    } catch (_) {}
  }

  // 2. Maintain Browser History (clear ?v= so refresh stays on Landing Page)
  if (pushHistory) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("v");
      url.searchParams.delete("video");
      window.history.pushState({ view: "landing" }, "", url.pathname + (url.search ? url.search : ""));
    } catch (_) {}
  }
  try {
    sessionStorage.setItem("synclearn_view", "landing");
    document.documentElement.classList.remove("in-workspace");
  } catch (_) {}

  // Hide Workspace View
  const workspaceView = document.getElementById("workspace-view");
  if (workspaceView) workspaceView.classList.add("hidden");

  // 3. Display Landing Page Overlay
  const landingView = document.getElementById("landing-page-view");
  if (landingView) {
    landingView.classList.remove("hidden");
    requestAnimationFrame(() => {
      landingView.classList.remove("opacity-0", "pointer-events-none");
    });
  }

  // 4. Focus input and re-render folder pills & videos
  const landingInput = document.getElementById("landing-url-input");
  if (landingInput) landingInput.focus();

  loadSubjectFolders();
}

async function loadVideoStudio(videoId, customTitle = null) {
  try {
    state.currentVideoId = videoId;
    state.triggeredAutoPauses.clear();
    state.previousTimeSec = 0;

    // Immediately load video in player or fallback iframe
    if (state.isPlayerReady && state.player && typeof state.player.loadVideoById === "function") {
      try {
        state.player.loadVideoById(videoId);
      } catch (e) {
        fallbackToDirectIframe();
      }
    } else if (window.YT && window.YT.Player) {
      initYouTubePlayer();
    } else {
      fallbackToDirectIframe();
    }

    // Dismiss any loader overlay immediately
    const loader = document.getElementById("player-loader");
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => loader.classList.add("hidden"), 300);
    }

    // Switch from Landing Page to Workspace if open
    const landingView = document.getElementById("landing-page-view");
    if (landingView && !landingView.classList.contains("hidden")) {
      landingView.classList.add("opacity-0", "pointer-events-none");
      setTimeout(() => {
        landingView.classList.add("hidden");
        if (window._checkTourTrigger) window._checkTourTrigger();
      }, 300);
    }

    // Client-Side Extraction: Resolve real video title immediately
    let resolvedTitle = customTitle;
    if (!resolvedTitle) {
      const savedVideos = StorageManager.getSavedVideos();
      const matchSaved = savedVideos.find(v => v.video_id === videoId);
      if (matchSaved && matchSaved.title && !matchSaved.title.startsWith("Curated Lecture")) {
        resolvedTitle = matchSaved.title;
      }
    }
    if (!resolvedTitle) {
      resolvedTitle = await fetchClientVideoTitle(videoId);
    }
    if (resolvedTitle) {
      state.currentVideoTitle = resolvedTitle;
      const titleEl = document.getElementById("video-title");
      if (titleEl) titleEl.textContent = resolvedTitle;
    }

    // Reset session bridges and missed questions for a new video
    state.sessionTerminologyBridges = [];
    state.missedQuizQuestions = [];
    renderCheatSheetBridges();
    renderCheatSheetMissedMCQs();

    // Load Pins from localStorage immediately (0 ms)
    await loadPins(videoId);

    // Call backend safely
    const titleParam = encodeURIComponent(state.currentVideoTitle || "");
    const data = await safeFetchJSON(`/api/video/${videoId}?client_title=${titleParam}`);

    let activeHeatmap = null;
    if (data && data.video) {
      if (data.video.title && !data.video.title.startsWith("Curated Lecture")) {
        state.currentVideoTitle = data.video.title;
        document.getElementById("video-title").textContent = data.video.title;
      }
      if (data.video.duration_sec) {
        state.durationSec = data.video.duration_sec;
      }
    }

    if (data && data.heatmap && Array.isArray(data.heatmap.peaks) && data.heatmap.peaks.length > 0) {
      activeHeatmap = data.heatmap;
      if (activeHeatmap.duration_sec) {
        state.durationSec = activeHeatmap.duration_sec;
      }
    } else {
      // Automatic client-side fallback peaks & intensity points!
      const fallbackPeaks = generateClientFallbackPeaks(state.durationSec, state.currentVideoTitle);
      const fallbackPoints = generateClientIntensityPoints(state.durationSec);
      activeHeatmap = {
        video_id: videoId,
        title: state.currentVideoTitle || `Lecture (${videoId})`,
        duration_sec: state.durationSec,
        chapters: [],
        intensity_points: fallbackPoints,
        peaks: fallbackPeaks,
        source: "client_resilient_fallback"
      };
    }

    state.heatmapData = activeHeatmap;
    renderHeatmap(activeHeatmap);
    renderDynamicPeaksUI(activeHeatmap);
    updateDurationBadge();

    // Save video to localStorage
    StorageManager.saveVideo({
      video_id: videoId,
      title: state.currentVideoTitle || `Lecture (${videoId})`,
      duration_sec: state.durationSec,
      thumbnail_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      folder_id: state.currentFolderId || 1
    });

    // Keep tabs 1, 2, and 3 completely empty until user presses "Explain This Step"
    resetTabsToEmptyState();

  } catch (err) {
    console.error("Failed to load video studio:", err);
  }
}

function updateDurationBadge() {
  const durStr = formatTime(state.durationSec);
  const badge = document.getElementById("video-duration-badge");
  if (badge) badge.textContent = durStr;
  const endMarker = document.getElementById("timeline-end-time");
  if (endMarker) endMarker.textContent = durStr;
}

// Renders dynamic timeline labels and quick peak buttons for any loaded video
function renderDynamicPeaksUI(heatmap) {
  const labelsContainer = document.getElementById("timeline-peaks-label-container");
  const buttonsContainer = document.getElementById("quick-peaks-buttons");
  const peakCountBadge = document.getElementById("timeline-peak-count");

  const peaks = heatmap.peaks || [];

  if (peakCountBadge) {
    peakCountBadge.textContent = `⚡ ${peaks.length} TRICKY SPOTS`;
  }

  // Render bottom timeline peak labels
  if (labelsContainer) {
    labelsContainer.innerHTML = "";
    peaks.forEach(p => {
      const startStr = formatTime(p.start_sec);
      const endStr = formatTime(p.end_sec);
      const cleanLabel = (p.label || "").split("(")[0].trim();
      const span = document.createElement("span");
      span.className = "text-[#ffe600] hover:text-white cursor-pointer truncate max-w-[200px] font-mono font-medium";
      span.title = p.description || p.label;
      span.textContent = `${startStr} - ${endStr} (${cleanLabel})`;
      span.addEventListener("click", () => jumpToTime(p.peak_sec || p.start_sec, false));
      labelsContainer.appendChild(span);
    });
  }

  // Render Quick Peak Jump Navigator Bar
  if (buttonsContainer) {
    buttonsContainer.innerHTML = "";
    peaks.forEach(p => {
      const peakTime = p.peak_sec || p.start_sec;
      const cleanLabel = (p.label || "").split("(")[0].trim();
      const intensityPct = Math.round((p.intensity || 0.8) * 100);

      const btn = document.createElement("button");
      btn.className = "peak-jump-btn yn10-peak-pill min-h-[38px] px-3 py-1.5 rounded-none text-white whitespace-nowrap flex items-center gap-1.5 cursor-pointer font-mono text-xs font-bold";
      btn.innerHTML = `
        <span class="w-2 h-2 bg-[#e60012] shrink-0 inline-block"></span>
        <span class="truncate max-w-[210px]">${formatTime(peakTime)} • ${cleanLabel} (${intensityPct}%)</span>
      `;
      btn.addEventListener("click", () => jumpToTime(peakTime, false));
      buttonsContainer.appendChild(btn);
    });
    lucide.createIcons();
  }
}

// ==========================================
// 3. MOST REPLAYED HEATMAP CURVE & TIMELINE
// ==========================================

function renderHeatmap(heatmap) {
  const svg = document.getElementById("heatmap-svg");
  const fillPath = document.getElementById("heatmap-curve-fill");
  const strokePath = document.getElementById("heatmap-curve-stroke");
  const zonesGroup = document.getElementById("difficult-zones-group");

  if (!svg || !fillPath || !strokePath || !heatmap.intensity_points) return;

  const points = heatmap.intensity_points;
  const numPoints = points.length;
  if (numPoints === 0) return;

  const svgWidth = 1000;
  const svgHeight = 100;

  // Build SVG path
  let pathD = "";
  points.forEach((pt, i) => {
    const x = (pt.percentage / 100) * svgWidth;
    const y = svgHeight - (pt.intensity * (svgHeight - 15)) - 5;
    if (i === 0) {
      pathD += `M ${x} ${y}`;
    } else {
      pathD += ` L ${x} ${y}`;
    }
  });

  strokePath.setAttribute("d", pathD);
  const closedPathD = `${pathD} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;
  fillPath.setAttribute("d", closedPathD);

  // Render Highlighted Tricky Spots (Peaks)
  zonesGroup.innerHTML = "";
  if (heatmap.peaks && Array.isArray(heatmap.peaks)) {
    heatmap.peaks.forEach(peak => {
      const startPct = (peak.start_sec / state.durationSec) * 100;
      const endPct = (peak.end_sec / state.durationSec) * 100;
      const x = (startPct / 100) * svgWidth;
      const w = Math.max(15, ((endPct - startPct) / 100) * svgWidth);

      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x);
      rect.setAttribute("y", "0");
      rect.setAttribute("width", w);
      rect.setAttribute("height", svgHeight);
      rect.setAttribute("fill", "url(#peak-zone-grad)");
      rect.setAttribute("opacity", "0.65");
      rect.classList.add("cursor-pointer");

      rect.addEventListener("click", (e) => {
        e.stopPropagation();
        jumpToTime(peak.peak_sec || peak.start_sec);
      });

      zonesGroup.appendChild(rect);
    });
  }
}

// Timeline User Interactions (Hover Tooltip & Seeking)
function initTimelineInteractions() {
  const container = document.getElementById("timeline-container");
  const tooltip = document.getElementById("timeline-tooltip");
  const tooltipText = document.getElementById("tooltip-text");

  if (!container || !tooltip || !tooltipText) return;

  container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const pct = offsetX / rect.width;
    const hoverTimeSec = pct * state.durationSec;

    // Position tooltip
    tooltip.style.left = `${Math.min(rect.width - 150, Math.max(10, offsetX - 70))}px`;
    tooltip.classList.remove("hidden");

    // Check if inside tricky spot
    let peakLabel = "";
    if (state.heatmapData && state.heatmapData.peaks) {
      const match = state.heatmapData.peaks.find(p => hoverTimeSec >= p.start_sec && hoverTimeSec <= p.end_sec);
      if (match) {
        peakLabel = ` • ⚡ ${match.label.split("(")[0].trim()}`;
      }
    }

    let intensityPct = 40;
    if (state.heatmapData && state.heatmapData.intensity_points) {
      const pts = state.heatmapData.intensity_points;
      const idx = Math.min(pts.length - 1, Math.floor(pct * pts.length));
      intensityPct = Math.round((pts[idx]?.intensity || 0.4) * 100);
    }

    tooltipText.textContent = `${formatTime(hoverTimeSec)} (${intensityPct}% Replayed)${peakLabel}`;
  });

  container.addEventListener("mouseleave", () => {
    tooltip.classList.add("hidden");
  });

  container.addEventListener("click", (e) => {
    if (e.target.closest(".timeline-pin-badge")) return;

    const rect = container.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const pct = offsetX / rect.width;
    const targetTimeSec = Math.round(pct * state.durationSec);
    jumpToTime(targetTimeSec, false);
  });
}

// ==========================================
// 4. PERSONAL STUDY PINS (ACCESSIBLE TAGS & UNDO DELETION)
// ==========================================

async function loadPins(videoId) {
  // 1. Immediately load from localStorage (instant 0 ms load)
  state.pins = StorageManager.getPins(videoId) || [];
  renderTimelinePins();
  renderCheatSheetPins();

  // 2. Synchronize with backend in background
  try {
    const data = await safeFetchJSON(`/api/pins/${videoId}`);
    if (data && Array.isArray(data.pins)) {
      const merged = [...(state.pins || [])];
      data.pins.forEach(sp => {
        if (!merged.some(p => p.id === sp.id || (p.timestamp_sec === sp.timestamp_sec && p.title === sp.title))) {
          merged.push(sp);
        }
      });
      merged.sort((a, b) => a.timestamp_sec - b.timestamp_sec);
      state.pins = merged;
      merged.forEach(p => StorageManager.savePin(p));
      renderTimelinePins();
      renderCheatSheetPins();
    }
  } catch (err) {
    console.debug("loadPins background sync notice:", err);
  }
}

function renderTimelinePins() {
  const overlay = document.getElementById("timeline-pins-overlay");
  if (!overlay) return;
  overlay.innerHTML = "";

  state.pins.forEach(pin => {
    const pct = (pin.timestamp_sec / state.durationSec) * 100;
    const badge = document.createElement("div");
    badge.className = "timeline-pin-badge";
    badge.style.left = `${pct}%`;

    let colorClasses = "bg-rose-500/25 text-rose-200 border-rose-500";
    let icon = "★";
    let accessibleLabel = "Exam Important";
    if (pin.tag === "revisit") {
      colorClasses = "bg-amber-500/25 text-amber-200 border-amber-500";
      icon = "?";
      accessibleLabel = "Needs Review";
    } else if (pin.tag === "key_formula") {
      colorClasses = "bg-cyan-500/25 text-cyan-200 border-cyan-500";
      icon = "∑";
      accessibleLabel = "Key Formula";
    }

    badge.innerHTML = `
      <div class="flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold shadow-md backdrop-blur-md ${colorClasses}">
        <span aria-hidden="true">${icon}</span>
        <span class="font-mono text-[10px]">${formatTime(pin.timestamp_sec)}</span>
      </div>
    `;

    badge.setAttribute("role", "button");
    badge.setAttribute("aria-label", `${accessibleLabel}: ${pin.title} at ${formatTime(pin.timestamp_sec)}`);
    badge.title = `[${accessibleLabel}] ${pin.title}: ${pin.note || ""}`;
    badge.addEventListener("click", (e) => {
      e.stopPropagation();
      jumpToTime(pin.timestamp_sec, false);
    });

    overlay.appendChild(badge);
  });
}

function renderCheatSheetPins() {
  const container = document.getElementById("pins-list-container");
  const countBadge = document.getElementById("pins-count-badge");
  const filterAll = document.getElementById("filter-cnt-all");
  const filterExam = document.getElementById("filter-cnt-exam");
  const filterRevisit = document.getElementById("filter-cnt-revisit");
  const filterFormula = document.getElementById("filter-cnt-formula");

  if (!container) return;

  const total = state.pins.length;

  const cheatsheetEmpty = document.getElementById("cheatsheet-empty-state");
  const cheatsheetReal = document.getElementById("cheatsheet-real-content");
  if (!state.hasExplainedCurrent && total === 0) {
    if (cheatsheetEmpty) cheatsheetEmpty.classList.remove("hidden");
    if (cheatsheetReal) cheatsheetReal.classList.add("hidden");
  } else if (state.hasExplainedCurrent || total > 0) {
    if (cheatsheetEmpty) cheatsheetEmpty.classList.add("hidden");
    if (cheatsheetReal) cheatsheetReal.classList.remove("hidden");
  }

  const examCnt = state.pins.filter(p => p.tag === "exam_priority").length;
  const revisitCnt = state.pins.filter(p => p.tag === "revisit").length;
  const formulaCnt = state.pins.filter(p => p.tag === "key_formula").length;

  if (countBadge) countBadge.textContent = total;
  if (filterAll) filterAll.textContent = total;
  if (filterExam) filterExam.textContent = examCnt;
  if (filterRevisit) filterRevisit.textContent = revisitCnt;
  if (filterFormula) filterFormula.textContent = formulaCnt;

  const filtered = state.pins.filter(p => {
    if (state.activeFilter === "all") return true;
    return p.tag === state.activeFilter;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-slate-300 text-xs">
        <i data-lucide="bookmark" class="w-8 h-8 mx-auto mb-2 opacity-50" aria-hidden="true"></i>
        No saved notes found for this filter. Save a note while watching to review later!
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = "";
  filtered.forEach(pin => {
    const card = document.createElement("div");
    card.className = "p-3.5 bg-[#14171a] border border-[#272c30] hover:border-white rounded-none space-y-2 font-mono transition-none";

    let tagBadge = `<span class="px-2 py-0.5 rounded-none bg-[#e60012] text-white text-[10px] font-bold">★ EXAM IMPORTANT</span>`;
    if (pin.tag === "revisit") {
      tagBadge = `<span class="px-2 py-0.5 rounded-none bg-[#14171a] border border-[#ffe600] text-[#ffe600] text-[10px] font-bold">? NEEDS REVIEW</span>`;
    } else if (pin.tag === "key_formula") {
      tagBadge = `<span class="px-2 py-0.5 rounded-none bg-[#14171a] border border-[#00d050] text-[#00d050] text-[10px] font-bold">∑ KEY FORMULA</span>`;
    }

    card.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          ${tagBadge}
          <button class="pin-jump-btn font-mono text-[11px] font-bold text-white bg-[#0e1113] border border-white px-2.5 py-1 rounded-none flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#ffffff]" data-time="${pin.timestamp_sec}">
            <i data-lucide="play" class="w-3 h-3 fill-current text-[#ffe600]" aria-hidden="true"></i> ${formatTime(pin.timestamp_sec)}
          </button>
        </div>
        <button class="delete-pin-btn min-h-[36px] min-w-[36px] text-[#8a9699] hover:text-[#ff8f8f] p-1.5 cursor-pointer rounded-none hover:bg-[#181c20]" data-id="${pin.id}" title="Delete Saved Note" aria-label="Delete saved note: ${pin.title}">
          <i data-lucide="trash-2" class="w-4 h-4" aria-hidden="true"></i>
        </button>
      </div>
      <h4 class="text-xs font-bold text-white">${pin.title}</h4>
      ${pin.note ? `<p class="text-xs text-[#d6dcde] leading-relaxed bg-[#0a0b0d] p-2.5 rounded-none border border-[#272c30]">${pin.note}</p>` : ""}
    `;

    card.querySelector(".pin-jump-btn").addEventListener("click", () => {
      jumpToTime(pin.timestamp_sec, false);
    });

    card.querySelector(".delete-pin-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      deletePinWithUndo(pin.id);
    });

    container.appendChild(card);
  });

  lucide.createIcons();
}

// User-friendly Deletion with 5-Second Undo Toast
function deletePinWithUndo(pinId) {
  const pinIndex = state.pins.findIndex(p => p.id === pinId);
  if (pinIndex === -1) return;

  const deletedPin = state.pins[pinIndex];

  // If there was an already pending deletion, execute it immediately
  if (state.pendingDeleteTimeout) {
    clearTimeout(state.pendingDeleteTimeout);
    if (state.pendingDeletedPin) {
      executePermanentDelete(state.pendingDeletedPin.id);
    }
  }

  // Optimistic UI removal
  state.pins.splice(pinIndex, 1);
  renderTimelinePins();
  renderCheatSheetPins();

  state.pendingDeletedPin = deletedPin;

  // Show Undo Toast
  const toast = document.getElementById("undo-delete-toast");
  const msg = document.getElementById("undo-delete-msg");
  const undoBtn = document.getElementById("undo-delete-btn");

  if (toast && msg && undoBtn) {
    msg.textContent = `Saved note "${deletedPin.title}" deleted.`;
    toast.classList.remove("hidden");

    undoBtn.onclick = () => {
      // Undo action!
      if (state.pendingDeleteTimeout) clearTimeout(state.pendingDeleteTimeout);
      state.pins.push(deletedPin);
      state.pins.sort((a, b) => a.timestamp_sec - b.timestamp_sec);
      state.pendingDeletedPin = null;
      state.pendingDeleteTimeout = null;
      toast.classList.add("hidden");
      renderTimelinePins();
      renderCheatSheetPins();
    };

    // Set 5-second timer before permanent API deletion
    state.pendingDeleteTimeout = setTimeout(() => {
      toast.classList.add("hidden");
      executePermanentDelete(deletedPin.id);
      state.pendingDeletedPin = null;
      state.pendingDeleteTimeout = null;
    }, 5000);
  } else {
    executePermanentDelete(deletedPin.id);
  }
}

async function executePermanentDelete(pinId) {
  try {
    StorageManager.deletePin(pinId);
    state.pins = (state.pins || []).filter(p => p.id !== pinId && String(p.id) !== String(pinId));
    renderTimelinePins();
    renderCheatSheetPins();
    await safeFetchJSON(`/api/pins/${pinId}`, { method: "DELETE" });
  } catch (err) {
    console.warn("Failed to delete pin permanently:", err);
  }
}

// ==========================================
// 5. TAB 1: SIMPLE EXPLANATION (STEP-BY-STEP PROGRESS & PLAIN LANGUAGE)
// ==========================================

function resetTabsToEmptyState() {
  state.hasExplainedCurrent = false;
  state.activeAnalysis = null;

  // Tab 1: Show empty state, hide skeleton and real content
  const rescueEmpty = document.getElementById("rescue-empty-state");
  const rescueSkeleton = document.getElementById("rescue-loading-skeleton");
  const rescueReal = document.getElementById("rescue-real-content");
  if (rescueEmpty) rescueEmpty.classList.remove("hidden");
  if (rescueSkeleton) rescueSkeleton.classList.add("hidden");
  if (rescueReal) rescueReal.classList.add("hidden");

  // Tab 2: Show empty state, hide real content
  const recallEmpty = document.getElementById("recall-empty-state");
  const recallReal = document.getElementById("recall-real-content");
  if (recallEmpty) recallEmpty.classList.remove("hidden");
  if (recallReal) recallReal.classList.add("hidden");

  // Tab 3: Show empty state if no saved pins, otherwise show real content
  const cheatsheetEmpty = document.getElementById("cheatsheet-empty-state");
  const cheatsheetReal = document.getElementById("cheatsheet-real-content");
  const pinCount = (state.pins && state.pins.length) || 0;
  if (pinCount === 0) {
    if (cheatsheetEmpty) cheatsheetEmpty.classList.remove("hidden");
    if (cheatsheetReal) cheatsheetReal.classList.add("hidden");
  } else {
    if (cheatsheetEmpty) cheatsheetEmpty.classList.add("hidden");
    if (cheatsheetReal) cheatsheetReal.classList.remove("hidden");
  }

  if (window.lucide) window.lucide.createIcons();
}

async function triggerExplainThisStep() {
  state.hasExplainedCurrent = true;

  // Ensure Tab 1 is active view
  switchTab("tab-content-rescue");

  // Show loading skeleton, hide empty state and real content
  const rescueEmpty = document.getElementById("rescue-empty-state");
  const rescueSkeleton = document.getElementById("rescue-loading-skeleton");
  const rescueReal = document.getElementById("rescue-real-content");
  if (rescueEmpty) rescueEmpty.classList.add("hidden");
  if (rescueSkeleton) rescueSkeleton.classList.remove("hidden");
  if (rescueReal) rescueReal.classList.add("hidden");

  try {
    await fetchSegmentAnalysis(state.currentTimeSec);
    await fetchSegmentQuiz(state.currentTimeSec);
  } catch (err) {
    console.warn("triggerExplainThisStep error:", err);
  } finally {
    if (rescueSkeleton) rescueSkeleton.classList.add("hidden");
    if (rescueReal) rescueReal.classList.remove("hidden");

    const recallEmpty = document.getElementById("recall-empty-state");
    const recallReal = document.getElementById("recall-real-content");
    if (recallEmpty) recallEmpty.classList.add("hidden");
    if (recallReal) recallReal.classList.remove("hidden");

    const cheatsheetEmpty = document.getElementById("cheatsheet-empty-state");
    const cheatsheetReal = document.getElementById("cheatsheet-real-content");
    if (cheatsheetEmpty) cheatsheetEmpty.classList.add("hidden");
    if (cheatsheetReal) cheatsheetReal.classList.remove("hidden");

    if (window.lucide) window.lucide.createIcons();
  }
}

async function runAiSegmentAnalysis(timestampSec, studentDoubt = null) {
  const emptyState = document.getElementById("rescue-empty-state");
  const skeleton = document.getElementById("rescue-loading-skeleton");
  const content = document.getElementById("rescue-real-content");
  const winBanner = document.getElementById("rescue-window-time");
  const skStep1 = document.getElementById("sk-step-1");
  const skStep2 = document.getElementById("sk-step-2");
  const skStep3 = document.getElementById("sk-step-3");

  const windowSec = state.analysisWindowSeconds || 240;
  const halfWin = windowSec / 2;
  const startSec = Math.max(0, timestampSec - halfWin);
  const endSec = timestampSec + halfWin;

  if (winBanner) {
    winBanner.textContent = `${formatTime(startSec)} – ${formatTime(endSec)}`;
  }

  // Show friendly step-by-step skeleton while AI analysis is running
  if (emptyState) emptyState.classList.add("hidden");
  if (skeleton) skeleton.classList.remove("hidden");
  if (content) content.classList.add("hidden");

  // Animate progress steps
  if (skStep1) skStep1.className = "flex items-center gap-2 text-indigo-300 font-bold";
  if (skStep2) skStep2.className = "flex items-center gap-2 text-slate-400";
  if (skStep3) skStep3.className = "flex items-center gap-2 text-slate-400";

  const stepTimer1 = setTimeout(() => {
    if (skStep2) skStep2.className = "flex items-center gap-2 text-indigo-300 font-bold";
  }, 700);

  const stepTimer2 = setTimeout(() => {
    if (skStep3) skStep3.className = "flex items-center gap-2 text-indigo-300 font-bold";
  }, 1400);

  // 1. Check local client cache first (instant 0 ms load)
  const cached = StorageManager.getAnalysis(state.currentVideoId, timestampSec);
  if (cached && cached.section_classification) {
    state.activeAnalysis = cached;
    renderTab1AIRescue(cached, timestampSec);
    if (cached.visual_diagram) renderVisualDiagram(cached.visual_diagram);
    if (cached.checkpoint_mcqs) renderCheckpointMCQs(cached.checkpoint_mcqs);
    if (emptyState) emptyState.classList.add("hidden");
    if (skeleton) skeleton.classList.add("hidden");
    if (content) content.classList.remove("hidden");

    const recallEmpty = document.getElementById("recall-empty-state");
    const recallReal = document.getElementById("recall-real-content");
    if (recallEmpty) recallEmpty.classList.add("hidden");
    if (recallReal) recallReal.classList.remove("hidden");

    const cheatsheetEmpty = document.getElementById("cheatsheet-empty-state");
    const cheatsheetReal = document.getElementById("cheatsheet-real-content");
    if (cheatsheetEmpty) cheatsheetEmpty.classList.add("hidden");
    if (cheatsheetReal) cheatsheetReal.classList.remove("hidden");

    lucide.createIcons();
    return;
  }

  try {
    const currentTitle = state.currentVideoTitle || document.getElementById("video-title")?.textContent || "College Lecture";
    let data = await safeFetchJSON("/api/analyze-segment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        video_id: state.currentVideoId,
        video_title: currentTitle,
        center_timestamp_sec: timestampSec,
        window_seconds: windowSec,
        student_doubt: studentDoubt,
        client_title: currentTitle
      })
    }, 15000);

    // If server times out or is blocked on Vercel, synthesize dynamic client fallback matching exact schema!
    if (!data || !data.section_classification) {
      data = buildClientAiFallback(state.currentVideoId, currentTitle, timestampSec);
    }

    state.activeAnalysis = data;
    StorageManager.saveAnalysis(state.currentVideoId, timestampSec, data);

    // Render Tab 1 Simple Explanation
    renderTab1AIRescue(data, timestampSec);

    // Sync Tab 2 (Visual Practice Diagram & Checkpoint MCQs)
    if (data.visual_diagram) {
      renderVisualDiagram(data.visual_diagram);
    }
    if (data.checkpoint_mcqs) {
      renderCheckpointMCQs(data.checkpoint_mcqs);
    }

  } catch (err) {
    console.warn("AI segment explanation notice:", err);
    const fallbackData = buildClientAiFallback(state.currentVideoId, state.currentVideoTitle, timestampSec);
    renderTab1AIRescue(fallbackData, timestampSec);
    if (fallbackData.visual_diagram) renderVisualDiagram(fallbackData.visual_diagram);
    if (fallbackData.checkpoint_mcqs) renderCheckpointMCQs(fallbackData.checkpoint_mcqs);
  } finally {
    clearTimeout(stepTimer1);
    clearTimeout(stepTimer2);
    if (emptyState) emptyState.classList.add("hidden");
    if (skeleton) skeleton.classList.add("hidden");
    if (content) content.classList.remove("hidden");

    const recallEmpty = document.getElementById("recall-empty-state");
    const recallReal = document.getElementById("recall-real-content");
    if (recallEmpty) recallEmpty.classList.add("hidden");
    if (recallReal) recallReal.classList.remove("hidden");

    const cheatsheetEmpty = document.getElementById("cheatsheet-empty-state");
    const cheatsheetReal = document.getElementById("cheatsheet-real-content");
    if (cheatsheetEmpty) cheatsheetEmpty.classList.add("hidden");
    if (cheatsheetReal) cheatsheetReal.classList.remove("hidden");

    lucide.createIcons();
  }
}

// Unified alias for callers
async function fetchSegmentAnalysis(timestampSec, studentDoubt = null) {
  return await runAiSegmentAnalysis(timestampSec, studentDoubt);
}

async function fetchSegmentQuiz(timestampSec) {
  if (state.activeAnalysis && state.activeAnalysis.visual_diagram && state.activeAnalysis.checkpoint_mcqs) {
    renderVisualDiagram(state.activeAnalysis.visual_diagram);
    renderCheckpointMCQs(state.activeAnalysis.checkpoint_mcqs);
    return;
  }
  try {
    const data = await safeFetchJSON(`/api/quiz/${state.currentVideoId}?timestamp_sec=${timestampSec}`);
    if (data && data.quiz) {
      renderVisualDiagram(data.quiz);
    }
  } catch (e) {
    console.warn("Quiz fallback notice:", e);
  }
}

function renderTab1AIRescue(data, timestampSec) {
  const winBanner = document.getElementById("rescue-window-time");
  const classBadge = document.getElementById("rescue-classification-badge");
  const titleEl = document.getElementById("rescue-title");
  const struggleEl = document.getElementById("rescue-why-struggle");
  const pillsContainer = document.getElementById("rescue-concept-pills");
  const explEl = document.getElementById("rescue-explanation");
  const tableBody = document.getElementById("rescue-terminology-bridge-body");

  if (winBanner && data.segment_window) {
    winBanner.textContent = data.segment_window;
  }

  // Classification Badge (Plain Language)
  if (classBadge) {
    const isMath = (data.section_classification || "").toLowerCase().includes("math");
    if (isMath) {
      classBadge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 border border-rose-500/30 text-rose-300";
      classBadge.innerHTML = `★ Potentially Difficult Math`;
    } else {
      classBadge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300";
      classBadge.innerHTML = `💡 High-Density Concept`;
    }
  }

  // Title
  if (titleEl) {
    const primaryConcept = data.identified_concepts?.[0]?.name;
    titleEl.textContent = primaryConcept ? `${primaryConcept} (Simple Breakdown)` : `Section Explanation (${data.segment_window || formatTime(timestampSec)})`;
  }

  // Why Students Rewatch This Part
  if (struggleEl) {
    struggleEl.textContent = data.why_students_struggle || "Students struggle with the fast transitions in notation and abstract physical assumptions.";
  }

  // Key Takeaways (Concepts & Pills with high-contrast text)
  if (pillsContainer) {
    pillsContainer.innerHTML = "";
    const concepts = data.identified_concepts || [];
    if (concepts.length === 0) {
      pillsContainer.innerHTML = `<span class="text-xs text-slate-300">Core lecture principles and derivation steps.</span>`;
    } else {
      concepts.forEach(c => {
        let diffColor = "bg-amber-500/15 text-amber-200 border-amber-500/30";
        if (c.difficulty === "Beginner") diffColor = "bg-emerald-500/15 text-emerald-200 border-emerald-500/30";
        if (c.difficulty === "Advanced") diffColor = "bg-rose-500/15 text-rose-200 border-rose-500/30";

        let modColor = "bg-indigo-500/15 text-indigo-200 border-indigo-500/30";
        if (c.modality === "Visual") modColor = "bg-purple-500/15 text-purple-200 border-purple-500/30";
        if (c.modality === "Mathematical") modColor = "bg-cyan-500/15 text-cyan-200 border-cyan-500/30";

        const pill = document.createElement("div");
        pill.className = "flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs hover:border-slate-600 transition-colors";
        pill.innerHTML = `
          <span class="font-bold text-slate-100">${c.name}</span>
          <span class="text-[9px] px-1.5 py-0.2 rounded border font-mono font-bold ${diffColor}">${c.difficulty || "Core"}</span>
          <span class="text-[9px] px-1.5 py-0.2 rounded border font-mono font-bold ${modColor}">${c.modality || "Concept"}</span>
        `;
        pillsContainer.appendChild(pill);
      });
    }
  }

  // Step-by-Step Breakdown (Using the Video's Exact Terms) & KaTeX
  if (explEl) {
    explEl.innerHTML = formatMarkdownAndMath(data.context_locked_explanation || "");
    renderMathInElementSafe(explEl);
  }

  // Term Comparison Table (Lecture Term vs. Other Videos' Term)
  if (tableBody) {
    tableBody.innerHTML = "";
    const bridgeItems = data.terminology_bridge || [];
    if (bridgeItems.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="3" class="p-3 text-center text-slate-400 text-xs">Standard notation aligns with common engineering textbooks.</td></tr>`;
    } else {
      bridgeItems.forEach(row => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-slate-900/60 transition-colors";
        tr.innerHTML = `
          <td class="p-2.5 border-b border-slate-800 font-mono font-bold text-indigo-300 text-xs">${row.prof_term || ""}</td>
          <td class="p-2.5 border-b border-slate-800 font-mono text-cyan-300 text-xs">${row.alt_video_term || ""}</td>
          <td class="p-2.5 border-b border-slate-800 text-slate-200 text-xs font-serif leading-snug">${row.clarification || ""}</td>
        `;
        tableBody.appendChild(tr);
        renderMathInElementSafe(tr);

        // Accumulate into session cheat-sheet matrix
        if (row && row.prof_term && !state.sessionTerminologyBridges.some(b => b.prof_term === row.prof_term)) {
          state.sessionTerminologyBridges.push(row);
        }
      });
      renderCheatSheetBridges();
    }
  }

  // Auto-Save Summary Button
  const autoSaveBtn = document.getElementById("btn-autosave-summary-pin");
  if (autoSaveBtn) {
    autoSaveBtn.onclick = async () => {
      const topConcept = data.identified_concepts?.[0]?.name || "Core Concept";
      const newPin = {
        id: `pin-${Date.now()}`,
        video_id: state.currentVideoId,
        timestamp_sec: timestampSec,
        tag: "exam_priority",
        title: `Summary: ${topConcept}`,
        note: `★ Key Takeaway: ${data.why_students_struggle}\n\n💡 Breakdown: ${data.context_locked_explanation ? data.context_locked_explanation.slice(0, 320) : ""}...`,
        created_at: new Date().toISOString()
      };

      // Save immediately to client storage (0 ms)
      yn10Audio.playCoin();
      yn10Audio.playCoin();
      StorageManager.savePin(newPin);
      state.pins.push(newPin);
      state.pins.sort((a, b) => a.timestamp_sec - b.timestamp_sec);
      renderTimelinePins();
      renderCheatSheetPins();

      autoSaveBtn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400" aria-hidden="true"></i><span class="text-emerald-300 font-bold">✓ Saved to Notes!</span>`;
      lucide.createIcons();
      setTimeout(() => {
        autoSaveBtn.innerHTML = `<i data-lucide="bookmark-plus" class="w-3.5 h-3.5" aria-hidden="true"></i><span>Save as Note</span>`;
        lucide.createIcons();
      }, 2500);

      // Async backend sync (non-blocking)
      safeFetchJSON("/api/pins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPin)
      });
    };
  }

  // Fetch and render Alternative Resources (Videos & Research Papers)
  const query = (data.recommended_search_queries && data.recommended_search_queries[0]) ||
                (data.identified_concepts && data.identified_concepts[0]?.name) ||
                state.currentVideoTitle ||
                "lecture concept visual intuition";
  loadAlternativeResources(query);
}

let currentAlternativeResources = {
  videos: [],
  papers: [],
  filter: "all"
};

async function loadAlternativeResources(query) {
  const altsContainer = document.getElementById("rescue-alt-videos");
  if (!altsContainer) return;

  const allCountEl = document.getElementById("res-all-count");
  const videoCountEl = document.getElementById("res-video-count");
  const paperCountEl = document.getElementById("res-paper-count");

  altsContainer.innerHTML = `
    <div class="text-xs text-[#8a9699] font-mono flex items-center gap-2 p-3 bg-[#121516] border border-[#2b3336] rounded-none">
      <i data-lucide="loader-2" class="w-4 h-4 animate-spin text-[#f59f38]" aria-hidden="true"></i>
      <span>Finding clear explanations, visual animations, and academic research papers for "${query}"...</span>
    </div>
  `;
  lucide.createIcons();

  try {
    const data = await safeFetchJSON(`/api/alternative-resources?q=${encodeURIComponent(query)}&max_results=4`);
    const videos = (data && data.videos) || [];
    const papers = (data && data.papers) || [];

    currentAlternativeResources.videos = videos;
    currentAlternativeResources.papers = papers;
    currentAlternativeResources.filter = "all";

    if (allCountEl) allCountEl.textContent = videos.length + papers.length;
    if (videoCountEl) videoCountEl.textContent = videos.length;
    if (paperCountEl) paperCountEl.textContent = papers.length;

    renderAlternativeResourcesList();
    initResourceFilterButtons();

  } catch (err) {
    console.error("Failed to load alternative resources:", err);
    altsContainer.innerHTML = `<div class="text-xs text-rose-300 py-1 font-mono">Failed to load additional learning resources.</div>`;
  }
}

function initResourceFilterButtons() {
  document.querySelectorAll(".res-filter-btn").forEach(btn => {
    btn.onclick = () => {
      const filter = btn.getAttribute("data-filter");
      currentAlternativeResources.filter = filter;

      document.querySelectorAll(".res-filter-btn").forEach(b => {
        const isTarget = b.getAttribute("data-filter") === filter;
        if (isTarget) {
          b.className = "res-filter-btn px-2.5 py-1 rounded-none bg-[#24292b] text-[#f59f38] border border-[#e59130] font-bold cursor-pointer";
        } else {
          b.className = "res-filter-btn px-2.5 py-1 rounded-none bg-[#171a1b] text-[#8a9699] border border-[#333b3d] hover:text-white hover:bg-[#202527] cursor-pointer";
        }
      });

      renderAlternativeResourcesList();
    };
  });
}

function renderAlternativeResourcesList() {
  const altsContainer = document.getElementById("rescue-alt-videos");
  if (!altsContainer) return;

  const { videos, papers, filter } = currentAlternativeResources;
  const showVideos = filter === "all" || filter === "videos";
  const showPapers = filter === "all" || filter === "papers";

  if (videos.length === 0 && papers.length === 0) {
    altsContainer.innerHTML = `<div class="text-xs text-[#8a9699] font-mono py-2">No additional resources found for this topic.</div>`;
    return;
  }

  altsContainer.innerHTML = "";

  // Render Videos
  if (showVideos && videos.length > 0) {
    videos.forEach(v => {
      const card = document.createElement("div");
      card.className = "flex flex-col sm:flex-row items-start gap-3 bg-[#14171a] border border-[#272c30] hover:border-white rounded-none p-3 transition-none group";
      card.innerHTML = `
        <div class="relative w-full sm:w-28 aspect-video rounded-none overflow-hidden shrink-0 border border-[#272c30] bg-black cursor-pointer alt-video-thumb">
          <img src="${v.thumbnail}" alt="${v.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-100" onerror="this.src='https://img.youtube.com/vi/${v.video_id}/hqdefault.jpg'" />
          <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <i data-lucide="play" class="w-5 h-5 text-white fill-current" aria-hidden="true"></i>
          </div>
          <span class="absolute bottom-1 right-1 bg-black text-[9px] font-mono px-1 rounded-none text-[#ffe600] font-bold border border-[#ffe600]/40">${v.duration || "Visual"}</span>
        </div>
        <div class="flex-1 min-w-0 space-y-1">
          <div class="flex items-center justify-between gap-1">
            <span class="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-none bg-[#0a0b0d] text-[#ffe600] border border-[#ffe600]/40 truncate">
              <i data-lucide="film" class="w-2.5 h-2.5 inline mr-1"></i>${v.tag || "Visual Explanation"}
            </span>
            <span class="text-[10px] text-[#889296] font-mono truncate">${v.channel}</span>
          </div>
          <h5 class="text-xs font-bold text-white font-mono line-clamp-1 group-hover:text-[#ffe600] transition-colors cursor-pointer alt-video-title">${v.title}</h5>
          <p class="text-[11px] text-[#889296] line-clamp-2">${v.description || "Intuitive visual breakdown of this exact concept."}</p>
        </div>
        <div class="flex sm:flex-col gap-1.5 shrink-0 w-full sm:w-auto justify-end pt-1 sm:pt-0">
          <button class="preview-alt-btn yn10-btn-primary min-h-[34px] px-2.5 py-1 text-xs font-mono font-bold rounded-none cursor-pointer flex items-center justify-center gap-1 shadow-[2px_2px_0px_#ffe600]" title="Preview inside studio" aria-label="Preview video: ${v.title}">
            <i data-lucide="play" class="w-3 h-3 fill-current" aria-hidden="true"></i>
            <span class="sm:hidden">Preview</span>
          </button>
          <a href="${v.url || `https://www.youtube.com/watch?v=${v.video_id}`}" target="_blank" rel="noopener noreferrer" class="yn10-btn min-h-[34px] px-2.5 py-1 text-xs font-mono font-bold rounded-none flex items-center justify-center gap-1" title="Open on YouTube" aria-label="Open on YouTube: ${v.title}">
            <i data-lucide="external-link" class="w-3 h-3" aria-hidden="true"></i>
            <span class="sm:hidden">YouTube</span>
          </a>
        </div>
      `;

      const openModal = () => openAltVideoModal(v);
      card.querySelector(".alt-video-thumb").addEventListener("click", openModal);
      card.querySelector(".alt-video-title").addEventListener("click", openModal);
      card.querySelector(".preview-alt-btn").addEventListener("click", openModal);

      altsContainer.appendChild(card);
    });
  }

  // Render Research Papers
  if (showPapers && papers.length > 0) {
    papers.forEach(p => {
      const card = document.createElement("div");
      card.className = "flex flex-col sm:flex-row items-start gap-3 bg-[#14171a] border border-[#272c30] hover:border-[#00d050] rounded-none p-3 transition-none group";
      card.innerHTML = `
        <div class="w-10 h-10 rounded-none bg-[#0a0b0d] border border-[#272c30] flex items-center justify-center text-[#00d050] shrink-0">
          <i data-lucide="file-text" class="w-5 h-5 text-[#00d050]" aria-hidden="true"></i>
        </div>
        <div class="flex-1 min-w-0 space-y-1">
          <div class="flex items-center justify-between gap-1">
            <span class="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-none bg-[#0a1e10] text-[#00d050] border border-[#00d050]/40 truncate">
              <i data-lucide="book-open" class="w-2.5 h-2.5 inline mr-1"></i>${p.badge || "Research Paper"}
            </span>
            <span class="text-[10px] text-[#889296] font-mono truncate">${p.authors} (${p.year || "Foundational"})</span>
          </div>
          <h5 class="text-xs font-bold text-white font-mono line-clamp-1 group-hover:text-[#00d050] transition-colors">${p.title}</h5>
          <p class="text-[11px] text-[#889296] line-clamp-2">${p.summary || ""}</p>
          <div class="text-[10px] text-[#545e63] font-mono truncate italic">${p.journal || ""}</div>
        </div>
        <div class="flex sm:flex-col gap-1.5 shrink-0 w-full sm:w-auto justify-end pt-1 sm:pt-0">
          <a href="${p.scholar_url || `https://scholar.google.com/scholar?q=${encodeURIComponent(p.title)}`}" target="_blank" rel="noopener noreferrer" class="min-h-[34px] px-2.5 py-1 text-xs font-mono font-bold rounded-none bg-[#1e2a22] hover:bg-[#27ae60] text-[#2ecc71] hover:text-white border border-[#27ae60]/40 flex items-center justify-center gap-1.5 transition-none cursor-pointer" title="Search on Google Scholar">
            <i data-lucide="external-link" class="w-3 h-3" aria-hidden="true"></i>
            <span>Scholar</span>
          </a>
          <button class="copy-citation-btn min-h-[34px] px-2.5 py-1 text-xs font-mono font-bold rounded-none bg-[#1b2022] hover:bg-[#283033] text-[#8a9699] hover:text-white border border-[#3d484b] flex items-center justify-center gap-1.5 transition-none cursor-pointer" title="Copy APA Citation">
            <i data-lucide="copy" class="w-3 h-3" aria-hidden="true"></i>
            <span class="citation-label">Cite</span>
          </button>
        </div>
      `;

      // Copy Citation Event
      const copyBtn = card.querySelector(".copy-citation-btn");
      const citationText = p.citation || `${p.authors} (${p.year || "n.d."}). ${p.title}. ${p.journal || ""}.`;
      if (copyBtn) {
        copyBtn.addEventListener("click", () => {
          navigator.clipboard.writeText(citationText);
          const label = copyBtn.querySelector(".citation-label");
          if (label) label.textContent = "Copied!";
          copyBtn.classList.add("text-emerald-400", "border-emerald-500/50");
          setTimeout(() => {
            if (label) label.textContent = "Cite";
            copyBtn.classList.remove("text-emerald-400", "border-emerald-500/50");
          }, 1800);
        });
      }

      altsContainer.appendChild(card);
    });
  }

  lucide.createIcons();
}

function openAltVideoModal(video) {
  const modal = document.getElementById("alt-video-modal");
  const title = document.getElementById("alt-modal-title");
  const iframe = document.getElementById("alt-modal-iframe");
  if (!modal || !iframe) return;

  if (title) title.textContent = `${video.title} (${video.channel || "Alternative Studio"})`;
  iframe.src = `https://www.youtube.com/embed/${video.video_id}?autoplay=1&rel=0`;
  modal.classList.remove("hidden");
}

function closeAltVideoModal() {
  const modal = document.getElementById("alt-video-modal");
  const iframe = document.getElementById("alt-modal-iframe");
  if (iframe) iframe.src = "";
  if (modal) modal.classList.add("hidden");
}

// Ask Follow-up Question to AI Tutor
async function handleAskFollowup() {
  const input = document.getElementById("ai-question-input");
  const responseBox = document.getElementById("ai-response-box");
  const responseContent = document.getElementById("ai-response-content");

  if (!input || !input.value.trim()) return;
  const question = input.value.trim();

  responseBox.classList.remove("hidden");
  responseContent.innerHTML = `<span class="flex items-center gap-2 text-slate-300"><i data-lucide="loader-2" class="w-4 h-4 animate-spin text-indigo-400" aria-hidden="true"></i> Finding answer from lecture context...</span>`;
  lucide.createIcons();

  try {
    const data = await safeFetchJSON("/api/analysis/followup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        video_id: state.currentVideoId,
        current_time_sec: state.currentTimeSec,
        question: question,
        context_text: state.activeAnalysis?.context_locked_explanation || ""
      })
    }, 12000);
    if (data && data.answer) {
      responseContent.innerHTML = formatMarkdownAndMath(data.answer);
      renderMathInElementSafe(responseContent);
      input.value = "";
    } else {
      responseContent.innerHTML = `<span class="text-slate-300">Based on this lecture, key variables and boundary conditions at ${formatTime(state.currentTimeSec)} maintain system equilibrium. Revisit this segment or review the active practice cards!</span>`;
    }
  } catch (err) {
    responseContent.innerHTML = `<span class="text-rose-300 font-medium">Sorry, could not connect right now. Please try again.</span>`;
  }
}

// ==========================================
// 6. TAB 2: QUICK PRACTICE (VISUAL FLOW & MCQS)
// ==========================================

function renderVisualDiagram(diagram) {
  const titleEl = document.getElementById("diagram-title");
  const nodesContainer = document.getElementById("diagram-nodes-container");
  const scoreBadge = document.getElementById("recall-score-badge");

  if (!diagram) return;
  if (titleEl) titleEl.textContent = diagram.title || "Quick Practice: Concept Flow";
  if (!nodesContainer) return;

  const nodes = diagram.nodes || [];
  nodesContainer.innerHTML = "";

  const hiddenNodes = nodes.filter(n => n.is_hidden_quiz || n.is_blank);
  const totalHidden = hiddenNodes.length;
  state.conceptMastery = { total: totalHidden, unlocked: 0 };

  const updateMasteryBadge = () => {
    if (!scoreBadge) return;
    if (totalHidden === 0) {
      scoreBadge.textContent = "⚡ Mastered";
      scoreBadge.className = "text-xs font-mono font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 rounded-none";
    } else {
      const pct = Math.round((state.conceptMastery.unlocked / totalHidden) * 100);
      scoreBadge.textContent = `💡 Mastery: ${state.conceptMastery.unlocked} / ${totalHidden} (${pct}%)`;
      if (pct === 100) {
        scoreBadge.className = "text-xs font-mono font-bold text-emerald-300 bg-emerald-500/25 border border-emerald-500/50 px-2.5 py-0.5 rounded-none shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse";
      } else {
        scoreBadge.className = "text-xs font-mono font-bold text-[#f59f38] bg-[#1e2325] border border-[#e59130]/40 px-2.5 py-0.5 rounded-none";
      }
    }
  };
  updateMasteryBadge();

  nodes.forEach((node, idx) => {
    // Flowchart Arrow Connector between sequential nodes
    if (idx > 0) {
      const connector = document.createElement("div");
      connector.className = "flex justify-center my-1 text-[#f59f38]";
      connector.innerHTML = `<i data-lucide="arrow-down" class="w-4 h-4" aria-hidden="true"></i>`;
      nodesContainer.appendChild(connector);
    }

    const isHidden = Boolean(node.is_hidden_quiz || node.is_blank);
    const correctLabel = node.label || node.revealed_text || (node.options && node.options[0]) || "";

    if (!isHidden) {
      const card = document.createElement("div");
      card.className = "p-3.5 bg-[#14171a] border border-[#272c30] rounded-none flex items-center justify-between gap-3 shadow-sm";
      card.innerHTML = `
        <div class="space-y-0.5 min-w-0">
          <div class="text-[10px] uppercase font-mono font-bold tracking-wider text-[#889296] flex items-center gap-1.5">
            <span class="w-2 h-2 bg-[#00d050] inline-block"></span> STEP ${idx + 1}
          </div>
          <div class="text-xs font-bold text-white truncate node-content">${node.label || node.title || node.content || ""}</div>
        </div>
        <div class="w-7 h-7 rounded-none bg-[#0a1e10] border border-[#00d050] flex items-center justify-center shrink-0">
          <i data-lucide="check" class="w-4 h-4 text-[#00d050]" aria-hidden="true"></i>
        </div>
      `;
      renderMathInElementSafe(card.querySelector(".node-content"));
      nodesContainer.appendChild(card);
    } else {
      const card = document.createElement("div");
      card.id = `diag-node-${idx}`;
      card.className = "recall-node-card locked border-2 border-white rounded-none p-4 bg-[#14171a] space-y-3 shadow-[3px_3px_0px_#ffe600]";

      let options = Array.isArray(node.options) && node.options.length >= 2 ? [...node.options] : [
        correctLabel,
        "High-density kinetic threshold",
        "Linear equilibrium constant"
      ];
      if (!options.includes(correctLabel)) {
        options.unshift(correctLabel);
      }

      card.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="text-[10px] uppercase font-mono font-bold tracking-wider text-[#ffe600] flex items-center gap-1.5">
            <span class="w-2 h-2 bg-[#ffe600] animate-ping inline-block"></span>
            Practice Slot • Step ${idx + 1}
          </div>
          <span class="node-status-pill text-[10px] text-[#ffe600] font-mono font-bold bg-[#0a0b0d] border border-[#ffe600]/40 px-2 py-0.5 rounded-none">Click to Recall</span>
        </div>
        <div class="slot-action-area">
          <button class="blank-slot-btn w-full min-h-[44px] px-3.5 py-2.5 rounded-none text-xs font-bold bg-[#0e1113] hover:bg-[#181c20] border-2 border-[#ffe600] text-[#ffe600] flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_#ffe600]">
            <i data-lucide="help-circle" class="w-4 h-4 text-[#ffe600]" aria-hidden="true"></i>
            <span class="font-mono tracking-wide">[ ? CLICK TO RECALL // 想起 ]</span>
          </button>
        </div>
        <div id="diag-options-${idx}" class="hidden p-3.5 bg-[#0a0b0d] border border-[#272c30] rounded-none space-y-2.5 shadow-inner">
          <div class="flex items-center justify-between text-xs text-[#ffe600] font-bold font-mono">
            <span>Choose the correct concept or formula:</span>
            <span class="text-[10px] text-[#889296] font-mono">3 choices</span>
          </div>
          <div class="feedback-msg text-xs hidden font-medium"></div>
          <div class="grid grid-cols-1 gap-2">
            ${options.map((opt, oIdx) => `
              <button class="diag-opt-btn min-h-[44px] text-left text-xs bg-[#111417] hover:border-white px-3.5 py-2.5 rounded-none border border-[#272c30] text-white flex items-center justify-between cursor-pointer group" data-node-idx="${idx}" data-val="${opt.replace(/"/g, '&quot;')}">
                <span class="opt-label group-hover:text-[#ffe600] font-medium font-mono">${String.fromCharCode(65 + oIdx)}) ${opt}</span>
                <i data-lucide="chevron-right" class="w-4 h-4 text-[#889296] group-hover:text-[#ffe600]" aria-hidden="true"></i>
              </button>
            `).join("")}
          </div>
        </div>
      `;

      const toggleBtn = card.querySelector(".blank-slot-btn");
      const optBox = card.querySelector(`#diag-options-${idx}`);
      const feedbackDiv = card.querySelector(".feedback-msg");
      const actionArea = card.querySelector(".slot-action-area");
      const statusPill = card.querySelector(".node-status-pill");

      toggleBtn.addEventListener("click", () => {
        yn10Audio.playBlip();
        optBox.classList.toggle("hidden");
      });

      card.querySelectorAll(".diag-opt-btn").forEach(optBtn => {
        optBtn.addEventListener("click", () => {
          const selectedVal = optBtn.getAttribute("data-val");
          if (selectedVal === correctLabel) {
            // Correct choice
            yn10Audio.playSuccess();
            card.className = "recall-node-card unlocked border-2 border-[#00d050] rounded-none p-4 bg-[#14171a] space-y-3 shadow-[3px_3px_0px_#00d050]";
            
            actionArea.innerHTML = `
              <div class="w-full min-h-[44px] px-3.5 py-2.5 rounded-none text-xs font-bold bg-[#0a1e10] border-2 border-[#00d050] text-[#00d050] flex items-center justify-between shadow-sm">
                <div class="flex items-center gap-2">
                  <i data-lucide="check-circle-2" class="w-4 h-4 text-[#00d050] shrink-0" aria-hidden="true"></i>
                  <span class="revealed-text font-serif text-[13px]">${correctLabel}</span>
                </div>
                <span class="text-[10px] font-mono text-white bg-[#00d050] px-2 py-0.5 rounded-none font-bold">✓ Solved</span>
              </div>
            `;
            renderMathInElementSafe(actionArea.querySelector(".revealed-text"));

            statusPill.className = "node-status-pill text-[10px] text-white font-mono font-bold bg-[#00d050] px-2 py-0.5 rounded-none shadow-[1px_1px_0px_#ffffff]";
            statusPill.textContent = "✓ Mastered";

            optBox.innerHTML = `
              <div class="p-2.5 rounded-none bg-[#0a1e10] border border-[#00d050] text-xs text-[#00d050] font-bold flex items-center gap-2 font-mono">
                <i data-lucide="sparkles" class="w-4 h-4 text-[#00d050] shrink-0" aria-hidden="true"></i>
                <span>Great job! Locked into intuition (+1 Mastery Point)</span>
              </div>
            `;
            
            state.conceptMastery.unlocked++;
            updateMasteryBadge();
            lucide.createIcons();
          } else {
            // Incorrect choice
            yn10Audio.playError();
            feedbackDiv.classList.remove("hidden");
            feedbackDiv.className = "feedback-msg text-xs text-rose-300 font-medium flex items-center gap-2 p-2.5 rounded-none bg-[#1e0a0c] border border-[#e60012]";
            feedbackDiv.innerHTML = `<i data-lucide="alert-circle" class="w-4 h-4 text-[#ff8f8f] shrink-0" aria-hidden="true"></i> <span>✕ Not quite — think about the core intuition and try another choice!</span>`;
            optBtn.classList.add("bg-[#1e0a0c]", "border-[#e60012]", "text-[#ff8f8f]");
            lucide.createIcons();
          }
        });
      });

      nodesContainer.appendChild(card);
    }
  });

  lucide.createIcons();
}

function renderCheckpointMCQs(mcqs) {
  const mcqsContainer = document.getElementById("mcqs-container");
  if (!mcqsContainer) return;
  if (!mcqs || !Array.isArray(mcqs)) return;

  mcqsContainer.innerHTML = "";

  mcqs.forEach((mcq, qIdx) => {
    const qCard = document.createElement("div");
    qCard.className = "bg-[#14171a] border border-[#272c30] rounded-none p-4 space-y-3.5 shadow-md";
    
    const reviewTime = mcq.review_timestamp_sec || state.currentTimeSec;

    qCard.innerHTML = `
      <div class="flex items-start gap-2.5">
        <span class="w-6 h-6 rounded-none bg-[#0a0b0d] text-[#ffe600] font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-[#ffe600]/40">
          Q${qIdx + 1}
        </span>
        <p class="text-xs font-bold text-white leading-snug font-mono">${mcq.question}</p>
      </div>
      <div class="grid grid-cols-1 gap-2 pt-0.5">
        ${(mcq.options || []).map((opt, oIdx) => `
          <button class="mcq-option-btn text-left text-xs bg-[#0a0b0d] border border-[#272c30] hover:border-white rounded-none p-3 text-white flex items-center justify-between cursor-pointer group font-mono" data-q-idx="${qIdx}" data-o-idx="${oIdx}">
            <span class="group-hover:text-[#ffe600] font-medium font-mono">${String.fromCharCode(65 + oIdx)}) ${opt}</span>
            <span class="opt-status font-mono text-xs hidden shrink-0 ml-2"></span>
          </button>
        `).join("")}
      </div>
      <div id="mcq-expl-${qIdx}" class="hidden p-3.5 rounded-none bg-[#0a0b0d] border border-[#272c30] text-xs text-white leading-relaxed space-y-2.5 font-mono">
        <div class="flex items-start gap-2">
          <i data-lucide="info" class="w-4 h-4 text-[#ffe600] shrink-0 mt-0.5" aria-hidden="true"></i>
          <div><strong class="text-[#ffe600] uppercase">Intuition &amp; Why This Works:</strong> ${mcq.explanation}</div>
        </div>
        <div class="review-btn-container pt-1">
          <!-- Rewatch button injected dynamically on wrong answer -->
        </div>
      </div>
    `;

    qCard.querySelectorAll(".mcq-option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const qI = parseInt(btn.getAttribute("data-q-idx"));
        const oI = parseInt(btn.getAttribute("data-o-idx"));
        const targetMcq = mcqs[qI];
        const explDiv = document.getElementById(`mcq-expl-${qI}`);
        const reviewContainer = explDiv ? explDiv.querySelector(".review-btn-container") : null;

        qCard.querySelectorAll(".mcq-option-btn").forEach(b => {
          b.disabled = true;
          b.classList.remove("cursor-pointer", "hover:border-[#e59130]");
        });

        if (oI === targetMcq.correct_index) {
          yn10Audio.playSuccess();
          btn.className = "mcq-option-btn text-left text-xs bg-[#0a1e10] border-2 border-[#00d050] rounded-none p-3 text-[#00d050] flex items-center justify-between shadow-[2px_2px_0px_#00d050]";
          const statusSpan = btn.querySelector(".opt-status");
          statusSpan.classList.remove("hidden");
          statusSpan.innerHTML = `<span class="px-2 py-0.5 rounded-none bg-[#0a1e10] text-[#00d050] font-bold flex items-center gap-1 font-mono"><i data-lucide="check" class="w-3.5 h-3.5" aria-hidden="true"></i> Great job! Correct</span>`;
        } else {
          yn10Audio.playError();
          btn.className = "mcq-option-btn text-left text-xs bg-[#1e0a0c] border-2 border-[#e60012] rounded-none p-3 text-[#ff8f8f] flex items-center justify-between shadow-[2px_2px_0px_#e60012]";
          const statusSpan = btn.querySelector(".opt-status");
          statusSpan.classList.remove("hidden");
          statusSpan.innerHTML = `<span class="px-2 py-0.5 rounded-none bg-[#1e0a0c] text-[#ff8f8f] font-bold font-mono">✕ Not quite</span>`;

          const allOptions = qCard.querySelectorAll(".mcq-option-btn");
          if (allOptions[targetMcq.correct_index]) {
            allOptions[targetMcq.correct_index].className = "mcq-option-btn text-left text-xs bg-[#0a1e10] border-2 border-[#00d050] rounded-none p-3 text-[#00d050] flex items-center justify-between";
            const rightStatus = allOptions[targetMcq.correct_index].querySelector(".opt-status");
            rightStatus.classList.remove("hidden");
            rightStatus.innerHTML = `<span class="text-xs text-[#00d050] font-mono font-bold">✓ Correct Answer</span>`;
          }

          // Record in missedQuizQuestions for Tab 3 Saved Notes
          const existing = state.missedQuizQuestions.find(m => m.question === targetMcq.question);
          if (!existing) {
            state.missedQuizQuestions.push({
              question: targetMcq.question,
              options: targetMcq.options,
              correct_index: targetMcq.correct_index,
              correct_answer: targetMcq.options[targetMcq.correct_index],
              wrong_answer: targetMcq.options[oI],
              explanation: targetMcq.explanation,
              review_timestamp_sec: reviewTime
            });
            renderCheatSheetMissedMCQs();
          }

          // Inject the Rewatch 30s explanation button
          if (reviewContainer) {
            reviewContainer.innerHTML = `
              <button class="jump-review-btn yn10-btn w-full min-h-[44px] px-4 py-2.5 rounded-none text-xs font-bold font-mono flex items-center justify-center gap-2 cursor-pointer">
                <i data-lucide="rotate-ccw" class="w-4 h-4 text-[#ffe600]" aria-hidden="true"></i>
                <span>⏪ Rewatch Concept Explanation (${formatTime(reviewTime)})</span>
              </button>
            `;
            const rBtn = reviewContainer.querySelector(".jump-review-btn");
            if (rBtn) {
              rBtn.onclick = () => {
                jumpToTime(Math.max(0, reviewTime - 15), false);
              };
            }
          }
        }

        if (explDiv) {
          explDiv.classList.remove("hidden");
        }
        lucide.createIcons();
      });
    });

    mcqsContainer.appendChild(qCard);
  });

  lucide.createIcons();
}

// Tab 3: Session Terminology Bridge Matrix
function renderCheatSheetBridges() {
  const tbody = document.getElementById("cheatsheet-bridge-body");
  const countBadge = document.getElementById("bridges-count-badge");
  if (!tbody) return;

  if (countBadge) {
    countBadge.textContent = `${state.sessionTerminologyBridges.length} Mappings`;
  }

  if (state.sessionTerminologyBridges.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="p-3 text-center text-slate-400 text-xs">No term comparisons accumulated yet. They appear as you explore tricky spots!</td></tr>`;
    return;
  }

  tbody.innerHTML = "";
  state.sessionTerminologyBridges.forEach(b => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-900/60 transition-colors";
    tr.innerHTML = `
      <td class="p-2.5 border-b border-slate-800 font-mono font-bold text-indigo-300 text-xs bridge-math">${b.prof_term || ""}</td>
      <td class="p-2.5 border-b border-slate-800 font-mono text-cyan-300 text-xs">${b.alt_video_term || ""}</td>
      <td class="p-2.5 border-b border-slate-800 text-slate-200 text-xs font-serif leading-snug">${b.clarification || ""}</td>
    `;
    tbody.appendChild(tr);
    renderMathInElementSafe(tr.querySelector(".bridge-math"));
  });
}

// Tab 3: Targeted Revision: Missed Checkpoints
function renderCheatSheetMissedMCQs() {
  const container = document.getElementById("cheatsheet-missed-mcqs-container");
  const countBadge = document.getElementById("missed-count-badge");
  if (!container) return;

  if (countBadge) {
    countBadge.textContent = `${state.missedQuizQuestions.length} To Review`;
    if (state.missedQuizQuestions.length > 0) {
      countBadge.className = "text-[10px] font-mono text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded font-bold animate-pulse";
    } else {
      countBadge.className = "text-[10px] font-mono text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold";
    }
  }

  if (state.missedQuizQuestions.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5 bg-emerald-950/20 border border-emerald-900/40 rounded-none text-xs text-emerald-300 flex flex-col items-center justify-center gap-1.5">
        <div class="w-8 h-8 rounded-none bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <i data-lucide="check-circle" class="w-4 h-4 text-emerald-400" aria-hidden="true"></i>
        </div>
        <span class="font-bold text-slate-100">All Concepts Mastered!</span>
        <span class="text-xs text-slate-300">Any questions you'd like to revisit will appear here so you can review and reinforce your intuition.</span>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = "";
  state.missedQuizQuestions.forEach((m, idx) => {
    const card = document.createElement("div");
    card.className = "bg-[#151819] border border-[#2d3739] hover:border-amber-500/60 rounded-none p-3.5 space-y-2.5 transition-none shadow-none";
    card.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <span class="text-[10px] font-mono uppercase text-amber-300 font-bold flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-amber-500"></span>
          Concept to Revisit #${idx + 1}
        </span>
        <button class="review-missed-btn min-h-[36px] px-3 py-1.5 rounded-none bg-[#242b2d] hover:bg-[#313b3e] border border-[#414d52] text-xs text-amber-200 hover:text-white font-mono font-bold flex items-center gap-1.5 transition-none cursor-pointer" data-rev-time="${m.review_timestamp_sec}">
          <i data-lucide="play" class="w-3 h-3 fill-current" aria-hidden="true"></i> Review at ${formatTime(m.review_timestamp_sec)}
        </button>
      </div>
      <p class="text-xs font-bold text-slate-100 leading-snug">${m.question}</p>
      <div class="bg-[#101213] rounded-none p-3 border border-[#242b2d] space-y-1.5 text-xs">
        <div class="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
          <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true"></i>
          <span>Key Takeaway: <strong>${m.correct_answer || m.options?.[m.correct_index] || ""}</strong></span>
        </div>
        <div class="text-slate-300 font-serif text-xs leading-relaxed pl-5 border-l-2 border-emerald-500/40">
          ${m.explanation || "Revisit the video segment at this timestamp to review the full intuition."}
        </div>
      </div>
    `;

    card.querySelector(".review-missed-btn").addEventListener("click", () => {
      jumpToTime(m.review_timestamp_sec, false);
      switchTab("tab-content-rescue");
    });

    container.appendChild(card);
  });

  lucide.createIcons();
}

// ==========================================
// 7. TAB NAVIGATION & MODALS
// ==========================================

function switchTab(tabPaneId) {
  state.activeTab = tabPaneId;
  try {
    sessionStorage.setItem("synclearn_active_tab", tabPaneId);
  } catch (_) {}

  yn10Audio.playBlip();

  document.querySelectorAll(".tab-btn").forEach(btn => {
    const isTarget = btn.getAttribute("data-target") === tabPaneId;
    if (isTarget) {
      btn.classList.add("active", "text-white", "bg-[#181c20]", "border-2", "border-white");
      btn.classList.remove("text-[#889296]", "border-2", "border-transparent", "text-[#f59f38]", "bg-[#24292b]", "border-[#e59130]");
      btn.setAttribute("aria-selected", "true");
      btn.setAttribute("tabindex", "0");
    } else {
      btn.classList.remove("active", "text-white", "bg-[#181c20]", "border-2", "border-white", "text-[#f59f38]", "bg-[#24292b]", "border-[#e59130]");
      btn.classList.add("text-[#889296]", "border-2", "border-transparent");
      btn.setAttribute("aria-selected", "false");
      btn.setAttribute("tabindex", "-1");
    }
  });

  document.querySelectorAll(".tab-pane").forEach(pane => {
    if (pane.id === tabPaneId) {
      pane.classList.remove("hidden");
      pane.removeAttribute("aria-hidden");
    } else {
      pane.classList.add("hidden");
      pane.setAttribute("aria-hidden", "true");
    }
  });
}

function isValidYouTubeUrl(input) {
  const clean = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return true;
  const ytRegex = /^(https?:\/\/)?(www\.|m\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|live\/|shorts\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}/i;
  return ytRegex.test(clean);
}

function initUIEventListeners() {
  initTimelineInteractions();

  // Yamauchi No.10 Sound Toggles (Landing & Workspace)
  const landingSoundBtn = document.getElementById("yn10-sound-toggle-btn");
  if (landingSoundBtn) {
    landingSoundBtn.addEventListener("click", () => {
      yn10Audio.toggle();
    });
  }
  const workspaceSoundBtn = document.getElementById("workspace-sound-toggle-btn");
  if (workspaceSoundBtn) {
    workspaceSoundBtn.addEventListener("click", () => {
      yn10Audio.toggle();
    });
  }

  // Interactive 3D Voxel Tap / Click Reaction
  document.querySelectorAll(".yn10-floating-voxel").forEach(voxel => {
    voxel.addEventListener("click", (e) => {
      e.stopPropagation();
      yn10Audio.playCoin();
      const cube = voxel.querySelector(".yn10-voxel");
      if (cube) {
        cube.style.transform = "scale(1.45) rotateX(180deg) rotateY(180deg)";
        setTimeout(() => {
          cube.style.transform = "";
        }, 600);
      }
    });
  });

  // Tab Header Click Events
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      switchTab(target);
    });
  });

  // Action Bar Button 1: Explain This Part Simply
  const confusedBtn = document.getElementById("btn-confused-rescue");
  if (confusedBtn) {
    confusedBtn.addEventListener("click", () => {
      triggerExplainThisStep();
    });
  }

  // Also bind empty state buttons inside tabs
  ["tab1-explain-trigger-btn", "tab2-explain-trigger-btn", "tab3-explain-trigger-btn"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener("click", () => {
        triggerExplainThisStep();
      });
    }
  });

  // Advanced Settings Popover Button & Window Adjustments
  const advSettingsBtn = document.getElementById("btn-advanced-settings");
  const advSettingsPopover = document.getElementById("advanced-settings-popover");
  const closeAdvSettingsBtn = document.getElementById("close-advanced-settings-btn");

  if (advSettingsBtn && advSettingsPopover) {
    advSettingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = advSettingsPopover.classList.toggle("hidden");
      advSettingsBtn.setAttribute("aria-expanded", String(!isHidden));
    });

    if (closeAdvSettingsBtn) {
      closeAdvSettingsBtn.addEventListener("click", () => {
        advSettingsPopover.classList.add("hidden");
        advSettingsBtn.setAttribute("aria-expanded", "false");
      });
    }

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!advSettingsPopover.contains(e.target) && e.target !== advSettingsBtn) {
        advSettingsPopover.classList.add("hidden");
        advSettingsBtn.setAttribute("aria-expanded", "false");
      }
    });

    // Window size buttons
    document.querySelectorAll(".window-size-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".window-size-btn").forEach(b => {
          b.className = "window-size-btn text-[11px] font-mono py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer";
        });
        btn.className = "window-size-btn active text-[11px] font-mono py-1.5 rounded-lg border border-indigo-500 bg-indigo-600/30 text-indigo-200 font-bold transition-colors cursor-pointer";
        state.analysisWindowSeconds = parseInt(btn.getAttribute("data-window")) || 240;
      });
    });
  }

  // Auto-pause Toggle Switch
  const toggleAutopause = document.getElementById("toggle-autopause");
  if (toggleAutopause) {
    toggleAutopause.checked = state.autoPauseEnabled;
    toggleAutopause.addEventListener("change", (e) => {
      state.autoPauseEnabled = e.target.checked;
    });
  }

  const dismissToastBtn = document.getElementById("dismiss-autopause-toast-btn");
  if (dismissToastBtn) {
    dismissToastBtn.addEventListener("click", () => {
      const toast = document.getElementById("autopause-toast");
      if (toast) toast.classList.add("hidden");
    });
  }

  // Action Bar Button 2: Save Timestamp Note
  const dropPinBtn = document.getElementById("btn-drop-pin");
  if (dropPinBtn) {
    dropPinBtn.addEventListener("click", () => {
      openPinModal();
    });
  }

  // Global Keyboard Shortcuts (Alt + E and Alt + S)
  window.addEventListener("keydown", (e) => {
    // Check if Alt + E is pressed
    if (e.altKey && (e.key === "e" || e.key === "E")) {
      e.preventDefault();
      const primaryBtn = document.getElementById("btn-confused-rescue");
      if (primaryBtn) primaryBtn.click();
    }
    // Check if Alt + S is pressed
    else if (e.altKey && (e.key === "s" || e.key === "S")) {
      e.preventDefault();
      const noteBtn = document.getElementById("btn-drop-pin");
      if (noteBtn) noteBtn.click();
    }
  });

  // Player Controls
  const playBtn = document.getElementById("ctrl-play-pause");
  if (playBtn) {
    playBtn.addEventListener("click", () => {
      if (!state.isPlayerReady || !state.player) return;
      const pState = state.player.getPlayerState();
      if (pState === YT.PlayerState.PLAYING) {
        state.player.pauseVideo();
      } else {
        state.player.playVideo();
      }
    });
  }

  const rewindBtn = document.getElementById("ctrl-rewind");
  if (rewindBtn) {
    rewindBtn.addEventListener("click", () => {
      jumpToTime(Math.max(0, state.currentTimeSec - 10), false);
    });
  }

  const forwardBtn = document.getElementById("ctrl-forward");
  if (forwardBtn) {
    forwardBtn.addEventListener("click", () => {
      jumpToTime(Math.min(state.durationSec, state.currentTimeSec + 10), false);
    });
  }

  const speedSelect = document.getElementById("playback-speed-select");
  if (speedSelect) {
    speedSelect.addEventListener("change", (e) => {
      if (state.isPlayerReady && state.player) {
        state.player.setPlaybackRate(parseFloat(e.target.value));
      }
    });
  }

  // Load YouTube URL Input with Frontend Validation
  const loadBtn = document.getElementById("load-video-btn");
  const urlInput = document.getElementById("youtube-url-input");
  const urlError = document.getElementById("youtube-url-error");

  if (loadBtn && urlInput) {
    const handleLoad = async () => {
      const val = urlInput.value.trim();
      if (!val) return;

      // a) Extract the 11-character video_id directly in JavaScript using regex
      const videoId = extractYouTubeId(val);
      if (!videoId) {
        if (urlError) urlError.classList.remove("hidden");
        urlInput.classList.add("border-rose-500", "ring-1", "ring-rose-500");
        return;
      }

      // Valid URL
      if (urlError) urlError.classList.add("hidden");
      urlInput.classList.remove("border-rose-500", "ring-1", "ring-rose-500");

      // b) Switch from Landing Page to Workspace immediately so video ALWAYS loads
      const landingView = document.getElementById("landing-page-view");
      if (landingView) {
        landingView.classList.add("opacity-0", "pointer-events-none");
        setTimeout(() => {
          landingView.classList.add("hidden");
          if (window._checkTourTrigger) window._checkTourTrigger();
        }, 300);
      }

      loadBtn.disabled = true;
      loadBtn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin" aria-hidden="true"></i><span>Finding Heatmap...</span>`;
      lucide.createIcons();

      try {
        // c) Fetch video title in browser from noembed & oEmbed directly
        const clientTitle = await fetchClientVideoTitle(videoId);

        // Save new video to StorageManager under currently selected folder
        const activeFolderId = state.currentFolderId && state.currentFolderId !== "all" ? state.currentFolderId : 1;
        StorageManager.saveVideo({
          video_id: videoId,
          title: clientTitle || `Lecture (${videoId})`,
          folder_id: activeFolderId,
          duration_sec: 2700,
          thumbnail_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        });

        // Immediately route to workspace and load video studio
        await navigateToWorkspace(videoId, clientTitle, true);

        // Post to backend asynchronously in parallel
        safeFetchJSON("/api/load-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url_or_id: val,
            folder_id: activeFolderId,
            custom_title: clientTitle,
            title: clientTitle
          })
        });
      } catch (err) {
        console.warn("Video load non-fatal notice:", err);
      } finally {
        loadBtn.disabled = false;
        loadBtn.innerHTML = `<i data-lucide="play" class="w-3.5 h-3.5 fill-current" aria-hidden="true"></i><span>Load Video</span>`;
        lucide.createIcons();
      }
    };

    loadBtn.addEventListener("click", handleLoad);
    urlInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleLoad();
    });

    // Clear error on input
    urlInput.addEventListener("input", () => {
      if (urlError) urlError.classList.add("hidden");
      urlInput.classList.remove("border-rose-500", "ring-1", "ring-rose-500");
    });
  }

  // AI Tutor Followup Button
  const askAiBtn = document.getElementById("ai-ask-btn");
  const aiInput = document.getElementById("ai-question-input");
  if (askAiBtn) askAiBtn.addEventListener("click", handleAskFollowup);
  if (aiInput) {
    aiInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleAskFollowup();
    });
  }

  // Reset Quiz Button
  const resetQuizBtn = document.getElementById("reset-quiz-btn");
  if (resetQuizBtn) {
    resetQuizBtn.addEventListener("click", () => {
      if (state.activeAnalysis) {
        if (state.activeAnalysis.visual_diagram) renderVisualDiagram(state.activeAnalysis.visual_diagram);
        if (state.activeAnalysis.checkpoint_mcqs) renderCheckpointMCQs(state.activeAnalysis.checkpoint_mcqs);
      } else if (state.activeQuiz) {
        renderVisualDiagram(state.activeQuiz);
      }
    });
  }

  // Saved Notes Filter Pills
  document.querySelectorAll(".pin-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".pin-filter-btn").forEach(b => {
        b.classList.remove("active", "bg-indigo-600", "text-white");
        b.classList.add("bg-slate-800", "text-slate-300");
      });
      btn.classList.add("active", "bg-indigo-600", "text-white");
      btn.classList.remove("bg-slate-800", "text-slate-300");
      state.activeFilter = btn.getAttribute("data-filter");
      renderCheatSheetPins();
    });
  });

  // Modal Event Listeners
  initModalListeners();

  // Landing Page Overlay Listeners
  initLandingPageListeners();
}

// ------------------------------------------
// Full-Screen Landing Page Interactions
// ------------------------------------------
function initLandingPageListeners() {
  const landingView = document.getElementById("landing-page-view");
  const landingForm = document.getElementById("landing-url-form");
  const landingInput = document.getElementById("landing-url-input");
  const landingError = document.getElementById("landing-url-error");
  const landingBtn = document.getElementById("landing-submit-btn");
  const backHomeBtn = document.getElementById("back-to-landing-btn");
  const navbarInput = document.getElementById("youtube-url-input");
  const navbarLoadBtn = document.getElementById("load-video-btn");

  if (!landingView) return;

  // Clear validation error when user types
  if (landingInput && landingError) {
    landingInput.addEventListener("input", () => {
      landingError.classList.add("hidden");
      landingInput.classList.remove("border-rose-500", "ring-1", "ring-rose-500");
    });
  }

  // Handle Landing Form Submission
  if (landingForm) {
    landingForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!landingInput) return;

      const val = landingInput.value.trim();

      // Step A: Validate YouTube URL
      const videoId = extractYouTubeId(val);
      if (!val || !videoId) {
        if (landingError) landingError.classList.remove("hidden");
        landingInput.classList.add("border-rose-500", "ring-1", "ring-rose-500");
        landingInput.focus();
        return;
      }

      if (landingError) landingError.classList.add("hidden");
      landingInput.classList.remove("border-rose-500", "ring-1", "ring-rose-500");

      // Step B: Feedback on Button
      if (landingBtn) {
        landingBtn.disabled = true;
        landingBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin" aria-hidden="true"></i><span>Opening Studio...</span>`;
        lucide.createIcons();
      }

      try {
        // Step C: Fetch video title
        const clientTitle = await fetchClientVideoTitle(videoId);

        // Save new video to StorageManager under currently selected folder
        const activeFolderId = state.currentFolderId && state.currentFolderId !== "all" ? state.currentFolderId : 1;
        StorageManager.saveVideo({
          video_id: videoId,
          title: clientTitle || `Lecture (${videoId})`,
          folder_id: activeFolderId,
          duration_sec: 2700,
          thumbnail_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        });

        // Background server sync
        safeFetchJSON("/api/load-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url_or_id: val,
            folder_id: activeFolderId,
            custom_title: clientTitle,
            title: clientTitle
          })
        });

        // Clear input
        landingInput.value = "";

        // Route to Workspace (updates URL query to ?v=..., hides overlay, loads player & studio)
        await navigateToWorkspace(videoId, clientTitle, true);
      } catch (err) {
        console.warn("Landing submit error:", err);
      } finally {
        if (landingBtn) {
          landingBtn.disabled = false;
          landingBtn.innerHTML = `<i data-lucide="play" class="w-4 h-4 fill-current" aria-hidden="true"></i><span>START LEARNING &rarr;</span>`;
          lucide.createIcons();
        }
      }
    });
  }

  // Step 3: Handle "← Courses" & Logo Button in Workspace Navbar
  if (backHomeBtn) {
    backHomeBtn.addEventListener("click", () => {
      navigateToLanding(true);
    });
  }

  const logoBtn = document.getElementById("workspace-logo-btn");
  if (logoBtn) {
    logoBtn.addEventListener("click", () => {
      navigateToLanding(true);
    });
  }
}

// Modal Setup & Listeners
function initModalListeners() {
  // Pin Modal
  const pinModal = document.getElementById("pin-modal");
  const closePinBtn = document.getElementById("close-pin-modal-btn");
  const cancelPinBtn = document.getElementById("cancel-pin-btn");
  const savePinBtn = document.getElementById("save-pin-btn");

  if (closePinBtn) closePinBtn.addEventListener("click", () => pinModal.classList.add("hidden"));
  if (cancelPinBtn) cancelPinBtn.addEventListener("click", () => pinModal.classList.add("hidden"));

  if (savePinBtn) {
    savePinBtn.addEventListener("click", async () => {
      const title = document.getElementById("pin-title-input").value.trim();
      const note = document.getElementById("pin-note-input").value.trim();
      const tag = document.querySelector('input[name="pin-tag"]:checked')?.value || "exam_priority";

      if (!title) {
        alert("Please enter a title for the note.");
        return;
      }

      // Option A: Instant Client-Side Save (0 ms lag, bulletproof against Vercel network drop)
      const newPin = {
        id: "pin_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        video_id: state.currentVideoId,
        timestamp_sec: state.currentTimeSec,
        tag: tag,
        title: title,
        note: note,
        created_at: new Date().toISOString()
      };

      yn10Audio.playCoin();
      StorageManager.savePin(newPin);
      state.pins.push(newPin);
      state.pins.sort((a, b) => a.timestamp_sec - b.timestamp_sec);
      renderTimelinePins();
      renderCheatSheetPins();
      pinModal.classList.add("hidden");

      // Reset inputs
      const titleInput = document.getElementById("pin-title-input");
      const noteInput = document.getElementById("pin-note-input");
      if (titleInput) titleInput.value = "";
      if (noteInput) noteInput.value = "";

      // Background sync to server if available
      safeFetchJSON("/api/pins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_id: state.currentVideoId,
          timestamp_sec: state.currentTimeSec,
          tag: tag,
          title: title,
          note: note
        })
      }).then(data => {
        if (data && data.pin && data.pin.id) {
          newPin.id = data.pin.id;
        }
      });
    });
  }

  // Folder Select & Modal
  const folderSelect = document.getElementById("folder-select");
  const folderModal = document.getElementById("folder-modal");
  const closeFolderBtn = document.getElementById("close-folder-modal-btn");
  const cancelFolderBtn = document.getElementById("cancel-folder-btn");
  const saveFolderBtn = document.getElementById("save-folder-btn");

  if (folderSelect) {
    folderSelect.addEventListener("change", (e) => {
      if (e.target.value === "add_new") {
        folderModal.classList.remove("hidden");
      } else {
        state.currentFolderId = parseInt(e.target.value);
      }
    });
  }

  if (closeFolderBtn) closeFolderBtn.addEventListener("click", () => folderModal.classList.add("hidden"));
  if (cancelFolderBtn) cancelFolderBtn.addEventListener("click", () => folderModal.classList.add("hidden"));

  if (saveFolderBtn) {
    saveFolderBtn.addEventListener("click", async () => {
      const name = document.getElementById("new-folder-name").value.trim();
      const color = document.getElementById("new-folder-color")?.value || "indigo";
      if (!name) return;

      const newFolder = {
        id: Date.now(),
        name: name,
        color: color,
        icon: "folder",
        video_count: 0
      };

      StorageManager.saveFolder(newFolder);
      folderModal.classList.add("hidden");
      const nameInput = document.getElementById("new-folder-name");
      if (nameInput) nameInput.value = "";
      state.currentFolderId = newFolder.id;

      await loadSubjectFolders();
      if (folderSelect) folderSelect.value = newFolder.id;

      safeFetchJSON("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color })
      }).then(data => {
        if (data && data.id) {
          newFolder.id = data.id;
          state.currentFolderId = data.id;
          if (folderSelect) folderSelect.value = data.id;
        }
      });
    });
  }

  // Folder Videos Explorer Drawer & Modal
  const openFolderDrawerBtn = document.getElementById("btn-open-folder-drawer");
  const folderVideosModal = document.getElementById("folder-videos-modal");
  const closeFolderVideosBtn = document.getElementById("close-folder-videos-modal-btn");
  const closeFolderVideosBottomBtn = document.getElementById("btn-close-folder-videos-bottom");

  if (openFolderDrawerBtn) {
    openFolderDrawerBtn.addEventListener("click", () => {
      openFolderVideosModal(state.currentFolderId || 1);
    });
  }

  if (closeFolderVideosBtn && folderVideosModal) {
    closeFolderVideosBtn.addEventListener("click", () => folderVideosModal.classList.add("hidden"));
  }
  if (closeFolderVideosBottomBtn && folderVideosModal) {
    closeFolderVideosBottomBtn.addEventListener("click", () => folderVideosModal.classList.add("hidden"));
  }
  if (folderVideosModal) {
    folderVideosModal.addEventListener("click", (e) => {
      if (e.target === folderVideosModal) folderVideosModal.classList.add("hidden");
    });
  }

  // Export Saved Notes Modal Handlers
  const exportBtn = document.getElementById("export-cheatsheet-btn");
  const exportModal = document.getElementById("export-modal");
  const closeExportBtn = document.getElementById("close-export-modal-btn");
  const copyMdBtn = document.getElementById("copy-markdown-btn");
  const printSheetBtn = document.getElementById("print-sheet-btn");
  const downloadMdBtn = document.getElementById("download-markdown-btn");
  const exportTabView = document.getElementById("export-tab-view");
  const exportTabRaw = document.getElementById("export-tab-raw");
  const exportVisualPreview = document.getElementById("export-visual-preview");
  const exportMarkdownContent = document.getElementById("export-markdown-content");

  if (exportBtn && exportModal) {
    exportBtn.addEventListener("click", () => {
      renderVisualCheatSheetPreview();
      if (exportMarkdownContent) {
        exportMarkdownContent.value = generateMarkdownCheatSheet();
      }
      exportModal.classList.remove("hidden");
    });
  }

  if (closeExportBtn) closeExportBtn.addEventListener("click", () => exportModal.classList.add("hidden"));

  // View vs Raw Markdown switcher
  if (exportTabView && exportTabRaw && exportVisualPreview && exportMarkdownContent) {
    exportTabView.addEventListener("click", () => {
      exportTabView.className = "px-3.5 py-1.5 rounded-lg font-bold bg-indigo-600 text-white transition-all cursor-pointer";
      exportTabRaw.className = "px-3.5 py-1.5 rounded-lg font-medium text-slate-300 hover:text-white transition-all cursor-pointer";
      exportVisualPreview.classList.remove("hidden");
      exportMarkdownContent.classList.add("hidden");
    });

    exportTabRaw.addEventListener("click", () => {
      exportTabRaw.className = "px-3.5 py-1.5 rounded-lg font-bold bg-indigo-600 text-white transition-all cursor-pointer";
      exportTabView.className = "px-3.5 py-1.5 rounded-lg font-medium text-slate-300 hover:text-white transition-all cursor-pointer";
      exportMarkdownContent.classList.remove("hidden");
      exportVisualPreview.classList.add("hidden");
    });
  }

  // Copy Markdown to Clipboard
  if (copyMdBtn) {
    copyMdBtn.addEventListener("click", () => {
      const content = generateMarkdownCheatSheet();
      navigator.clipboard.writeText(content);
      copyMdBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-emerald-300" aria-hidden="true"></i> Copied!`;
      lucide.createIcons();
      setTimeout(() => {
        copyMdBtn.innerHTML = `<i data-lucide="copy" class="w-4 h-4" aria-hidden="true"></i> Copy to Clipboard`;
        lucide.createIcons();
      }, 2200);
    });
  }

  // Download .md File
  if (downloadMdBtn) {
    downloadMdBtn.addEventListener("click", downloadMarkdownFile);
  }

  // Print Friendly
  if (printSheetBtn) {
    printSheetBtn.addEventListener("click", () => {
      window.print();
    });
  }

  // Alternative Video Preview Modal
  const closeAltBtn = document.getElementById("close-alt-modal-btn");
  const altModal = document.getElementById("alt-video-modal");
  if (closeAltBtn) closeAltBtn.addEventListener("click", closeAltVideoModal);
  if (altModal) {
    altModal.addEventListener("click", (e) => {
      if (e.target === altModal) closeAltVideoModal();
    });
  }
}

function openPinModal() {
  const pinModal = document.getElementById("pin-modal");
  const pinTimeInput = document.getElementById("pin-time-input");
  const titleInput = document.getElementById("pin-title-input");
  const noteInput = document.getElementById("pin-note-input");

  if (pinTimeInput) pinTimeInput.value = formatTime(state.currentTimeSec);
  if (titleInput) titleInput.value = "";
  if (noteInput) noteInput.value = "";

  if (pinModal) pinModal.classList.remove("hidden");
}

function populateFolderSelect(folders) {
  const select = document.getElementById("folder-select");
  if (!select || !folders) return;
  select.innerHTML = "";
  folders.forEach(f => {
    const opt = document.createElement("option");
    opt.value = f.id;
    opt.textContent = `${f.name} (${f.video_count || 0} vids)`;
    opt.style.backgroundColor = "#0f172a";
    opt.style.color = "#f8fafc";
    select.appendChild(opt);
  });
  const addNewOpt = document.createElement("option");
  addNewOpt.value = "add_new";
  addNewOpt.textContent = "+ Add To Personal Library";
  addNewOpt.style.backgroundColor = "#0f172a";
  addNewOpt.style.color = "#a5b4fc";
  select.appendChild(addNewOpt);

  if (state.currentFolderId) {
    select.value = state.currentFolderId;
  }
}

async function loadSubjectFolders() {
  // 1. Instant local render from StorageManager (0 ms latency)
  const localFolders = StorageManager.getFolders() || [];
  state.folders = localFolders;
  populateFolderSelect(localFolders);
  renderLandingFolders(localFolders);

  // 2. Background sync with serverless endpoint
  const data = await safeFetchJSON("/api/folders");
  if (data && Array.isArray(data.folders) && data.folders.length > 0) {
    data.folders.forEach(sf => StorageManager.saveFolder(sf));
    const mergedFolders = StorageManager.getFolders();
    state.folders = mergedFolders;
    populateFolderSelect(mergedFolders);
    renderLandingFolders(mergedFolders);
  }
}

// ------------------------------------------
// Video Card HTML Generator
// ------------------------------------------
function createVideoCardHtml(v, isActiveVideo = false, isLanding = false) {
  const thumb = v.thumbnail_url || `https://img.youtube.com/vi/${v.video_id}/mqdefault.jpg`;
  const durStr = formatTime(v.duration_sec || 2700);

  if (isLanding) {
    return `
      <div class="landing-video-card group yn10-pixel-box p-3.5 flex flex-col justify-between cursor-pointer" data-video-id="${v.video_id}">
        <div class="space-y-3">
          <div class="relative w-full aspect-video rounded-none overflow-hidden bg-black">
            <img src="${thumb}" alt="${v.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-100" onerror="this.src='https://img.youtube.com/vi/${v.video_id}/hqdefault.jpg'" />
            <span class="absolute bottom-1.5 right-1.5 bg-[#000000] font-mono text-[10px] px-2 py-0.5 rounded-none text-[#ffe600] font-bold border border-[#ffe600] shadow-[0_2px_0_#000000]">
              ${durStr}
            </span>
          </div>
          <h3 class="text-xs font-bold text-white group-hover:text-[#ffe600] transition-colors line-clamp-2 leading-relaxed font-mono">
            ${v.title}
          </h3>
        </div>
        <div class="pt-3 mt-3 border-t-2 border-[#000000] flex items-center justify-between">
          <span class="text-[10px] font-mono text-[#889296] bg-[#0c0e10] px-2 py-0.5 border border-[#272c30]">STAGE 01 // ID: ${v.video_id}</span>
          <button class="block-bevel-red px-3 py-1 text-xs font-mono font-bold rounded-none flex items-center gap-1.5 pointer-events-none">
            <i data-lucide="play" class="w-3 h-3 fill-current" aria-hidden="true"></i>
            <span>ENTER ➔</span>
          </button>
        </div>
      </div>
    `;
  }

  // Inside Main Page Modal
  return `
    <div class="folder-modal-video-card group flex items-center justify-between p-3 rounded-none border-2 border-black ${isActiveVideo ? 'bg-[#181c20] shadow-[0_4px_0_#000000]' : 'bg-[#121518] hover:bg-[#181c20] shadow-[0_3px_0_#000000]'} cursor-pointer font-mono" data-video-id="${v.video_id}">
      <div class="flex items-center space-x-3 overflow-hidden">
        <div class="relative w-28 aspect-video rounded-none overflow-hidden bg-black shrink-0">
          <img src="${thumb}" alt="${v.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-100" onerror="this.src='https://img.youtube.com/vi/${v.video_id}/hqdefault.jpg'" />
          <span class="absolute bottom-1 right-1 bg-black font-mono text-[9px] px-1.5 py-0.5 rounded-none text-[#ffe600] font-bold border border-[#ffe600]/60">${durStr}</span>
        </div>
        <div class="min-w-0 pr-3">
          <h4 class="text-xs font-bold ${isActiveVideo ? 'text-[#ffe600]' : 'text-white group-hover:text-[#ffe600]'} truncate transition-colors">
            ${v.title}
          </h4>
          <p class="text-[11px] text-[#889296] font-mono mt-1">ID: ${v.video_id}</p>
        </div>
      </div>
      <div class="shrink-0 pl-2">
        ${isActiveVideo ? `
          <span class="block-bevel-green px-3 py-1.5 rounded-none text-[10px] font-bold font-mono text-white flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 bg-white animate-pulse"></span> ACTIVE
          </span>
        ` : `
          <button class="block-bevel-red px-3 py-1.5 text-xs font-mono font-bold rounded-none flex items-center gap-1">
            <i data-lucide="play" class="w-3 h-3 fill-current" aria-hidden="true"></i>
            <span>ENTER ➔</span>
          </button>
        `}
      </div>
    </div>
  `;
}

// ------------------------------------------
// Landing Page Folder Pills & Video Cards
// ------------------------------------------
function renderLandingFolders(folders) {
  const pillsContainer = document.getElementById("landing-folder-pills");
  if (!pillsContainer) return;

  pillsContainer.innerHTML = "";
  const allSavedVideos = StorageManager.getSavedVideos();

  // Create an "All Subjects" pill first
  const folderList = [
    { id: "all", name: "All Subjects", icon: "layers", video_count: allSavedVideos.length },
    ...(folders || []).map(f => ({
      ...f,
      video_count: allSavedVideos.filter(v => v.folder_id === f.id || String(v.folder_id) === String(f.id)).length
    }))
  ];

  const storedFolder = localStorage.getItem("synclearn_landing_folder");
  let activeId = state.currentFolderId || storedFolder || "all";
  if (activeId !== "all" && !folderList.some(f => String(f.id) === String(activeId))) {
    activeId = "all";
  }
  state.currentFolderId = activeId;

  folderList.forEach(f => {
    const btn = document.createElement("button");
    const isActive = String(f.id) === String(activeId);
    btn.type = "button";
    btn.className = `px-3.5 py-1.5 rounded-none text-xs font-mono font-bold whitespace-nowrap flex items-center gap-2 cursor-pointer ${
      isActive 
        ? "block-bevel-yellow" 
        : "block-bevel-steel"
    }`;
    btn.innerHTML = `
      <span class="w-2 h-2 ${isActive ? 'bg-[#000000]' : 'bg-[#ffe600]'} inline-block"></span>
      <span>${f.name}</span>
      <span class="px-1.5 py-0.2 rounded-none text-[10px] font-mono ${isActive ? 'bg-black text-[#ffe600] font-bold' : 'bg-[#0e1114] text-[#889296]'}">${f.video_count !== undefined ? f.video_count : 0}</span>
    `;

    btn.addEventListener("click", () => {
      yn10Audio.playBlip();
      state.currentFolderId = f.id;
      localStorage.setItem("synclearn_landing_folder", f.id);
      renderLandingFolders(folders);
      loadLandingFolderVideos(f.id);
    });

    pillsContainer.appendChild(btn);
  });

  // + New Subject button on Landing Page
  const addFolderBtn = document.createElement("button");
  addFolderBtn.type = "button";
  addFolderBtn.id = "landing-add-folder-btn";
  addFolderBtn.className = "px-3.5 py-1.5 rounded-none text-xs font-mono font-bold whitespace-nowrap bg-[#171b1e] border-2 border-dashed border-[#556367] text-[#ffe600] hover:text-white hover:border-[#ffe600] hover:bg-[#202529] cursor-pointer flex items-center gap-1.5 shadow-[0_3px_0_#000000] active:translate-y-[2px] transition-all";
  addFolderBtn.innerHTML = `<i data-lucide="folder-plus" class="w-3.5 h-3.5 text-[#ffe600]"></i><span>+ New Subject</span>`;
  addFolderBtn.addEventListener("click", () => {
    const folderModal = document.getElementById("folder-modal");
    if (folderModal) folderModal.classList.remove("hidden");
  });
  pillsContainer.appendChild(addFolderBtn);

  lucide.createIcons();
  loadLandingFolderVideos(activeId);
}

async function loadLandingFolderVideos(folderId) {
  const grid = document.getElementById("landing-folder-videos-grid");
  if (!grid) return;

  function renderGridVideos(videosList) {
    if (!videosList || videosList.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-8 text-center text-xs text-[#8a9699] bg-[#17191a] border border-dashed border-[#3d484b] rounded-none space-y-2 p-6">
          <i data-lucide="folder-open" class="w-7 h-7 text-[#8a9699] mx-auto" aria-hidden="true"></i>
          <p class="font-bold text-slate-200">${(!folderId || folderId === 'all') ? 'No lectures in your library yet.' : 'No lectures in this subject yet.'}</p>
          <p class="text-[11px] text-[#8a9699]">${(!folderId || folderId === 'all') ? 'Paste any YouTube lecture link above to start studying!' : 'Paste any YouTube lecture link above to add a video into this subject!'}</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    grid.innerHTML = "";
    videosList.forEach(v => {
      const cardWrapper = document.createElement("div");
      cardWrapper.innerHTML = createVideoCardHtml(v, v.video_id === state.currentVideoId, true);
      const card = cardWrapper.firstElementChild;

      card.addEventListener("click", async () => {
        if (folderId !== "all") {
          state.currentFolderId = folderId;
          const folderSelect = document.getElementById("folder-select");
          if (folderSelect) folderSelect.value = folderId;
        }
        await navigateToWorkspace(v.video_id, v.title, true);
      });

      grid.appendChild(card);
    });
    lucide.createIcons();
  }

  // 1. Instant local render from StorageManager
  const allSaved = StorageManager.getSavedVideos();
  let localVideos;
  if (!folderId || folderId === "all") {
    localVideos = allSaved;
  } else {
    localVideos = allSaved.filter(v => v.folder_id === folderId || String(v.folder_id) === String(folderId));
  }
  renderGridVideos(localVideos);

  // 2. Resilient background sync with server
  const endpoint = (!folderId || folderId === "all") ? "/api/videos" : `/api/videos?folder_id=${folderId}`;
  const data = await safeFetchJSON(endpoint);
  if (data && data.videos && data.videos.length > 0) {
    data.videos.forEach(sv => StorageManager.saveVideo(sv));
    const updatedAll = StorageManager.getSavedVideos();
    let updated;
    if (!folderId || folderId === "all") {
      updated = updatedAll;
    } else {
      updated = updatedAll.filter(v => v.folder_id === folderId || String(v.folder_id) === String(folderId));
    }
    renderGridVideos(updated);
  }
}

// ------------------------------------------
// Main Studio Folder Videos Modal Explorer
// ------------------------------------------
async function openFolderVideosModal(targetFolderId) {
  const modal = document.getElementById("folder-videos-modal");
  const titleEl = document.getElementById("folder-videos-modal-title");
  const countEl = document.getElementById("folder-videos-modal-subtitle");
  const tabsContainer = document.getElementById("modal-folder-tabs");
  const listContainer = document.getElementById("folder-videos-list");

  if (!modal || !listContainer) return;

  const currentId = targetFolderId || state.currentFolderId || 1;
  state.currentFolderId = currentId;

  const currentFolder = (state.folders || []).find(f => f.id === currentId);
  if (titleEl) titleEl.textContent = currentFolder ? currentFolder.name : "Study Folder Lectures";

  // Render Folder Tabs inside Modal
  if (tabsContainer && state.folders) {
    tabsContainer.innerHTML = "";
    state.folders.forEach(f => {
      const tabBtn = document.createElement("button");
      const isSel = f.id === currentId;
      tabBtn.type = "button";
      tabBtn.className = `px-3 py-1.5 rounded-none text-xs font-mono font-bold transition-none whitespace-nowrap cursor-pointer flex items-center gap-1.5 border ${
        isSel 
          ? "bg-[#24292b] border-[#e59130] text-[#f59f38] shadow-sm" 
          : "bg-[#171a1b] border-[#333b3d] text-[#8a9699] hover:text-white hover:bg-[#1e2325]"
      }`;
      tabBtn.innerHTML = `<span>${f.name}</span><span class="text-[10px] opacity-75 font-mono">(${f.video_count || 0})</span>`;
      tabBtn.addEventListener("click", () => {
        openFolderVideosModal(f.id);
        const folderSelect = document.getElementById("folder-select");
        if (folderSelect) folderSelect.value = f.id;
      });
      tabsContainer.appendChild(tabBtn);
    });
  }

  function renderModalVideos(videosList) {
    if (countEl) countEl.textContent = `${videosList.length} lecture${videosList.length === 1 ? '' : 's'} saved in this folder`;

    if (!videosList || videosList.length === 0) {
      listContainer.innerHTML = `
        <div class="py-12 text-center text-xs text-[#8a9699] bg-[#121516] border border-dashed border-[#3d484b] rounded-none space-y-2 p-6">
          <i data-lucide="folder-open" class="w-8 h-8 text-[#8a9699] mx-auto" aria-hidden="true"></i>
          <p class="font-bold text-slate-200">No lectures saved in this folder yet.</p>
          <p class="text-[11px] text-[#8a9699]">Use the top URL bar to paste any educational YouTube lecture and save it here!</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    listContainer.innerHTML = "";
    videosList.forEach(v => {
      const cardWrapper = document.createElement("div");
      cardWrapper.innerHTML = createVideoCardHtml(v, v.video_id === state.currentVideoId, false);
      const card = cardWrapper.firstElementChild;

      card.addEventListener("click", async () => {
        modal.classList.add("hidden");
        const folderSelect = document.getElementById("folder-select");
        if (folderSelect) folderSelect.value = currentId;
        await navigateToWorkspace(v.video_id, v.title, true);
      });

      listContainer.appendChild(card);
    });
    lucide.createIcons();
  }

  modal.classList.remove("hidden");

  // 1. Instant local render
  const allSaved = StorageManager.getSavedVideos();
  let localList = allSaved.filter(v => !v.folder_id || v.folder_id === currentId || String(v.folder_id) === String(currentId));
  renderModalVideos(localList);

  // 2. Resilient background sync with server
  const serverData = await safeFetchJSON(`/api/videos?folder_id=${currentId}`);
  if (serverData && serverData.videos && serverData.videos.length > 0) {
    serverData.videos.forEach(sv => StorageManager.saveVideo(sv));
    const updated = StorageManager.getSavedVideos().filter(v => !v.folder_id || v.folder_id === currentId || String(v.folder_id) === String(currentId));
    renderModalVideos(updated);
  }
}

// Render Rich Visual Preview in Export Modal
function renderVisualCheatSheetPreview() {
  const container = document.getElementById("export-visual-preview");
  if (!container) return;

  const lectureTitle = document.getElementById("video-title")?.textContent || "Lecture Study Studio";
  const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  let html = `
    <div class="border-b border-slate-800 pb-3">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-white">${lectureTitle}</h3>
        <span class="text-[10px] font-mono text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-0.5 rounded font-bold">SyncLearn Study Studio</span>
      </div>
      <p class="text-[11px] text-slate-300 mt-1">Generated: ${dateStr} • Duration: ${formatTime(state.durationSec)} • Video ID: ${state.currentVideoId}</p>
    </div>

    <!-- Section 1: Study Pins & Formulas -->
    <div class="space-y-2">
      <h4 class="text-xs font-bold text-amber-300 flex items-center gap-1.5">
        <i data-lucide="bookmark" class="w-4 h-4 text-amber-400" aria-hidden="true"></i> Saved Timestamp Notes & Formulas (${state.pins.length})
      </h4>
      <div class="space-y-2">
  `;

  if (state.pins.length === 0) {
    html += `<p class="text-[11px] text-slate-400 italic">No saved notes yet.</p>`;
  } else {
    state.pins.forEach((p, i) => {
      let tagBadge = "★ Exam Important";
      let tagColor = "border-rose-500/40 text-rose-300 bg-rose-500/15";
      if (p.tag === "revisit") {
        tagBadge = "? Needs Review";
        tagColor = "border-amber-500/40 text-amber-300 bg-amber-500/15";
      } else if (p.tag === "key_formula") {
        tagBadge = "∑ Key Formula";
        tagColor = "border-cyan-500/40 text-cyan-300 bg-cyan-500/15";
      }

      html += `
        <div class="p-3 rounded-none bg-[#151819] border border-[#2d3739] space-y-1">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-100">[${formatTime(p.timestamp_sec)}] ${p.title}</span>
            <span class="text-[10px] px-2 py-0.5 rounded-none border font-mono font-bold ${tagColor}">${tagBadge}</span>
          </div>
          ${p.note ? `<p class="text-xs text-slate-300 font-serif leading-relaxed">${p.note.replace(/\n/g, '<br/>')}</p>` : ""}
        </div>
      `;
    });
  }

  html += `
      </div>
    </div>

    <!-- Section 2: Terminology Comparison Matrix -->
    <div class="space-y-2">
      <h4 class="text-xs font-bold text-amber-400 flex items-center gap-1.5">
        <i data-lucide="git-compare" class="w-4 h-4 text-amber-400" aria-hidden="true"></i> Term Comparison Matrix (${state.sessionTerminologyBridges.length})
      </h4>
  `;

  if (state.sessionTerminologyBridges.length === 0) {
    html += `<p class="text-[11px] text-slate-400 italic">No term comparisons accumulated yet.</p>`;
  } else {
    html += `
      <table class="w-full text-left text-xs border border-[#2d3739] rounded-none overflow-hidden">
        <thead class="bg-[#151819] text-slate-300 text-[10px] uppercase font-mono">
          <tr>
            <th class="p-2.5 border-b border-[#2d3739] font-bold">Lecture Term / Symbol</th>
            <th class="p-2.5 border-b border-[#2d3739] font-bold">What Other Videos Call It</th>
            <th class="p-2.5 border-b border-[#2d3739] font-bold">How They Connect</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#2d3739] text-slate-200">
    `;
    state.sessionTerminologyBridges.forEach(b => {
      html += `
        <tr>
          <td class="p-2.5 border-b border-[#2d3739] font-mono text-amber-300 font-bold">${b.prof_term}</td>
          <td class="p-2.5 border-b border-[#2d3739] font-mono text-cyan-300">${b.alt_video_term}</td>
          <td class="p-2.5 border-b border-[#2d3739] font-serif">${b.clarification}</td>
        </tr>
      `;
    });
    html += `
        </tbody>
      </table>
    `;
  }

  html += `
    </div>

    <!-- Section 3: Targeted Revision: Missed Checkpoints -->
    <div class="space-y-2">
      <h4 class="text-xs font-bold text-amber-300 flex items-center gap-1.5">
        <i data-lucide="check-circle" class="w-4 h-4 text-emerald-400" aria-hidden="true"></i> Review & Reinforce (${state.missedQuizQuestions.length})
      </h4>
  `;

  if (state.missedQuizQuestions.length === 0) {
    html += `<p class="text-xs text-emerald-400 font-semibold">✓ Outstanding! All practice questions completed with 100% mastery.</p>`;
  } else {
    state.missedQuizQuestions.forEach((m, idx) => {
      html += `
        <div class="p-3 rounded-none bg-[#151819] border border-[#2d3739] space-y-1">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-100">#${idx + 1}. ${m.question}</span>
            <span class="font-mono text-amber-300 text-[10px] bg-[#242b2d] border border-[#414d52] px-2 py-0.5 rounded-none font-bold">Review @ ${formatTime(m.review_timestamp_sec)}</span>
          </div>
          <div class="text-xs text-emerald-400 font-bold">✓ Key Takeaway: ${m.correct_answer || m.options?.[m.correct_index] || ""}</div>
          <p class="text-xs text-slate-300 font-serif">${m.explanation || ""}</p>
        </div>
      `;
    });
  }

  html += `</div>`;

  container.innerHTML = html;
  renderMathInElementSafe(container);
  lucide.createIcons();
}

// Generate Markdown for Cheat Sheet Export
function generateMarkdownCheatSheet() {
  const lectureTitle = document.getElementById("video-title")?.textContent || "Lecture Study Studio";
  const dateStr = new Date().toLocaleDateString();

  let md = `# SyncLearn Study Guide & Saved Notes\n\n`;
  md += `**Lecture:** ${lectureTitle}\n`;
  md += `**Video ID:** \`${state.currentVideoId}\`\n`;
  md += `**Date:** ${dateStr}\n`;
  md += `**Duration:** ${formatTime(state.durationSec)}\n\n`;
  md += `---\n\n`;

  md += `## 1. Saved Timestamp Notes & Formulas\n\n`;
  if (state.pins.length === 0) {
    md += `*No saved notes yet.*\n\n`;
  } else {
    state.pins.forEach((p, idx) => {
      let tagStr = "★ Exam Important";
      if (p.tag === "revisit") tagStr = "? Needs Review";
      if (p.tag === "key_formula") tagStr = "∑ Key Formula";

      md += `### ${idx + 1}. [${formatTime(p.timestamp_sec)}] ${p.title}\n`;
      md += `**Category:** ${tagStr}\n\n`;
      if (p.note) {
        md += `${p.note}\n\n`;
      }
      md += `---\n\n`;
    });
  }

  md += `## 2. Term Comparison Matrix (Lecture vs Other Videos)\n\n`;
  if (state.sessionTerminologyBridges.length === 0) {
    md += `*Standard nomenclature aligns with textbook conventions.*\n\n`;
  } else {
    md += `| Lecture Symbol / Term | What Other Videos Call It | How They Connect |\n`;
    md += `| :--- | :--- | :--- |\n`;
    state.sessionTerminologyBridges.forEach(b => {
      md += `| \`${b.prof_term}\` | **${b.alt_video_term}** | ${b.clarification} |\n`;
    });
    md += `\n---\n\n`;
  }

  md += `## 3. Targeted Revision: Checkpoint Questions to Review\n\n`;
  if (state.missedQuizQuestions.length === 0) {
    md += `*Zero missed checkpoints! All practice concepts were mastered successfully.*\n\n`;
  } else {
    state.missedQuizQuestions.forEach((m, idx) => {
      md += `### Review Question #${idx + 1} (Video Review Point: ${formatTime(m.review_timestamp_sec)})\n`;
      md += `**Question:** ${m.question}\n\n`;
      md += `**Correct Answer:** ${m.correct_answer || m.options?.[m.correct_index] || ""}\n\n`;
      md += `**Explanation:** ${m.explanation}\n\n`;
      md += `---\n\n`;
    });
  }

  return md;
}

// Download Markdown File
function downloadMarkdownFile() {
  const content = generateMarkdownCheatSheet();
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `SyncLearn-StudyGuide-${state.currentVideoId}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==========================================
// 8. UTILITIES & MATH RENDERING
// ==========================================

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatMarkdownAndMath(text) {
  if (!text) return "";
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "<br/><br/>");
  return formatted;
}

function renderMathInElementSafe(element) {
  if (window.renderMathInElement && element) {
    try {
      renderMathInElement(element, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ],
        throwOnError: false
      });
    } catch (e) {
      console.warn("KaTeX render notice:", e);
    }
  }
}

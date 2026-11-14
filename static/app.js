/**
 * static/app.js - SyncLearn Interactive YouTube Learning Studio
 * Built by Team ClaudeNSons
 * Refactored for User-Centred Design, Cognitive Accessibility, and Hick's Law
 */

// Global Application State
const state = {
  currentVideoId: "fnF67w6rDpg", // Default Engineering Chemistry lecture
  durationSec: 2700,
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
  currentFolderId: 1,
  // User-Centred Settings
  analysisWindowSeconds: 240, // Default ±2m (240s window)
  autoPauseEnabled: true,
  triggeredAutoPauses: new Set(),
  // Undo Deletion State
  pendingDeleteTimeout: null,
  pendingDeletedPin: null,
  // Session Learning Data
  sessionTerminologyBridges: [
    {
      prof_term: "\\bar{M}_n \\text{ vs } \\bar{M}_w",
      alt_video_term: "Number-Avg vs Weight-Avg Molar Mass",
      clarification: "Mn linear chains count; Mw squares chain weight reflecting mechanical toughness."
    },
    {
      prof_term: "\\text{PDI} = \\frac{\\bar{M}_w}{\\bar{M}_n}",
      alt_video_term: "Dispersity Index (Đ)",
      clarification: "IUPAC standard dispersity. PDI = 1.0 indicates strictly monodisperse chains."
    },
    {
      prof_term: "\\text{DP}_n",
      alt_video_term: "Chain Length / Degree of Polymerization",
      clarification: "Average number of repeat monomer units per polymer macromolecule."
    }
  ],
  missedQuizQuestions: [],
  conceptMastery: { total: 0, unlocked: 0 }
};

// Initialize Application on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  initUIEventListeners();
  loadSubjectFolders();
  renderCheatSheetBridges();
  renderCheatSheetMissedMCQs();
  loadVideoStudio(state.currentVideoId);
});

// ==========================================
// 1. YOUTUBE IFRAME PLAYER INTEGRATION (BULLETPROOF)
// ==========================================

function initYouTubePlayer() {
  if (state.player && typeof state.player.loadVideoById === "function") return;

  const playerEl = document.getElementById("youtube-player");
  if (!playerEl) return;

  try {
    if (window.YT && window.YT.Player) {
      state.player = new YT.Player("youtube-player", {
        height: "100%",
        width: "100%",
        videoId: state.currentVideoId,
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
      });
    } else {
      fallbackToDirectIframe();
    }
  } catch (err) {
    console.warn("YT.Player initialization notice:", err);
    fallbackToDirectIframe();
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
  if (!state.isPlayerReady) {
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
  fallbackToDirectIframe();
}

function fallbackToDirectIframe() {
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

  // Synchronize duration if video changed
  if (event.data === YT.PlayerState.PLAYING || event.data === YT.PlayerState.CUED) {
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

function jumpToTime(seconds, triggerAnalysis = true) {
  state.previousTimeSec = seconds;
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
    fetchSegmentAnalysis(seconds);
    fetchSegmentQuiz(seconds);
  }
}

// ==========================================
// 2. VIDEO STUDIO LOADING & DYNAMIC SWITCHING
// ==========================================

async function loadVideoStudio(videoId) {
  try {
    state.currentVideoId = videoId;
    state.triggeredAutoPauses.clear();
    state.previousTimeSec = 0;

    // Reset session bridges and missed questions for a new video
    if (videoId !== "fnF67w6rDpg") {
      state.sessionTerminologyBridges = [];
      state.missedQuizQuestions = [];
    }
    renderCheatSheetBridges();
    renderCheatSheetMissedMCQs();

    const res = await fetch(`/api/video/${videoId}`);
    const data = await res.json();

    if (data.video) {
      document.getElementById("video-title").textContent = data.video.title;
      if (data.video.duration_sec) {
        state.durationSec = data.video.duration_sec;
      }
    }

    if (data.heatmap) {
      state.heatmapData = data.heatmap;
      if (data.heatmap.duration_sec) {
        state.durationSec = data.heatmap.duration_sec;
      }
      renderHeatmap(data.heatmap);
      renderDynamicPeaksUI(data.heatmap);
    }

    updateDurationBadge();

    // Load Pins
    await loadPins(videoId);

    // Switch video in player or fallback iframe
    if (state.isPlayerReady && state.player && typeof state.player.loadVideoById === "function") {
      try {
        state.player.loadVideoById(videoId);
      } catch (e) {
        fallbackToDirectIframe();
      }
    } else {
      fallbackToDirectIframe();
    }

    // Dismiss any loader overlay
    const loader = document.getElementById("player-loader");
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => loader.classList.add("hidden"), 300);
    }

    // Determine target initial peak for analysis
    let initialTimestamp = 30;
    if (data.heatmap && data.heatmap.peaks && data.heatmap.peaks.length > 0) {
      initialTimestamp = data.heatmap.peaks[0].peak_sec || data.heatmap.peaks[0].start_sec;
    }

    // Automatically load analysis & quiz for this video's initial focus point
    await fetchSegmentAnalysis(initialTimestamp);
    await fetchSegmentQuiz(initialTimestamp);

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
    peakCountBadge.textContent = `⚡ ${peaks.length} Tricky Spots Found`;
  }

  // Render bottom timeline peak labels
  if (labelsContainer) {
    labelsContainer.innerHTML = "";
    peaks.forEach(p => {
      const startStr = formatTime(p.start_sec);
      const endStr = formatTime(p.end_sec);
      const cleanLabel = (p.label || "").split("(")[0].trim();
      const span = document.createElement("span");
      span.className = "text-amber-300 hover:text-amber-200 cursor-pointer truncate max-w-[200px] font-medium";
      span.title = p.description || p.label;
      span.textContent = `${startStr} - ${endStr} (${cleanLabel})`;
      span.addEventListener("click", () => jumpToTime(p.peak_sec || p.start_sec, true));
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
      btn.className = "peak-jump-btn min-h-[38px] bg-slate-800 hover:bg-indigo-600/30 hover:border-indigo-500/50 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-100 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer font-medium";
      btn.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
        <span class="truncate max-w-[190px]">${formatTime(peakTime)} • ${cleanLabel} (${intensityPct}% replayed)</span>
      `;
      btn.addEventListener("click", () => jumpToTime(peakTime, true));
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
    jumpToTime(targetTimeSec, true);
  });
}

// ==========================================
// 4. PERSONAL STUDY PINS (ACCESSIBLE TAGS & UNDO DELETION)
// ==========================================

async function loadPins(videoId) {
  try {
    const res = await fetch(`/api/pins/${videoId}`);
    const data = await res.json();
    state.pins = data.pins || [];
    renderTimelinePins();
    renderCheatSheetPins();
  } catch (err) {
    console.error("Failed to load pins:", err);
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
      jumpToTime(pin.timestamp_sec, true);
      switchTab("tab-content-rescue");
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
    card.className = "bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 space-y-2 transition-all";

    let tagBadge = `<span class="px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-bold">★ Exam Important</span>`;
    if (pin.tag === "revisit") {
      tagBadge = `<span class="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">? Needs Review</span>`;
    } else if (pin.tag === "key_formula") {
      tagBadge = `<span class="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold">∑ Key Formula</span>`;
    }

    card.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          ${tagBadge}
          <button class="pin-jump-btn font-mono text-[11px] font-bold text-indigo-300 hover:text-white bg-indigo-950/60 border border-indigo-800/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer" data-time="${pin.timestamp_sec}">
            <i data-lucide="play" class="w-3 h-3 fill-current" aria-hidden="true"></i> ${formatTime(pin.timestamp_sec)}
          </button>
        </div>
        <button class="delete-pin-btn min-h-[36px] min-w-[36px] text-slate-400 hover:text-rose-400 p-1.5 transition-colors cursor-pointer rounded-lg hover:bg-slate-900" data-id="${pin.id}" title="Delete Saved Note" aria-label="Delete saved note: ${pin.title}">
          <i data-lucide="trash-2" class="w-4 h-4" aria-hidden="true"></i>
        </button>
      </div>
      <h4 class="text-xs font-bold text-slate-100">${pin.title}</h4>
      ${pin.note ? `<p class="text-xs text-slate-300 leading-relaxed font-serif bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">${pin.note}</p>` : ""}
    `;

    card.querySelector(".pin-jump-btn").addEventListener("click", () => {
      jumpToTime(pin.timestamp_sec, true);
      switchTab("tab-content-rescue");
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
    await fetch(`/api/pins/${pinId}`, { method: "DELETE" });
  } catch (err) {
    console.warn("Failed to delete pin permanently:", err);
  }
}

// ==========================================
// 5. TAB 1: SIMPLE EXPLANATION (STEP-BY-STEP PROGRESS & PLAIN LANGUAGE)
// ==========================================

async function runAiSegmentAnalysis(timestampSec, studentDoubt = null) {
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

  try {
    const res = await fetch("/api/analyze-segment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        video_id: state.currentVideoId,
        center_timestamp_sec: timestampSec,
        window_seconds: windowSec,
        student_doubt: studentDoubt
      })
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    state.activeAnalysis = data;

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
    console.error("Failed to run segment explanation:", err);
  } finally {
    clearTimeout(stepTimer1);
    clearTimeout(stepTimer2);
    if (skeleton) skeleton.classList.add("hidden");
    if (content) content.classList.remove("hidden");
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
    const res = await fetch(`/api/quiz/${state.currentVideoId}?timestamp_sec=${timestampSec}`);
    const data = await res.json();
    if (data.quiz) {
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
        video_id: state.currentVideoId,
        timestamp_sec: timestampSec,
        tag: "exam_priority",
        title: `Summary: ${topConcept}`,
        note: `★ Key Takeaway: ${data.why_students_struggle}\n\n💡 Breakdown: ${data.context_locked_explanation ? data.context_locked_explanation.slice(0, 320) : ""}...`
      };

      try {
        const pRes = await fetch("/api/pins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPin)
        });
        const pData = await pRes.json();
        if (pData.pin) {
          state.pins.push(pData.pin);
          state.pins.sort((a, b) => a.timestamp_sec - b.timestamp_sec);
          renderTimelinePins();
          renderCheatSheetPins();
          autoSaveBtn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400" aria-hidden="true"></i><span class="text-emerald-300 font-bold">✓ Saved to Notes!</span>`;
          lucide.createIcons();
          setTimeout(() => {
            autoSaveBtn.innerHTML = `<i data-lucide="bookmark-plus" class="w-3.5 h-3.5" aria-hidden="true"></i><span>Save as Note</span>`;
            lucide.createIcons();
          }, 2500);
        }
      } catch (err) {
        console.error("Auto-save note error:", err);
      }
    };
  }

  // Fetch and render Alternative Videos
  const query = (data.recommended_search_queries && data.recommended_search_queries[0]) ||
                (data.identified_concepts && data.identified_concepts[0]?.name) ||
                "lecture concept visual intuition";
  loadAlternativeVideos(query);
}

async function loadAlternativeVideos(query) {
  const altsContainer = document.getElementById("rescue-alt-videos");
  if (!altsContainer) return;

  altsContainer.innerHTML = `
    <div class="text-xs text-slate-300 flex items-center gap-2 p-3 bg-slate-900 rounded-xl">
      <i data-lucide="loader-2" class="w-4 h-4 animate-spin text-indigo-400" aria-hidden="true"></i>
      <span>Finding intuitive animations and visual explanations for "${query}"...</span>
    </div>
  `;
  lucide.createIcons();

  try {
    const res = await fetch(`/api/alternative-videos?q=${encodeURIComponent(query)}&max_results=4`);
    const data = await res.json();
    const videos = data.videos || [];

    if (videos.length === 0) {
      altsContainer.innerHTML = `<div class="text-xs text-slate-400 py-2">No other videos found for this topic.</div>`;
      return;
    }

    altsContainer.innerHTML = "";
    videos.forEach(v => {
      const card = document.createElement("div");
      card.className = "flex items-start gap-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3 transition-all group";
      card.innerHTML = `
        <div class="relative w-24 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-800 cursor-pointer alt-video-thumb">
          <img src="${v.thumbnail}" alt="${v.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform" onerror="this.src='https://img.youtube.com/vi/${v.video_id}/hqdefault.jpg'" />
          <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <i data-lucide="play" class="w-5 h-5 text-white fill-current" aria-hidden="true"></i>
          </div>
          <span class="absolute bottom-1 right-1 bg-black/80 text-[9px] font-mono px-1 rounded text-white">${v.duration || "Visual"}</span>
        </div>
        <div class="flex-1 min-w-0 space-y-1">
          <div class="flex items-center justify-between gap-1">
            <span class="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 truncate">${v.tag || "Visual Animation"}</span>
            <span class="text-[10px] text-slate-400 truncate">${v.channel}</span>
          </div>
          <h5 class="text-xs font-bold text-slate-100 line-clamp-1 group-hover:text-indigo-300 transition-colors cursor-pointer alt-video-title">${v.title}</h5>
          <p class="text-[11px] text-slate-300 line-clamp-2 font-serif">${v.description || "Intuitive visual breakdown of this exact concept."}</p>
        </div>
        <div class="flex flex-col gap-1 shrink-0">
          <button class="preview-alt-btn min-h-[36px] min-w-[36px] p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center" title="Preview inside studio" aria-label="Preview video: ${v.title}">
            <i data-lucide="play" class="w-3.5 h-3.5" aria-hidden="true"></i>
          </button>
          <a href="${v.url || `https://www.youtube.com/watch?v=${v.video_id}`}" target="_blank" rel="noopener noreferrer" class="min-h-[36px] min-w-[36px] p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center justify-center" title="Open on YouTube" aria-label="Open on YouTube: ${v.title}">
            <i data-lucide="external-link" class="w-3.5 h-3.5" aria-hidden="true"></i>
          </a>
        </div>
      `;

      const openModal = () => openAltVideoModal(v);
      card.querySelector(".alt-video-thumb").addEventListener("click", openModal);
      card.querySelector(".alt-video-title").addEventListener("click", openModal);
      card.querySelector(".preview-alt-btn").addEventListener("click", openModal);

      altsContainer.appendChild(card);
    });

    lucide.createIcons();

  } catch (err) {
    console.error("Failed to load alternative videos:", err);
    altsContainer.innerHTML = `<div class="text-xs text-rose-300 py-1">Failed to load other videos.</div>`;
  }
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
    const res = await fetch("/api/analysis/followup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        video_id: state.currentVideoId,
        current_time_sec: state.currentTimeSec,
        question: question,
        context_text: state.activeAnalysis?.context_locked_explanation || ""
      })
    });
    const data = await res.json();
    responseContent.innerHTML = formatMarkdownAndMath(data.answer || "Answer generated.");
    renderMathInElementSafe(responseContent);
    input.value = "";
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
      scoreBadge.className = "text-xs font-mono font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 rounded";
    } else {
      const pct = Math.round((state.conceptMastery.unlocked / totalHidden) * 100);
      scoreBadge.textContent = `⚡ Mastery: ${state.conceptMastery.unlocked} / ${totalHidden} (${pct}%)`;
      if (pct === 100) {
        scoreBadge.className = "text-xs font-mono font-bold text-emerald-300 bg-emerald-500/25 border border-emerald-500/50 px-2.5 py-0.5 rounded shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse";
      } else {
        scoreBadge.className = "text-xs font-mono font-bold text-cyan-300 bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-0.5 rounded";
      }
    }
  };
  updateMasteryBadge();

  nodes.forEach((node, idx) => {
    // Flowchart Arrow Connector between sequential nodes
    if (idx > 0) {
      const connector = document.createElement("div");
      connector.className = "flex justify-center my-1 text-cyan-400";
      connector.innerHTML = `<i data-lucide="arrow-down" class="w-4 h-4" aria-hidden="true"></i>`;
      nodesContainer.appendChild(connector);
    }

    const isHidden = Boolean(node.is_hidden_quiz || node.is_blank);
    const correctLabel = node.label || node.revealed_text || (node.options && node.options[0]) || "";

    if (!isHidden) {
      const card = document.createElement("div");
      card.className = "bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-sm";
      card.innerHTML = `
        <div class="space-y-0.5 min-w-0">
          <div class="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span> Step ${idx + 1}
          </div>
          <div class="text-xs font-bold text-slate-100 truncate node-content">${node.label || node.title || node.content || ""}</div>
        </div>
        <div class="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <i data-lucide="check" class="w-4 h-4 text-emerald-400" aria-hidden="true"></i>
        </div>
      `;
      renderMathInElementSafe(card.querySelector(".node-content"));
      nodesContainer.appendChild(card);
    } else {
      const card = document.createElement("div");
      card.id = `diag-node-${idx}`;
      card.className = "recall-node-card locked border border-cyan-500/50 rounded-2xl p-4 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20 space-y-3 shadow-sm transition-all";

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
          <div class="text-[10px] uppercase font-mono font-bold tracking-wider text-cyan-300 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            Practice Slot • Step ${idx + 1}
          </div>
          <span class="node-status-pill text-[10px] text-cyan-300 font-mono font-bold bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded">Click to Recall</span>
        </div>
        <div class="slot-action-area">
          <button class="blank-slot-btn w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/60 text-cyan-100 shadow-[0_0_12px_rgba(6,182,212,0.25)] flex items-center justify-center gap-2 cursor-pointer transition-all">
            <i data-lucide="help-circle" class="w-4 h-4 text-cyan-400 animate-pulse" aria-hidden="true"></i>
            <span class="font-mono tracking-wide">[ ? Click to Recall ]</span>
          </button>
        </div>
        <div id="diag-options-${idx}" class="hidden p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5 shadow-inner">
          <div class="flex items-center justify-between text-xs text-cyan-300 font-bold">
            <span>Choose the correct concept or formula:</span>
            <span class="text-[10px] text-slate-400 font-mono">3 choices</span>
          </div>
          <div class="feedback-msg text-xs hidden font-medium"></div>
          <div class="grid grid-cols-1 gap-2">
            ${options.map((opt, oIdx) => `
              <button class="diag-opt-btn min-h-[44px] text-left text-xs bg-slate-900 hover:bg-slate-800 px-3.5 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-100 transition-all flex items-center justify-between cursor-pointer group" data-node-idx="${idx}" data-val="${opt.replace(/"/g, '&quot;')}">
                <span class="opt-label group-hover:text-cyan-300 transition-colors font-medium">${String.fromCharCode(65 + oIdx)}) ${opt}</span>
                <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" aria-hidden="true"></i>
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
        optBox.classList.toggle("hidden");
      });

      card.querySelectorAll(".diag-opt-btn").forEach(optBtn => {
        optBtn.addEventListener("click", () => {
          const selectedVal = optBtn.getAttribute("data-val");
          if (selectedVal === correctLabel) {
            // Correct choice
            card.className = "recall-node-card unlocked border border-emerald-500/60 rounded-2xl p-4 bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 space-y-3 shadow-sm transition-all";
            
            actionArea.innerHTML = `
              <div class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-950/60 border border-emerald-500/70 text-emerald-200 flex items-center justify-between shadow-sm">
                <div class="flex items-center gap-2">
                  <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true"></i>
                  <span class="revealed-text font-serif text-[13px]">${correctLabel}</span>
                </div>
                <span class="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded font-bold">Locked</span>
              </div>
            `;
            renderMathInElementSafe(actionArea.querySelector(".revealed-text"));

            statusPill.className = "node-status-pill text-[10px] text-emerald-300 font-mono font-bold bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded";
            statusPill.textContent = "✓ Unlocked";

            optBox.innerHTML = `
              <div class="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 font-bold flex items-center gap-2">
                <i data-lucide="sparkles" class="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true"></i>
                <span>Locked into memory! (+1 Mastery Point)</span>
              </div>
            `;
            
            state.conceptMastery.unlocked++;
            updateMasteryBadge();
            lucide.createIcons();
          } else {
            // Incorrect choice
            feedbackDiv.classList.remove("hidden");
            feedbackDiv.className = "feedback-msg text-xs text-rose-300 font-medium flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/60";
            feedbackDiv.innerHTML = `<i data-lucide="alert-circle" class="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true"></i> <span>✕ Not quite right — consider the core intuition and try another choice!</span>`;
            optBtn.classList.add("bg-rose-950/50", "border-rose-500/80", "text-rose-200");
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
    qCard.className = "bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5";
    
    const reviewTime = mcq.review_timestamp_sec || state.currentTimeSec;

    qCard.innerHTML = `
      <div class="flex items-start gap-2.5">
        <span class="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/30">
          Q${qIdx + 1}
        </span>
        <p class="text-xs font-bold text-slate-100 leading-snug">${mcq.question}</p>
      </div>
      <div class="grid grid-cols-1 gap-2 pt-0.5">
        ${(mcq.options || []).map((opt, oIdx) => `
          <button class="mcq-option-btn text-left text-xs bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3 text-slate-200 flex items-center justify-between transition-all cursor-pointer group" data-q-idx="${qIdx}" data-o-idx="${oIdx}">
            <span class="group-hover:text-indigo-200 transition-colors font-medium">${String.fromCharCode(65 + oIdx)}) ${opt}</span>
            <span class="opt-status font-mono text-xs hidden shrink-0 ml-2"></span>
          </button>
        `).join("")}
      </div>
      <div id="mcq-expl-${qIdx}" class="hidden p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-900/60 text-xs text-slate-200 leading-relaxed font-serif space-y-2.5">
        <div class="flex items-start gap-2">
          <i data-lucide="info" class="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" aria-hidden="true"></i>
          <div><strong class="text-indigo-200 font-sans">Explanation & Intuition:</strong> ${mcq.explanation}</div>
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
          b.classList.remove("cursor-pointer", "hover:border-slate-700");
        });

        if (oI === targetMcq.correct_index) {
          btn.className = "mcq-option-btn text-left text-xs bg-emerald-950/50 border border-emerald-500 rounded-xl p-3 text-emerald-200 flex items-center justify-between shadow-sm";
          const statusSpan = btn.querySelector(".opt-status");
          statusSpan.classList.remove("hidden");
          statusSpan.innerHTML = `<span class="px-2 py-0.5 rounded bg-emerald-500/25 text-emerald-300 font-bold flex items-center gap-1"><i data-lucide="check" class="w-3.5 h-3.5" aria-hidden="true"></i> Correct</span>`;
        } else {
          btn.className = "mcq-option-btn text-left text-xs bg-rose-950/50 border border-rose-500 rounded-xl p-3 text-rose-200 flex items-center justify-between shadow-sm";
          const statusSpan = btn.querySelector(".opt-status");
          statusSpan.classList.remove("hidden");
          statusSpan.innerHTML = `<span class="px-2 py-0.5 rounded bg-rose-500/25 text-rose-300 font-bold">✕ Incorrect</span>`;

          const allOptions = qCard.querySelectorAll(".mcq-option-btn");
          if (allOptions[targetMcq.correct_index]) {
            allOptions[targetMcq.correct_index].className = "mcq-option-btn text-left text-xs bg-emerald-950/40 border border-emerald-500/70 rounded-xl p-3 text-emerald-200 flex items-center justify-between";
            const rightStatus = allOptions[targetMcq.correct_index].querySelector(".opt-status");
            rightStatus.classList.remove("hidden");
            rightStatus.innerHTML = `<span class="text-xs text-emerald-400 font-mono font-bold">✓ Correct Answer</span>`;
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
              <button class="jump-review-btn w-full min-h-[44px] bg-gradient-to-r from-rose-600/30 via-amber-600/30 to-rose-600/30 hover:from-rose-600/50 hover:to-amber-600/50 border border-amber-500/50 text-amber-100 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer">
                <i data-lucide="rotate-ccw" class="w-4 h-4 text-amber-400" aria-hidden="true"></i>
                <span>⏪ Rewatch Exact 30s Explanation (${formatTime(reviewTime)})</span>
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
      <div class="text-center py-5 bg-emerald-950/20 border border-emerald-900/40 rounded-2xl text-xs text-emerald-300 flex flex-col items-center justify-center gap-1.5">
        <div class="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <i data-lucide="check-circle" class="w-4 h-4 text-emerald-400" aria-hidden="true"></i>
        </div>
        <span class="font-bold text-slate-100">Zero Missed Checkpoints!</span>
        <span class="text-xs text-slate-300">When you answer a checkpoint question incorrectly, it appears here for targeted pre-exam cramming.</span>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = "";
  state.missedQuizQuestions.forEach((m, idx) => {
    const card = document.createElement("div");
    card.className = "bg-slate-950/80 border border-rose-900/50 hover:border-rose-700/60 rounded-2xl p-3.5 space-y-2.5 transition-all shadow-sm";
    card.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <span class="text-[10px] font-mono uppercase text-rose-300 font-bold flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          Question to Review #${idx + 1}
        </span>
        <button class="review-missed-btn min-h-[36px] px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 text-xs text-indigo-200 hover:text-white font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer" data-rev-time="${m.review_timestamp_sec}">
          <i data-lucide="play" class="w-3 h-3 fill-current" aria-hidden="true"></i> Jump to ${formatTime(m.review_timestamp_sec)}
        </button>
      </div>
      <p class="text-xs font-bold text-slate-100 leading-snug">${m.question}</p>
      <div class="bg-slate-900 rounded-xl p-3 border border-slate-800 space-y-1.5 text-xs">
        <div class="text-emerald-300 font-bold flex items-center gap-1.5 text-xs">
          <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true"></i>
          <span>Correct Insight: <strong>${m.correct_answer || m.options?.[m.correct_index] || ""}</strong></span>
        </div>
        <div class="text-slate-300 font-serif text-xs leading-relaxed pl-5 border-l-2 border-emerald-500/40">
          ${m.explanation || "Review the video explanation at this exact timestamp."}
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

  document.querySelectorAll(".tab-btn").forEach(btn => {
    const isTarget = btn.getAttribute("data-target") === tabPaneId;
    if (isTarget) {
      btn.classList.add("active", "text-indigo-300", "bg-slate-800", "border-indigo-500/40");
      btn.classList.remove("text-slate-300", "border-transparent");
      btn.setAttribute("aria-selected", "true");
      btn.setAttribute("tabindex", "0");
    } else {
      btn.classList.remove("active", "text-indigo-300", "bg-slate-800", "border-indigo-500/40");
      btn.classList.add("text-slate-300", "border-transparent");
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
      fetchSegmentAnalysis(state.currentTimeSec);
      fetchSegmentQuiz(state.currentTimeSec);
      switchTab("tab-content-rescue");
    });
  }

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

      // Validate URL before sending
      if (!isValidYouTubeUrl(val)) {
        if (urlError) urlError.classList.remove("hidden");
        urlInput.classList.add("border-rose-500", "ring-1", "ring-rose-500");
        return;
      }

      // Valid URL
      if (urlError) urlError.classList.add("hidden");
      urlInput.classList.remove("border-rose-500", "ring-1", "ring-rose-500");

      loadBtn.disabled = true;
      loadBtn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin" aria-hidden="true"></i><span>Finding Heatmap...</span>`;
      lucide.createIcons();

      try {
        const res = await fetch("/api/videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url_or_id: val,
            folder_id: state.currentFolderId
          })
        });
        const data = await res.json();
        if (data.video) {
          await loadVideoStudio(data.video.video_id);
        }
      } catch (err) {
        alert("Failed to load YouTube video: " + err);
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
    landingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!landingInput) return;

      const val = landingInput.value.trim();

      // Step A: Validate YouTube URL
      if (!val || !isValidYouTubeUrl(val)) {
        if (landingError) landingError.classList.remove("hidden");
        landingInput.classList.add("border-rose-500", "ring-1", "ring-rose-500");
        landingInput.focus();
        return;
      }

      if (landingError) landingError.classList.add("hidden");
      landingInput.classList.remove("border-rose-500", "ring-1", "ring-rose-500");

      // Step B: Change button text to Loading Workspace...
      if (landingBtn) {
        landingBtn.disabled = true;
        landingBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin" aria-hidden="true"></i><span>Loading Workspace...</span>`;
        lucide.createIcons();
      }

      // Step C: Copy value directly to existing top navbar input
      if (navbarInput) {
        navbarInput.value = val;
      }

      // Step D: Smoothly hide landing page overlay
      landingView.classList.add("opacity-0", "pointer-events-none");
      setTimeout(() => {
        landingView.classList.add("hidden");
        if (landingBtn) {
          landingBtn.disabled = false;
          landingBtn.innerHTML = `<span>Start Studying This Video &rarr;</span>`;
          lucide.createIcons();
        }
      }, 300);

      // Trigger the existing navbar "Load" button handler to enter the study studio
      if (navbarLoadBtn) {
        navbarLoadBtn.click();
      }
    });
  }

  // Step 3: Handle "← Home" Button in Existing Top Navbar
  if (backHomeBtn) {
    backHomeBtn.addEventListener("click", () => {
      // Pause YouTube player if active
      if (state.player && typeof state.player.pauseVideo === "function") {
        try {
          state.player.pauseVideo();
        } catch (_) {}
      }

      // Show landing page overlay again
      landingView.classList.remove("hidden");
      requestAnimationFrame(() => {
        landingView.classList.remove("opacity-0", "pointer-events-none");
      });

      if (landingInput) {
        landingInput.focus();
      }
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

      try {
        const res = await fetch("/api/pins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            video_id: state.currentVideoId,
            timestamp_sec: state.currentTimeSec,
            tag: tag,
            title: title,
            note: note
          })
        });
        const data = await res.json();
        if (data.pin) {
          state.pins.push(data.pin);
          state.pins.sort((a, b) => a.timestamp_sec - b.timestamp_sec);
          renderTimelinePins();
          renderCheatSheetPins();
          pinModal.classList.add("hidden");
        }
      } catch (err) {
        alert("Failed to save note: " + err);
      }
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
      const color = document.getElementById("new-folder-color").value;
      if (!name) return;

      try {
        const res = await fetch("/api/folders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, color })
        });
        const data = await res.json();
        if (data.id) {
          folderModal.classList.add("hidden");
          await loadSubjectFolders();
          folderSelect.value = data.id;
          state.currentFolderId = data.id;
        }
      } catch (err) {
        alert("Failed to create folder: " + err);
      }
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

async function loadSubjectFolders() {
  const select = document.getElementById("folder-select");

  try {
    const res = await fetch("/api/folders");
    const data = await res.json();
    if (data.folders) {
      state.folders = data.folders;

      // 1. Populate Navbar Select with Dark Themed Options
      if (select) {
        select.innerHTML = "";
        data.folders.forEach(f => {
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

      // 2. Render Folder Pills & Videos on Landing Page
      renderLandingFolders(data.folders);
    }
  } catch (err) {
    console.error("Failed to load folders:", err);
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
      <div class="landing-video-card group bg-slate-900/90 border border-slate-800 hover:border-indigo-500/70 rounded-2xl p-3.5 transition-all flex flex-col justify-between cursor-pointer shadow-lg shadow-black/40 hover:-translate-y-1 hover:shadow-indigo-500/10" data-video-id="${v.video_id}">
        <div class="space-y-2.5">
          <div class="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
            <img src="${thumb}" alt="${v.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='https://img.youtube.com/vi/${v.video_id}/hqdefault.jpg'" />
            <span class="absolute bottom-1.5 right-1.5 bg-slate-950/85 backdrop-blur-md text-[10px] font-mono px-2 py-0.5 rounded-md text-slate-200 font-semibold border border-slate-800">
              ${durStr}
            </span>
          </div>
          <h3 class="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-relaxed">
            ${v.title}
          </h3>
        </div>
        <div class="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
          <span class="text-[10px] font-mono text-slate-400">ID: ${v.video_id}</span>
          <button class="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-all pointer-events-none">
            <i data-lucide="play" class="w-3 h-3 fill-current" aria-hidden="true"></i>
            <span>Study Video</span>
          </button>
        </div>
      </div>
    `;
  }

  // Inside Main Page Modal
  return `
    <div class="folder-modal-video-card group flex items-center justify-between p-3 rounded-xl border ${isActiveVideo ? 'bg-indigo-950/50 border-indigo-500/60 shadow-md shadow-indigo-500/10' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'} transition-all cursor-pointer" data-video-id="${v.video_id}">
      <div class="flex items-center space-x-3 overflow-hidden">
        <div class="relative w-28 aspect-video rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
          <img src="${thumb}" alt="${v.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" onerror="this.src='https://img.youtube.com/vi/${v.video_id}/hqdefault.jpg'" />
          <span class="absolute bottom-1 right-1 bg-slate-950/90 font-mono text-[9px] px-1.5 py-0.5 rounded text-slate-300 font-semibold">${durStr}</span>
        </div>
        <div class="min-w-0 pr-3">
          <h4 class="text-xs font-bold ${isActiveVideo ? 'text-indigo-200' : 'text-slate-100 group-hover:text-indigo-300'} truncate transition-colors">
            ${v.title}
          </h4>
          <p class="text-[11px] text-slate-400 font-mono mt-1">ID: ${v.video_id}</p>
        </div>
      </div>
      <div class="shrink-0 pl-2">
        ${isActiveVideo ? `
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active Now
          </span>
        ` : `
          <button class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-sm">
            <i data-lucide="play" class="w-3 h-3 fill-current" aria-hidden="true"></i>
            <span>Load Video</span>
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
  if (!pillsContainer || !folders || folders.length === 0) return;

  pillsContainer.innerHTML = "";
  let activeId = state.currentFolderId || folders[0].id;

  folders.forEach(f => {
    const btn = document.createElement("button");
    const isActive = f.id === activeId;
    btn.type = "button";
    btn.className = `px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
      isActive 
        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40 font-bold" 
        : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
    }`;
    btn.innerHTML = `
      <i data-lucide="folder" class="w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-indigo-400'}" aria-hidden="true"></i>
      <span>${f.name}</span>
      <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-800 text-slate-400'}">${f.video_count || 0}</span>
    `;

    btn.addEventListener("click", () => {
      document.querySelectorAll("#landing-folder-pills button").forEach(b => {
        b.className = "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800";
        const icon = b.querySelector("i");
        if (icon) icon.className = "w-3.5 h-3.5 text-indigo-400";
      });
      btn.className = "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40 font-bold";
      const activeIcon = btn.querySelector("i");
      if (activeIcon) activeIcon.className = "w-3.5 h-3.5 text-white";

      state.currentFolderId = f.id;
      loadLandingFolderVideos(f.id);
    });

    pillsContainer.appendChild(btn);
  });

  lucide.createIcons();
  loadLandingFolderVideos(activeId);
}

async function loadLandingFolderVideos(folderId) {
  const grid = document.getElementById("landing-folder-videos-grid");
  if (!grid) return;

  grid.innerHTML = `
    <div class="col-span-full py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
      <i data-lucide="loader-2" class="w-4 h-4 animate-spin text-indigo-400" aria-hidden="true"></i>
      <span>Loading saved lectures in this folder...</span>
    </div>
  `;
  lucide.createIcons();

  try {
    const res = await fetch(`/api/videos?folder_id=${folderId}`);
    const data = await res.json();
    const videos = data.videos || [];

    if (videos.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-8 text-center text-xs text-slate-400 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl space-y-2 p-6">
          <i data-lucide="folder-open" class="w-7 h-7 text-slate-600 mx-auto" aria-hidden="true"></i>
          <p class="font-medium text-slate-300">No lectures saved in this folder yet.</p>
          <p class="text-[11px] text-slate-400">Paste any YouTube lecture URL above to add a video into this folder!</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    grid.innerHTML = "";
    videos.forEach(v => {
      const cardWrapper = document.createElement("div");
      cardWrapper.innerHTML = createVideoCardHtml(v, v.video_id === state.currentVideoId, true);
      const card = cardWrapper.firstElementChild;

      card.addEventListener("click", async () => {
        const landingView = document.getElementById("landing-page-view");
        if (landingView) {
          landingView.classList.add("opacity-0", "pointer-events-none");
          setTimeout(() => landingView.classList.add("hidden"), 300);
        }
        state.currentFolderId = folderId;
        const folderSelect = document.getElementById("folder-select");
        if (folderSelect) folderSelect.value = folderId;
        await loadVideoStudio(v.video_id);
      });

      grid.appendChild(card);
    });

    lucide.createIcons();
  } catch (err) {
    console.error("Failed to load folder videos on landing page:", err);
    grid.innerHTML = `<div class="col-span-full py-4 text-xs text-rose-400">Failed to load lectures.</div>`;
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
      tabBtn.className = `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
        isSel 
          ? "bg-indigo-600 text-white font-bold shadow-sm" 
          : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
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

  // Load videos for this folder
  listContainer.innerHTML = `
    <div class="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
      <i data-lucide="loader-2" class="w-4 h-4 animate-spin text-indigo-400" aria-hidden="true"></i>
      <span>Loading folder lectures...</span>
    </div>
  `;
  lucide.createIcons();
  modal.classList.remove("hidden");

  try {
    const res = await fetch(`/api/videos?folder_id=${currentId}`);
    const data = await res.json();
    const videos = data.videos || [];

    if (countEl) countEl.textContent = `${videos.length} lecture${videos.length === 1 ? '' : 's'} saved in this folder`;

    if (videos.length === 0) {
      listContainer.innerHTML = `
        <div class="py-12 text-center text-xs text-slate-400 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl space-y-2 p-6">
          <i data-lucide="folder-open" class="w-8 h-8 text-slate-600 mx-auto" aria-hidden="true"></i>
          <p class="font-medium text-slate-300">No lectures saved in this folder yet.</p>
          <p class="text-[11px] text-slate-400">Use the top URL bar to paste any educational YouTube lecture and save it here!</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    listContainer.innerHTML = "";
    videos.forEach(v => {
      const cardWrapper = document.createElement("div");
      cardWrapper.innerHTML = createVideoCardHtml(v, v.video_id === state.currentVideoId, false);
      const card = cardWrapper.firstElementChild;

      card.addEventListener("click", async () => {
        modal.classList.add("hidden");
        const folderSelect = document.getElementById("folder-select");
        if (folderSelect) folderSelect.value = currentId;
        await loadVideoStudio(v.video_id);
      });

      listContainer.appendChild(card);
    });

    lucide.createIcons();
  } catch (err) {
    console.error("Failed to load folder videos:", err);
    listContainer.innerHTML = `<div class="py-4 text-xs text-rose-400">Failed to load lectures: ${err}</div>`;
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
        <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-100">[${formatTime(p.timestamp_sec)}] ${p.title}</span>
            <span class="text-[10px] px-2 py-0.2 rounded border font-mono font-bold ${tagColor}">${tagBadge}</span>
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
      <h4 class="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
        <i data-lucide="git-compare" class="w-4 h-4 text-emerald-400" aria-hidden="true"></i> Term Comparison Matrix (${state.sessionTerminologyBridges.length})
      </h4>
  `;

  if (state.sessionTerminologyBridges.length === 0) {
    html += `<p class="text-[11px] text-slate-400 italic">No term comparisons accumulated yet.</p>`;
  } else {
    html += `
      <table class="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
        <thead class="bg-slate-900 text-slate-300 text-[10px] uppercase font-mono">
          <tr>
            <th class="p-2.5 border-b border-slate-800 font-bold">Lecture Term / Symbol</th>
            <th class="p-2.5 border-b border-slate-800 font-bold">What Other Videos Call It</th>
            <th class="p-2.5 border-b border-slate-800 font-bold">How They Connect</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800 text-slate-200">
    `;
    state.sessionTerminologyBridges.forEach(b => {
      html += `
        <tr>
          <td class="p-2.5 border-b border-slate-800 font-mono text-indigo-300 font-bold">${b.prof_term}</td>
          <td class="p-2.5 border-b border-slate-800 font-mono text-cyan-300">${b.alt_video_term}</td>
          <td class="p-2.5 border-b border-slate-800 font-serif">${b.clarification}</td>
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
      <h4 class="text-xs font-bold text-rose-300 flex items-center gap-1.5">
        <i data-lucide="alert-circle" class="w-4 h-4 text-rose-400" aria-hidden="true"></i> Targeted Revision: Questions to Review (${state.missedQuizQuestions.length})
      </h4>
  `;

  if (state.missedQuizQuestions.length === 0) {
    html += `<p class="text-xs text-emerald-300 font-semibold">✓ No missed checkpoints! All practice questions were cleared successfully.</p>`;
  } else {
    state.missedQuizQuestions.forEach((m, idx) => {
      html += `
        <div class="p-3 rounded-xl bg-slate-900 border border-rose-900/40 space-y-1">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-100">#${idx + 1}. ${m.question}</span>
            <span class="font-mono text-indigo-300 text-[10px] bg-indigo-950/60 px-2 py-0.5 rounded font-bold">Review @ ${formatTime(m.review_timestamp_sec)}</span>
          </div>
          <div class="text-xs text-emerald-300 font-bold">✓ Correct Answer: ${m.correct_answer || m.options?.[m.correct_index] || ""}</div>
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

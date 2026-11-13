// src/App.jsx
import React, { useState } from 'react';
import { Cpu, FlaskConical, Sparkles, Video, CheckCircle2, Check } from 'lucide-react';
import TopoRecallLab from './features/topo-recall/TopoRecallLab';
import YouTubeGeneratorBar from './features/topo-recall/YouTubeGeneratorBar';
import YouTubePlayer from './features/topo-recall/YouTubePlayer';
import { DEFAULT_CHALLENGES } from './features/topo-recall/labHelpers';
import { YOUTUBE_PRESETS } from './features/topo-recall/youtubeUtils';

export default function App() {
  const [completedIds, setCompletedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('toporecall_completed') || '[]');
    } catch {
      return [];
    }
  });

  const [aiChallenges, setAiChallenges] = useState([]);
  const [activeChallengeId, setActiveChallengeId] = useState(DEFAULT_CHALLENGES[0].id);
  const [showVideo, setShowVideo] = useState(true);

  // Challenge list: AI generated + Real YouTube Presets + Default offline levels
  const allChallenges = [
    ...aiChallenges,
    ...YOUTUBE_PRESETS,
    ...DEFAULT_CHALLENGES,
  ];

  const activeChallenge =
    allChallenges.find((c) => c.id === activeChallengeId) || allChallenges[0];

  const handleChallengeGenerated = (newChal) => {
    setAiChallenges((prev) => [newChal, ...prev]);
    setActiveChallengeId(newChal.id);
    if (newChal.videoId) {
      setShowVideo(true);
    }
  };

  const handleSelectPreset = (preset) => {
    setActiveChallengeId(preset.id);
    setShowVideo(true);
  };

  const handleCompleteLevel = (id) => {
    if (!completedIds.includes(id)) {
      const updated = [...completedIds, id];
      setCompletedIds(updated);
      try {
        localStorage.setItem('toporecall_completed', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save progress', e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      {/* Top Application Header */}
      <header className="h-14 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-black text-sm">
            ⚡
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-slate-100 flex items-center gap-2">
              <span>TopoRecall</span>
              <span className="text-[10px] font-semibold text-rose-400 bg-rose-950/50 border border-rose-800/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Video className="w-2.5 h-2.5" /> Video Lab
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Interactive Schematic & Molecular Topology Recall from YouTube Lectures
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeChallenge?.videoId && (
            <button
              onClick={() => setShowVideo(!showVideo)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                showVideo
                  ? 'bg-rose-950/60 border-rose-700/60 text-rose-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-rose-400" />
              <span>{showVideo ? 'Hide Video' : 'Show Video'}</span>
            </button>
          )}

          <div className="text-xs bg-indigo-950/80 border border-indigo-700/60 px-3 py-1 rounded-full text-indigo-200 flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Solved: {completedIds.length} / {allChallenges.length}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-3 sm:p-4 flex flex-col h-[calc(100vh-56px)] overflow-hidden">
        {/* YouTube Extractor Input Bar */}
        <YouTubeGeneratorBar
          onChallengeGenerated={handleChallengeGenerated}
          onSelectPreset={handleSelectPreset}
        />

        {/* Challenge Switcher Tabs */}
        <div className="flex items-center gap-2 pb-2.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Labs:
          </span>
          {allChallenges.map((c) => {
            const isActive = c.id === activeChallenge.id;
            const isSolved = completedIds.includes(c.id);

            return (
              <button
                key={c.id}
                onClick={() => setActiveChallengeId(c.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                  isActive
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {c.domain === 'ece' ? (
                  <Cpu className="w-3.5 h-3.5 text-indigo-300" />
                ) : (
                  <FlaskConical className="w-3.5 h-3.5 text-emerald-300" />
                )}
                <span>{c.title}</span>
                {c.videoId && (
                  <span className="text-[9px] px-1 py-0.2 bg-rose-950/80 text-rose-300 border border-rose-800/40 rounded">
                    ▶ Video
                  </span>
                )}
                {isSolved && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Lab Content Area (Side-by-side Video Player + Interactive Canvas) */}
        <div className="flex-1 flex gap-3 overflow-hidden min-h-0">
          {/* Embedded YouTube Player Panel (when video is active & toggled) */}
          {activeChallenge?.videoId && showVideo && (
            <div className="w-80 md:w-96 shrink-0 flex flex-col gap-2 overflow-y-auto">
              <YouTubePlayer
                videoId={activeChallenge.videoId}
                timestampSec={activeChallenge.timestampSec || 0}
                title={activeChallenge.title}
                isCollapsed={false}
                onToggleCollapse={() => setShowVideo(false)}
              />
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-400 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Recall Challenge</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Study the schematic or chemical reaction taught at timestamp{' '}
                  <span className="text-amber-300 font-mono font-medium">
                    {activeChallenge.timestampSec ? `${Math.floor(activeChallenge.timestampSec / 60)}:${(activeChallenge.timestampSec % 60).toString().padStart(2, '0')}` : '00:00'}
                  </span>
                  . Place components on the canvas and wire them together from memory!
                </p>
              </div>
            </div>
          )}

          {/* Interactive Topology Board */}
          <TopoRecallLab
            key={activeChallenge.id}
            challenge={activeChallenge}
            onCompleteLevel={handleCompleteLevel}
            isLevelCompleted={completedIds.includes(activeChallenge.id)}
            showVideo={showVideo}
            onToggleVideo={() => setShowVideo(!showVideo)}
          />
        </div>
      </main>
    </div>
  );
}

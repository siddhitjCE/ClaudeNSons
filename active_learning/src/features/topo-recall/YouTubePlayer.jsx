// src/features/topo-recall/YouTubePlayer.jsx
import React, { useState } from 'react';
import { ExternalLink, Minimize2, Maximize2, RotateCcw, Video } from 'lucide-react';
import { formatSeconds } from './youtubeUtils';

export default function YouTubePlayer({
  videoId,
  timestampSec = 0,
  title = 'Lecture Video',
  isCollapsed = false,
  onToggleCollapse,
}) {
  const [iframeKey, setIframeKey] = useState(0);

  if (!videoId) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-slate-500" />
          <span>No YouTube video loaded for this level. Paste a video above or select a preset!</span>
        </div>
      </div>
    );
  }

  const startSec = Math.max(0, Math.floor(timestampSec));
  const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${startSec}&autoplay=0&rel=0`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all">
      {/* Player Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs">{title}</span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
            ▶ {formatSeconds(startSec)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIframeKey((prev) => prev + 1)}
            title="Replay from clip start"
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer text-[11px]"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Replay</span>
          </button>

          <a
            href={`https://www.youtube.com/watch?v=${videoId}&t=${startSec}s`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in YouTube"
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-[11px]"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden sm:inline">YouTube</span>
          </a>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Expand video' : 'Minimize video'}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              {isCollapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Video Iframe */}
      {!isCollapsed && (
        <div className="relative w-full aspect-video bg-black">
          <iframe
            key={iframeKey}
            src={embedUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}

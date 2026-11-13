// src/features/topo-recall/YouTubeGeneratorBar.jsx
import React, { useState, useEffect } from 'react';
import { Sparkles, Key, Video, Clock, Eye, EyeOff, Loader2, AlertCircle, Check } from 'lucide-react';
import {
  extractYouTubeInfo,
  parseTimestampToSeconds,
  formatSeconds,
  callGeminiForVideo,
  sanitizeChallenge,
  YOUTUBE_PRESETS,
} from './youtubeUtils';

export default function YouTubeGeneratorBar({ onChallengeGenerated, onSelectPreset }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [ytUrl, setYtUrl] = useState('');
  const [timestamp, setTimestamp] = useState('02:30');
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          if (next <= 4) setLoadingStage(`Ingesting clip around ${timestamp}... (${next}s)`);
          else if (next <= 10) setLoadingStage(`Analyzing circuit/chemical frames with Gemini... (${next}s)`);
          else setLoadingStage(`Generating netlist schema & verification rules... (${next}s)`);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [loading, timestamp]);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
    }
  }, [apiKey]);

  // When user pastes a URL that has a timestamp in it, auto-fill timestamp field
  const handleUrlChange = (e) => {
    const val = e.target.value;
    setYtUrl(val);
    setError('');
    const info = extractYouTubeInfo(val);
    if (info.timestampSec !== null) {
      setTimestamp(formatSeconds(info.timestampSec));
    }
  };

  const handleApplyPreset = (preset, instantLoad = false) => {
    setYtUrl(preset.videoUrl);
    setTimestamp(preset.timestamp);
    setError('');
    if (instantLoad && onSelectPreset) {
      onSelectPreset(preset);
      setSuccessMsg(`Loaded demo lab: "${preset.title}" with video player!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!apiKey.trim()) {
      setError('Please enter your Google AI Studio API Key first (or click an Instant Demo preset below).');
      return;
    }

    const { videoId, cleanUrl } = extractYouTubeInfo(ytUrl);
    if (!videoId) {
      setError('Please provide a valid public YouTube URL (e.g., https://www.youtube.com/watch?v=... or https://youtu.be/...).');
      return;
    }

    const centerSec = parseTimestampToSeconds(timestamp);
    const startSec = Math.max(0, centerSec - 45);
    const endSec = centerSec + 45;

    setElapsed(0);
    setLoading(true);
    setLoadingStage('Connecting to Gemini API & analyzing video clip...');

    try {
      const { parsed, modelUsed } = await callGeminiForVideo({
        apiKey: apiKey.trim(),
        cleanYtUrl: cleanUrl,
        startSec,
        endSec,
        preferredModel: selectedModel,
      });

      const newChallenge = sanitizeChallenge(parsed, cleanUrl, centerSec, videoId);
      onChallengeGenerated(newChallenge);

      setSuccessMsg(`Generated "${newChallenge.title}" using ${modelUsed}!`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error('YouTube Generation Error:', err);
      setError(err.message || 'Failed to generate structure from YouTube video.');
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 mb-3 shadow-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
            <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <Video className="w-3.5 h-3.5" />
            <span>YouTube-to-Lab Generator:</span>
          </div>

          {/* Preset Buttons for Quick Testing */}
          <div className="flex items-center flex-wrap gap-1.5 text-[11px]">
            <span className="text-slate-400 text-[10px] hidden sm:inline">Try Demo:</span>
            {YOUTUBE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p, true)}
                className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-indigo-950 hover:text-indigo-200 border border-slate-700/80 text-slate-300 transition cursor-pointer text-[10px]"
                title={`Load Instant Demo: ${p.title}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* API Key */}
          <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 w-44 shrink-0 focus-within:border-indigo-500">
            <Key className="w-3 h-3 text-slate-500 mr-1.5 shrink-0" />
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Gemini API Key"
              className="bg-transparent text-xs text-slate-200 focus:outline-none w-full pr-5"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 text-slate-500 hover:text-slate-300 cursor-pointer"
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          </div>

          {/* YouTube URL */}
          <div className="flex-1 min-w-[200px] flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 focus-within:border-indigo-500">
            <Video className="w-3 h-3 text-slate-500 mr-2 shrink-0" />
            <input
              type="url"
              value={ytUrl}
              onChange={handleUrlChange}
              placeholder="Paste YouTube Video URL (e.g. https://www.youtube.com/watch?v=...)"
              className="bg-transparent text-xs text-slate-200 focus:outline-none w-full"
            />
          </div>

          {/* Timestamp */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 w-24 shrink-0 focus-within:border-indigo-500" title="Clip Timestamp (mm:ss or seconds)">
            <Clock className="w-3 h-3 text-slate-500 mr-1.5 shrink-0" />
            <input
              type="text"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              placeholder="02:30"
              className="bg-transparent text-xs text-slate-200 focus:outline-none w-full font-mono text-center"
            />
          </div>

          {/* Model Selector */}
          <div className="shrink-0 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent text-[11px] text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="gemini-3.8-flash" className="bg-slate-900 text-white">Gemini 3.8 Flash (Latest)</option>
              <option value="gemini-2.5-flash" className="bg-slate-900 text-white">Gemini 2.5 Flash</option>
              <option value="gemini-2.0-flash" className="bg-slate-900 text-white">Gemini 2.0 Flash</option>
              <option value="gemini-1.5-flash" className="bg-slate-900 text-white">Gemini 1.5 Flash</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow transition cursor-pointer shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing Video...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Generate Lab</span>
              </>
            )}
          </button>
        </div>

        {/* Loading / Status / Error feedback */}
        {loading && (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-indigo-300 bg-indigo-950/40 border border-indigo-800/40 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400 shrink-0" />
              <span>{loadingStage}</span>
            </div>
            {elapsed > 12 && (
              <span className="text-[11px] text-amber-300">
                (Google video processing can take 15–20s for long lectures)
              </span>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-950/60 border border-rose-800/60 rounded-lg px-3 py-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/50 border border-emerald-800/50 rounded-lg px-3 py-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </form>
    </div>
  );
}

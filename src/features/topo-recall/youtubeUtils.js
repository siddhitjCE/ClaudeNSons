// src/features/topo-recall/youtubeUtils.js

/**
 * Parses user timestamp strings into integer seconds.
 * Supports:
 * - "02:30" or "2:30" (mm:ss) -> 150
 * - "01:15:30" (hh:mm:ss) -> 4530
 * - "2m15s" or "90s" or "2m" -> 135 / 90 / 120
 * - "150" (raw seconds) -> 150
 */
export function parseTimestampToSeconds(input) {
  if (input === null || input === undefined || input === '') return 120;
  const str = input.toString().trim();

  // 1h2m3s / 2m15s / 90s
  const hourMatch = str.match(/(\d+)\s*h/i);
  const minMatch = str.match(/(\d+)\s*m/i);
  const secMatch = str.match(/(\d+)\s*s/i);
  if (hourMatch || minMatch || secMatch) {
    const h = hourMatch ? parseInt(hourMatch[1], 10) : 0;
    const m = minMatch ? parseInt(minMatch[1], 10) : 0;
    const s = secMatch ? parseInt(secMatch[1], 10) : 0;
    return h * 3600 + m * 60 + s;
  }

  // mm:ss or hh:mm:ss
  if (str.includes(':')) {
    const parts = str.split(':').map((p) => parseInt(p, 10) || 0);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
  }

  const num = parseInt(str, 10);
  return isNaN(num) || num < 0 ? 120 : num;
}

/**
 * Formats seconds into mm:ss or hh:mm:ss string.
 */
export function formatSeconds(totalSec) {
  const s = Math.max(0, Math.floor(totalSec || 0));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  const pad = (n) => n.toString().padStart(2, '0');
  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Extracts 11-char YouTube Video ID and any timestamp from public URL.
 */
export function extractYouTubeInfo(url) {
  if (!url || typeof url !== 'string') return { videoId: null, timestampSec: null, cleanUrl: null };
  const str = url.trim();

  // Standard video ID regex covering watch, youtu.be, embed, shorts, live
  const idMatch = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+?&v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/i);
  const videoId = idMatch ? idMatch[1] : null;

  // Check URL parameter for time (&t=120 or &t=2m15s or ?t=90)
  const tMatch = str.match(/[?&]t=([0-9a-zA-Z]+)/i);
  let timestampSec = null;
  if (tMatch) {
    timestampSec = parseTimestampToSeconds(tMatch[1]);
  }

  const cleanUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : str;
  return { videoId, timestampSec, cleanUrl };
}

/**
 * Pre-analyzed sample challenges from real YouTube educational videos.
 * Allows users to test the video-to-structure feature instantly without an API key.
 */
export const YOUTUBE_PRESETS = [
  {
    id: 'preset_opamp_inverting',
    label: '⚡ ECE: Inverting Op-Amp (MIT)',
    videoUrl: 'https://www.youtube.com/watch?v=7FYHt5XviKc',
    videoId: '7FYHt5XviKc',
    timestamp: '02:30',
    timestampSec: 150,
    domain: 'ece',
    title: 'Inverting Amplifier (Op-Amp)',
    formula: 'V_out = -(Rf / Rin) * Vin',
    prompt: 'Construct the classic Inverting Op-Amp circuit from the lecture. Connect Vin through Rin into In−, place feedback resistor Rf between In− and Out, and ground In+.',
    palette: [
      { type: 'OPAMP', label: 'Op-Amp', sub: 'Active', ports: ['IN_MINUS', 'IN_PLUS', 'OUT'], isDistractor: false },
      { type: 'RES_IN', label: 'Input Resistor (Rin)', sub: 'Passive', ports: ['P1', 'P2'], isDistractor: false },
      { type: 'RES_F', label: 'Feedback Resistor (Rf)', sub: 'Passive', ports: ['P1', 'P2'], isDistractor: false },
      { type: 'VIN', label: 'Input Source (Vin)', sub: 'Source', ports: ['OUT'], isDistractor: false },
      { type: 'GND', label: 'Ground (GND)', sub: 'Ref (0V)', ports: ['GND'], isDistractor: false },
      { type: 'CAP', label: 'Bypass Cap (C)', sub: 'Distractor', ports: ['P1', 'P2'], isDistractor: true },
    ],
    expectedConnections: [
      { fromType: 'VIN', fromPort: 'OUT', toType: 'RES_IN', toPort: 'P1' },
      { fromType: 'RES_IN', fromPort: 'P2', toType: 'OPAMP', toPort: 'IN_MINUS' },
      { fromType: 'OPAMP', fromPort: 'IN_MINUS', toType: 'RES_F', toPort: 'P1' },
      { fromType: 'RES_F', fromPort: 'P2', toType: 'OPAMP', toPort: 'OUT' },
      { fromType: 'OPAMP', fromPort: 'IN_PLUS', toType: 'GND', toPort: 'GND' },
    ],
    diagnosticHint: 'In− receives Vin via Rin and feedback Rf from Out. In+ must be grounded (0V virtual ground).',
  },
  {
    id: 'preset_aspirin_synth',
    label: '🧪 CHEM: Aspirin Synthesis (Organic)',
    videoUrl: 'https://www.youtube.com/watch?v=Y4NMpO1xI8U',
    videoId: 'Y4NMpO1xI8U',
    timestamp: '03:45',
    timestampSec: 225,
    domain: 'chem',
    title: 'Aspirin (Acetylsalicylic Acid)',
    formula: '2-acetoxybenzoic acid (C9H8O4)',
    prompt: 'Synthesize Acetylsalicylic Acid (Aspirin) from the lecture mechanism. Attach the Carboxyl group (-COOH) to C1 and the Acetoxy ester (-OCOCH3) to ortho position C2 on the Benzene ring.',
    palette: [
      { type: 'BENZENE', label: 'Benzene Core', sub: 'Parent Aromatic', ports: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'], isDistractor: false },
      { type: 'COOH', label: '-COOH (Carboxylic Acid)', sub: 'Functional Group', ports: ['BOND'], isDistractor: false },
      { type: 'OCOCH3', label: '-OCOCH₃ (Acetoxy Ester)', sub: 'Substituent', ports: ['BOND'], isDistractor: false },
      { type: 'NO2', label: '-NO₂ (Nitro Group)', sub: 'Distractor', ports: ['BOND'], isDistractor: true },
    ],
    expectedConnections: [
      { fromType: 'COOH', fromPort: 'BOND', toType: 'BENZENE', toPort: 'C1' },
      { fromType: 'OCOCH3', fromPort: 'BOND', toType: 'BENZENE', toPort: 'C2' },
    ],
    diagnosticHint: 'Aspirin is an ortho-disubstituted aromatic compound with -COOH at C1 and -OCOCH3 at C2.',
  },
  {
    id: 'preset_555_astable',
    label: '⏱ ECE: 555 Astable Oscillator',
    videoUrl: 'https://www.youtube.com/watch?v=kRlSFm519Bo',
    videoId: 'kRlSFm519Bo',
    timestamp: '04:10',
    timestampSec: 250,
    domain: 'ece',
    title: '555 Timer Astable Multivibrator',
    formula: 'f = 1.44 / ((RA + 2*RB) * C)',
    prompt: 'Construct the 555 Astable Oscillator: Connect Timing Capacitor C from Threshold/Trigger to GND, tie TRIG and THRESH together, and feed DISCHARGE via timing resistor RA from VCC.',
    palette: [
      { type: 'IC555', label: '555 Timer IC', sub: 'IC', ports: ['GND', 'TRIG', 'OUT', 'RESET', 'CTRL', 'THRESH', 'DISCH', 'VCC'], isDistractor: false },
      { type: 'RA', label: 'Timing Resistor RA', sub: 'Passive', ports: ['P1', 'P2'], isDistractor: false },
      { type: 'RB', label: 'Timing Resistor RB', sub: 'Passive', ports: ['P1', 'P2'], isDistractor: false },
      { type: 'C_TIMING', label: 'Timing Cap C', sub: 'Capacitor', ports: ['P1', 'P2'], isDistractor: false },
      { type: 'VCC', label: 'Power (Vcc)', sub: 'Source', ports: ['OUT'], isDistractor: false },
      { type: 'GND', label: 'Ground (GND)', sub: 'Ref (0V)', ports: ['GND'], isDistractor: false },
      { type: 'INDUCTOR', label: 'Inductor (L)', sub: 'Distractor', ports: ['P1', 'P2'], isDistractor: true },
    ],
    expectedConnections: [
      { fromType: 'VCC', fromPort: 'OUT', toType: 'IC555', toPort: 'VCC' },
      { fromType: 'VCC', fromPort: 'OUT', toType: 'RA', toPort: 'P1' },
      { fromType: 'RA', fromPort: 'P2', toType: 'IC555', toPort: 'DISCH' },
      { fromType: 'IC555', fromPort: 'DISCH', toType: 'RB', toPort: 'P1' },
      { fromType: 'RB', fromPort: 'P2', toType: 'IC555', toPort: 'THRESH' },
      { fromType: 'IC555', fromPort: 'THRESH', toType: 'IC555', toPort: 'TRIG' },
      { fromType: 'IC555', fromPort: 'TRIG', toType: 'C_TIMING', toPort: 'P1' },
      { fromType: 'C_TIMING', fromPort: 'P2', toType: 'GND', toPort: 'GND' },
      { fromType: 'IC555', fromPort: 'GND', toType: 'GND', toPort: 'GND' },
    ],
    diagnosticHint: 'In astable mode, THRESH and TRIG are tied together and connected to timing capacitor C. RA connects VCC to DISCH, and RB connects DISCH to THRESH.',
  },
];

/**
 * Calls Gemini API to analyze a YouTube video at a specific timestamp range.
 * Uses gemini-3.8-flash by default with automatic fallback to other versions.
 */
export async function callGeminiForVideo({ apiKey, cleanYtUrl, startSec, endSec, preferredModel = 'gemini-3.8-flash' }) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Google AI Studio API Key is required. Get a free key at aistudio.google.com.');
  }

  const trimmedKey = apiKey.trim();
  const modelsToTry = [preferredModel, 'gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'].filter(
    (m, idx, arr) => arr.indexOf(m) === idx
  );

  const centerFormatted = formatSeconds(startSec + Math.round((endSec - startSec) / 2));

  const promptText = `You are an expert STEM educator and schematic/structure extractor.
Analyze this public YouTube educational video clip between timestamp ${startSec}s and ${endSec}s (around ${centerFormatted}).
Identify the main electronic circuit schematic, organic chemical compound/reaction mechanism, or system architecture taught or drawn on the board in this clip.

You MUST return ONLY a valid, parseable JSON object adhering to this EXACT schema (do not wrap in markdown or include conversational text):
{
  "title": "Clear Title of Circuit or Chemical Molecule",
  "domain": "ece" or "chem",
  "formula": "Governing mathematical formula (e.g. V_out = -Rf/Rin * Vin) or IUPAC name / chemical formula",
  "prompt": "Clear instruction for the student to construct and wire this exact topology from memory.",
  "palette": [
    {
      "type": "UPPERCASE_IDENTIFIER",
      "label": "Human-readable label",
      "sub": "Active | Passive | Source | Functional Group | Parent",
      "ports": ["PORT1", "PORT2"],
      "isDistractor": false
    }
  ],
  "expectedConnections": [
    {
      "fromType": "UPPERCASE_TYPE_A",
      "fromPort": "PORT_ON_A",
      "toType": "UPPERCASE_TYPE_B",
      "toPort": "PORT_ON_B"
    }
  ],
  "diagnosticHint": "Helpful hint explaining the key topological connection if the student gets stuck."
}

Rules:
1. Standard components for ECE:
   - 'OPAMP' (ports: ["IN_MINUS", "IN_PLUS", "OUT"])
   - 'RES' (ports: ["P1", "P2"])
   - 'CAP' (ports: ["P1", "P2"])
   - 'VIN' (ports: ["OUT"])
   - 'GND' (ports: ["GND"])
2. Standard components for CHEM:
   - 'BENZENE' (ports: ["C1", "C2", "C3", "C4", "C5", "C6"])
   - 'OH' (ports: ["BOND"])
   - 'NO2' (ports: ["BOND"])
   - 'COOH' (ports: ["BOND"])
   - 'CH3' (ports: ["BOND"])
   - 'CL' (ports: ["BOND"])
3. Always include 1 plausible distractor component in palette with "isDistractor": true.
4. Ensure every port in "expectedConnections" exists in that component's "ports" array.
5. Keep component types in uppercase and match them consistently between palette and expectedConnections.`;

  let lastError = null;

  // 1. Try Google Interactions API first (recommended by Google for gemini-3.8-flash)
  try {
    const interactionsUrl = `https://generativelanguage.googleapis.com/v1beta/interactions?key=${trimmedKey}`;
    const intRes = await fetch(interactionsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': trimmedKey,
      },
      body: JSON.stringify({
        model: 'gemini-3.8-flash',
        input: [
          {
            type: 'video',
            uri: cleanYtUrl,
            mime_type: 'video/*',
          },
          {
            type: 'text',
            text: promptText,
          },
        ],
      }),
    });

    const intData = await intRes.json();
    if (intRes.ok && !intData.error) {
      let rawText = intData.output_text;
      if (!rawText && Array.isArray(intData.steps)) {
        for (const step of intData.steps) {
          if (Array.isArray(step.content)) {
            for (const item of step.content) {
              if (item.type === 'text' && item.text) {
                rawText = item.text;
                break;
              }
            }
          }
        }
      }

      if (rawText) {
        const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return { parsed, modelUsed: 'gemini-3.8-flash (Interactions API)' };
        }
      }
    }
  } catch (e) {
    console.warn('Interactions API fallback to generateContent:', e);
  }

  // 2. Fallback to standard generateContent across available models
  for (const model of modelsToTry) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${trimmedKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(25000),
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  fileData: {
                    fileUri: cleanYtUrl,
                    mimeType: 'video/mp4',
                  },
                  videoMetadata: {
                    startOffset: { seconds: startSec },
                    endOffset: { seconds: endSec },
                  },
                },
                {
                  text: promptText,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        const errMsg = data.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        // If model not found (404) or deprecated / no longer available, continue to next fallback model
        const isModelUnavailable =
          response.status === 404 ||
          errMsg.toLowerCase().includes('not found') ||
          errMsg.toLowerCase().includes('no longer available') ||
          errMsg.toLowerCase().includes('deprecated');

        if (isModelUnavailable) {
          lastError = new Error(`Model ${model} not available on this API key: ${errMsg}`);
          continue;
        }
        throw new Error(errMsg);
      }

      const candidate = data.candidates?.[0];
      if (!candidate) {
        const blockReason = data.promptFeedback?.blockReason || 'No candidates returned by Gemini.';
        throw new Error(`Content generation blocked: ${blockReason}`);
      }

      const rawText = candidate.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Gemini API returned an empty response body.');
      }

      // Clean markdown code blocks if present
      const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse valid JSON from the Gemini response.');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return { parsed, modelUsed: model };
    } catch (err) {
      lastError = err;
      // Do not retry on bad API key
      if (err.message.includes('API_KEY_INVALID') || err.message.includes('API key not valid')) {
        throw err;
      }
    }
  }

  throw lastError || new Error('All model attempts failed to generate lab.');
}

/**
 * Validates and normalizes parsed AI lab schema.
 */
export function sanitizeChallenge(parsed, ytUrl, timestampSec, videoId) {
  const domain = parsed.domain === 'chem' ? 'chem' : 'ece';
  const title = (parsed.title || 'Custom Video Lab').trim();
  const formula = (parsed.formula || '').trim();
  const prompt = (parsed.prompt || 'Construct the topology demonstrated in the lecture video.').trim();

  // Normalize palette
  const rawPalette = Array.isArray(parsed.palette) ? parsed.palette : [];
  const palette = rawPalette.map((item, idx) => {
    const type = (item.type || `COMP_${idx + 1}`).toUpperCase().trim();
    const ports = Array.isArray(item.ports) && item.ports.length > 0
      ? item.ports.map((p) => p.toString().toUpperCase().trim())
      : ['P1', 'P2'];
    return {
      type,
      label: item.label || type,
      sub: item.sub || (item.isDistractor ? 'Distractor' : 'Component'),
      ports,
      isDistractor: Boolean(item.isDistractor),
    };
  });

  // Normalize expectedConnections
  const rawConn = Array.isArray(parsed.expectedConnections) ? parsed.expectedConnections : [];
  const expectedConnections = rawConn.map((c) => ({
    fromType: (c.fromType || '').toUpperCase().trim(),
    fromPort: (c.fromPort || '').toUpperCase().trim(),
    toType: (c.toType || '').toUpperCase().trim(),
    toPort: (c.toPort || '').toUpperCase().trim(),
  })).filter((c) => c.fromType && c.toType);

  return {
    id: `yt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    domain,
    title,
    formula,
    prompt,
    palette,
    expectedConnections,
    diagnosticHint: parsed.diagnosticHint || 'Carefully check the pin connections shown in the lecture video.',
    videoUrl: ytUrl,
    videoId: videoId || null,
    timestampSec: timestampSec || 0,
  };
}

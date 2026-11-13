// src/features/topo-recall/ComponentSymbol.jsx
import React from 'react';

/**
 * Authentic vector schematic symbols where terminal lead lines align
 * with pixel perfection to the glowing port boundary coordinates.
 */
export default function ComponentSymbol({
  type = '',
  label = '',
  width = 120,
  height = 52,
  className = 'w-full h-full',
}) {
  const norm = (type || '').toUpperCase().trim();

  // 1. Resistors (RES, RES_IN, RES_F, RA, RB)
  // Terminal P1 is at (0, 26) and P2 is at (120, 26)
  if (['RES', 'RES_IN', 'RES_F', 'RA', 'RB'].includes(norm)) {
    return (
      <svg
        viewBox="0 0 120 52"
        className={className}
        fill="none"
        preserveAspectRatio="none"
      >
        {/* Horizontal Lead in -> Zigzag peaks -> Lead out */}
        <path
          d="M 0 26 h 24 l 5 -13 l 9 26 l 9 -26 l 9 26 l 9 -26 l 9 26 l 9 -26 l 9 26 l 5 -13 h 24"
          stroke="#10b981"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_3px_rgba(16,185,129,0.5)]"
        />
      </svg>
    );
  }

  // 2. Voltage Sources (VIN, VCC)
  // Terminal OUT is at (96, 26)
  if (['VIN', 'VCC'].includes(norm)) {
    const isV2 = label.includes('2');
    const sourceText = label || (isV2 ? 'V2' : 'V1');
    return (
      <svg
        viewBox="0 0 96 52"
        className={className}
        fill="none"
        preserveAspectRatio="none"
      >
        {/* Circle with Blue Glow */}
        <circle
          cx="36"
          cy="26"
          r="18"
          stroke="#38bdf8"
          strokeWidth="2.4"
          fill="#082f49"
          className="drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]"
        />
        {/* Label inside source */}
        <text
          x="36"
          y="31"
          fill="#e0f2fe"
          fontSize="13"
          fontWeight="bold"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          textAnchor="middle"
        >
          {sourceText}
        </text>
        {/* Lead from circle boundary (x=54, y=26) straight to port at (96, 26) */}
        <line
          x1="54"
          y1="26"
          x2="96"
          y2="26"
          stroke="#10b981"
          strokeWidth="2.8"
          strokeLinecap="round"
          className="drop-shadow-[0_0_3px_rgba(16,185,129,0.5)]"
        />
      </svg>
    );
  }

  // 3. Operational Amplifier (OPAMP)
  // IN_MINUS at (0, 26), IN_PLUS at (0, 58), OUT at (140, 42)
  if (norm === 'OPAMP') {
    return (
      <svg
        viewBox="0 0 140 84"
        className={className}
        fill="none"
        preserveAspectRatio="none"
      >
        {/* Upper Inverting Lead (-) starting exactly at (0, 26) */}
        <line x1="0" y1="26" x2="30" y2="26" stroke="#10b981" strokeWidth="2.8" strokeLinecap="round" />
        {/* Lower Non-Inverting Lead (+) starting exactly at (0, 58) */}
        <line x1="0" y1="58" x2="30" y2="58" stroke="#10b981" strokeWidth="2.8" strokeLinecap="round" />

        {/* Triangle Body */}
        <polygon
          points="30,8 30,76 106,42"
          stroke="#10b981"
          strokeWidth="2.6"
          fill="#06241d"
          fillOpacity="0.4"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]"
        />

        {/* Minus Sign in Red */}
        <line x1="38" y1="26" x2="48" y2="26" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />

        {/* Plus Sign in Green */}
        <line x1="38" y1="58" x2="48" y2="58" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
        <line x1="43" y1="53" x2="43" y2="63" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />

        {/* Op-Amp Identifier (U1) */}
        <text
          x="64"
          y="46"
          fill="#cbd5e1"
          fontSize="12"
          fontWeight="bold"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          textAnchor="middle"
        >
          {label || 'U1'}
        </text>

        {/* Output Lead ending exactly at (140, 42) */}
        <line x1="106" y1="42" x2="140" y2="42" stroke="#10b981" strokeWidth="2.8" strokeLinecap="round" />
      </svg>
    );
  }

  // 4. Ground Terminal (GND)
  // Terminal GND is at (38, 0)
  if (norm === 'GND') {
    return (
      <svg
        viewBox="0 0 76 72"
        className={className}
        fill="none"
        preserveAspectRatio="none"
      >
        {/* Vertical Stem starting directly at (38, 0) */}
        <line x1="38" y1="0" x2="38" y2="26" stroke="#10b981" strokeWidth="2.8" strokeLinecap="round" />
        {/* 3 Horizontal Decreasing Ground Bars */}
        <line x1="16" y1="26" x2="60" y2="26" stroke="#10b981" strokeWidth="2.8" strokeLinecap="round" />
        <line x1="24" y1="34" x2="52" y2="34" stroke="#10b981" strokeWidth="2.6" strokeLinecap="round" />
        <line x1="32" y1="42" x2="44" y2="42" stroke="#10b981" strokeWidth="2.4" strokeLinecap="round" />
        {/* GND Text */}
        <text
          x="38"
          y="58"
          fill="#10b981"
          fontSize="10.5"
          fontWeight="bold"
          fontFamily="ui-monospace, monospace"
          textAnchor="middle"
          letterSpacing="0.05em"
        >
          GND
        </text>
      </svg>
    );
  }

  // 5. Capacitor (CAP, C_TIMING)
  // Terminals at (0, 26) and (110, 26)
  if (['CAP', 'C_TIMING'].includes(norm)) {
    return (
      <svg
        viewBox="0 0 110 52"
        className={className}
        fill="none"
        preserveAspectRatio="none"
      >
        {/* Left Lead starting at (0, 26) */}
        <line x1="0" y1="26" x2="47" y2="26" stroke="#10b981" strokeWidth="2.8" strokeLinecap="round" />
        {/* Left Plate */}
        <line x1="47" y1="10" x2="47" y2="42" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
        {/* Right Plate */}
        <line x1="63" y1="10" x2="63" y2="42" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
        {/* Right Lead ending at (110, 26) */}
        <line x1="63" y1="26" x2="110" y2="26" stroke="#10b981" strokeWidth="2.8" strokeLinecap="round" />
      </svg>
    );
  }

  // 6. Benzene Parent Core Ring
  // Hexagon vertices calculated to match the 6 carbon ports at radius 56
  if (norm === 'BENZENE') {
    const cx = 75, cy = 75, r = 56;
    const angles = [-90, -30, 30, 90, 150, 210];
    const pointsStr = angles
      .map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return `${Math.round(cx + r * Math.cos(rad))},${Math.round(cy + r * Math.sin(rad))}`;
      })
      .join(' ');

    return (
      <svg
        viewBox="0 0 150 150"
        className={className}
        fill="none"
        preserveAspectRatio="none"
      >
        <polygon
          points={pointsStr}
          stroke="#10b981"
          strokeWidth="2.8"
          strokeLinejoin="round"
          fill="#06241d"
          fillOpacity="0.3"
        />
        <circle cx="75" cy="75" r="34" stroke="#10b981" strokeWidth="2.2" strokeDasharray="5 3" />
      </svg>
    );
  }

  // 7. Chemical Substituents (-OH, -NO2, -COOH, -OAc)
  // Terminal BOND is at (0, 23)
  if (['OH', 'NO2', 'COOH', 'OCOCH3', 'CH3', 'CL'].includes(norm)) {
    const textMap = {
      OH: '-OH',
      NO2: '-NO₂',
      COOH: '-COOH',
      OCOCH3: '-OAc',
      CH3: '-CH₃',
      CL: '-Cl',
    };
    return (
      <svg
        viewBox="0 0 96 46"
        className={className}
        fill="none"
        preserveAspectRatio="none"
      >
        {/* Lead starting directly at (0, 23) */}
        <line x1="0" y1="23" x2="24" y2="23" stroke="#10b981" strokeWidth="2.8" strokeLinecap="round" />
        <text
          x="28"
          y="28"
          fill="#5eead4"
          fontSize="14"
          fontWeight="bold"
          fontFamily="ui-monospace, monospace"
        >
          {textMap[norm] || `-${norm}`}
        </text>
      </svg>
    );
  }

  // 8. 555 Timer IC (DIP Package)
  if (norm === 'IC555') {
    return (
      <svg
        viewBox="0 0 140 100"
        className={className}
        fill="none"
        preserveAspectRatio="none"
      >
        <rect x="20" y="8" width="100" height="84" rx="4" stroke="#10b981" strokeWidth="2.4" fill="#041a14" />
        <path d="M62 8 a8 8 0 0 0 16 0" stroke="#10b981" strokeWidth="2" />
        {/* Pin internal leads */}
        <line x1="0" y1="20" x2="20" y2="20" stroke="#10b981" strokeWidth="2" />
        <line x1="0" y1="40" x2="20" y2="40" stroke="#10b981" strokeWidth="2" />
        <line x1="0" y1="60" x2="20" y2="60" stroke="#10b981" strokeWidth="2" />
        <line x1="0" y1="80" x2="20" y2="80" stroke="#10b981" strokeWidth="2" />
        <line x1="120" y1="20" x2="140" y2="20" stroke="#10b981" strokeWidth="2" />
        <line x1="120" y1="40" x2="140" y2="40" stroke="#10b981" strokeWidth="2" />
        <line x1="120" y1="60" x2="140" y2="60" stroke="#10b981" strokeWidth="2" />
        <line x1="120" y1="80" x2="140" y2="80" stroke="#10b981" strokeWidth="2" />
        <text x="70" y="54" fill="#6ee7b7" fontSize="12" fontWeight="bold" textAnchor="middle">555 TIMER</text>
      </svg>
    );
  }

  // Generic block
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} fill="none">
      <rect x="15" y="8" width={width - 30} height={height - 16} rx="4" stroke="#10b981" strokeWidth="2" fill="#06241d" />
      <line x1="0" y1={height / 2} x2="15" y2={height / 2} stroke="#10b981" strokeWidth="2.4" />
      <line x1={width - 15} y1={height / 2} x2={width} y2={height / 2} stroke="#10b981" strokeWidth="2.4" />
      <text x={width / 2} y={height / 2 + 4} fill="#6ee7b7" fontSize="10" fontWeight="bold" textAnchor="middle">{norm}</text>
    </svg>
  );
}

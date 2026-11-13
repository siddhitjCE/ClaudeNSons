// src/features/topo-recall/labHelpers.js

export const DEFAULT_CHALLENGES = [
  {
    id: 'ece_summing_amp',
    domain: 'ece',
    title: 'Inverting Summing Amplifier',
    formula: 'V_out = -Rf * (V1/R1 + V2/R2)',
    prompt: 'Place and wire a 2-input Inverting Summing Op-Amp. Connect V1 & V2 through R1 & R2 into In−, bridge In− and Out with Rf, and ground In+.',
    palette: [
      { type: 'OPAMP', label: 'Op-Amp', sub: 'Active', ports: ['IN_MINUS', 'IN_PLUS', 'OUT'], isDistractor: false },
      { type: 'RES', label: 'Resistor (R)', sub: 'Passive', ports: ['P1', 'P2'], isDistractor: false },
      { type: 'VIN', label: 'Voltage In (V)', sub: 'Source', ports: ['OUT'], isDistractor: false },
      { type: 'GND', label: 'Ground (GND)', sub: 'Ref (0V)', ports: ['GND'], isDistractor: false },
      { type: 'CAP', label: 'Capacitor (C)', sub: 'Distractor', ports: ['P1', 'P2'], isDistractor: true },
    ],
  },
  {
    id: 'chem_meta_nitrophenol',
    domain: 'chem',
    title: 'm-Nitrophenol (1,3-Isomer)',
    formula: 'IUPAC: 3-nitrophenol',
    prompt: 'Synthesize meta-Nitrophenol by attaching the right functional groups to the Benzene parent ring at the 1,3 (meta) positions.',
    palette: [
      { type: 'BENZENE', label: 'Benzene Ring', sub: 'Parent Chain', ports: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'], isDistractor: false },
      { type: 'OH', label: '-OH (Hydroxyl)', sub: 'Phenol Group', ports: ['BOND'], isDistractor: false },
      { type: 'NO2', label: '-NO₂ (Nitro)', sub: 'Substituent', ports: ['BOND'], isDistractor: false },
      { type: 'COOH', label: '-COOH (Carboxyl)', sub: 'Distractor', ports: ['BOND'], isDistractor: true },
    ],
  },
];

export function getComponentGeometry(type, rawPorts = []) {
  const normType = (type || '').toUpperCase();
  const ports = Array.isArray(rawPorts) ? rawPorts : [];

  switch (normType) {
    case 'OPAMP':
      return {
        width: 140,
        height: 84,
        ports: [
          { id: 'IN_MINUS', label: '−', x: 0, y: 26 },
          { id: 'IN_PLUS', label: '+', x: 0, y: 58 },
          { id: 'OUT', label: 'Out', x: 140, y: 42 },
        ],
      };
    case 'RES':
    case 'RES_IN':
    case 'RES_F':
    case 'RA':
    case 'RB':
      return {
        width: 120,
        height: 52,
        ports: [
          { id: 'P1', label: '1', x: 0, y: 26 },
          { id: 'P2', label: '2', x: 120, y: 26 },
        ],
      };
    case 'CAP':
    case 'C_TIMING':
      return {
        width: 110,
        height: 52,
        ports: [
          { id: 'P1', label: '1', x: 0, y: 26 },
          { id: 'P2', label: '2', x: 110, y: 26 },
        ],
      };
    case 'VIN':
    case 'VCC':
      return { width: 96, height: 52, ports: [{ id: 'OUT', label: 'V', x: 96, y: 26 }] };
    case 'GND':
      return { width: 76, height: 72, ports: [{ id: 'GND', label: '0V', x: 38, y: 0 }] };
    case 'BENZENE': {
      const cx = 75, cy = 75, r = 56;
      const angles = [-90, -30, 30, 90, 150, 210];
      return {
        width: 150,
        height: 150,
        ports: angles.map((deg, idx) => {
          const rad = (deg * Math.PI) / 180;
          return {
            id: `C${idx + 1}`,
            label: `C${idx + 1}`,
            x: Math.round(cx + r * Math.cos(rad)),
            y: Math.round(cy + r * Math.sin(rad)),
          };
        }),
      };
    }
    case 'OH':
    case 'NO2':
    case 'COOH':
    case 'CH3':
    case 'CL':
    case 'OCOCH3':
      return { width: 96, height: 46, ports: [{ id: 'BOND', label: '•', x: 0, y: 23 }] };
    case 'IC555':
      return {
        width: 140,
        height: 100,
        ports: [
          { id: 'GND', label: '1', x: 0, y: 20 },
          { id: 'TRIG', label: '2', x: 0, y: 40 },
          { id: 'OUT', label: '3', x: 0, y: 60 },
          { id: 'RESET', label: '4', x: 0, y: 80 },
          { id: 'CTRL', label: '5', x: 140, y: 80 },
          { id: 'THRESH', label: '6', x: 140, y: 60 },
          { id: 'DISCH', label: '7', x: 140, y: 40 },
          { id: 'VCC', label: '8', x: 140, y: 20 },
        ],
      };
    default: {
      const width = 128;
      const portList = ports.length > 0 ? ports : ['P1', 'P2'];
      const height = Math.max(56, Math.ceil(portList.length / 2) * 32 + 16);
      const dynamicPorts = portList.map((portId, idx) => {
        const isLeft = idx % 2 === 0;
        const sideIdx = Math.floor(idx / 2);
        const totalOnSide = Math.ceil(portList.length / 2);
        const yStep = height / (totalOnSide + 1);
        return {
          id: portId.toString().toUpperCase(),
          label: portId.toString(),
          x: isLeft ? 0 : width,
          y: Math.round(yStep * (sideIdx + 1)),
        };
      });
      return { width, height, ports: dynamicPorts };
    }
  }
}

export function verifyTopology(challenge, nodes, wires) {
  if (nodes.length === 0) {
    return { pass: false, msg: 'Canvas is empty! Click components in the Component Box to place them.' };
  }

  // 1. Check for any Distractors placed on the canvas
  const distractorTypes = new Set(
    (challenge.palette || []).filter((p) => p.isDistractor).map((p) => p.type.toUpperCase())
  );
  const placedDistractor = nodes.find((n) => distractorTypes.has(n.type.toUpperCase()));
  if (placedDistractor) {
    return {
      pass: false,
      msg: `Distractor Alert: "${placedDistractor.label || placedDistractor.type}" is a distractor and not part of the correct topology.`,
    };
  }

  // 2. Disjoint-Set Union-Find of electrical nets
  const parent = {};
  const find = (k) => (parent[k] === k ? k : (parent[k] = find(parent[k])));
  const union = (a, b) => {
    const ra = find(a), rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  };

  nodes.forEach((n) =>
    (n.geometry?.ports || []).forEach((p) => {
      parent[`${n.id}:${p.id}`] = `${n.id}:${p.id}`;
    })
  );
  wires.forEach((w) => union(`${w.fromNode}:${w.fromPort}`, `${w.toNode}:${w.toPort}`));
  const sameNet = (a, b) => Boolean(parent[a] && parent[b] && find(a) === find(b));

  // 3. ECE Inverting Summing Amplifier Rule Checker
  if (challenge.id === 'ece_summing_amp') {
    if (nodes.some((n) => n.type === 'CAP')) {
      return { pass: false, msg: 'Distractor Alert: A standard Summing Amplifier uses only resistors, not a capacitor.' };
    }
    const opamp = nodes.find((n) => n.type === 'OPAMP');
    const gnds = nodes.filter((n) => n.type === 'GND');
    const vins = nodes.filter((n) => n.type === 'VIN');
    const resistors = nodes.filter((n) => n.type === 'RES');

    if (!opamp) return { pass: false, msg: 'Missing Operational Amplifier (Op-Amp) on the board.' };
    if (vins.length < 2) return { pass: false, msg: 'Place at least two Voltage Sources (V1 and V2) for a summing input.' };
    if (resistors.length < 3) return { pass: false, msg: 'You need 3 Resistors: two input resistors (R1, R2) and one feedback resistor (Rf).' };

    const inMinus = `${opamp.id}:IN_MINUS`;
    const inPlus = `${opamp.id}:IN_PLUS`;
    const opOut = `${opamp.id}:OUT`;

    const plusGrounded = gnds.some((g) => sameNet(inPlus, `${g.id}:GND`));
    if (!plusGrounded) return { pass: false, msg: 'Diagnostic Error: Non-inverting input (In+) is floating! Connect In+ to Ground (GND).' };

    const connectsNets = (res, netA, netB) => {
      const p1 = `${res.id}:P1`, p2 = `${res.id}:P2`;
      return (sameNet(p1, netA) && sameNet(p2, netB)) || (sameNet(p2, netA) && sameNet(p1, netB));
    };

    const hasFeedback = resistors.some((r) => connectsNets(r, inMinus, opOut));
    if (!hasFeedback) return { pass: false, msg: 'Diagnostic Error: Missing negative feedback! Connect a resistor (Rf) between In− and Out.' };

    const fedVins = vins.filter((v) => resistors.some((r) => connectsNets(r, `${v.id}:OUT`, inMinus)));
    if (fedVins.length < 2) return { pass: false, msg: 'Each Voltage Source must pass through its own input resistor into the summing junction (In−).' };

    return { pass: true, msg: 'Verified! Summing junction at In−, negative feedback loop Rf intact, and In+ grounded.' };
  }

  // 4. Chem meta-Nitrophenol Rule Checker
  if (challenge.id === 'chem_meta_nitrophenol') {
    if (nodes.some((n) => n.type === 'COOH')) {
      return { pass: false, msg: 'Distractor Alert: -COOH forms Benzoic Acid. Nitrophenol only uses -OH and -NO₂.' };
    }
    const benzene = nodes.find((n) => n.type === 'BENZENE');
    const oh = nodes.find((n) => n.type === 'OH');
    const no2 = nodes.find((n) => n.type === 'NO2');
    if (!benzene || !oh || !no2) return { pass: false, msg: 'Place 1 Benzene ring, 1 -OH group, and 1 -NO₂ group.' };

    const getCarbonIdx = (groupNode) => {
      for (let i = 1; i <= 6; i++) {
        if (sameNet(`${benzene.id}:C${i}`, `${groupNode.id}:BOND`)) return i;
      }
      return null;
    };

    const cOH = getCarbonIdx(oh);
    const cNO2 = getCarbonIdx(no2);
    if (!cOH || !cNO2) return { pass: false, msg: 'Wire both -OH and -NO₂ directly to carbon ports (C1–C6) on the Benzene ring.' };
    if (cOH === cNO2) return { pass: false, msg: 'Valency Error: Two substituents cannot bond to the exact same aromatic carbon.' };

    const dist = Math.min(Math.abs(cOH - cNO2), 6 - Math.abs(cOH - cNO2));
    if (dist === 1) return { pass: false, msg: 'Isomer Error: Distance 1,2 is ortho-Nitrophenol. Move one group to form the 1,3 (meta) isomer!' };
    if (dist === 3) return { pass: false, msg: 'Isomer Error: Distance 1,4 is para-Nitrophenol. Move one group to form the 1,3 (meta) isomer!' };

    return { pass: true, msg: `Verified! 1,3-disubstituted meta-Nitrophenol synthesized (attached at C${cOH} and C${cNO2}).` };
  }

  // 5. Intelligent Dynamic Netlist Checker for YouTube-generated and Preset challenges
  if (challenge.expectedConnections && challenge.expectedConnections.length > 0) {
    const requiredTypes = [
      ...new Set((challenge.palette || []).filter((p) => !p.isDistractor).map((p) => p.type.toUpperCase())),
    ];

    for (const reqType of requiredTypes) {
      if (!nodes.some((n) => n.type.toUpperCase() === reqType)) {
        return {
          pass: false,
          msg: `Missing component: Place at least one "${reqType}" component on the board.`,
        };
      }
    }

    const isSymmetric = (type) => ['RES', 'RES_IN', 'RES_F', 'RA', 'RB', 'CAP', 'C_TIMING', 'INDUCTOR'].includes(type.toUpperCase());

    for (const rule of challenge.expectedConnections) {
      const fromType = rule.fromType.toUpperCase();
      const toType = rule.toType.toUpperCase();
      const fromPort = rule.fromPort.toUpperCase();
      const toPort = rule.toPort.toUpperCase();

      const matched = nodes.some((nA) => {
        if (nA.type.toUpperCase() !== fromType) return false;
        const portsA = isSymmetric(fromType) && (fromPort === 'P1' || fromPort === 'P2')
          ? ['P1', 'P2']
          : [fromPort];

        return nodes.some((nB) => {
          if (nB.type.toUpperCase() !== toType || nA.id === nB.id) return false;
          const portsB = isSymmetric(toType) && (toPort === 'P1' || toPort === 'P2')
            ? ['P1', 'P2']
            : [toPort];

          return portsA.some((pA) =>
            portsB.some((pB) => sameNet(`${nA.id}:${pA}`, `${nB.id}:${pB}`))
          );
        });
      });

      if (!matched) {
        return {
          pass: false,
          msg: challenge.diagnosticHint || `Missing connection between ${rule.fromType} (${rule.fromPort}) and ${rule.toType} (${rule.toPort}).`,
        };
      }
    }

    return { pass: true, msg: 'Verified! Your custom structure correctly matches the lecture video topology.' };
  }

  // Fallback net check
  if (wires.length >= 1 && nodes.length >= 2) {
    return { pass: true, msg: 'Verified! All components are wired into a connected net.' };
  }

  return { pass: false, msg: 'Place the required components and connect their pins with wires, then click Verify.' };
}

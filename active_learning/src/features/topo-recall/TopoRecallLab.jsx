// src/features/topo-recall/TopoRecallLab.jsx
import React, { useState, useRef } from 'react';
import { CheckCircle2, AlertTriangle, RotateCcw, Video, Sparkles } from 'lucide-react';
import { getComponentGeometry, verifyTopology } from './labHelpers';
import ComponentSymbol from './ComponentSymbol';

function getWireCurve(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  // Horizontal S-curve when moving left to right
  if (dx >= 20) {
    const curvature = Math.min(Math.max(dx * 0.5, 30), 120);
    return `M ${p1.x} ${p1.y} C ${p1.x + curvature} ${p1.y}, ${p2.x - curvature} ${p2.y}, ${p2.x} ${p2.y}`;
  }

  // Vertical or looping connection (like feedback resistor or ground)
  const dist = Math.hypot(dx, dy);
  const curvature = Math.min(Math.max(dist * 0.45, 35), 90);
  const cx1 = p1.x + (dx >= 0 ? curvature : -curvature);
  const cy1 = p1.y + (dy < 0 ? -curvature * 0.5 : curvature * 0.5);
  const cx2 = p2.x - (dx >= 0 ? curvature : -curvature);
  const cy2 = p2.y + (dy < 0 ? curvature * 0.3 : -curvature * 0.3);
  return `M ${p1.x} ${p1.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p2.x} ${p2.y}`;
}

export default function TopoRecallLab({
  challenge,
  onCompleteLevel,
  showVideo,
  onToggleVideo,
}) {
  const [nodes, setNodes] = useState([]);
  const [wires, setWires] = useState([]);
  const [pendingPort, setPendingPort] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [draggingNode, setDraggingNode] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const canvasRef = useRef(null);

  const handleReset = () => {
    setNodes([]);
    setWires([]);
    setPendingPort(null);
    setFeedback(null);
  };

  const addNodeToBoard = (item, customPos = null) => {
    const geometry = getComponentGeometry(item.type, item.ports);
    const existing = nodes.filter((n) => n.type === item.type);
    const count = existing.length;

    // Schematic reference designator labeling (R1, R2, Rf, V1, V2, U1, GND)
    let displayLabel = item.label;
    if (item.type === 'OPAMP') {
      displayLabel = 'U1';
    } else if (['RES', 'RES_IN', 'RES_F', 'RA', 'RB'].includes(item.type)) {
      displayLabel = count === 0 ? 'R1' : count === 1 ? 'R2' : 'Rf';
    } else if (['VIN', 'VCC'].includes(item.type)) {
      displayLabel = `V${count + 1}`;
    } else if (['CAP', 'C_TIMING'].includes(item.type)) {
      displayLabel = `C${count + 1}`;
    } else if (item.type === 'GND') {
      displayLabel = 'GND';
    }

    const offset = (nodes.length % 6) * 28;
    const x = customPos ? customPos.x : (140 + offset);
    const y = customPos ? customPos.y : (90 + offset);

    const newNode = {
      id: `${item.type}_${Date.now().toString().slice(-4)}_${Math.random().toString(36).substring(2, 5)}`,
      type: item.type,
      label: displayLabel,
      subLabel: item.label,
      geometry,
      x,
      y,
    };
    setNodes((prev) => [...prev, newNode]);
    setFeedback(null);
  };

  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    if (draggingNode) {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggingNode.id
            ? { ...n, x: Math.max(10, x - draggingNode.offsetX), y: Math.max(10, y - draggingNode.offsetY) }
            : n
        )
      );
    }
  };

  const handlePortClick = (e, nodeId, portId) => {
    e.stopPropagation();
    if (!pendingPort) {
      setPendingPort({ nodeId, portId });
      return;
    }
    if (pendingPort.nodeId === nodeId && pendingPort.portId === portId) {
      setPendingPort(null);
      return;
    }
    setWires((prev) => [
      ...prev,
      {
        id: `w_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        fromNode: pendingPort.nodeId,
        fromPort: pendingPort.portId,
        toNode: nodeId,
        toPort: portId,
      },
    ]);
    setPendingPort(null);
    setFeedback(null);
  };

  const getPortAbsoluteCoords = (nodeId, portId) => {
    const n = nodes.find((item) => item.id === nodeId);
    if (!n) return { x: 0, y: 0 };
    const p = n.geometry.ports.find((pt) => pt.id === portId);
    return p ? { x: n.x + p.x, y: n.y + p.y } : { x: n.x, y: n.y };
  };

  const handleVerify = () => {
    const res = verifyTopology(challenge, nodes, wires);
    setFeedback(res);
    if (res.pass && onCompleteLevel) {
      onCompleteLevel(challenge.id);
    }
  };

  const palette = Array.isArray(challenge?.palette) ? challenge.palette : [];

  return (
    <div className="flex-1 flex flex-col w-full bg-slate-950 text-slate-100 select-none rounded-xl overflow-hidden border border-slate-800 min-h-0">
      {/* Sub-header Task & Formula Bar */}
      <div className="px-5 py-2.5 bg-slate-900/70 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <span className="font-bold text-indigo-400 shrink-0">Task:</span>
          <span className="text-slate-300">{challenge?.prompt}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {challenge?.videoId && (
            <button
              onClick={onToggleVideo}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition cursor-pointer ${
                showVideo
                  ? 'bg-rose-950/60 border-rose-700/60 text-rose-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-rose-400" />
              <span>{showVideo ? 'Hide Video' : 'Watch Lecture Clip'}</span>
            </button>
          )}

          {challenge?.formula && (
            <span className="font-mono text-amber-400 bg-amber-950/40 border border-amber-800/50 px-2.5 py-0.5 rounded text-[11px]">
              {challenge.formula}
            </span>
          )}

          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Clear all nodes and wires"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
            <button
              onClick={handleVerify}
              className="flex items-center gap-1.5 px-3.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Verify</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas & Component Box Split */}
      <div className="flex flex-1 overflow-hidden relative min-h-0">
        {/* Interactive Wiring Canvas */}
        <div
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setDraggingNode(null)}
          onClick={() => setPendingPort(null)}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
          }}
          onDrop={(e) => {
            e.preventDefault();
            try {
              const raw = e.dataTransfer.getData('application/json');
              if (!raw) return;
              const item = JSON.parse(raw);
              if (!canvasRef.current) return;
              const rect = canvasRef.current.getBoundingClientRect();
              const geom = getComponentGeometry(item.type, item.ports);
              const dropX = Math.max(10, Math.round(e.clientX - rect.left - geom.width / 2));
              const dropY = Math.max(10, Math.round(e.clientY - rect.top - geom.height / 2));
              addNodeToBoard(item, { x: dropX, y: dropY });
            } catch (err) {
              console.error('Drop error:', err);
            }
          }}
          className="flex-1 relative overflow-hidden bg-[#030712] bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:22px_22px]"
        >
          {/* Top Instruction Pill Banner (matches user screenshot) */}
          <div className="absolute top-3 left-4 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a1524]/90 border border-slate-700/80 shadow-lg backdrop-blur-md text-[11px] text-slate-200 pointer-events-none select-none">
            <span className="text-amber-400 font-bold">⚡</span>
            <span className="font-semibold text-slate-100">How to Wire:</span>
            <span>Click any glowing port circle</span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_6px_#2dd4bf]" />
            <span>then click another port to connect. Click any wire to delete it.</span>
          </div>

          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {wires.map((w) => {
              const p1 = getPortAbsoluteCoords(w.fromNode, w.fromPort);
              const p2 = getPortAbsoluteCoords(w.toNode, w.toPort);
              const pathD = getWireCurve(p1, p2);
              return (
                <g
                  key={w.id}
                  className="pointer-events-auto cursor-pointer group"
                  onClick={() => setWires((prev) => prev.filter((item) => item.id !== w.id))}
                >
                  <path d={pathD} stroke="transparent" strokeWidth="16" fill="none" />
                  <path
                    d={pathD}
                    stroke="#10b981"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    fill="none"
                    className="group-hover:stroke-rose-500 transition-colors drop-shadow-[0_0_4px_rgba(16,185,129,0.7)]"
                  />
                  <title>Click wire to delete</title>
                </g>
              );
            })}

            {/* Pending Wire Indicator */}
            {pendingPort && (() => {
              const p1 = getPortAbsoluteCoords(pendingPort.nodeId, pendingPort.portId);
              const pathD = getWireCurve(p1, mousePos);
              return (
                <path
                  d={pathD}
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeDasharray="6,6"
                  fill="none"
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_6px_rgba(245,158,11,0.7)]"
                />
              );
            })()}
          </svg>

          {/* Canvas Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              style={{
                left: node.x,
                top: node.y,
                width: node.geometry.width,
                height: node.geometry.height,
              }}
              onMouseDown={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setDraggingNode({ id: node.id, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top });
              }}
              className="absolute bg-[#06121e]/95 border-2 border-emerald-500/80 hover:border-teal-400 rounded-2xl shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] cursor-grab active:cursor-grabbing group transition-all select-none"
            >
              {/* Top Component Designator Label for Resistors and Capacitors */}
              {['RES', 'RES_IN', 'RES_F', 'RA', 'RB', 'CAP', 'C_TIMING'].includes(node.type) && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded bg-[#06121e] border border-emerald-500/60 text-[10px] font-bold text-slate-100 tracking-wider shadow-sm pointer-events-none select-none z-10">
                  {node.label}
                </span>
              )}

              {/* Full-bleed vector schematic symbol aligning with outer terminal pins */}
              <ComponentSymbol
                type={node.type}
                label={node.label}
                width={node.geometry.width}
                height={node.geometry.height}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />

              {/* Delete Pill Button (red circle with white X on top right corner) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNodes((prev) => prev.filter((n) => n.id !== node.id));
                  setWires((prev) => prev.filter((w) => w.fromNode !== node.id && w.toNode !== node.id));
                }}
                className="absolute -top-2 -right-2 hidden group-hover:flex w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-400 text-white font-bold text-[10px] items-center justify-center cursor-pointer shadow-md shadow-rose-950/60 transition-transform hover:scale-110 z-20"
                title="Remove component"
              >
                ✕
              </button>

              {/* Glowing Port Circles matching exact terminal leads */}
              {node.geometry.ports.map((port) => {
                const isSelected = pendingPort?.nodeId === node.id && pendingPort?.portId === port.id;
                return (
                  <button
                    key={port.id}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => handlePortClick(e, node.id, port.id)}
                    style={{ left: port.x - 7, top: port.y - 7 }}
                    title={`Port: ${port.label}`}
                    className={`absolute w-3.5 h-3.5 rounded-full border-2 transition-all cursor-pointer z-10 ${
                      isSelected
                        ? 'bg-amber-400 border-white scale-140 shadow-[0_0_12px_#f59e0b]'
                        : 'bg-teal-400 border-[#06121e] shadow-[0_0_8px_rgba(45,212,191,0.85)] hover:scale-135 hover:bg-teal-300'
                    }`}
                  />
                );
              })}
            </div>
          ))}

          {/* Empty Canvas Instructions */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center p-6 rounded-2xl bg-[#06121e]/85 border border-slate-800 backdrop-blur-sm max-w-sm">
                <p className="text-xs font-semibold text-slate-300 mb-1">Canvas is ready</p>
                <p className="text-[11px] text-slate-400">
                  Drag & drop items from the <span className="text-teal-400 font-semibold">Component Box</span> or click them to place on the canvas.
                </p>
              </div>
            </div>
          )}

          {/* Verification Feedback Toast */}
          {feedback && (
            <div
              className={`absolute bottom-4 left-4 right-4 p-3.5 rounded-xl border flex items-center gap-3 shadow-2xl backdrop-blur-md transition-all ${
                feedback.pass
                  ? 'bg-emerald-950/95 border-emerald-500 text-emerald-200'
                  : 'bg-rose-950/95 border-rose-500 text-rose-200'
              }`}
            >
              {feedback.pass ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold block">{feedback.pass ? 'Success!' : 'Verification Notice'}</span>
                <span className="text-xs font-medium opacity-90">{feedback.msg}</span>
              </div>
              <button
                onClick={() => setFeedback(null)}
                className="text-xs opacity-60 hover:opacity-100 cursor-pointer px-1"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Right Component Box Sidebar */}
        <aside className="w-64 bg-slate-900 border-l border-slate-800 p-3.5 flex flex-col gap-3 overflow-y-auto shrink-0">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Component Box</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Drag & drop onto canvas or click to place.</p>
          </div>

          <div className="flex flex-col gap-2">
            {palette.map((item, idx) => (
              <button
                key={`${item.type}_${idx}`}
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify(item));
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => addNodeToBoard(item)}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500 transition text-left cursor-grab active:cursor-grabbing group shadow-sm select-none"
                title="Drag and drop onto canvas or click to add"
              >
                {/* Visual Outline Schematic Symbol Preview */}
                <div className="w-11 h-11 rounded-lg bg-slate-950/80 border border-slate-700/80 group-hover:border-indigo-500/80 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 shrink-0 p-1 transition-colors">
                  <ComponentSymbol type={item.type} className="w-full h-full" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
                      {item.label}
                    </span>
                    <span className="text-[8px] uppercase px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 shrink-0">
                      {item.sub || item.type}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block font-mono truncate">
                    Ports: {Array.isArray(item.ports) ? item.ports.join(', ') : 'P1, P2'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

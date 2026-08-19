// import { useEffect, useRef, useState } from "react";

// export interface ClusterPinData {
//   id: string;
//   category: string;
//   count: number;
//   label: string;
//   severity: "critical" | "warning" | "opt";
//   x: number;
//   y: number;
//   z: number;
//   details: {
//     rule: string;
//     description: string;
//     impact: string;
//   };
// }

// export const CLUSTER_PINS: ClusterPinData[] = [
//   {
//     id: "sec-1",
//     category: "injections",
//     count: 85,
//     label: "Dynamic Code Injections",
//     severity: "critical",
//     x: -0.3,
//     y: 0.7,
//     z: 0.65,
//     details: {
//       rule: "AST-SEC-409",
//       description: "Arbitrary code execution vectors and unvalidated dynamic eval calls.",
//       impact: "Critical CVSS 9.8",
//     },
//   },
//   {
//     id: "perf-1",
//     category: "complexity",
//     count: 22,
//     label: "High Big-O Hotspots",
//     severity: "warning",
//     x: 0.6,
//     y: 0.65,
//     z: 0.45,
//     details: {
//       rule: "AST-PERF-102",
//       description: "Nested loops yielding O(n²) time complexity across pipeline handlers.",
//       impact: "High CPU Latency",
//     },
//   },
//   {
//     id: "mem-1",
//     category: "memory",
//     count: 5,
//     label: "Heap Memory Leaks",
//     severity: "critical",
//     x: -0.75,
//     y: -0.6,
//     z: 0.35,
//     details: {
//       rule: "AST-MEM-003",
//       description: "Unreleased event listeners and circular closure retention scopes.",
//       impact: "Memory Thrashing",
//     },
//   },
//   {
//     id: "conc-1",
//     category: "concurrency",
//     count: 4,
//     label: "Race Conditions",
//     severity: "critical",
//     x: -0.85,
//     y: 0.35,
//     z: 0.45,
//     details: {
//       rule: "AST-RACE-011",
//       description: "Unsynchronized async mutations across worker promises.",
//       impact: "Data Corruption",
//     },
//   },
//   {
//     id: "types-1",
//     category: "types",
//     count: 8,
//     label: "Implicit Any Escapes",
//     severity: "opt",
//     x: 0.85,
//     y: -0.15,
//     z: 0.5,
//     details: {
//       rule: "AST-TYP-220",
//       description: "Loose type assertions bypassing strict compile-time checks.",
//       impact: "Type Safety Drift",
//     },
//   },
//   {
//     id: "refactor-1",
//     category: "refactor",
//     count: 2,
//     label: "Dead Code Branches",
//     severity: "opt",
//     x: -0.15,
//     y: 0.2,
//     z: 0.96,
//     details: {
//       rule: "AST-OPT-088",
//       description: "Unreachable conditional statements and redundant exports.",
//       impact: "Bundle Bloat",
//     },
//   },
// ];

// interface SynapsePulse {
//   startIndex: number;
//   endIndex: number;
//   progress: number;
//   speed: number;
//   color: string;
// }

// interface NeuralCoreProps {
//   activeCategory: string;
//   zoomLevel: number;
//   onSelectPin: (pin: ClusterPinData) => void;
// }

// export default function NeuralCoreCanvas({ activeCategory, zoomLevel, onSelectPin }: NeuralCoreProps) {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const [projectedPins, setProjectedPins] = useState<
//     { pin: ClusterPinData; px: number; py: number; visible: boolean; pz: number }[]
//   >([]);

//   const rotRef = useRef({ x: 0.35, y: -0.2 });
//   const isDraggingRef = useRef(false);
//   const lastMouseRef = useRef({ x: 0, y: 0 });

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     let animId: number;
//     let width = (canvas.width = window.innerWidth);
//     let height = (canvas.height = window.innerHeight);

//     const onResize = () => {
//       if (!canvas) return;
//       width = canvas.width = window.innerWidth;
//       height = canvas.height = window.innerHeight;
//     };
//     window.addEventListener("resize", onResize);

//     // Dynamic Fibonacci point distribution
//     const numPoints = width < 768 ? 160 : 320;
//     const vertices: { x: number; y: number; z: number }[] = [];
//     const phi = Math.PI * (Math.sqrt(5) - 1);

//     for (let i = 0; i < numPoints; i++) {
//       const y = 1 - (i / (numPoints - 1)) * 2;
//       const radius = Math.sqrt(1 - y * y);
//       const theta = phi * i;
//       vertices.push({
//         x: Math.cos(theta) * radius,
//         y,
//         z: Math.sin(theta) * radius,
//       });
//     }

//     // Synapse electrical tracking paths
//     const synapses: SynapsePulse[] = Array.from({ length: 22 }, () => ({
//       startIndex: Math.floor(Math.random() * numPoints),
//       endIndex: Math.floor(Math.random() * numPoints),
//       progress: Math.random(),
//       speed: 0.005 + Math.random() * 0.01,
//       color: Math.random() > 0.35 ? "rgba(167, 139, 250," : "rgba(56, 189, 248,",
//     }));

//     let ringAngle = 0;

//     const render = () => {
//       ctx.clearRect(0, 0, width, height);

//       if (!isDraggingRef.current) {
//         rotRef.current.y += 0.0016;
//       }
//       ringAngle += 0.0035;

//       const rx = rotRef.current.x;
//       const ry = rotRef.current.y;
//       const cx = width / 2;
//       const cy = height / 2;

//       const isMobile = width < 768;
//       const baseRadius = Math.min(width, height) * (isMobile ? 0.38 : 0.32) * zoomLevel;

//       const project = (x: number, y: number, z: number, scale = 1) => {
//         const cosY = Math.cos(ry);
//         const sinY = Math.sin(ry);
//         const x1 = x * cosY - z * sinY;
//         const z1 = z * cosY + x * sinY;

//         const cosX = Math.cos(rx);
//         const sinX = Math.sin(rx);
//         const y2 = y * cosX - z1 * sinX;
//         const z2 = z1 * cosX + y * sinX;

//         return {
//           px: cx + x1 * baseRadius * scale,
//           py: cy + y2 * baseRadius * scale,
//           pz: z2,
//         };
//       };

//       // Atmospheric Rayleigh Dark Edge Shader Backing
//       const rimGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.6, cx, cy, baseRadius * 1.05);
//       rimGrad.addColorStop(0, "rgba(5, 8, 18, 0)");
//       rimGrad.addColorStop(0.7, "rgba(15, 23, 42, 0.45)");
//       rimGrad.addColorStop(0.92, "rgba(99, 102, 241, 0.22)");
//       rimGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

//       ctx.fillStyle = rimGrad;
//       ctx.beginPath();
//       ctx.arc(cx, cy, baseRadius * 1.05, 0, Math.PI * 2);
//       ctx.fill();

//       // Outer Fine Gyroscope Rings
//       const drawRing = (tilt: number, angleOffset: number, ringRadius: number, color: string) => {
//         ctx.beginPath();
//         const steps = 72;
//         for (let i = 0; i <= steps; i++) {
//           const theta = (i / steps) * Math.PI * 2 + angleOffset;
//           const rxPos = Math.cos(theta) * ringRadius;
//           const ryPos = Math.sin(theta) * ringRadius * Math.cos(tilt);
//           const rzPos = Math.sin(theta) * ringRadius * Math.sin(tilt);
//           const p = project(rxPos, ryPos, rzPos, 1);

//           if (i === 0) ctx.moveTo(p.px, p.py);
//           else ctx.lineTo(p.px, p.py);
//         }
//         ctx.strokeStyle = color;
//         ctx.lineWidth = 0.75;
//         ctx.stroke();
//       };

//       drawRing(0.55, ringAngle, 1.15, "rgba(139, 92, 246, 0.16)");
//       drawRing(-0.45, -ringAngle * 1.2, 1.22, "rgba(56, 189, 248, 0.12)");

//       // Transform Matrix Mapping
//       const projectedVerts = vertices.map((v) => project(v.x, v.y, v.z));

//       // Network Inter-axon Links
//       ctx.lineWidth = 0.55;
//       for (let i = 0; i < projectedVerts.length; i++) {
//         for (let j = i + 1; j < projectedVerts.length; j++) {
//           const v1 = vertices[i];
//           const v2 = vertices[j];
//           const dist3D = Math.hypot(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);

//           if (dist3D < 0.32) {
//             const p1 = projectedVerts[i];
//             const p2 = projectedVerts[j];
//             const avgZ = (p1.pz + p2.pz) / 2;

//             if (avgZ > -0.3) {
//               const alpha = Math.max(0.03, (avgZ + 1) * 0.18);
//               ctx.strokeStyle = `rgba(167, 139, 250, ${alpha})`;
//               ctx.beginPath();
//               ctx.moveTo(p1.px, p1.py);
//               ctx.lineTo(p2.px, p2.py);
//               ctx.stroke();
//             }
//           }
//         }
//       }

//       // Synapse Pulsing Streamers
//       for (const syn of synapses) {
//         syn.progress += syn.speed;
//         if (syn.progress >= 1) {
//           syn.progress = 0;
//           syn.startIndex = Math.floor(Math.random() * numPoints);
//           syn.endIndex = Math.floor(Math.random() * numPoints);
//         }

//         const pStart = projectedVerts[syn.startIndex];
//         const pEnd = projectedVerts[syn.endIndex];

//         if (pStart.pz > -0.2 && pEnd.pz > -0.2) {
//           const currX = pStart.px + (pEnd.px - pStart.px) * syn.progress;
//           const currY = pStart.py + (pEnd.py - pStart.py) * syn.progress;
//           const pulseAlpha = Math.sin(syn.progress * Math.PI);

//           ctx.fillStyle = `${syn.color} ${pulseAlpha * 0.95})`;
//           ctx.beginPath();
//           ctx.arc(currX, currY, 1.8, 0, Math.PI * 2);
//           ctx.fill();
//         }
//       }

//       // Structural Node Points
//       for (const p of projectedVerts) {
//         if (p.pz > -0.35) {
//           const depthAlpha = Math.max(0.12, (p.pz + 1) * 0.45);
//           ctx.fillStyle = `rgba(255, 255, 255, ${depthAlpha})`;
//           ctx.beginPath();
//           ctx.arc(p.px, p.py, p.pz > 0.3 ? 1.6 : 1.0, 0, Math.PI * 2);
//           ctx.fill();
//         }
//       }

//       // Map Hit Target Vectors
//       const updatedPins = CLUSTER_PINS.map((pin) => {
//         const length = Math.hypot(pin.x, pin.y, pin.z);
//         const proj = project(pin.x / length, pin.y / length, pin.z / length, 1.02);

//         return {
//           pin,
//           px: proj.px,
//           py: proj.py,
//           pz: proj.pz,
//           visible: proj.pz > 0.05,
//         };
//       });

//       setProjectedPins(updatedPins);
//       animId = requestAnimationFrame(render);
//     };

//     render();

//     return () => {
//       window.removeEventListener("resize", onResize);
//       cancelAnimationFrame(animId);
//     };
//   }, [zoomLevel]);

//   const handleStart = (clientX: number, clientY: number) => {
//     isDraggingRef.current = true;
//     lastMouseRef.current = { x: clientX, y: clientY };
//   };

//   const handleMove = (clientX: number, clientY: number) => {
//     if (!isDraggingRef.current) return;
//     const dx = clientX - lastMouseRef.current.x;
//     const dy = clientY - lastMouseRef.current.y;
//     rotRef.current.y += dx * 0.005;
//     rotRef.current.x += dy * 0.005;
//     lastMouseRef.current = { x: clientX, y: clientY };
//   };

//   const handleEnd = () => {
//     isDraggingRef.current = false;
//   };

//   return (
//     <div
//       className="relative w-full h-full cursor-grab active:cursor-grabbing select-none touch-none"
//       onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
//       onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
//       onMouseUp={handleEnd}
//       onMouseLeave={handleEnd}
//       onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
//       onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
//       onTouchEnd={handleEnd}
//     >
//       <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

//       {/* Invisible Interactive Hit-Boxes with Crosshair Hover States */}
//       {projectedPins.map(({ pin, px, py, visible, pz }) => {
//         if (!visible) return null;
//         const isDimmed = activeCategory !== "all" && pin.category !== activeCategory;

//         return (
//           <button
//             key={pin.id}
//             onClick={(e) => {
//               e.stopPropagation();
//               onSelectPin(pin);
//             }}
//             style={{
//               left: `${px}px`,
//               top: `${py}px`,
//               transform: `translate(-50%, -50%) scale(${Math.max(0.8, (pz + 1) * 0.58)})`,
//               opacity: isDimmed ? 0.08 : 1,
//             }}
//             className="absolute z-20 group w-10 h-10 flex items-center justify-center bg-transparent border-none outline-none cursor-pointer transition-opacity duration-200"
//           >
//             {/* Pure CSS Holographic Micro-Crosshair appearing only on button hover */}
//             <div className="relative w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
//               <span className="absolute w-full h-px bg-white/40" />
//               <span className="absolute h-full w-px bg-white/40" />
//               <span className="absolute w-2 h-2 rounded-full border border-white/60 bg-black/80 shadow-2xl shadow-white/30" />
//             </div>
//           </button>
//         );
//       })}
//     </div>
//   );
// }









"use client";

import { useEffect, useRef } from "react";

interface SynapsePulse {
  startIndex: number;
  endIndex: number;
  progress: number;
  speed: number;
  color: string;
}

interface NeuralCoreProps {
  zoomLevel?: number;
}

export default function NeuralCoreCanvas({ zoomLevel = 1 }: NeuralCoreProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Inertial physics state refs
  const rotRef = useRef({ x: 0.35, y: -0.2 });
  const velRef = useRef({ x: 0, y: 0.0018 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  const zoomRef = useRef(zoomLevel);
  zoomRef.current = zoomLevel;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;

    const resize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Fibonacci Sphere Distribution
    const isMobile = window.innerWidth < 768;
    const numPoints = isMobile ? 180 : 340;
    const vertices: { x: number; y: number; z: number; baseSize: number }[] = [];
    const phi = Math.PI * (Math.sqrt(5) - 1);

    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;
      vertices.push({
        x: Math.cos(theta) * radius,
        y,
        z: Math.sin(theta) * radius,
        baseSize: Math.random() * 0.8 + 0.8,
      });
    }

    // Synapse Pulses
    const synapses: SynapsePulse[] = Array.from({ length: 28 }, () => ({
      startIndex: Math.floor(Math.random() * numPoints),
      endIndex: Math.floor(Math.random() * numPoints),
      progress: Math.random(),
      speed: 0.006 + Math.random() * 0.012,
      color: Math.random() > 0.4 ? "rgba(168, 85, 247," : "rgba(56, 189, 248,",
    }));

    let ringAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Inertial Drag Physics Integration
      if (!isDraggingRef.current) {
        velRef.current.y *= 0.95;
        velRef.current.x *= 0.95;
        // Continuous auto-rotation
        rotRef.current.y += velRef.current.y + 0.0016;
        rotRef.current.x += velRef.current.x;
      }
      ringAngle += 0.004;

      const rx = rotRef.current.x;
      const ry = rotRef.current.y;
      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = Math.min(width, height) * (isMobile ? 0.38 : 0.3) * zoomRef.current;

      const project = (x: number, y: number, z: number, scale = 1) => {
        const cosY = Math.cos(ry);
        const sinY = Math.sin(ry);
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        const cosX = Math.cos(rx);
        const sinX = Math.sin(rx);
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        const perspective = 1 + z2 * 0.28;

        return {
          px: cx + x1 * baseRadius * scale * perspective,
          py: cy + y2 * baseRadius * scale * perspective,
          pz: z2,
          scale: perspective,
        };
      };

      // Atmospheric Deep Volumetric Glow
      const coreBloom = ctx.createRadialGradient(cx, cy, baseRadius * 0.1, cx, cy, baseRadius * 1.15);
      coreBloom.addColorStop(0, "rgba(99, 102, 241, 0.18)");
      coreBloom.addColorStop(0.5, "rgba(56, 189, 248, 0.08)");
      coreBloom.addColorStop(0.85, "rgba(15, 23, 42, 0.35)");
      coreBloom.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = coreBloom;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 1.15, 0, Math.PI * 2);
      ctx.fill();

      // Gyroscope Telemetry Rings
      const drawPrecisionRing = (tilt: number, angleOffset: number, ringRad: number, color: string, dashes: number[]) => {
        ctx.beginPath();
        ctx.setLineDash(dashes);
        const steps = 80;
        for (let i = 0; i <= steps; i++) {
          const theta = (i / steps) * Math.PI * 2 + angleOffset;
          const rxPos = Math.cos(theta) * ringRad;
          const ryPos = Math.sin(theta) * ringRad * Math.cos(tilt);
          const rzPos = Math.sin(theta) * ringRad * Math.sin(tilt);
          const p = project(rxPos, ryPos, rzPos, 1);

          if (i === 0) ctx.moveTo(p.px, p.py);
          else ctx.lineTo(p.px, p.py);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      };

      drawPrecisionRing(0.65, ringAngle, 1.18, "rgba(168, 85, 247, 0.22)", [4, 10]);
      drawPrecisionRing(-0.5, -ringAngle * 1.3, 1.28, "rgba(56, 189, 248, 0.18)", [40, 20, 10, 20]);

      // Projected Vertices
      const projectedVerts = vertices.map((v) => ({
        ...project(v.x, v.y, v.z),
        baseSize: v.baseSize,
      }));

      // Render Inter-Axon Neural Meshes
      ctx.lineWidth = 0.65;
      for (let i = 0; i < projectedVerts.length; i++) {
        for (let j = i + 1; j < projectedVerts.length; j++) {
          const v1 = vertices[i];
          const v2 = vertices[j];
          const dist3D = Math.hypot(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);

          if (dist3D < 0.3) {
            const p1 = projectedVerts[i];
            const p2 = projectedVerts[j];
            const avgZ = (p1.pz + p2.pz) / 2;

            if (avgZ > -0.45) {
              const alpha = Math.max(0.02, (avgZ + 1) * 0.22);
              ctx.strokeStyle = `rgba(147, 197, 253, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(p1.px, p1.py);
              ctx.lineTo(p2.px, p2.py);
              ctx.stroke();
            }
          }
        }
      }

      // Additive Blending for High-Energy Pulses
      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      // Synapse Electrical Streamers
      for (const syn of synapses) {
        syn.progress += syn.speed;
        if (syn.progress >= 1) {
          syn.progress = 0;
          syn.startIndex = Math.floor(Math.random() * numPoints);
          syn.endIndex = Math.floor(Math.random() * numPoints);
        }

        const pStart = projectedVerts[syn.startIndex];
        const pEnd = projectedVerts[syn.endIndex];

        if (pStart.pz > -0.3 && pEnd.pz > -0.3) {
          const currX = pStart.px + (pEnd.px - pStart.px) * syn.progress;
          const currY = pStart.py + (pEnd.py - pStart.py) * syn.progress;
          const pulseAlpha = Math.sin(syn.progress * Math.PI);

          ctx.fillStyle = `${syn.color} ${pulseAlpha * 0.95})`;
          ctx.beginPath();
          ctx.arc(currX, currY, 2.2, 0, Math.PI * 2);
          ctx.fill();

          // Particle Trail
          ctx.strokeStyle = `${syn.color} ${pulseAlpha * 0.35})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(pStart.px, pStart.py);
          ctx.lineTo(currX, currY);
          ctx.stroke();
        }
      }

      // Structural Node Points
      for (const p of projectedVerts) {
        if (p.pz > -0.5) {
          const depthAlpha = Math.max(0.08, (p.pz + 1) * 0.55);
          const size = p.baseSize * Math.max(0.6, (p.pz + 1) * 0.9);

          ctx.fillStyle = p.pz > 0.4 ? "rgba(255, 255, 255, 0.95)" : `rgba(186, 230, 253, ${depthAlpha})`;
          ctx.beginPath();
          ctx.arc(p.px, p.py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleStart = (clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: clientX, y: clientY };
    velRef.current = { x: 0, y: 0 };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;
    const dx = clientX - lastMouseRef.current.x;
    const dy = clientY - lastMouseRef.current.y;

    velRef.current = { x: dy * 0.003, y: dx * 0.003 };
    rotRef.current.y += dx * 0.005;
    rotRef.current.x += dy * 0.005;

    lastMouseRef.current = { x: clientX, y: clientY };
  };

  const handleEnd = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[600px] cursor-grab active:cursor-grabbing select-none touch-none overflow-hidden bg-slate-950/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl"
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handleEnd}
    >
      {/* Background Radial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0)_0%,rgba(3,7,18,0.85)_100%)] pointer-events-none" />

      {/* GPU Accelerated 3D Neural Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
}
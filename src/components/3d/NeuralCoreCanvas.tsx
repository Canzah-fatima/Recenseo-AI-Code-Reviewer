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
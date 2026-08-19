"use client";

import { useState, useEffect } from "react";
import Starfield from "../components/3d/Starfield";
import NeuralCoreCanvas from "../components/3d/NeuralCoreCanvas";
import CircularTypewriter from "../components/CircularTypewriter";
import TopNavigationHUD from "../components/hud/TopNavigationHUD";
import BottomPillDock from "../components/hud/BottomPillDock";
import HUDLegend from "../components/hud/HUDLegend";

interface LandingViewProps {
  onLaunch: () => void;
}

export default function LandingView({ onLaunch }: LandingViewProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [zoomLevel, setZoomLevel] = useState(0.85);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(1.6, z + 0.15));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.45, z - 0.15));

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) {
        setZoomLevel((z) => Math.min(1.6, z + 0.05));
      } else {
        setZoomLevel((z) => Math.max(0.45, z - 0.05));
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020305] text-white select-none">
      <Starfield />

      {/* Top HUD Navigation */}
      <TopNavigationHUD onLaunchStudio={onLaunch} />

      {/* Center 3D Neural Canvas */}
      <main className="absolute inset-0 z-10">
        <NeuralCoreCanvas zoomLevel={zoomLevel} />
      </main>

      {/* Orbital Typewriter */}
      <div
        className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none transition-transform duration-300 ease-out"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <CircularTypewriter radius={185} />
      </div>

      {/* Bottom-Left: Stacked Category Pills */}
      <aside className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-30 pointer-events-auto">
        <BottomPillDock
          activeCategory={activeCategory}
          onSelectCategory={(cat) => setActiveCategory(cat)}
        />
      </aside>

      {/* Bottom-Right: (+ / -) Zoom Control */}
      <aside className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 pointer-events-auto">
        <HUDLegend onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
      </aside>
    </div>
  );
}
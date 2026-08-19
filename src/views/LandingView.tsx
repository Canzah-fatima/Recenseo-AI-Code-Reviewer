"use client";

import { useState, useEffect, useCallback } from "react";
import Starfield from "../components/3d/Starfield";
import NeuralCoreCanvas from "../components/3d/NeuralCoreCanvas";
import CircularTypewriter from "../components/CircularTypewriter";
import TopNavigationHUD from "../components/hud/TopNavigationHUD";
import BottomPillDock from "../components/hud/BottomPillDock";
import HUDLegend from "../components/hud/HUDLegend";

interface LandingViewProps {
  onLaunch: () => void;
}

const MIN_ZOOM = 0.45;
const MAX_ZOOM = 1.6;
const ZOOM_STEP = 0.15;
const WHEEL_STEP = 0.05;

export default function LandingView({ onLaunch }: LandingViewProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [zoomLevel, setZoomLevel] = useState(0.85);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)));
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      setZoomLevel((z) => {
        const delta = e.deltaY < 0 ? WHEEL_STEP : -WHEEL_STEP;
        return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(z + delta).toFixed(2)));
      });
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020305] text-white select-none">
      {/* Background Starfield Canvas */}
      <Starfield />

      {/* Top HUD Navigation */}
      <TopNavigationHUD onLaunchStudio={onLaunch} />

      {/* Center 3D Neural Canvas */}
      <main className="absolute inset-0 z-10" aria-label="3D Neural Visualization">
        <NeuralCoreCanvas zoomLevel={zoomLevel} />
      </main>

      {/* Orbital Circular Typewriter Overlay */}
      <div
        className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none transition-transform duration-300 ease-out will-change-transform"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <CircularTypewriter radius={185} />
      </div>

      {/* Bottom-Left: Stacked Category Pills */}
      <aside className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-30 pointer-events-auto">
        <BottomPillDock
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />
      </aside>

      {/* Bottom-Right: Zoom HUD Controls */}
      <aside className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 pointer-events-auto">
        <HUDLegend onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
      </aside>
    </div>
  );
}
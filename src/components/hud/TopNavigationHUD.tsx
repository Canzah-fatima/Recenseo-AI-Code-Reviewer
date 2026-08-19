"use client";

import React from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";

interface TopNavigationHUDProps {
  onLaunchStudio: () => void;
}

export default function TopNavigationHUD({ onLaunchStudio }: TopNavigationHUDProps) {
  return (
    <header className="absolute top-0 left-0 right-0 h-16 px-4 sm:px-8 flex items-center justify-between z-30 select-none pointer-events-auto">
      {/* Top Left: Logo + AI Code Reviewer Badge */}
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-sm bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] animate-pulse" />
        <span className="font-mono text-sm font-black tracking-widest text-white">
          RECENSEO
        </span>
        <span className="text-zinc-600 hidden xs:inline">/</span>
        <span className="font-mono text-[9px] tracking-wider px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-zinc-300 uppercase">
          AI Code Reviewer
        </span>
      </div>

      {/* Top Right: Launch Studio Action */}
      <button
        onClick={onLaunchStudio}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-mono font-bold text-xs uppercase tracking-wider transition active:scale-95 shadow-[0_0_24px_rgba(255,255,255,0.25)]"
      >
        <span>START NOW</span>
        <ArrowUpRight size={14} className="stroke-[2.5]" />
      </button>
    </header>
  );
}
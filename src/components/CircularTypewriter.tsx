"use client";

import { useState, useEffect, useId } from "react";

interface CircularTypewriterProps {
  phrases?: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  radius?: number;
  accentColor?: string;
  secondaryColor?: string;
}

const DEFAULT_PHRASES = [
  "NEURAL REASONING ENGINE • STATIC CODE ANALYSIS • AST SYNTHESIS • ",
  "DETECTING MEMORY LEAKS • SECURITY VULNERABILITIES • ALGORITHMIC BOTTLENECKS • ",
  "OPTIMIZING BIG-O COMPLEXITY • ARCHITECTURAL SKELETON REVIEWS • ",
];

export default function CircularTypewriter({
  phrases = DEFAULT_PHRASES,
  typingSpeed = 55,
  deletingSpeed = 28,
  pauseDuration = 2400,
  radius = 220,
  accentColor = "#38bdf8",
  secondaryColor = "#818cf8",
}: CircularTypewriterProps) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const uid = useId().replace(/:/g, "");
  const pathId = `orbit-path-${uid}`;

  // Typewriter Loop
  useEffect(() => {
    const fullText = phrases[currentPhraseIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayedText.length < fullText.length) {
        timer = setTimeout(() => {
          setDisplayedText(fullText.slice(0, displayedText.length + 1));
        }, typingSpeed);
      } else {
        timer = setTimeout(() => setIsDeleting(true), pauseDuration);
      }
    } else {
      if (displayedText.length > 0) {
        timer = setTimeout(() => {
          setDisplayedText(fullText.slice(0, displayedText.length - 1));
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentPhraseIndex, phrases, typingSpeed, deletingSpeed, pauseDuration]);

  const size = (radius + 60) * 2;
  const center = size / 2;

  // Concentric ring radii
  const innerRadius = radius - 24;
  const outerRadius = radius + 22;

  return (
    <div className="relative flex items-center justify-center pointer-events-none select-none w-full max-w-[680px] aspect-square mx-auto">
      {/* Ambient background glow */}
      <div
        className="absolute inset-1/4 rounded-full blur-[100px] opacity-25 pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${accentColor} 0%, ${secondaryColor} 70%, transparent 100%)`,
        }}
      />

      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full"
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* Circular Text Path */}
          <path
            id={pathId}
            d={`
              M ${center}, ${center - radius}
              a ${radius},${radius} 0 1,1 0,${radius * 2}
              a ${radius},${radius} 0 1,1 0,-${radius * 2}
            `}
          />
        </defs>

        {/* --- LAYER 1: OUTER TELEMETRY TICKS (Slow Clockwise) --- */}
        <g
          className="origin-center animate-[spin_120s_linear_infinite]"
          opacity={0.35}
        >
          <circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="none"
            stroke={accentColor}
            strokeWidth="1.5"
            strokeDasharray="2 12"
          />
          {/* Compass cardinal nodes */}
          <circle cx={center} cy={center - outerRadius} r="2.5" fill={accentColor} />
          <circle cx={center} cy={center + outerRadius} r="2.5" fill={accentColor} />
          <circle cx={center - outerRadius} cy={center} r="2.5" fill={accentColor} />
          <circle cx={center + outerRadius} cy={center} r="2.5" fill={accentColor} />
        </g>

        {/* --- LAYER 2: INNER TECHNICAL RETICLE (Counter-Clockwise) --- */}
        <g
          className="origin-center animate-[spin_80s_linear_infinite_reverse]"
          opacity={0.25}
        >
          <circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            strokeDasharray="40 18 10 18"
          />
          <circle
            cx={center}
            cy={center}
            r={innerRadius - 8}
            fill="none"
            stroke={secondaryColor}
            strokeWidth="0.75"
            strokeDasharray="2 6"
          />
        </g>

        {/* --- LAYER 3: MAIN TEXT ORBIT CARRIER (Slow Rotation) --- */}
        <g className="origin-center animate-[spin_60s_linear_infinite]">
          {/* Base Guide Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.07)"
            strokeWidth="1"
          />

          {/* Crisp Pure White Foreground Text (No Shadow) */}
          <text
            fill="#ffffff"
            className="font-mono text-[10.5px] uppercase font-bold tracking-[0.26em]"
          >
            <textPath href={`#${pathId}`} startOffset="0%">
              {displayedText}
              <tspan fill="#ffffff" className="animate-pulse">
                ▋
              </tspan>
            </textPath>
          </text>
        </g>
      </svg>
    </div>
  );
}
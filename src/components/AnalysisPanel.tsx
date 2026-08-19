"use client";
import { Braces } from "lucide-react";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Activity,
  FileText,
  GitCompare,
  Download,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  HardDrive,
  Copy,
  Check,
  Plus,
  Minus,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  MoreHorizontal,
  FileCode2,
} from "lucide-react";
import { downloadTextFile } from "../lib/storage";
import type { AnalysisResult, Diagnostic, CodeMetrics } from "../types";

type Tab = "diagnostics" | "explainer" | "diff";

interface Props {
  analysis: AnalysisResult | null;
  metrics: CodeMetrics | null;
  originalCode: string;
  isAnalyzing?: boolean;
  activeTab: Tab;
  onTabChange?: (tab: Tab) => void;
  onApplyPatch?: (code: string) => void;
  onDiagnosticClick: (line: number) => void;
  error?: string | null;
  onRetry?: () => void;
}

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  lineNum?: number;
}

function computeLineDiff(original: string, modified: string): DiffLine[] {
  const orig = original.split("\n");
  const mod = modified.split("\n");
  const m = orig.length;
  const n = mod.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (orig[i - 1] === mod[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  let i = m;
  let j = n;
  const temp: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && orig[i - 1] === mod[j - 1]) {
      temp.push({ type: "unchanged", content: orig[i - 1], lineNum: i });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      temp.push({ type: "added", content: mod[j - 1], lineNum: j });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      temp.push({ type: "removed", content: orig[i - 1], lineNum: i });
      i--;
    }
  }

  return temp.reverse();
}

export default function AnalysisPanel({
  analysis,
  metrics,
  originalCode,
  isAnalyzing = false,
  activeTab,
  onApplyPatch,
  onDiagnosticClick,
  error = null,
  onRetry,
}: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [patchApplied, setPatchApplied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowOptionsMenu(false);
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const diffLines = useMemo(() => {
    if (!analysis?.optimizedCode) return [];
    return computeLineDiff(originalCode, analysis.optimizedCode);
  }, [originalCode, analysis?.optimizedCode]);

  const addedCount = useMemo(
    () => diffLines.filter((l) => l.type === "added").length,
    [diffLines]
  );
  const removedCount = useMemo(
    () => diffLines.filter((l) => l.type === "removed").length,
    [diffLines]
  );
  const hasChanges = addedCount > 0 || removedCount > 0;

  const handleApply = () => {
    if (!analysis?.optimizedCode || !onApplyPatch) return;
    onApplyPatch(analysis.optimizedCode);
    setPatchApplied(true);
    setTimeout(() => setPatchApplied(false), 2200);
  };

  const handleCopyCode = () => {
    if (!analysis?.optimizedCode) return;
    navigator.clipboard.writeText(analysis.optimizedCode);
    setCopiedCode(true);
    setShowOptionsMenu(false);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleExportReport = () => {
    if (!analysis || !metrics) return;
    const lines = [
      `# RECENSEO CODE AUDIT REPORT`,
      `HEALTH INDEX: ${metrics.healthScore}/100 | LANGUAGE: ${analysis.language.toUpperCase()}`,
      `\n## ARCHITECTURAL SUMMARY\n${analysis.plainLanguageSummary}`,
      `\n## COMPLEXITY ANALYSIS\nTime: ${analysis.performanceAnalysis.timeComplexity} | Space: ${analysis.performanceAnalysis.spaceComplexity}`,
      `Bottleneck: ${analysis.performanceAnalysis.bottleneck}`,
      `\n## DIAGNOSTIC FINDINGS (${analysis.diagnostics.length})`,
      ...analysis.diagnostics.map(
        (d) =>
          `\n### [${d.severity.toUpperCase()}] ${d.title} (Line ${d.startLine})\n${d.message}\n> Remediation: ${d.remediation}`
      ),
    ];
    downloadTextFile("recenseo-audit.md", lines.join("\n"), "text/markdown");
    setShowOptionsMenu(false);
  };

  if (isAnalyzing) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center select-none bg-[#07090D]">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3" />
        <span className="font-mono text-xs font-bold tracking-widest text-white uppercase">
          Traversing AST Nodes…
        </span>
        <span className="font-mono text-[10px] text-zinc-500 mt-1 max-w-xs">
          Evaluating memory bounds, Big-O hotspots & security rules.
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center select-none bg-[#07090D] animate-in fade-in">
        <div className="w-10 h-10 rounded-full border border-rose-500/30 bg-rose-500/10 flex items-center justify-center mb-3 text-rose-400">
          <AlertCircle size={20} />
        </div>
        <h3 className="text-sm font-mono font-bold tracking-wider text-rose-300 uppercase mb-2">
          Engine Execution Notice
        </h3>
        <p className="text-xs font-mono text-rose-200/80 max-w-md leading-relaxed mb-4 bg-[#14080a] border border-rose-500/20 p-3 rounded-xl break-words">
          {error}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-mono font-bold text-xs uppercase tracking-wider transition active:scale-95 shadow-md"
          >
            <RotateCcw size={12} />
            <span>Retry Analysis</span>
          </button>
        )}
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center select-none text-zinc-500 bg-[#07090D]">
        

{/* ... */}
<div className="w-10 h-10 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-center mb-3 text-zinc-400">
  <Braces size={25} className="text-zinc-400" />
</div>
        <h3 className="text-sm font-semibold text-zinc-200 mb-1">
          Ready for telemetry
        </h3>
        <p className="text-xs font-mono text-zinc-500 max-w-xs leading-relaxed">
          Click <span className="text-zinc-300 font-bold">ANALYZE</span> to inspect AST branches and evaluate AI patches.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col overflow-hidden bg-[#07090D]">
      {/* ── SUB-HEADER: VS CODE ACTION BAR & STATUS ── */}
      <div className="h-9 px-3 sm:px-4 border-b border-white/[0.06] bg-[#050608] flex items-center justify-between font-mono text-[10px] tracking-wider shrink-0 select-none">
        {/* Left Status Indicators */}
        {activeTab === "diagnostics" && metrics && (
          <div className="flex items-center gap-3">
            <span className="text-zinc-500">HEALTH:</span>
            <span className={`font-bold ${metrics.healthScore >= 80 ? "text-emerald-400" : "text-amber-400"}`}>
              {metrics.healthScore}/100
            </span>
            <span className="text-zinc-700">|</span>
            <span className="text-rose-400 font-bold">{metrics.criticalCount} C</span>
            <span className="text-amber-400 font-bold">{metrics.warningCount} W</span>
            <span className="text-sky-400 font-bold">{metrics.infoCount} I</span>
          </div>
        )}

        {activeTab === "explainer" && (
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="text-zinc-200 font-bold uppercase">AST ARCHITECTURE SPEC</span>
          </div>
        )}

        {activeTab === "diff" && (
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">DIFF:</span>
            <span className="text-emerald-400 font-bold">+{addedCount}</span>
            <span className="text-rose-400 font-bold">-{removedCount}</span>
          </div>
        )}

        {/* Right VS Code Action Popover Menu */}
        <div className="relative ml-auto" ref={menuRef}>
          <button
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.08] transition flex items-center gap-1"
            title="More Actions"
          >
            <MoreHorizontal size={14} />
          </button>

          {showOptionsMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-[#0b0d12] border border-white/15 shadow-2xl p-1 z-50 divide-y divide-white/[0.04] font-mono text-[11px] animate-in fade-in zoom-in-95">
              <button
                onClick={handleExportReport}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white flex items-center gap-2 transition"
              >
                <Download size={12} className="text-zinc-400" />
                <span>Download Report</span>
              </button>
              <button
                onClick={handleCopyCode}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white flex items-center gap-2 transition"
              >
                {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="text-zinc-400" />}
                <span>{copiedCode ? "Copied Code" : "Copy Refactored"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 overflow-y-auto pb-14">
        {/* TAB 1: COLLAPSIBLE ISSUES ACCORDION */}
        {activeTab === "diagnostics" && (
          <div className="divide-y divide-white/[0.04]">
            {analysis.diagnostics.length === 0 ? (
              <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-xs m-3">
                <CheckCircle2 size={16} />
                <span>Zero structural issues found. Clean syntax verified.</span>
              </div>
            ) : (
              analysis.diagnostics.map((d: Diagnostic, index: number) => {
                const isOpen = expandedIndex === index;
                const isCritical = d.severity === "critical";
                const isWarning = d.severity === "warning";

                return (
                  <div
                    key={index}
                    className={`transition-colors duration-150 ${
                      isOpen ? "bg-white/[0.025]" : "hover:bg-white/[0.01]"
                    }`}
                  >
                    {/* Header Row */}
                    <div
                      onClick={() => setExpandedIndex(isOpen ? null : index)}
                      className="px-3.5 sm:px-4 py-3 flex items-center justify-between cursor-pointer gap-3 select-none"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isCritical ? (
                          <AlertTriangle size={14} className="text-rose-400 shrink-0" />
                        ) : isWarning ? (
                          <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                        ) : (
                          <Info size={14} className="text-sky-400 shrink-0" />
                        )}

                        <span className="font-semibold text-xs text-white truncate">
                          {d.title}
                        </span>

                        <span
                          className={`font-mono text-[8px] px-1.5 py-0.2 rounded uppercase font-bold shrink-0 ${
                            isCritical
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : isWarning
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                          }`}
                        >
                          {d.severity}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDiagnosticClick(d.startLine);
                          }}
                          className="font-mono text-[9px] px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-400 hover:text-white transition"
                        >
                          LN {d.startLine}
                        </button>
                        <ChevronRight
                          size={13}
                          className={`text-zinc-500 transition-transform duration-200 ${
                            isOpen ? "rotate-90 text-white" : ""
                          }`}
                        />
                      </div>
                    </div>

                    {/* Collapsible Body */}
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs space-y-3 font-sans border-t border-white/[0.03] animate-in fade-in">
                        <p className="text-zinc-300 leading-relaxed pl-6">{d.message}</p>
                        {d.remediation && (
                          <div className="ml-6 p-3 rounded-lg bg-black/60 border border-white/[0.06] font-mono text-[11px]">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
                              REMEDIATION PLAN
                            </span>
                            <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                              {d.remediation}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: EXPLAINER */}
        {activeTab === "explainer" && (
          <div className="p-4 space-y-4 font-sans">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <span className="font-mono text-[10px] text-zinc-500 uppercase font-bold tracking-widest block">
                EXECUTIVE OVERVIEW
              </span>
              <h3 className="text-sm sm:text-base font-semibold text-white">
                Architectural analysis & code synthesis.
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                {analysis.plainLanguageSummary}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-bold uppercase mb-1">
                  <Clock size={12} />
                  <span>TIME COMPLEXITY</span>
                </div>
                <div className="text-sm font-bold text-white mb-1">
                  {analysis.performanceAnalysis.timeComplexity}
                </div>
                <p className="text-[11px] text-zinc-400">
                  {analysis.performanceAnalysis.bottleneck || "Static bound analysis."}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-bold uppercase mb-1">
                  <HardDrive size={12} />
                  <span>SPACE COMPLEXITY</span>
                </div>
                <div className="text-sm font-bold text-white mb-1">
                  {analysis.performanceAnalysis.spaceComplexity}
                </div>
                <p className="text-[11px] text-zinc-400">Auxiliary allocation.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COPILOT DIFF */}
        {activeTab === "diff" && (
          <div className="h-full flex flex-col font-mono text-[11px] sm:text-xs">
            {!hasChanges ? (
              <div className="flex flex-col items-center justify-center p-8 text-center select-none text-zinc-500">
                <CheckCircle2 size={32} className="text-emerald-400 mb-3" />
                <h4 className="text-sm font-semibold text-white mb-1">
                  All improvements applied
                </h4>
                <p className="text-xs font-mono text-zinc-400">
                  Source editor is currently synchronized with model output.
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-[1px] select-text">
                {diffLines.map((line, idx) => {
                  const isAdded = line.type === "added";
                  const isRemoved = line.type === "removed";

                  return (
                    <div
                      key={idx}
                      className={`flex items-start rounded-sm py-0.5 px-2 leading-5 font-mono ${
                        isAdded
                          ? "bg-emerald-950/40 text-emerald-200 border-l-2 border-emerald-400"
                          : isRemoved
                          ? "bg-rose-950/40 text-rose-300 border-l-2 border-rose-500 line-through opacity-80"
                          : "text-zinc-400 hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="w-7 shrink-0 text-right pr-2 text-[10px] text-zinc-600 select-none">
                        {line.lineNum ?? ""}
                      </div>
                      <div className="w-3 shrink-0 flex items-center justify-center select-none pt-0.5 font-bold">
                        {isAdded && <Plus size={10} className="text-emerald-400 stroke-[3]" />}
                        {isRemoved && <Minus size={10} className="text-rose-400 stroke-[3]" />}
                      </div>
                      <pre className="flex-1 overflow-x-auto whitespace-pre font-mono pl-1 text-[11px]">
                        {line.content || " "}
                      </pre>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── COPILOT-STYLE FLOATING BOTTOM APPLY PILL ── */}
      {hasChanges && onApplyPatch && (
        <div className="absolute bottom-3 right-3 sm:right-4 z-40 animate-in fade-in slide-in-from-bottom-2">
          <button
            onClick={handleApply}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-mono font-bold text-xs uppercase tracking-wider transition active:scale-95 shadow-[0_8px_24px_rgba(0,0,0,0.8)] border border-white/20"
          >
            <CheckCircle2 size={13} className="text-black" />
            <span>{patchApplied ? "APPLIED FIX" : "APPLY FIX"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
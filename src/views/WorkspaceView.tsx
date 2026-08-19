// "use client";

// import { useState } from "react";
// import {
//   Terminal,
//   Play,
//   Upload,
//   ChevronDown,
//   ShieldAlert,
//   Zap,
//   Cpu,
//   Layers,
//   Square,
//   Activity,
//   FileText,
//   GitCompare,
//   Code2,
// } from "lucide-react";
// import CodeEditor from "../components/CodeEditor";
// import AnalysisPanel from "../components/AnalysisPanel";
// import { analyzeCode } from "../lib/gemini";
// import type { AnalysisResult, CodeMetrics } from "../types";

// const SAMPLE_PRESETS = [
//   {
//     label: "Dynamic Eval Vulnerability",
//     icon: ShieldAlert,
//     lang: "python",
//     code: `import os\n\ndef execute_query(user_payload: str):\n    # AST-SEC-409: Arbitrary code execution vector\n    sanitized = user_payload.strip()\n    return eval(f"process_{sanitized}()")\n\ndef main():\n    raw_input = "__import__('os').system('rm -rf /')"\n    execute_query(raw_input)\n\nif __name__ == '__main__':\n    main()`,
//   },
//   {
//     label: "Nested O(n²) Complexity",
//     icon: Zap,
//     lang: "python",
//     code: `def match_dataset_duplicates(records: list[dict]):\n    duplicates = []\n    # AST-PERF-102: Nested quadratic iteration bottleneck\n    for i in range(len(records)):\n        for j in range(len(records)):\n            if i != j and records[i]['hash'] == records[j]['hash']:\n                if records[i] not in duplicates:\n                    duplicates.append(records[i])\n    return duplicates`,
//   },
//   {
//     label: "Unbounded Closure Retention",
//     icon: Cpu,
//     lang: "typescript",
//     code: `class WorkerScope {\n  private registry = new Map<string, Function>();\n  \n  public registerListener(id: string, stream: any) {\n    // AST-MEM-003: Unreleased event listener scope retention\n    const heavyweightBuffer = new Array(100000).fill("0xDEADBEEF");\n    stream.on("data", (chunk: any) => {\n      console.log(chunk, heavyweightBuffer.length);\n    });\n  }\n}`,
//   },
// ];

// interface WorkspaceViewProps {
//   onBackToLanding?: () => void;
// }

// type Tab = "diagnostics" | "explainer" | "diff";

// export default function WorkspaceView({ onBackToLanding }: WorkspaceViewProps) {
//   const [code, setCode] = useState("");
//   const [language, setLanguage] = useState("python");
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
//   const [metrics, setMetrics] = useState<CodeMetrics | null>(null);
//   const [highlightLine, setHighlightLine] = useState<number | null>(null);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);
//   const [modelUsed, setModelUsed] = useState<string | null>(null);
//   const [activeTab, setActiveTab] = useState<Tab>("diagnostics");
//   const [mobileView, setMobileView] = useState<"editor" | "audit">("editor");

//   const handleRunAnalysis = async () => {
//     if (!code.trim()) return;
//     setIsAnalyzing(true);
//     setErrorMessage(null);
//     setMobileView("audit");

//     const calculatedLines = code.split("\n").length;
//     const filename = `main.${language === "python" ? "py" : language === "typescript" ? "ts" : "js"}`;

//     try {
//       const { result, modelUsed: usedModel } = await analyzeCode(code, filename, language);

//       const critical = result.diagnostics.filter((d) => d.severity === "critical").length;
//       const warning = result.diagnostics.filter((d) => d.severity === "warning").length;
//       const info = result.diagnostics.filter((d) => d.severity === "info").length;

//       const computedScore = Math.max(10, 100 - critical * 25 - warning * 10 - info * 5);

//       setMetrics({
//         healthScore: computedScore,
//         linesOfCode: calculatedLines,
//         criticalCount: critical,
//         warningCount: warning,
//         infoCount: info,
//       });
//       setAnalysis(result);
//       setModelUsed(usedModel);
//     } catch (err: any) {
//       setErrorMessage(err.message || "Failed to analyze code.");
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   return (
//     <div className="relative w-screen h-screen bg-[#050608] text-white flex flex-col select-none overflow-hidden font-sans">
//       <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:24px_24px]" />

//       {/* ── 1. GLOBAL COMMAND DECK ── */}
//       <header className="h-12 px-3 sm:px-4 border-b border-white/[0.08] bg-[#07090D]/90 backdrop-blur-xl flex items-center justify-between gap-2 z-30 shrink-0">
//         <div className="flex items-center gap-2.5 shrink-0">
//           <button
//             onClick={onBackToLanding}
//             className="flex items-center gap-2 text-white font-mono font-bold text-xs tracking-widest uppercase hover:opacity-80 transition"
//           >
//             <div className="w-2 h-2 rounded-sm bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
//             <span>RECENSEO</span>
//             <span className="hidden sm:inline text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-400 font-normal">
//               STUDIO
//             </span>
//           </button>

//           <div className="h-3.5 w-px bg-white/10 hidden xs:block" />

//           {/* Compact Language Tag */}
//           <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.08] text-[10px] font-mono text-zinc-400">
//             <span className="uppercase font-semibold">{language}</span>
//           </div>

//           <label className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.04] cursor-pointer transition">
//             <Upload size={13} />
//             <input
//               type="file"
//               className="hidden"
//               onChange={(e) => {
//                 const file = e.target.files?.[0];
//                 if (file) {
//                   const reader = new FileReader();
//                   reader.onload = (ev) => setCode((ev.target?.result as string) || "");
//                   reader.readAsText(file);
//                 }
//               }}
//             />
//           </label>
//         </div>

//         {/* Center: View Toggles for Mobile / Responsive Screens */}
//         <div className="flex lg:hidden items-center p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
//           <button
//             onClick={() => setMobileView("editor")}
//             className={`px-2.5 py-1 rounded-md font-mono text-[10px] font-bold flex items-center gap-1 transition ${
//               mobileView === "editor" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
//             }`}
//           >
//             <Code2 size={11} />
//             <span>Code</span>
//           </button>
//           <button
//             onClick={() => setMobileView("audit")}
//             className={`px-2.5 py-1 rounded-md font-mono text-[10px] font-bold flex items-center gap-1 transition ${
//               mobileView === "audit" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
//             }`}
//           >
//             <Activity size={11} />
//             <span>Audit</span>
//             {analysis && (
//               <span className="text-[9px] px-1 rounded bg-white/20 ml-0.5">
//                 {analysis.diagnostics.length}
//               </span>
//             )}
//           </button>
//         </div>

//         {/* Right Primary Action */}
//         <div className="flex items-center shrink-0">
//           <button
//             onClick={handleRunAnalysis}
//             disabled={isAnalyzing || !code.trim()}
//             className="group relative overflow-hidden h-7 sm:h-8 px-3.5 sm:px-4 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-40 disabled:hover:bg-white text-black font-mono font-bold text-[10px] sm:text-xs tracking-wider uppercase transition shadow-lg flex items-center gap-1.5 active:scale-95"
//           >
//             {isAnalyzing ? (
//               <>
//                 <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
//                 <span>ANALYZING…</span>
//               </>
//             ) : (
//               <>
//                 <Play size={10} className="fill-black" />
//                 <span>ANALYZE</span>
//               </>
//             )}
//           </button>
//         </div>
//       </header>

//       {/* ── 2. INSET DUAL WORKSPACE PANES ── */}
//       <main className="flex-1 p-2 sm:p-3 grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-hidden z-20">
//         {/* Source Code Panel */}
//         <div
//           className={`relative flex-col rounded-2xl bg-[#07090D] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden ${
//             mobileView === "editor" ? "flex" : "hidden lg:flex"
//           }`}
//         >
//           <div className="h-9 px-4 border-b border-white/[0.06] bg-white/[0.01] flex items-center justify-between text-[10px] font-mono text-zinc-400 shrink-0">
//             <div className="flex items-center gap-2">
//               <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
//               <span className="text-zinc-200 font-semibold uppercase">SOURCE BUFFER</span>
//               <span className="text-zinc-600">/</span>
//               <span className="text-zinc-500">main.{language === "python" ? "py" : "ts"}</span>
//             </div>
//             <div className="flex items-center gap-3">
//               <span>UTF-8</span>
//               <span>{code ? `${new Blob([code]).size} B` : "0 B"}</span>
//             </div>
//           </div>

//           <div className="flex-1 relative overflow-hidden">
//             <CodeEditor
//               code={code}
//               language={language}
//               diagnostics={analysis?.diagnostics ?? []}
//               highlightLine={highlightLine}
//               onChange={(newCode: string) => setCode(newCode)}
//               onDrop={(file: File) => {
//                 const reader = new FileReader();
//                 reader.onload = (ev) => setCode((ev.target?.result as string) || "");
//                 reader.readAsText(file);
//               }}
//             />

//             {!code && (
//               <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6 bg-[#07090D]/90 backdrop-blur-[2px]">
//                 <div className="pointer-events-auto max-w-md w-full flex flex-col items-center text-center">
//                   <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-3">
//                     <Layers size={18} className="text-zinc-300" />
//                   </div>
//                   <h3 className="text-sm font-semibold text-white mb-1">
//                     Ingest or load an AST test vector
//                   </h3>
//                   <p className="text-xs text-zinc-500 font-mono mb-4">
//                     Type source code directly or test predefined architectural patterns:
//                   </p>

//                   <div className="w-full space-y-2">
//                     {SAMPLE_PRESETS.map((preset, idx) => {
//                       const Icon = preset.icon;
//                       return (
//                         <button
//                           key={idx}
//                           onClick={() => {
//                             setCode(preset.code);
//                             setLanguage(preset.lang);
//                           }}
//                           className="w-full px-3 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 transition flex items-center justify-between text-left group"
//                         >
//                           <div className="flex items-center gap-2.5">
//                             <Icon size={14} className="text-zinc-400 group-hover:text-white" />
//                             <span className="text-xs font-mono text-zinc-300 group-hover:text-white font-medium">
//                               {preset.label}
//                             </span>
//                           </div>
//                           <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300 uppercase">
//                             LOAD →
//                           </span>
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Audit & Intelligence Panel */}
//         <div
//           className={`relative flex-col rounded-2xl bg-[#07090D] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden ${
//             mobileView === "audit" ? "flex" : "hidden lg:flex"
//           }`}
//         >
//           <AnalysisPanel
//             analysis={analysis}
//             metrics={metrics}
//             originalCode={code}
//             isAnalyzing={isAnalyzing}
//             activeTab={activeTab}
//             onApplyPatch={(patchedCode: string) => {
//               setCode(patchedCode);
//               setMobileView("editor");
//             }}
//             onDiagnosticClick={(line: number) => {
//               setHighlightLine(line);
//               setMobileView("editor");
//             }}
//             error={errorMessage}
//             onRetry={handleRunAnalysis}
//           />
//         </div>
//       </main>

//       {/* ── 3. BOTTOM GLOBAL STATUS RIBBON ── */}
//       <footer className="h-6 px-3 sm:px-4 border-t border-white/[0.08] bg-[#07090D] text-[9px] font-mono text-zinc-500 flex items-center justify-between shrink-0 z-30 select-none">
//         <div className="flex items-center gap-2.5">
//           <span className="flex items-center gap-1.5 text-zinc-300 font-semibold">
//             <Terminal size={10} /> RECENSEO AST CORE
//           </span>
//           <span className="text-zinc-700">·</span>
//           <span>{modelUsed ? `ENGINE: ${modelUsed.toUpperCase()}` : "GEMINI 3.7 / 2.5 FLASH"}</span>
//           <span className="text-zinc-700">·</span>
//           <span>{code.split("\n").filter(Boolean).length} LINES COMPILED</span>
//         </div>

//         <div className="hidden sm:flex items-center gap-4">
//           <span className="text-zinc-400">SECURE ISOLATED SANDBOX</span>
//         </div>
//       </footer>
//     </div>
//   );
// }





























"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Terminal,
  Play,
  Upload,
  ShieldAlert,
  Zap,
  Cpu,
  Layers,
  Activity,
  Code2,
  ChevronDown,
} from "lucide-react";
import CodeEditor from "../components/CodeEditor";
import AnalysisPanel from "../components/AnalysisPanel";
import { analyzeCode } from "../lib/gemini";
import type { AnalysisResult, CodeMetrics } from "../types";

const SUPPORTED_LANGUAGES = [
  { id: "python", label: "Python", ext: "py" },
  { id: "typescript", label: "TypeScript", ext: "ts" },
  { id: "javascript", label: "JavaScript", ext: "js" },
  { id: "rust", label: "Rust", ext: "rs" },
  { id: "go", label: "Go", ext: "go" },
  { id: "cpp", label: "C++", ext: "cpp" },
];

const SAMPLE_PRESETS = [
  {
    label: "Dynamic Eval Vulnerability",
    icon: ShieldAlert,
    lang: "python",
    code: `import os\n\ndef execute_query(user_payload: str):\n    # AST-SEC-409: Arbitrary code execution vector\n    sanitized = user_payload.strip()\n    return eval(f"process_{sanitized}()")\n\ndef main():\n    raw_input = "__import__('os').system('rm -rf /')"\n    execute_query(raw_input)\n\nif __name__ == '__main__':\n    main()`,
  },
  {
    label: "Nested O(n²) Complexity",
    icon: Zap,
    lang: "python",
    code: `def match_dataset_duplicates(records: list[dict]):\n    duplicates = []\n    # AST-PERF-102: Nested quadratic iteration bottleneck\n    for i in range(len(records)):\n        for j in range(len(records)):\n            if i != j and records[i]['hash'] == records[j]['hash']:\n                if records[i] not in duplicates:\n                    duplicates.append(records[i])\n    return duplicates`,
  },
  {
    label: "Unbounded Closure Retention",
    icon: Cpu,
    lang: "typescript",
    code: `class WorkerScope {\n  private registry = new Map<string, Function>();\n  \n  public registerListener(id: string, stream: any) {\n    // AST-MEM-003: Unreleased event listener scope retention\n    const heavyweightBuffer = new Array(100000).fill("0xDEADBEEF");\n    stream.on("data", (chunk: any) => {\n      console.log(chunk, heavyweightBuffer.length);\n    });\n  }\n}`,
  },
];

interface WorkspaceViewProps {
  onBackToLanding?: () => void;
}

type Tab = "diagnostics" | "explainer" | "diff";

export default function WorkspaceView({ onBackToLanding }: WorkspaceViewProps) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [metrics, setMetrics] = useState<CodeMetrics | null>(null);
  const [highlightLine, setHighlightLine] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("diagnostics");
  const [mobileView, setMobileView] = useState<"editor" | "audit">("editor");

  const inferLanguageFromFilename = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "py":
        return "python";
      case "ts":
      case "tsx":
        return "typescript";
      case "js":
      case "jsx":
        return "javascript";
      case "rs":
        return "rust";
      case "go":
        return "go";
      case "cpp":
      case "cc":
      case "cxx":
        return "cpp";
      default:
        return language;
    }
  };

  const handleRunAnalysis = useCallback(async () => {
    if (!code.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setErrorMessage(null);
    setMobileView("audit");

    const calculatedLines = code.split("\n").length;
    const currentExt = SUPPORTED_LANGUAGES.find((l) => l.id === language)?.ext || "txt";
    const filename = `main.${currentExt}`;

    try {
      const { result, modelUsed: usedModel } = await analyzeCode(code, filename, language);

      const critical = result.diagnostics.filter((d) => d.severity === "critical").length;
      const warning = result.diagnostics.filter((d) => d.severity === "warning").length;
      const info = result.diagnostics.filter((d) => d.severity === "info").length;

      const computedScore = Math.max(10, 100 - critical * 25 - warning * 10 - info * 5);

      setMetrics({
        healthScore: computedScore,
        linesOfCode: calculatedLines,
        criticalCount: critical,
        warningCount: warning,
        infoCount: info,
      });
      setAnalysis(result);
      setModelUsed(usedModel);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to analyze code.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [code, language, isAnalyzing]);

  // Shortcut handler: Cmd/Ctrl + Enter to trigger analysis
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleRunAnalysis();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRunAnalysis]);

  const handleFileUpload = (file: File) => {
    const detectedLang = inferLanguageFromFilename(file.name);
    setLanguage(detectedLang);
    const reader = new FileReader();
    reader.onload = (ev) => setCode((ev.target?.result as string) || "");
    reader.readAsText(file);
  };

  return (
    <div className="relative w-screen h-screen bg-[#050608] text-white flex flex-col select-none overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* ── 1. GLOBAL COMMAND DECK ── */}
      <header className="h-12 px-3 sm:px-4 border-b border-white/[0.08] bg-[#07090D]/90 backdrop-blur-xl flex items-center justify-between gap-2 z-30 shrink-0">
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-2 text-white font-mono font-bold text-xs tracking-widest uppercase hover:opacity-80 transition"
          >
            <div className="w-2 h-2 rounded-sm bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            <span>RECENSEO</span>
            <span className="hidden sm:inline text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-400 font-normal">
              STUDIO
            </span>
          </button>

          <div className="h-3.5 w-px bg-white/10 hidden xs:block" />

          {/* Interactive Language Selector */}
          <div className="relative flex items-center">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="appearance-none bg-white/[0.03] border border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white px-2.5 py-1 pr-6 rounded-md text-[10px] font-mono uppercase font-semibold cursor-pointer outline-none transition"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id} className="bg-[#07090D] text-zinc-300">
                  {lang.label}
                </option>
              ))}
            </select>
            <ChevronDown size={10} className="absolute right-2 text-zinc-500 pointer-events-none" />
          </div>

          <label className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.04] cursor-pointer transition">
            <Upload size={13} />
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
          </label>
        </div>

        {/* Center: Mobile Responsive Segmented Control */}
        <div className="flex lg:hidden items-center p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
          <button
            onClick={() => setMobileView("editor")}
            className={`px-2.5 py-1 rounded-md font-mono text-[10px] font-bold flex items-center gap-1 transition ${
              mobileView === "editor" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Code2 size={11} />
            <span>Code</span>
          </button>
          <button
            onClick={() => setMobileView("audit")}
            className={`px-2.5 py-1 rounded-md font-mono text-[10px] font-bold flex items-center gap-1 transition ${
              mobileView === "audit" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Activity size={11} />
            <span>Audit</span>
            {analysis && (
              <span className="text-[9px] px-1 rounded bg-white/20 ml-0.5">
                {analysis.diagnostics.length}
              </span>
            )}
          </button>
        </div>

        {/* Right Action */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden md:inline text-[10px] font-mono text-zinc-500">⌘ + ↵</span>
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing || !code.trim()}
            className="group relative overflow-hidden h-7 sm:h-8 px-3.5 sm:px-4 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-40 disabled:hover:bg-white text-black font-mono font-bold text-[10px] sm:text-xs tracking-wider uppercase transition shadow-lg flex items-center gap-1.5 active:scale-95"
          >
            {isAnalyzing ? (
              <>
                <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>ANALYZING…</span>
              </>
            ) : (
              <>
                <Play size={10} className="fill-black" />
                <span>ANALYZE</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── 2. INSET DUAL WORKSPACE PANES ── */}
      <main className="flex-1 p-2 sm:p-3 grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-hidden z-20">
        {/* Source Code Panel */}
        <div
          className={`relative flex-col rounded-2xl bg-[#07090D] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden ${
            mobileView === "editor" ? "flex" : "hidden lg:flex"
          }`}
        >
          <div className="h-9 px-4 border-b border-white/[0.06] bg-white/[0.01] flex items-center justify-between text-[10px] font-mono text-zinc-400 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
              <span className="text-zinc-200 font-semibold uppercase">SOURCE BUFFER</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-500">
                main.{SUPPORTED_LANGUAGES.find((l) => l.id === language)?.ext || "txt"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span>UTF-8</span>
              <span>{code ? `${new Blob([code]).size} B` : "0 B"}</span>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <CodeEditor
              code={code}
              language={language}
              diagnostics={analysis?.diagnostics ?? []}
              highlightLine={highlightLine}
              onChange={(newCode: string) => setCode(newCode)}
              onDrop={handleFileUpload}
            />

            {!code && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6 bg-[#07090D]/90 backdrop-blur-[2px]">
                <div className="pointer-events-auto max-w-md w-full flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-3">
                    <Layers size={18} className="text-zinc-300" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">
                    Ingest or load an AST test vector
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono mb-4">
                    Type source code directly or test predefined architectural patterns:
                  </p>

                  <div className="w-full space-y-2">
                    {SAMPLE_PRESETS.map((preset, idx) => {
                      const Icon = preset.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setCode(preset.code);
                            setLanguage(preset.lang);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 transition flex items-center justify-between text-left group"
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon size={14} className="text-zinc-400 group-hover:text-white" />
                            <span className="text-xs font-mono text-zinc-300 group-hover:text-white font-medium">
                              {preset.label}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300 uppercase">
                            LOAD →
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Audit & Intelligence Panel */}
        <div
          className={`relative flex-col rounded-2xl bg-[#07090D] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden ${
            mobileView === "audit" ? "flex" : "hidden lg:flex"
          }`}
        >
          <AnalysisPanel
            analysis={analysis}
            metrics={metrics}
            originalCode={code}
            isAnalyzing={isAnalyzing}
            activeTab={activeTab}
            onTabChange={(tab: Tab) => setActiveTab(tab)}
            onApplyPatch={(patchedCode: string) => {
              setCode(patchedCode);
              setMobileView("editor");
            }}
            onDiagnosticClick={(line: number) => {
              setHighlightLine(line);
              setMobileView("editor");
            }}
            error={errorMessage}
            onRetry={handleRunAnalysis}
          />
        </div>
      </main>

      {/* ── 3. BOTTOM GLOBAL STATUS RIBBON ── */}
      <footer className="h-6 px-3 sm:px-4 border-t border-white/[0.08] bg-[#07090D] text-[9px] font-mono text-zinc-500 flex items-center justify-between shrink-0 z-30 select-none">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 text-zinc-300 font-semibold">
            <Terminal size={10} /> RECENSEO AST CORE
          </span>
          <span className="text-zinc-700">·</span>
          <span>{modelUsed ? `ENGINE: ${modelUsed.toUpperCase()}` : "GEMINI 2.5 FLASH"}</span>
          <span className="text-zinc-700">·</span>
          <span>{code.split("\n").filter(Boolean).length} LINES COMPILED</span>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <span className="text-zinc-400">SECURE ISOLATED SANDBOX</span>
        </div>
      </footer>
    </div>
  );
}
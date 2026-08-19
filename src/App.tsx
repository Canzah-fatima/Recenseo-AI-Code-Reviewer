"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Play,
  Upload,
  ChevronDown,
  FilePlus,
  Square,
  FolderTree,
  PanelLeftClose,
  PanelLeft,
  Trash2,
  FileCode,
  Edit2,
  Check,
  MoreVertical,
  Code2,
  Activity,
  FileText,
  GitCompare,
} from "lucide-react";
import CodeEditor from "./components/CodeEditor";
import AnalysisPanel from "./components/AnalysisPanel";
import LandingView from "./views/LandingView";
import { ALL_LANGUAGES, EXT_TO_LANG } from "./lib/presets";
import { analyzeCode } from "./lib/gemini";
import { deriveMetrics } from "./types";
import type { AnalysisResult, CodeMetrics } from "./types";

interface WorkspaceFile {
  id: string;
  name: string;
  language: string;
  code: string;
}

export type MainTab = "editor" | "diagnostics" | "explainer" | "diff";

export default function App() {
  const [currentView, setCurrentView] = useState<"landing" | "studio">("landing");

  const [files, setFiles] = useState<WorkspaceFile[]>([
    { id: "1", name: "main.py", language: "python", code: "" },
  ]);
  const [activeFileId, setActiveFileId] = useState<string>("1");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MainTab>("editor");

  const [editorWidthPercent, setEditorWidthPercent] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const splitPaneRef = useRef<HTMLDivElement>(null);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [metrics, setMetrics] = useState<CodeMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [highlightLine, setHighlightLine] = useState<number | null>(null);

  const [showLangMenu, setShowLangMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: Event) => {
      const target = e.target as Node;
      if (langMenuRef.current && !langMenuRef.current.contains(target)) {
        setShowLangMenu(false);
      }
      if (!(target as HTMLElement).closest(".file-menu-container")) {
        setActiveMenuId(null);
      }
    };
    window.addEventListener("pointerdown", handleOutsideClick, true);
    return () => window.removeEventListener("pointerdown", handleOutsideClick, true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !splitPaneRef.current) return;
      const containerRect = splitPaneRef.current.getBoundingClientRect();
      const relativeX = e.clientX - containerRect.left;
      const computedPercent = (relativeX / containerRect.width) * 100;
      if (computedPercent > 20 && computedPercent < 80) {
        setEditorWidthPercent(computedPercent);
      }
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const updateActiveCode = (newCode: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === activeFileId ? { ...f, code: newCode } : f))
    );
  };

  const handleAnalyze = useCallback(async () => {
    if (!activeFile.code.trim()) {
      setError("The editor buffer is empty.");
      return;
    }

    setActiveTab("diagnostics");

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsAnalyzing(true);
    setError(null);
    setStatusMessage("Running AST and multi-engine code review...");

    try {
      const { result, modelUsed: usedModel } = await analyzeCode(
        activeFile.code,
        activeFile.name,
        activeFile.language,
        controller.signal
      );
      setAnalysis(result);
      setMetrics(deriveMetrics(activeFile.code, result.diagnostics));
      setModelUsed(usedModel);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
      setStatusMessage(null);
      abortControllerRef.current = null;
    }
  }, [activeFile]);

  const handleLanguageChange = (newLang: string) => {
    const matched = ALL_LANGUAGES.find((l) => l.id === newLang);
    const ext = matched ? matched.ext : "txt";
    const base = activeFile.name.split(".")[0] || "untitled";
    setFiles((prev) =>
      prev.map((f) =>
        f.id === activeFileId ? { ...f, language: newLang, name: `${base}.${ext}` } : f
      )
    );
    setShowLangMenu(false);
  };

  const handleStartRename = (file: WorkspaceFile, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRenamingId(file.id);
    setTempName(file.name);
    setActiveMenuId(null);
  };

  const handleSaveRename = (id: string) => {
    if (!tempName.trim()) {
      setRenamingId(null);
      return;
    }
    const ext = tempName.split(".").pop()?.toLowerCase() ?? "";
    const detectedLang = EXT_TO_LANG[ext] || activeFile.language;
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: tempName.trim(), language: detectedLang } : f))
    );
    setRenamingId(null);
  };

  const handleNewFile = () => {
    const newId = String(Date.now());
    const newFile: WorkspaceFile = {
      id: newId,
      name: `file_${files.length + 1}.py`,
      language: "python",
      code: "",
    };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newId);
    setAnalysis(null);
    setMetrics(null);
    setError(null);
  };

  const handleDeleteFile = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveMenuId(null);
    if (files.length === 1) {
      updateActiveCode("");
      return;
    }
    const remaining = files.filter((f) => f.id !== id);
    setFiles(remaining);
    if (activeFileId === id) {
      setActiveFileId(remaining[0].id);
    }
  };

  const handleFileDrop = useCallback((file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const detectedLang = EXT_TO_LANG[ext] ?? "plaintext";
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const newId = String(Date.now());
      setFiles((prev) => [
        ...prev,
        { id: newId, name: file.name, language: detectedLang, code: content },
      ]);
      setActiveFileId(newId);
      setAnalysis(null);
      setMetrics(null);
      setError(null);
    };
    reader.readAsText(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileDrop(file);
    e.target.value = "";
  };

  const lineCount = activeFile.code ? activeFile.code.split("\n").length : 0;

  if (currentView === "landing") {
    return <LandingView onLaunch={() => setCurrentView("studio")} />;
  }

  return (
    <div
      onClick={() => {
        if (showLangMenu) setShowLangMenu(false);
        if (activeMenuId) setActiveMenuId(null);
      }}
      className="flex flex-col h-screen w-screen overflow-hidden bg-[#07080a] text-slate-100 font-sans selection:bg-white selection:text-black"
    >
      {/* ── RESPONSIVE WORKBENCH HEADER ── */}
      <header className="h-12 px-2 sm:px-4 border-b border-white/[0.08] bg-[#050608] flex items-center justify-between gap-1.5 sm:gap-2 shrink-0 z-30 select-none">
        {/* Left: Brand, Explorer & Language Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 min-w-0">
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-white transition ${
              sidebarOpen ? "bg-white/[0.08] text-white" : "hover:bg-white/[0.04]"
            }`}
            title="Toggle Explorer"
          >
            {sidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeft size={15} />}
          </button>

          <button
            onClick={() => setCurrentView("landing")}
            className="flex items-center gap-1.5 hover:opacity-85 transition shrink-0"
          >
            <span className="font-mono text-xs sm:text-sm font-black tracking-wider text-white">
              RECENSEO
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse hidden xs:inline-block" />
          </button>

          <div className="h-3.5 w-px bg-white/[0.08] mx-0.5 hidden xs:block" />

          {/* Language Selector Dropdown */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLangMenu(!showLangMenu);
              }}
              className="h-7 px-1.5 sm:px-2 rounded-md text-[10px] font-mono font-semibold uppercase bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 flex items-center gap-1 text-slate-400 hover:text-slate-200 transition"
            >
              <span className="max-w-[42px] xs:max-w-[60px] sm:max-w-none truncate">
                {activeFile.language}
              </span>
              <ChevronDown size={10} className="text-slate-500 shrink-0" />
            </button>

            {showLangMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-full left-0 mt-1.5 w-44 max-h-60 overflow-y-auto rounded-xl bg-[#0b0d12] border border-white/15 shadow-2xl p-1 z-50 divide-y divide-white/[0.04]"
              >
                {ALL_LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleLanguageChange(lang.id)}
                    className={`w-full text-left px-2.5 py-1.5 text-[11px] font-mono transition flex items-center justify-between rounded-md ${
                      lang.id === activeFile.language
                        ? "bg-white text-black font-bold"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <span>{lang.label}</span>
                    <span className="text-[9px] opacity-60">.{lang.ext}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Import File Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08] transition hidden sm:flex"
            title="Import Source File"
          >
            <Upload size={13} />
          </button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileInput} />
        </div>

        {/* Right Section: Viewport Tab Switches + Analyze Trigger Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="flex items-center p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
            <button
              onClick={() => setActiveTab("editor")}
              className={`px-1.5 sm:px-2.5 py-1 rounded-md font-mono text-[10px] sm:text-[11px] font-bold flex items-center gap-1 transition ${
                activeTab === "editor"
                  ? "bg-white text-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Code Editor"
            >
              <Code2 size={12} className="shrink-0" />
              <span className="hidden md:inline">Code</span>
            </button>

            <button
              onClick={() => setActiveTab("diagnostics")}
              className={`px-1.5 sm:px-2.5 py-1 rounded-md font-mono text-[10px] sm:text-[11px] font-bold flex items-center gap-1 transition ${
                activeTab === "diagnostics"
                  ? "bg-white text-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Issues"
            >
              <Activity size={12} className="shrink-0" />
              <span className="hidden md:inline">Issues</span>
              {analysis && (
                <span
                  className={`text-[8px] sm:text-[9px] px-1 rounded font-bold ${
                    activeTab === "diagnostics" ? "bg-black/20 text-black" : "bg-white/10 text-white"
                  }`}
                >
                  {analysis.diagnostics.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("explainer")}
              className={`px-1.5 sm:px-2.5 py-1 rounded-md font-mono text-[10px] sm:text-[11px] font-bold flex items-center gap-1 transition ${
                activeTab === "explainer"
                  ? "bg-white text-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Explainer"
            >
              <FileText size={12} className="shrink-0" />
              <span className="hidden md:inline">Explainer</span>
            </button>

            <button
              onClick={() => setActiveTab("diff")}
              className={`px-1.5 sm:px-2.5 py-1 rounded-md font-mono text-[10px] sm:text-[11px] font-bold flex items-center gap-1 transition ${
                activeTab === "diff"
                  ? "bg-white text-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Diff"
            >
              <GitCompare size={12} className="shrink-0" />
              <span className="hidden md:inline">Diff</span>
            </button>
          </div>

          {/* Action Trigger Button */}
          <button
            onClick={isAnalyzing ? () => abortControllerRef.current?.abort() : handleAnalyze}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 h-7 sm:h-8 rounded-lg bg-white text-black font-mono font-bold text-[10px] sm:text-xs tracking-wider uppercase hover:bg-slate-200 active:scale-95 transition shadow-lg shrink-0"
          >
            {isAnalyzing ? (
              <>
                <Square size={9} className="fill-current text-black shrink-0" />
                <span>STOP</span>
              </>
            ) : (
              <>
                <Play size={9} className="fill-current text-black shrink-0" />
                <span>ANALYZE</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── WORKSPACE SPLIT ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          />
        )}

        {/* Slide-out Explorer Sidebar */}
        <aside
          className={`fixed md:relative top-12 md:top-0 bottom-6 md:bottom-0 left-0 h-[calc(100%-4.5rem)] md:h-full border-r border-white/[0.08] bg-[#050608] flex flex-col shrink-0 select-none z-50 md:z-20 transition-all duration-300 ease-in-out ${
            sidebarOpen
              ? "w-60 translate-x-0"
              : "-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 md:overflow-hidden md:border-r-0"
          }`}
        >
          <div className="h-9 px-3 border-b border-white/[0.06] flex items-center justify-between font-mono text-[10px] text-slate-400 shrink-0">
            <span className="flex items-center gap-1.5 font-bold tracking-wider">
              <FolderTree size={12} /> EXPLORER
            </span>
            <button
              onClick={handleNewFile}
              className="p-1 rounded hover:bg-white/[0.06] text-slate-400 hover:text-white"
              title="New File"
            >
              <FilePlus size={13} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs">
            {files.map((file) => {
              const isActive = file.id === activeFileId;
              const isEditing = renamingId === file.id;
              const isMenuOpen = activeMenuId === file.id;

              return (
                <div
                  key={file.id}
                  onClick={() => {
                    if (!isEditing) {
                      setActiveFileId(file.id);
                      if (window.innerWidth < 768) setSidebarOpen(false);
                    }
                  }}
                  onDoubleClick={(e) => handleStartRename(file, e)}
                  className={`group relative px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer transition ${
                    isActive
                      ? "bg-white/10 text-white font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileCode
                      size={13}
                      className={isActive ? "text-white shrink-0" : "text-slate-600 shrink-0"}
                    />
                    {isEditing ? (
                      <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                        <input
                          autoFocus
                          type="text"
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          onBlur={() => handleSaveRename(file.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename(file.id);
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                          className="bg-black border border-white/30 text-white text-xs px-1.5 py-0.5 rounded w-full font-mono focus:outline-none"
                        />
                        <button onClick={() => handleSaveRename(file.id)} className="p-0.5 text-emerald-400">
                          <Check size={11} />
                        </button>
                      </div>
                    ) : (
                      <span className="truncate text-[11px]">{file.name}</span>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="file-menu-container relative shrink-0 ml-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : file.id);
                        }}
                        className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/10"
                      >
                        <MoreVertical size={12} />
                      </button>
                      {isMenuOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-full mt-1 w-28 rounded-lg bg-[#0b0d12] border border-white/15 shadow-2xl p-1 z-50 font-mono text-[10px]"
                        >
                          <button
                            onClick={(e) => handleStartRename(file, e)}
                            className="w-full text-left px-2 py-1 rounded hover:bg-white/10 text-slate-300 hover:text-white flex items-center gap-1.5"
                          >
                            <Edit2 size={10} /> Rename
                          </button>
                          <button
                            onClick={(e) => handleDeleteFile(file.id, e)}
                            className="w-full text-left px-2 py-1 rounded hover:bg-rose-500/10 text-rose-400 flex items-center gap-1.5"
                          >
                            <Trash2 size={10} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main Split Viewport */}
        <main
          ref={splitPaneRef}
          className="flex-1 flex flex-col md:flex-row overflow-hidden relative"
        >
          {/* Editor Canvas */}
          <section
            className={`h-full flex-col bg-[#050608] relative ${
              activeTab === "editor" ? "flex w-full" : "hidden md:flex"
            }`}
            style={{
              width:
                typeof window !== "undefined" && window.innerWidth >= 768
                  ? `${editorWidthPercent}%`
                  : "100%",
            }}
          >
            <CodeEditor
              code={activeFile.code}
              language={activeFile.language}
              diagnostics={analysis?.diagnostics ?? []}
              highlightLine={highlightLine}
              onChange={updateActiveCode}
              onDrop={handleFileDrop}
            />
          </section>

          {/* Desktop Resizing Divider Sash */}
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
            }}
            className="hidden md:block w-1 h-full hover:bg-white/40 bg-white/[0.06] cursor-col-resize transition-colors shrink-0 z-30"
          />

          {/* Analysis View */}
          <section
            className={`h-full flex-col bg-[#07090D] relative ${
              activeTab !== "editor" ? "flex w-full" : "hidden md:flex"
            }`}
            style={{
              width:
                typeof window !== "undefined" && window.innerWidth >= 768
                  ? `${100 - editorWidthPercent}%`
                  : "100%",
            }}
          >
            <AnalysisPanel
              analysis={analysis}
              metrics={metrics}
              originalCode={activeFile.code}
              isAnalyzing={isAnalyzing}
              activeTab={activeTab === "editor" ? "diagnostics" : activeTab}
              onApplyPatch={(patch) => updateActiveCode(patch)}
              onDiagnosticClick={(line) => {
                setHighlightLine(line);
                setActiveTab("editor");
              }}
              error={error}
              onRetry={handleAnalyze}
            />
          </section>
        </main>
      </div>

      {/* ── Status Ribbon Footer ── */}
      <footer className="h-6 px-3 border-t border-white/[0.06] bg-[#040506] flex items-center justify-between font-mono text-[9px] text-slate-500 shrink-0 select-none">
        <span>{statusMessage || (modelUsed ? `ENGINE: ${modelUsed.toUpperCase()}` : "AST POOL READY")}</span>
        <span>{lineCount} LINES</span>
      </footer>
    </div>
  );
}
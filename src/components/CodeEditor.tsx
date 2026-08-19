

// "use client";

// import { useRef, useEffect, useCallback, useState } from "react";
// import Editor, { useMonaco } from "@monaco-editor/react";
// import type { editor } from "monaco-editor";
// import { Copy, Check, UploadCloud, Terminal } from "lucide-react";
// import type { Diagnostic } from "../types";

// interface Props {
//   code: string;
//   language: string;
//   diagnostics: Diagnostic[];
//   highlightLine: number | null;
//   onChange: (code: string) => void;
//   onDrop: (file: File) => void;
// }

// const MONACO_LANG_MAP: Record<string, string> = {
//   python: "python",
//   javascript: "javascript",
//   typescript: "typescript",
//   rust: "rust",
//   go: "go",
//   cpp: "cpp",
//   c: "c",
//   csharp: "csharp",
//   java: "java",
//   sql: "sql",
//   php: "php",
//   ruby: "ruby",
//   swift: "swift",
//   kotlin: "kotlin",
//   html: "html",
//   css: "css",
//   scss: "scss",
//   json: "json",
//   yaml: "yaml",
//   markdown: "markdown",
//   dockerfile: "dockerfile",
//   graphql: "graphql",
//   lua: "lua",
//   r: "r",
//   shell: "shell",
//   plaintext: "plaintext",
// };

// const MARKER_OWNER = "recenseo";

// export default function CodeEditor({
//   code,
//   language,
//   diagnostics,
//   highlightLine,
//   onChange,
//   onDrop,
// }: Props) {
//   const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
//   const decorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null);
//   const lineHighlightDecorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null);
//   const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const monaco = useMonaco();

//   const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
//   const [selectedChars, setSelectedChars] = useState(0);
//   const [copied, setCopied] = useState(false);
//   const [isDraggingFile, setIsDraggingFile] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const checkViewport = () => setIsMobile(window.innerWidth < 768);
//     checkViewport();
//     window.addEventListener("resize", checkViewport);
//     return () => window.removeEventListener("resize", checkViewport);
//   }, []);

//   // Define Minimalist Monochrome Theme
//   useEffect(() => {
//     if (!monaco) return;

//     monaco.editor.defineTheme("recenseo-monochrome", {
//       base: "vs-dark",
//       inherit: true,
//       rules: [
//         { token: "comment", foreground: "52525b", fontStyle: "italic" },
//         { token: "keyword", foreground: "ffffff", fontStyle: "bold" },
//         { token: "string", foreground: "a1a1aa" },
//         { token: "number", foreground: "e4e4e7" },
//         { token: "type", foreground: "d4d4d8" },
//         { token: "function", foreground: "f4f4f5", fontStyle: "bold" },
//         { token: "variable", foreground: "d4d4d8" },
//       ],
//       colors: {
//         "editor.background": "#050608",
//         "editor.foreground": "#f4f4f5",
//         "editorCursor.foreground": "#ffffff",
//         "editor.lineHighlightBackground": "#ffffff08",
//         "editorLineNumber.foreground": "#3f3f46",
//         "editorLineNumber.activeForeground": "#ffffff",
//         "editor.selectionBackground": "#ffffff20",
//         "editor.inactiveSelectionBackground": "#ffffff10",
//         "editorIndentGuide.background1": "#18181b",
//         "editorIndentGuide.activeBackground1": "#27272a",
//       },
//     });

//     monaco.editor.setTheme("recenseo-monochrome");
//   }, [monaco]);

//   // Diagnostics markers
//   useEffect(() => {
//     if (!monaco || !editorRef.current) return;
//     const model = editorRef.current.getModel();
//     if (!model) return;

//     const lineCount = model.getLineCount();

//     const markers: editor.IMarkerData[] = diagnostics.map((d) => {
//       const start = Math.max(1, Math.min(d.startLine, lineCount));
//       const end = Math.max(start, Math.min(d.endLine, lineCount));
//       return {
//         startLineNumber: start,
//         endLineNumber: end,
//         startColumn: 1,
//         endColumn: model.getLineMaxColumn(end),
//         message: `[${d.severity.toUpperCase()}] ${d.title}\n${d.message}`,
//         severity:
//           d.severity === "critical"
//             ? monaco.MarkerSeverity.Error
//             : d.severity === "warning"
//             ? monaco.MarkerSeverity.Warning
//             : monaco.MarkerSeverity.Info,
//         source: "Recenseo AST",
//       };
//     });
//     monaco.editor.setModelMarkers(model, MARKER_OWNER, markers);

//     const decorations: editor.IModelDeltaDecoration[] = diagnostics.map((d) => {
//       const start = Math.max(1, Math.min(d.startLine, lineCount));
//       const end = Math.max(start, Math.min(d.endLine, lineCount));
//       return {
//         range: new monaco.Range(start, 1, end, 1),
//         options: {
//           isWholeLine: true,
//           linesDecorationsClassName:
//             d.severity === "critical"
//               ? "cs-gutter-critical"
//               : d.severity === "warning"
//               ? "cs-gutter-warning"
//               : "cs-gutter-info",
//         },
//       };
//     });

//     if (decorationsRef.current) {
//       decorationsRef.current.set(decorations);
//     } else {
//       decorationsRef.current = editorRef.current.createDecorationsCollection(decorations);
//     }

//     return () => {
//       try {
//         if (!model.isDisposed()) monaco.editor.setModelMarkers(model, MARKER_OWNER, []);
//         decorationsRef.current?.clear();
//       } catch {
//         // ignore
//       }
//     };
//   }, [monaco, diagnostics]);

//   // Jump to highlight line
//   useEffect(() => {
//     if (!monaco || !editorRef.current || highlightLine === null) return;

//     editorRef.current.revealLineInCenter(highlightLine, 0);
//     editorRef.current.setPosition({ lineNumber: highlightLine, column: 1 });
//     editorRef.current.focus();

//     const highlightDecoration: editor.IModelDeltaDecoration[] = [
//       {
//         range: new monaco.Range(highlightLine, 1, highlightLine, 1),
//         options: {
//           isWholeLine: true,
//           className: "cs-line-target-highlight",
//         },
//       },
//     ];

//     if (lineHighlightDecorationsRef.current) {
//       lineHighlightDecorationsRef.current.set(highlightDecoration);
//     } else {
//       lineHighlightDecorationsRef.current =
//         editorRef.current.createDecorationsCollection(highlightDecoration);
//     }

//     if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
//     highlightTimeoutRef.current = setTimeout(() => {
//       lineHighlightDecorationsRef.current?.clear();
//     }, 2400);

//     return () => {
//       if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
//     };
//   }, [highlightLine, monaco]);

//   const handleMount = useCallback((ed: editor.IStandaloneCodeEditor) => {
//     editorRef.current = ed;

//     ed.onDidChangeCursorPosition((e) => {
//       setCursorPos({ line: e.position.lineNumber, col: e.position.column });
//     });

//     ed.onDidChangeCursorSelection((e) => {
//       const model = ed.getModel();
//       if (!model) return;
//       const selectionLength = model.getValueInRange(e.selection).length;
//       setSelectedChars(selectionLength);
//     });
//   }, []);

//   const handleCopy = () => {
//     navigator.clipboard.writeText(code);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const lines = code ? code.split("\n").length : 0;

//   return (
//     <>
//       <style>{`
//         .cs-gutter-critical { border-left: 2px solid #ef4444; margin-left: 2px; }
//         .cs-gutter-warning  { border-left: 2px solid #f59e0b; margin-left: 2px; }
//         .cs-gutter-info     { border-left: 2px solid #e4e4e7; margin-left: 2px; }
//         .cs-line-target-highlight {
//           background: rgba(255, 255, 255, 0.06) !important;
//           border-left: 2px solid #ffffff !important;
//         }
//       `}</style>

//       <div
//         className="relative h-full w-full flex flex-col bg-[#050608] select-none text-zinc-100 overflow-hidden border-r border-white/[0.08]"
//         onDragOver={(e) => {
//           e.preventDefault();
//           e.dataTransfer.dropEffect = "copy";
//           setIsDraggingFile(true);
//         }}
//         onDragLeave={() => setIsDraggingFile(false)}
//         onDrop={(e) => {
//           e.preventDefault();
//           setIsDraggingFile(false);
//           const file = e.dataTransfer.files[0];
//           if (file) onDrop(file);
//         }}
//       >
//         {/* Drag & Drop Overlay */}
//         {isDraggingFile && (
//           <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050608]/90 backdrop-blur-sm border-2 border-dashed border-white/40 animate-in fade-in duration-150">
//             <UploadCloud className="w-10 h-10 text-white mb-3" />
//             <p className="font-mono text-xs font-bold text-white tracking-widest uppercase">DROP SOURCE FILE TO INGEST</p>
//           </div>
//         )}

//         {/* Monaco Editor */}
//         <div className="flex-1 w-full h-full relative">
//           <Editor
//             height="100%"
//             language={MONACO_LANG_MAP[language] ?? "plaintext"}
//             value={code}
//             onChange={(v) => onChange(v ?? "")}
//             onMount={handleMount}
//             theme="recenseo-monochrome"
//             options={{
//               fontSize: isMobile ? 12 : 13,
//               lineHeight: isMobile ? 20 : 22,
//               fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
//               fontLigatures: true,
//               minimap: { enabled: !isMobile, scale: 0.75, maxColumn: 80 },
//               scrollBeyondLastLine: false,
//               padding: { top: isMobile ? 10 : 16, bottom: 20 },
//               renderLineHighlight: "gutter",
//               smoothScrolling: true,
//               automaticLayout: true,
//               tabSize: 2,
//               insertSpaces: true,
//               wordWrap: "on",
//               overviewRulerBorder: false,
//               lineNumbersMinChars: isMobile ? 3 : 4,
//               cursorBlinking: "smooth",
//             }}
//           />
//         </div>

//         {/* Bottom Status Ribbon */}
//         <div className="h-7 px-3 sm:px-4 flex items-center justify-between border-t border-white/[0.08] bg-[#050608] text-[10px] font-mono text-zinc-400 shrink-0 select-none">
//           <div className="flex items-center gap-3">
//             <div className="flex items-center gap-1.5 text-zinc-200">
//               <Terminal size={11} />
//               <span className="uppercase font-semibold tracking-wider">{language}</span>
//             </div>
//             <span className="text-zinc-600">·</span>
//             <span>LN {cursorPos.line}, COL {cursorPos.col}</span>
//             {selectedChars > 0 && (
//               <>
//                 <span className="text-zinc-600">·</span>
//                 <span className="text-white">({selectedChars} selected)</span>
//               </>
//             )}
//             <span className="text-zinc-600">·</span>
//             <span>{lines} LINES</span>
//           </div>

//           <button
//             onClick={handleCopy}
//             className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition px-2 py-0.5 rounded hover:bg-white/[0.05] active:scale-95"
//             title="Copy editor buffer"
//           >
//             {copied ? <Check size={11} className="text-white" /> : <Copy size={11} />}
//             <span className={copied ? "text-white font-bold" : ""}>
//               {copied ? "COPIED" : "COPY"}
//             </span>
//           </button>
//         </div>
//       </div>
//     </>
//   );
// }





























"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { Copy, Check, UploadCloud, Terminal } from "lucide-react";
import type { Diagnostic } from "../types";

interface Props {
  code: string;
  language: string;
  diagnostics: Diagnostic[];
  highlightLine: number | null;
  onChange: (code: string) => void;
  onDrop: (file: File) => void;
}

const MONACO_LANG_MAP: Record<string, string> = {
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
  rust: "rust",
  go: "go",
  cpp: "cpp",
  c: "c",
  csharp: "csharp",
  java: "java",
  sql: "sql",
  php: "php",
  ruby: "ruby",
  swift: "swift",
  kotlin: "kotlin",
  html: "html",
  css: "css",
  scss: "scss",
  json: "json",
  yaml: "yaml",
  markdown: "markdown",
  dockerfile: "dockerfile",
  graphql: "graphql",
  lua: "lua",
  r: "r",
  shell: "shell",
  plaintext: "plaintext",
};

const MARKER_OWNER = "recenseo";

export default function CodeEditor({
  code,
  language,
  diagnostics,
  highlightLine,
  onChange,
  onDrop,
}: Props) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null);
  const lineHighlightDecorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null);
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const monaco = useMonaco();

  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [selectedChars, setSelectedChars] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkViewport = () => setIsMobile(window.innerWidth < 768);
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  // Register theme and keep indent guide settings standard
  useEffect(() => {
    if (!monaco) return;

    monaco.editor.defineTheme("recenseo-monochrome", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "52525b", fontStyle: "italic" },
        { token: "keyword", foreground: "ffffff", fontStyle: "bold" },
        { token: "string", foreground: "a1a1aa" },
        { token: "number", foreground: "e4e4e7" },
        { token: "type", foreground: "d4d4d8" },
        { token: "function", foreground: "f4f4f5", fontStyle: "bold" },
        { token: "variable", foreground: "d4d4d8" },
      ],
      colors: {
        "editor.background": "#050608",
        "editor.foreground": "#f4f4f5",
        "editorCursor.foreground": "#ffffff",
        "editor.lineHighlightBackground": "#ffffff08",
        "editorLineNumber.foreground": "#3f3f46",
        "editorLineNumber.activeForeground": "#ffffff",
        "editor.selectionBackground": "#ffffff20",
        "editor.inactiveSelectionBackground": "#ffffff10",
        "editorIndentGuide.background": "#18181b",
        "editorIndentGuide.activeBackground": "#27272a",
      },
    });

    monaco.editor.setTheme("recenseo-monochrome");
  }, [monaco]);

  // Set diagnostic markers and gutter styling
  useEffect(() => {
    if (!monaco || !editorRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    const lineCount = model.getLineCount();

    const markers: editor.IMarkerData[] = diagnostics.map((d) => {
      const start = Math.max(1, Math.min(d.startLine, lineCount));
      const end = Math.max(start, Math.min(d.endLine, lineCount));
      return {
        startLineNumber: start,
        endLineNumber: end,
        startColumn: 1,
        endColumn: model.getLineMaxColumn(end),
        message: `[${d.severity.toUpperCase()}] ${d.title}\n${d.message}`,
        severity:
          d.severity === "critical"
            ? monaco.MarkerSeverity.Error
            : d.severity === "warning"
            ? monaco.MarkerSeverity.Warning
            : monaco.MarkerSeverity.Info,
        source: "Recenseo AST",
      };
    });
    monaco.editor.setModelMarkers(model, MARKER_OWNER, markers);

    const decorations: editor.IModelDeltaDecoration[] = diagnostics.map((d) => {
      const start = Math.max(1, Math.min(d.startLine, lineCount));
      const end = Math.max(start, Math.min(d.endLine, lineCount));
      return {
        range: new monaco.Range(start, 1, end, 1),
        options: {
          isWholeLine: true,
          linesDecorationsClassName:
            d.severity === "critical"
              ? "cs-gutter-critical"
              : d.severity === "warning"
              ? "cs-gutter-warning"
              : "cs-gutter-info",
        },
      };
    });

    if (decorationsRef.current) {
      decorationsRef.current.set(decorations);
    } else {
      decorationsRef.current = editorRef.current.createDecorationsCollection(decorations);
    }

    return () => {
      try {
        if (!model.isDisposed()) monaco.editor.setModelMarkers(model, MARKER_OWNER, []);
        decorationsRef.current?.clear();
      } catch {
        // ignore on unmount
      }
    };
  }, [monaco, diagnostics]);

  // Jump to highlight line on diagnostic click
  useEffect(() => {
    if (!monaco || !editorRef.current || highlightLine === null) return;

    editorRef.current.revealLineInCenter(highlightLine, 0);
    editorRef.current.setPosition({ lineNumber: highlightLine, column: 1 });
    editorRef.current.focus();

    const highlightDecoration: editor.IModelDeltaDecoration[] = [
      {
        range: new monaco.Range(highlightLine, 1, highlightLine, 1),
        options: {
          isWholeLine: true,
          className: "cs-line-target-highlight",
        },
      },
    ];

    if (lineHighlightDecorationsRef.current) {
      lineHighlightDecorationsRef.current.set(highlightDecoration);
    } else {
      lineHighlightDecorationsRef.current =
        editorRef.current.createDecorationsCollection(highlightDecoration);
    }

    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    highlightTimeoutRef.current = setTimeout(() => {
      lineHighlightDecorationsRef.current?.clear();
    }, 2400);

    return () => {
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    };
  }, [highlightLine, monaco]);

  const handleMount = useCallback((ed: editor.IStandaloneCodeEditor) => {
    editorRef.current = ed;

    ed.onDidChangeCursorPosition((e) => {
      setCursorPos({ line: e.position.lineNumber, col: e.position.column });
    });

    ed.onDidChangeCursorSelection((e) => {
      const model = ed.getModel();
      if (!model) return;
      const selectionLength = model.getValueInRange(e.selection).length;
      setSelectedChars(selectionLength);
    });
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code ? code.split("\n").length : 0;

  return (
    <>
      <style>{`
        .cs-gutter-critical { border-left: 2px solid #ef4444; margin-left: 2px; }
        .cs-gutter-warning  { border-left: 2px solid #f59e0b; margin-left: 2px; }
        .cs-gutter-info     { border-left: 2px solid #e4e4e7; margin-left: 2px; }
        .cs-line-target-highlight {
          background: rgba(255, 255, 255, 0.06) !important;
          border-left: 2px solid #ffffff !important;
        }
      `}</style>

      <div
        className="relative h-full w-full flex flex-col bg-[#050608] select-none text-zinc-100 overflow-hidden border-r border-white/[0.08]"
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
          setIsDraggingFile(true);
        }}
        onDragLeave={() => setIsDraggingFile(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingFile(false);
          const file = e.dataTransfer.files[0];
          if (file) onDrop(file);
        }}
      >
        {/* Drag & Drop Ingest Overlay */}
        {isDraggingFile && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050608]/90 backdrop-blur-sm border-2 border-dashed border-white/40 animate-in fade-in duration-150">
            <UploadCloud className="w-10 h-10 text-white mb-3" />
            <p className="font-mono text-xs font-bold text-white tracking-widest uppercase">
              DROP SOURCE FILE TO INGEST
            </p>
          </div>
        )}

        {/* Monaco Canvas */}
        <div className="flex-1 w-full h-full relative">
          <Editor
            height="100%"
            language={MONACO_LANG_MAP[language] ?? "plaintext"}
            value={code}
            onChange={(v) => onChange(v ?? "")}
            onMount={handleMount}
            theme="recenseo-monochrome"
            options={{
              fontSize: isMobile ? 12 : 13,
              lineHeight: isMobile ? 20 : 22,
              fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
              fontLigatures: true,
              minimap: { enabled: !isMobile, scale: 0.75, maxColumn: 80 },
              scrollBeyondLastLine: false,
              padding: { top: isMobile ? 10 : 16, bottom: 20 },
              renderLineHighlight: "gutter",
              smoothScrolling: true,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              wordWrap: "on",
              overviewRulerBorder: false,
              lineNumbersMinChars: isMobile ? 3 : 4,
              cursorBlinking: "smooth",
            }}
          />
        </div>

        {/* Bottom Metadata Bar */}
        <div className="h-7 px-3 sm:px-4 flex items-center justify-between border-t border-white/[0.08] bg-[#050608] text-[10px] font-mono text-zinc-400 shrink-0 select-none">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-zinc-200">
              <Terminal size={11} />
              <span className="uppercase font-semibold tracking-wider">{language}</span>
            </div>
            <span className="text-zinc-600">·</span>
            <span>
              LN {cursorPos.line}, COL {cursorPos.col}
            </span>
            {selectedChars > 0 && (
              <>
                <span className="text-zinc-600">·</span>
                <span className="text-white">({selectedChars} selected)</span>
              </>
            )}
            <span className="text-zinc-600">·</span>
            <span>{lines} LINES</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition px-2 py-0.5 rounded hover:bg-white/[0.05] active:scale-95"
            title="Copy editor buffer"
          >
            {copied ? <Check size={11} className="text-white" /> : <Copy size={11} />}
            <span className={copied ? "text-white font-bold" : ""}>
              {copied ? "COPIED" : "COPY"}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
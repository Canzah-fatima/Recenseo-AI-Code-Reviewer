import type * as Monaco from "monaco-editor";

export const OBSIDIAN_THEME: Monaco.editor.IStandaloneThemeData = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "comment", foreground: "3d4a5c", fontStyle: "italic" },
    { token: "comment.doc", foreground: "4a5a70", fontStyle: "italic" },
    { token: "keyword", foreground: "a78bfa" },
    { token: "keyword.control", foreground: "a78bfa" },
    { token: "keyword.operator", foreground: "7c8799" },
    { token: "storage.type", foreground: "a78bfa" },
    { token: "string", foreground: "34d399" },
    { token: "string.escape", foreground: "10b981" },
    { token: "number", foreground: "f59e0b" },
    { token: "number.float", foreground: "f59e0b" },
    { token: "constant", foreground: "f59e0b" },
    { token: "type", foreground: "38bdf8" },
    { token: "type.identifier", foreground: "38bdf8" },
    { token: "class", foreground: "38bdf8" },
    { token: "entity.name.type", foreground: "38bdf8" },
    { token: "function", foreground: "c084fc" },
    { token: "entity.name.function", foreground: "c084fc" },
    { token: "variable", foreground: "eef0f3" },
    { token: "variable.parameter", foreground: "f9a8d4" },
    { token: "variable.predefined", foreground: "a78bfa" },
    { token: "operator", foreground: "6b7280" },
    { token: "delimiter", foreground: "3d4550" },
    { token: "delimiter.bracket", foreground: "5a6478" },
    { token: "tag", foreground: "38bdf8" },
    { token: "attribute.name", foreground: "f9a8d4" },
    { token: "attribute.value", foreground: "34d399" },
    { token: "annotation", foreground: "f59e0b" },
    { token: "decorator", foreground: "f59e0b" },
    { token: "regexp", foreground: "fb923c" },
  ],
  colors: {
    // Editor Base
    "editor.background": "#0d0f12",
    "editor.foreground": "#c9d1d9",
    "editor.lineHighlightBackground": "#13161b80",
    "editor.lineHighlightBorder": "#00000000",
    "editor.selectionBackground": "#a78bfa22",
    "editor.inactiveSelectionBackground": "#a78bfa11",
    "editor.wordHighlightBackground": "#38bdf810",
    "editor.wordHighlightStrongBackground": "#38bdf820",

    // Line Numbers & Gutter
    "editorLineNumber.foreground": "#252c38",
    "editorLineNumber.activeForeground": "#4a5568",
    "editorGutter.background": "#0d0f12",
    "editorGutter.addedBackground": "#10b98130",
    "editorGutter.deletedBackground": "#f43f5e30",
    "editorGutter.modifiedBackground": "#f59e0b30",

    // Cursor & Indentation Guides
    "editorCursor.foreground": "#a78bfa",
    "editorCursor.background": "#0d0f12",
    "editorWhitespace.foreground": "#1a1e25",
    "editorIndentGuide.background": "#1a1e25",
    "editorIndentGuide.activeBackground": "#2d3442",

    // Widgets (Suggest, Hover, Overlays)
    "editorWidget.background": "#13161b",
    "editorWidget.border": "#ffffff14",
    "editorWidget.resizeBorder": "#a78bfa",
    "editorSuggestWidget.background": "#13161b",
    "editorSuggestWidget.border": "#ffffff14",
    "editorSuggestWidget.selectedBackground": "#1a1e25",
    "editorSuggestWidget.highlightForeground": "#a78bfa",
    "editorHoverWidget.background": "#13161b",
    "editorHoverWidget.border": "#ffffff14",

    // Diagnostics
    "editorError.foreground": "#f43f5e",
    "editorError.background": "#f43f5e10",
    "editorWarning.foreground": "#f59e0b",
    "editorWarning.background": "#f59e0b08",
    "editorInfo.foreground": "#38bdf8",
    "editorInfo.background": "#38bdf808",

    // Overview Ruler
    "editorOverviewRuler.border": "#00000000",
    "editorOverviewRuler.errorForeground": "#f43f5e80",
    "editorOverviewRuler.warningForeground": "#f59e0b80",
    "editorOverviewRuler.infoForeground": "#38bdf880",

    // Scrollbars
    "scrollbarSlider.background": "#ffffff08",
    "scrollbarSlider.hoverBackground": "#ffffff14",
    "scrollbarSlider.activeBackground": "#ffffff1f",
    "scrollbar.shadow": "#00000000",

    // Find / Replace
    "editor.findMatchBackground": "#f59e0b33",
    "editor.findMatchHighlightBackground": "#f59e0b1a",
    "editor.findRangeHighlightBackground": "#f59e0b0d",

    // Minimap
    "minimap.background": "#0a0c10",
    "minimapGutter.addedBackground": "#10b98150",
    "minimapGutter.deletedBackground": "#f43f5e50",
    "minimapGutter.modifiedBackground": "#f59e0b50",

    // Diff Editor
    "diffEditor.insertedTextBackground": "#10b98110",
    "diffEditor.removedTextBackground": "#f43f5e10",
    "diffEditor.insertedLineBackground": "#10b98108",
    "diffEditor.removedLineBackground": "#f43f5e08",
    "diffEditorGutter.insertedLineBackground": "#10b98120",
    "diffEditorGutter.removedLineBackground": "#f43f5e20",

    // Peek View
    "peekView.border": "#a78bfa40",
    "peekViewResult.background": "#13161b",
    "peekViewResult.selectionBackground": "#1a1e25",
    "peekViewEditor.background": "#0d0f12",
    "peekViewEditor.matchHighlightBackground": "#f59e0b20",
  },
};

export const OBSIDIAN_THEME_NAME = "obsidian";

export function registerObsidianTheme(monaco: typeof Monaco | { editor: typeof Monaco.editor }) {
  monaco.editor.defineTheme(OBSIDIAN_THEME_NAME, OBSIDIAN_THEME);
}
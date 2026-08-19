import { loader } from "@monaco-editor/react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.56.0/min/vs",
  },
});

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#07080a] text-white p-8 text-center select-none font-mono">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-3 text-rose-400">
            <span className="font-bold text-sm">!</span>
          </div>
          <div className="text-sm font-bold text-zinc-200 uppercase tracking-widest mb-1">
            Runtime Error
          </div>
          <div className="text-xs text-rose-400 max-w-lg mb-6 bg-[#12080a] border border-rose-500/20 rounded-xl p-3 break-words">
            {this.state.error.message || "An unexpected error occurred."}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider transition active:scale-95 shadow-md font-sans"
          >
            Reload Recenseo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
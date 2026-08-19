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

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            background: "#08090a",
            color: "#f43f5e",
            fontFamily: "'JetBrains Mono', monospace",
            gap: "12px",
            padding: "32px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "13px", color: "#eef0f3" }}>
            Runtime error
          </div>
          <div style={{ fontSize: "11px", color: "#f43f5e", maxWidth: "600px" }}>
            {this.state.error.message}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "8px",
              padding: "8px 16px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
              color: "white",
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "12px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Reload Recenseo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);

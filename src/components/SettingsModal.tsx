import { useEffect, useRef, useState } from "react";
import { X, Key, ExternalLink, ShieldCheck, Cpu, Check } from "lucide-react";
import { AVAILABLE_MODELS, AUTO_MODEL } from "../lib/gemini";

interface Props {
  currentKey: string;
  currentModel: string;
  onSave: (key: string, model: string) => void;
  onClose: () => void;
}

export default function SettingsModal({ currentKey, currentModel, onSave, onClose }: Props) {
  const [value, setValue] = useState(currentKey);
  const [model, setModel] = useState(currentModel);
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onSave(trimmed, model);
      onClose();
    }
  };

  // Escape to close, focus trap within the dialog
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        className="relative w-full mx-4 rounded-xl max-h-[90vh] overflow-y-auto"
        style={{
          maxWidth: "440px",
          background: "#13161b",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 32px 96px rgba(0,0,0,0.8), 0 0 0 1px rgba(167,139,250,0.08)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b sticky top-0"
          style={{ borderColor: "rgba(255,255,255,0.07)", background: "#13161b" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "rgba(167,139,250,0.15)" }}
            >
              <Key size={12} style={{ color: "#a78bfa" }} />
            </div>
            <span id="settings-modal-title" className="text-sm font-semibold" style={{ color: "#eef0f3" }}>
              Settings
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
            style={{ color: "#4a5568" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <X size={13} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* API key */}
          <div className="space-y-3">
            <div
              className="flex items-start gap-3 p-3 rounded-lg"
              style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.12)" }}
            >
              <ShieldCheck size={13} style={{ color: "#38bdf8", marginTop: 1, flexShrink: 0 }} />
              <p className="text-xs leading-relaxed" style={{ color: "#7c8799" }}>
                Your key is stored locally in your browser and only sent to the Gemini API. It
                never leaves your device.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="gemini-api-key" className="text-[11px] font-medium" style={{ color: "#4a5568" }}>
                GEMINI API KEY
              </label>
              <input
                id="gemini-api-key"
                type="password"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                placeholder="AIzaSy..."
                autoFocus
                autoComplete="off"
                spellCheck={false}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: "#0d0f12",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#eef0f3",
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.02em",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(167,139,250,0.4)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>

            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-75"
              style={{ color: "#a78bfa" }}
            >
              <ExternalLink size={11} />
              Get a free key from Google AI Studio
            </a>
          </div>

          {/* Model selection */}
          <div className="space-y-2 pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <label className="flex items-center gap-1.5 text-[11px] font-medium pt-3" style={{ color: "#4a5568" }}>
              <Cpu size={11} />
              MODEL
            </label>

            <ModelRow
              active={model === AUTO_MODEL}
              onClick={() => setModel(AUTO_MODEL)}
              label="Auto (recommended)"
              description="Tries each model below in order until one succeeds."
            />
            {AVAILABLE_MODELS.map((m) => (
              <ModelRow
                key={m.id}
                active={model === m.id}
                onClick={() => setModel(m.id)}
                label={m.label}
                description={m.description}
                mono
              />
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#7c8799" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!value.trim()}
              className="flex-1 px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)", color: "white" }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModelRow({
  active,
  onClick,
  label,
  description,
  mono,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  description: string;
  mono?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-2.5 p-2.5 rounded-lg text-left transition-all"
      style={{
        background: active ? "rgba(167,139,250,0.08)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${active ? "rgba(167,139,250,0.25)" : "rgba(255,255,255,0.06)"}`,
      }}
    >
      <div
        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{
          background: active ? "#a78bfa" : "transparent",
          border: `1.5px solid ${active ? "#a78bfa" : "rgba(255,255,255,0.2)"}`,
        }}
      >
        {active && <Check size={10} style={{ color: "#13161b" }} strokeWidth={3} />}
      </div>
      <div className="min-w-0">
        <p
          className="text-xs font-medium"
          style={{ color: active ? "#eef0f3" : "#c9d1d9", fontFamily: mono ? "'JetBrains Mono', monospace" : undefined }}
        >
          {label}
        </p>
        <p className="text-[10.5px] mt-0.5 leading-snug" style={{ color: "#4a5568" }}>
          {description}
        </p>
      </div>
    </button>
  );
}

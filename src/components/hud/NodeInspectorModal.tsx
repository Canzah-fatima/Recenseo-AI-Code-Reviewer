import { X, ArrowRight, Sparkles } from "lucide-react";
import type { ClusterPinData } from "../3d/NeuralCoreCanvas";

interface NodeInspectorModalProps {
  pin: ClusterPinData | null;
  onClose: () => void;
  onOpenInStudio: () => void;
}

export default function NodeInspectorModal({
  pin,
  onClose,
  onOpenInStudio,
}: NodeInspectorModalProps) {
  if (!pin) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-sm sm:max-w-md p-5 sm:p-6 rounded-2xl bg-[#090b10] border border-white/20 shadow-2xl text-left font-mono">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X size={15} />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              pin.severity === "critical"
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                : pin.severity === "warning"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
            }`}
          >
            {pin.details.rule}
          </span>
          <span className="text-[10px] text-slate-400">{pin.details.impact}</span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-white font-sans tracking-tight">
          {pin.label}
        </h3>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed font-sans">
          {pin.details.description}
        </p>

        <div className="mt-4 p-3 bg-white/[0.03] rounded-xl border border-white/10 text-[11px] text-indigo-300">
          <div className="flex items-center gap-1.5 font-bold mb-1">
            <Sparkles size={12} />
            <span>Detection Telemetry</span>
          </div>
          {/* <span>{pin.count} occurrences isolated across dynamic AST branches.</span> */}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs text-slate-400 hover:text-white transition"
          >
            Dismiss
          </button>
          <button
            onClick={onOpenInStudio}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-black font-semibold text-xs rounded-full hover:bg-slate-200 transition font-sans"
          >
            Open in Studio
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
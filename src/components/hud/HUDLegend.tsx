import { Plus, Minus } from "lucide-react";

interface HUDLegendProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function HUDLegend({ onZoomIn, onZoomOut }: HUDLegendProps) {
  return (
    <>

      {/* Bottom Right Zoom Control Stack */}
      <div className="fixed bottom-16 sm:bottom-24 right-3 sm:right-6 z-30 pointer-events-auto flex flex-col gap-1">
        <button
          onClick={onZoomIn}
          className="w-8 h-8 rounded-t-lg bg-white/[0.08] border border-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition active:scale-95"
          title="Zoom In"
        >
          <Plus size={13} />
        </button>
        <button
          onClick={onZoomOut}
          className="w-8 h-8 rounded-b-lg bg-white/[0.08] border border-white/15 border-t-0 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition active:scale-95"
          title="Zoom Out"
        >
          <Minus size={13} />
        </button>
      </div>
    </>
  );
}
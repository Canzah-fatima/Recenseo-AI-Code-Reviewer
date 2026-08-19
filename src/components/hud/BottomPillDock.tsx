"use client";

import {
  ShieldAlert,
  Zap,
  Cpu,
  GitFork,
  ShieldCheck,
  Flame,
  type LucideIcon,
} from "lucide-react";

interface BottomPillDockProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

interface CategoryItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const CATEGORIES: CategoryItem[] = [
  { id: "injections", label: "CODE INJECTIONS", icon: ShieldAlert },
  { id: "complexity", label: "BIG-O COMPLEXITY", icon: Zap },
  { id: "memory", label: "HEAP LEAKS", icon: Cpu },
  { id: "concurrency", label: "RACE CONDITIONS", icon: GitFork },
  { id: "types", label: "TYPE SAFETY", icon: ShieldCheck },
  { id: "refactor", label: "DEAD CODE", icon: Flame },
];

export default function BottomPillDock({
  activeCategory,
  onSelectCategory,
}: BottomPillDockProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-1.5 w-max max-w-[calc(100vw-6rem)] select-none bg-transparent p-0">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;
        const Icon = cat.icon;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-mono text-[8px] sm:text-[9px] font-bold tracking-wide uppercase transition-all duration-150 active:scale-95 whitespace-nowrap ${
              isActive
                ? "bg-[#FFFFFF] text-black border border-black/20 shadow-[0_2px_8px_rgba(255,255,255,0.35)]"
                : "bg-[#E3E3E6] hover:bg-[#EEEEF0] text-[#18181B] border border-black/10 shadow-sm"
            }`}
          >
            <Icon
              size={10}
              className="text-[#18181B] shrink-0 sm:w-[11px] sm:h-[11px]"
              strokeWidth={2.4}
            />
            <span className="truncate">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
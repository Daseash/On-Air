"use client";

import { motion } from "framer-motion";
import React, { useState } from "react";
import { cn } from "./utils";

export interface HighlightTab {
  id: string;
  label: string;
  emoji?: string;
  badge?: string;
}

export interface HighlightProps {
  items: HighlightTab[];
  activeId?: string;
  onChange?: (tab: HighlightTab) => void;
  className?: string;
  pillClassName?: string;
  itemClassName?: string;
}

const defaultTabs: HighlightTab[] = [
  { id: "all", label: "All Stays", emoji: "🌐" },
  { id: "beach", label: "Beachfront", emoji: "🏖️" },
  { id: "views", label: "Amazing Views", emoji: "🌄" },
  { id: "trending", label: "Trending", emoji: "🔥" },
  { id: "cabins", label: "Cabins", emoji: "🪵" },
  { id: "cities", label: "Iconic Cities", emoji: "🏙️" },
  { id: "luxury", label: "Luxury", emoji: "💎" },
];

export const Highlight: React.FC<HighlightProps> = ({
  items = defaultTabs,
  activeId,
  onChange,
  className,
  pillClassName,
  itemClassName,
}) => {
  const [selected, setSelected] = useState<string>(activeId || items[0]?.id || "all");
  const [hovered, setHovered] = useState<string | null>(null);

  const currentActive = hovered || selected;

  return (
    <div
      onPointerLeave={() => setHovered(null)}
      className={cn(
        "relative flex items-center gap-1.5 p-1.5 rounded-full bg-neutral-100/90 border border-neutral-200/80 shadow-inner overflow-x-auto scrollbar-none",
        className
      )}
    >
      {items.map((tab) => {
        const isTarget = currentActive === tab.id;
        const isSelected = selected === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onPointerEnter={() => setHovered(tab.id)}
            onClick={() => {
              setSelected(tab.id);
              onChange?.(tab);
            }}
            className={cn(
              "relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-colors cursor-pointer select-none whitespace-nowrap",
              isSelected || isTarget
                ? "text-white"
                : "text-neutral-600 hover:text-neutral-900",
              itemClassName
            )}
          >
            {isTarget && (
              <motion.div
                layoutId="unlumen-highlight-pill"
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 32,
                }}
                className={cn(
                  "absolute inset-0 z-[-1] rounded-full bg-neutral-900 shadow-md",
                  pillClassName
                )}
              />
            )}
            {tab.emoji && <span className="text-base leading-none">{tab.emoji}</span>}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white font-mono">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Highlight;

"use client";

import { motion } from "framer-motion";
import React from "react";
import { cn } from "./utils";

export interface NavItem {
  name: string;
  href: string;
  description?: string;
}

export interface Skiper58Props {
  items?: NavItem[];
  className?: string;
  itemClassName?: string;
  center?: boolean;
  onSelect?: (item: NavItem) => void;
}

const defaultNavItems: NavItem[] = [
  { name: "Home", href: "/", description: "[0]" },
  { name: "Stays", href: "/listings", description: "[1]" },
  { name: "Beachfront", href: "/listings?category=beach", description: "[2]" },
  { name: "Mountain Views", href: "/listings?category=amazing-views", description: "[3]" },
  { name: "Become a Host", href: "/listings/new", description: "[4]" },
  { name: "Account", href: "/user", description: "[5]" },
  { name: "Login", href: "/login", description: "[6]" },
];

export const Skiper58: React.FC<Skiper58Props> = ({
  items = defaultNavItems,
  className,
  itemClassName,
  center = true,
  onSelect,
}) => {
  return (
    <ul
      className={cn(
        "flex min-h-full w-full flex-col items-center justify-center gap-2 rounded-2xl px-6 py-8 backdrop-blur-md bg-neutral-900/90 text-white shadow-2xl",
        className
      )}
    >
      {items.map((item, index) => (
        <li
          key={index}
          onClick={() => onSelect?.(item)}
          className={cn(
            "relative flex cursor-pointer flex-col items-center overflow-visible py-1.5 transition-opacity hover:opacity-100 opacity-85",
            itemClassName
          )}
        >
          <div className="relative flex items-center gap-3">
            {item.description && (
              <span className="text-xs font-mono text-neutral-400 select-none">
                {item.description}
              </span>
            )}
            <TextRoll
              center={center}
              className="text-3xl font-extrabold uppercase tracking-tight sm:text-5xl lg:text-6xl text-white hover:text-rose-400 transition-colors"
            >
              {item.name}
            </TextRoll>
          </div>
        </li>
      ))}
    </ul>
  );
};

const STAGGER = 0.032;

export const TextRoll: React.FC<{
  children: string;
  className?: string;
  center?: boolean;
}> = ({ children, className, center = false }) => {
  const letters = children.split("");

  return (
    <motion.span
      initial="initial"
      whileHover="hovered"
      className={cn("relative block overflow-hidden cursor-pointer", className)}
      style={{
        lineHeight: 0.85,
      }}
    >
      <div>
        {letters.map((char, index) => {
          const delay = center
            ? STAGGER * Math.abs(index - (letters.length - 1) / 2)
            : STAGGER * index;

          return (
            <motion.span
              key={index}
              variants={{
                initial: { y: 0 },
                hovered: { y: "-100%" },
              }}
              transition={{
                duration: 0.28,
                ease: [0.33, 1, 0.68, 1],
                delay,
              }}
              className="inline-block"
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          );
        })}
      </div>
      <div className="absolute inset-0">
        {letters.map((char, index) => {
          const delay = center
            ? STAGGER * Math.abs(index - (letters.length - 1) / 2)
            : STAGGER * index;

          return (
            <motion.span
              key={index}
              variants={{
                initial: { y: "100%" },
                hovered: { y: 0 },
              }}
              transition={{
                duration: 0.28,
                ease: [0.33, 1, 0.68, 1],
                delay,
              }}
              className="inline-block"
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          );
        })}
      </div>
    </motion.span>
  );
};

export default Skiper58;

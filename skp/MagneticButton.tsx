"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React, { useRef } from "react";
import { cn } from "./utils";

export interface SpringOptions {
  stiffness?: number;
  damping?: number;
  mass?: number;
}

export interface MagneticButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  radius?: number;
  strength?: number;
  springOptions?: SpringOptions;
  variant?: "default" | "dark" | "gradient" | "outline" | "accent";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  radius = 120,
  strength = 0.45,
  springOptions = { stiffness: 180, damping: 16, mass: 0.1 },
  variant = "default",
  size = "default",
  className,
  ...props
}) => {
  const ref = useRef<HTMLButtonElement | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = {
    stiffness: springOptions.stiffness ?? 180,
    damping: springOptions.damping ?? 16,
    mass: springOptions.mass ?? 0.1,
  };

  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const distance = Math.hypot(distanceX, distanceY);

    if (distance < radius) {
      mouseX.set(distanceX * strength);
      mouseY.set(distanceY * strength);
    } else {
      mouseX.set(0);
      mouseY.set(0);
    }
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const variantStyles = {
    default:
      "bg-neutral-900 text-white hover:bg-neutral-800 shadow-md",
    dark: "bg-slate-900 hover:bg-slate-800 text-white shadow-lg",
    gradient:
      "bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white shadow-rose-500/20 shadow-lg",
    outline:
      "bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-50 shadow-sm",
    accent:
      "bg-[#ff385c] text-white hover:bg-[#e00b41] shadow-lg shadow-[#ff385c]/30",
  };

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs rounded-full",
    default: "px-6 py-2.5 text-sm font-semibold rounded-full",
    lg: "px-8 py-3.5 text-base font-bold rounded-full",
  };

  return (
    <motion.button
      ref={ref}
      style={{ x, y }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn(
        "relative inline-flex items-center justify-center cursor-pointer select-none transition-colors active:scale-95",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
};

export default MagneticButton;

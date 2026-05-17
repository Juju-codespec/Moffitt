"use client";

import { cn } from "@/lib/utils/cn";
import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200",
          "disabled:opacity-50 disabled:pointer-events-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50",
          variant === "primary" &&
            "bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-900 hover:shadow-lg hover:shadow-cyan-500/25",
          variant === "secondary" &&
            "glass text-slate-200 hover:border-cyan-500/30",
          variant === "ghost" && "text-slate-400 hover:text-cyan-300 hover:bg-white/5",
          variant === "danger" && "bg-red-500/20 text-red-300 hover:bg-red-500/30",
          size === "sm" && "px-3 py-1.5 text-sm",
          size === "md" && "px-4 py-2 text-sm",
          size === "lg" && "px-6 py-3 text-base",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

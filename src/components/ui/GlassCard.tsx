"use client";

import { cn } from "@/lib/utils/cn";
import { motion, type MotionProps } from "framer-motion";

interface GlassCardProps extends MotionProps {
  strong?: boolean;
  children: React.ReactNode;
  className?: string;
}

/** Glassmorphism card container */
export function GlassCard({ strong, children, className, ...props }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-2xl p-5",
        strong ? "glass-strong" : "glass",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCw } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

export function FlashcardView({
  front,
  back,
}: {
  front: string;
  back: string;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="perspective-1000">
      <motion.div
        className="relative min-h-[200px] cursor-pointer"
        onClick={() => setFlipped((f) => !f)}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.4 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <GlassCard
          className="absolute inset-0 flex items-center justify-center p-6 text-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          <p className="text-lg text-white">{front}</p>
        </GlassCard>
        <GlassCard
          className="absolute inset-0 flex items-center justify-center p-6 text-center"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <p className="text-sm text-slate-300">{back}</p>
        </GlassCard>
      </motion.div>
      <Button
        variant="ghost"
        size="sm"
        className="mt-3 w-full"
        onClick={() => setFlipped((f) => !f)}
      >
        <RotateCw className="h-4 w-4" /> Flip
      </Button>
    </div>
  );
}

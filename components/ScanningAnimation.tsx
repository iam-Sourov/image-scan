"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface ScanningAnimationProps {
  imageSrc: string;
}

export function ScanningAnimation({ imageSrc }: ScanningAnimationProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 bg-slate-900 aspect-video flex items-center justify-center">
      <div className="relative w-full h-full">
        <Image
          src={imageSrc}
          alt="Scanning target"
          fill
          className="object-contain opacity-70"
        />
        {/* Scanning laser line */}
        <motion.div
          className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_15px_3px_rgba(52,211,153,0.8)] z-10"
          initial={{ top: "0%" }}
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{
            duration: 3,
            ease: "linear",
            repeat: Infinity,
          }}
        />
        {/* Scanning overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent pointer-events-none mix-blend-overlay" />

        {/* HUD Elements */}
        <div className="absolute top-4 left-4 text-emerald-400 font-mono text-xs animate-pulse">
          <p>INITIATING DEEP SCAN...</p>
          <p>ANALYZING PIXEL NOISE</p>
        </div>
        <div className="absolute bottom-4 right-4 text-emerald-400 font-mono text-xs text-right animate-pulse">
          <p>ARTIFACT DETECTION: ON</p>
          <p>MODEL: HIVE-V2</p>
        </div>
      </div>
    </div>
  );
}

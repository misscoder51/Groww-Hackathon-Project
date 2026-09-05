"use client";

import React, { useEffect, useState } from "react";

interface DitherWaveProps {
  className?: string;
  children?: React.ReactNode;
  subtle?: boolean;
}

export const DitherWave: React.FC<DitherWaveProps> = ({
  className = "",
  children,
  subtle = true,
}) => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {/* Restrained Dither Wave Background */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
          subtle ? "opacity-[0.035] dark:opacity-[0.07]" : "opacity-[0.06] dark:opacity-[0.12]"
        }`}
        aria-hidden="true"
      >
        <svg
          className={`w-full h-full object-cover ${reducedMotion ? "" : "animate-[pulse_8s_ease-in-out_infinite]"}`}
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id="dither-pattern"
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="0.75" fill="currentColor" />
              <circle cx="4" cy="4" r="0.75" fill="currentColor" />
            </pattern>
            <linearGradient id="wave-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0.8" />
            </linearGradient>
            <mask id="dither-mask">
              <rect width="100%" height="100%" fill="url(#dither-pattern)" />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#wave-grad)"
            mask="url(#dither-mask)"
            className="text-gray-900 dark:text-teal-400"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default DitherWave;

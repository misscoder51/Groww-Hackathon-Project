"use client"
import React from 'react'

export const DitherWave = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => {
  return (
    <div className={`relative overflow-hidden bg-black text-white ${className}`}>
      {/* Mock Dither Wave Effect */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-black to-black animate-pulse" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

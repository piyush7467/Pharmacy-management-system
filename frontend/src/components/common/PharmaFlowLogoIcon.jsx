import React from 'react';

/**
 * PharmaFlowLogoIcon
 * Pixel-accurate vector representation of the official PharmaFlow brand emblem:
 * A rich forest-green rounded squircle with the distinctive white medical cross and capsule pill.
 */
export function PharmaFlowLogoIcon({
  className = 'w-18 h-18 sm:w-20 sm:h-20',
  iconSize = 'w-10 h-10 sm:w-11 sm:h-11'
}) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-[22px] sm:rounded-[24px] bg-[#166534] dark:bg-[#166534] dark:border dark:border-emerald-500/25 text-white shadow-md shadow-emerald-950/15 shrink-0 select-none ${className}`}
      aria-label="PharmaFlow Logo"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconSize}
      >
        {/* Medical Cross Stem & Arms */}
        {/* Top Arm */}
        <rect x="41" y="16" width="18" height="26" rx="9" fill="white" />
        {/* Left Arm */}
        <rect x="16" y="41" width="26" height="18" rx="9" fill="white" />
        {/* Center Intersection */}
        <rect x="38" y="38" width="24" height="24" fill="white" />
        {/* Bottom Arm Extension */}
        <rect x="41" y="46" width="18" height="20" rx="9" fill="white" />
        {/* Right Arm Extension */}
        <rect x="46" y="41" width="20" height="18" rx="9" fill="white" />

        {/* Angled Pharma Capsule Overlay (Matches exact reference orientation) */}
        <g transform="translate(60, 60) rotate(-45)">
          {/* Pill Outline / Body */}
          <rect
            x="-10"
            y="-20"
            width="20"
            height="40"
            rx="10"
            fill="white"
            stroke="#166534"
            strokeWidth="3.5"
          />
          {/* Pill Middle Segment Divider */}
          <line
            x1="-10"
            y1="0"
            x2="10"
            y2="0"
            stroke="#166534"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}


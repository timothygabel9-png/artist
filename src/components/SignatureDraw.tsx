"use client";

import React from "react";

type Props = {
  className?: string;
  /** seconds */
  duration?: number;
  /** stroke thickness */
  strokeWidth?: number;
};

export default function SignatureDraw({
  className,
  duration = 2.8,
  strokeWidth = 3,
}: Props) {
  // IMPORTANT:
  // Replace the <path d="..."> with YOUR signature path.
  // This placeholder path is just an example.
  return (
    <svg
      className={className}
      viewBox="0 0 900 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Signature"
      role="img"
    >
      <path
        d="M65 150c55-45 95-75 140-75 58 0 32 86-10 86-30 0-40-40-10-58 36-22 110-10 190 4 90 16 150 22 220 8 55-11 90-34 115-65 8-10 9-20-3-25-16-6-55 25-75 52-22 30-32 68-5 76 28 8 92-40 132-84 22-25 42-46 60-46 16 0 8 30-8 50-30 36-64 54-112 68"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          // “ink” look
          filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.45))",
          // draw animation
          strokeDasharray: 2000,
          strokeDashoffset: 2000,
          animation: `sig-draw ${duration}s ease forwards`,
        }}
      />

      <style jsx>{`
        @keyframes sig-draw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </svg>
  );
}
"use client";

import React from "react";

interface BarcodeSVGProps {
  value: string;
  width?: number;
  height?: number;
  showText?: boolean;
  className?: string;
}

/**
 * Standard Code 39 bar patterns (digits, uppercase letters, hyphen).
 * 9 elements per char: 1 = narrow, 2 = wide.
 */
const CODE39_PATTERNS: Record<string, number[]> = {
  "0": [1, 1, 1, 2, 2, 1, 2, 1, 1],
  "1": [2, 1, 1, 2, 1, 1, 1, 1, 2],
  "2": [1, 1, 2, 2, 1, 1, 1, 1, 2],
  "3": [2, 1, 2, 2, 1, 1, 1, 1, 1],
  "4": [1, 1, 1, 2, 2, 1, 1, 1, 2],
  "5": [2, 1, 1, 2, 2, 1, 1, 1, 1],
  "6": [1, 1, 2, 2, 2, 1, 1, 1, 1],
  "7": [1, 1, 1, 2, 1, 1, 2, 1, 2],
  "8": [2, 1, 1, 2, 1, 1, 2, 1, 1],
  "9": [1, 1, 2, 2, 1, 1, 2, 1, 1],
  A: [2, 1, 1, 1, 1, 2, 1, 1, 2],
  B: [1, 1, 2, 1, 1, 2, 1, 1, 2],
  C: [2, 1, 2, 1, 1, 2, 1, 1, 1],
  D: [1, 1, 1, 1, 2, 2, 1, 1, 2],
  E: [2, 1, 1, 1, 2, 2, 1, 1, 1],
  F: [1, 1, 2, 1, 2, 2, 1, 1, 1],
  G: [1, 1, 1, 1, 1, 2, 2, 1, 2],
  H: [2, 1, 1, 1, 1, 2, 2, 1, 1],
  I: [1, 1, 2, 1, 1, 2, 2, 1, 1],
  J: [1, 1, 1, 1, 2, 2, 2, 1, 1],
  K: [2, 1, 1, 1, 1, 1, 1, 2, 2],
  L: [1, 1, 2, 1, 1, 1, 1, 2, 2],
  M: [2, 1, 2, 1, 1, 1, 1, 2, 1],
  N: [1, 1, 1, 1, 2, 1, 1, 2, 2],
  O: [2, 1, 1, 1, 2, 1, 1, 2, 1],
  P: [1, 1, 2, 1, 2, 1, 1, 2, 1],
  Q: [1, 1, 1, 1, 1, 1, 2, 2, 2],
  R: [2, 1, 1, 1, 1, 1, 2, 2, 1],
  S: [1, 1, 2, 1, 1, 1, 2, 2, 1],
  T: [1, 1, 1, 1, 2, 1, 2, 2, 1],
  U: [2, 2, 1, 1, 1, 1, 1, 1, 2],
  V: [1, 2, 2, 1, 1, 1, 1, 1, 2],
  W: [2, 2, 2, 1, 1, 1, 1, 1, 1],
  X: [1, 2, 1, 1, 2, 1, 1, 1, 2],
  Y: [2, 2, 1, 1, 2, 1, 1, 1, 1],
  Z: [1, 2, 2, 1, 2, 1, 1, 1, 1],
  "-": [1, 2, 1, 1, 1, 1, 2, 1, 2],
  "*": [1, 2, 1, 1, 2, 1, 2, 1, 1], // Start / Stop
};

export const BarcodeSVG: React.FC<BarcodeSVGProps> = ({
  value,
  width = 160,
  height = 36,
  showText = true,
  className = "",
}) => {
  // Normalize value for Code 39
  const cleanVal = value.toUpperCase().replace(/[^A-Z0-9-]/g, "-");
  const fullString = `*${cleanVal}*`;

  // Build bars: each character has 9 elements (bar, space, bar, space...)
  const elements: { isBar: boolean; width: number }[] = [];

  for (let i = 0; i < fullString.length; i++) {
    const char = fullString[i];
    const pattern = CODE39_PATTERNS[char] || CODE39_PATTERNS["-"];
    pattern.forEach((w, idx) => {
      elements.push({
        isBar: idx % 2 === 0,
        width: w,
      });
    });
    // Inter-character gap
    elements.push({ isBar: false, width: 1 });
  }

  const totalUnits = elements.reduce((acc, el) => acc + el.width, 0);
  const barHeight = showText ? height - 12 : height;

  let currentX = 0;

  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${totalUnits} ${height}`}
        shapeRendering="crispEdges"
        className="overflow-visible"
      >
        {elements.map((el, index) => {
          const x = currentX;
          currentX += el.width;
          if (!el.isBar) return null;
          return (
            <rect
              key={index}
              x={x}
              y={0}
              width={el.width}
              height={barHeight}
              fill="#000000"
            />
          );
        })}
        {showText && (
          <text
            x={totalUnits / 2}
            y={height - 1}
            textAnchor="middle"
            fontSize="8"
            fontFamily="monospace"
            fontWeight="bold"
            fill="#111827"
          >
            *{cleanVal}*
          </text>
        )}
      </svg>
    </div>
  );
};

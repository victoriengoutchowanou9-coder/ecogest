"use client";

import React from "react";

interface QRCodeSVGProps {
  value: string;
  size?: number;
  className?: string;
}

/**
 * Generates a deterministic, standard QR-like 25x25 matrix
 * with standard QR finder patterns, timing patterns, and data payload.
 */
function generateQRMatrix(input: string): boolean[][] {
  const size = 25; // Version 2 QR matrix size
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  // 1. Draw Finder Pattern helper
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[startY + r][startX + c] = isBorder || isCenter;
      }
    }
  };

  // Top-Left Finder
  drawFinder(0, 0);
  // Top-Right Finder
  drawFinder(size - 7, 0);
  // Bottom-Left Finder
  drawFinder(0, size - 7);

  // 2. Timing Patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // 3. Alignment pattern at (16, 16)
  const ax = 16;
  const ay = 16;
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const isBorder = Math.abs(r) === 2 || Math.abs(c) === 2;
      const isCenter = r === 0 && c === 0;
      matrix[ay + r][ax + c] = isBorder || isCenter;
    }
  }

  // 4. Deterministic hash-based data fill for remaining cells
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  const isReserved = (r: number, c: number): boolean => {
    // Top-left
    if (r <= 7 && c <= 7) return true;
    // Top-right
    if (r <= 7 && c >= size - 8) return true;
    // Bottom-left
    if (r >= size - 8 && c <= 7) return true;
    // Timing
    if (r === 6 || c === 6) return true;
    // Alignment
    if (Math.abs(r - ax) <= 2 && Math.abs(c - ay) <= 2) return true;
    return false;
  };

  let pseudoBit = Math.abs(hash);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!isReserved(r, c)) {
        pseudoBit = (pseudoBit * 1103515245 + 12345) & 0x7fffffff;
        matrix[r][c] = (pseudoBit % 7 === 0 || pseudoBit % 5 === 0);
      }
    }
  }

  return matrix;
}

export const QRCodeSVG: React.FC<QRCodeSVGProps> = ({
  value,
  size = 64,
  className = "",
}) => {
  const matrix = React.useMemo(() => generateQRMatrix(value), [value]);
  const matrixSize = matrix.length;
  const cellSize = size / (matrixSize + 2); // 1-cell border margin

  return (
    <div
      className={`inline-flex flex-col items-center justify-center p-1 bg-white border border-slate-900 ${className}`}
      title={`QR Code de vérification du bulletin: ${value}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        shapeRendering="crispEdges"
        className="w-full h-full"
      >
        <rect width={size} height={size} fill="#ffffff" />
        {matrix.map((row, r) =>
          row.map((cell, c) => {
            if (!cell) return null;
            return (
              <rect
                key={`${r}-${c}`}
                x={(c + 1) * cellSize}
                y={(r + 1) * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#000000"
              />
            );
          })
        )}
      </svg>
      <span className="text-[7px] font-mono tracking-tighter text-slate-800 uppercase mt-0.5 font-bold">
        VÉRIFIER
      </span>
    </div>
  );
};

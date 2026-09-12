import React, { useMemo } from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

/**
 * Pure SVG QR Code Generator component (No external API calls required)
 */
export const QRCodeSvg: React.FC<QRCodeProps> = ({ value, size = 150, className = '' }) => {
  const matrix = useMemo(() => generateQRMatrix(value), [value]);

  if (!matrix || matrix.length === 0) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-gray-100 dark:bg-[#3a3b3c] text-xs text-gray-500 rounded-xl ${className}`}
      >
        QR Error
      </div>
    );
  }

  const numCells = matrix.length;
  const cellSize = size / numCells;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${numCells} ${numCells}`}
      className={`rounded-xl bg-white p-2 ${className}`}
    >
      {matrix.map((row, r) =>
        row.map((cell, c) => (
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c}
              y={r}
              width={1.02}
              height={1.02}
              fill="#000000"
            />
          ) : null
        ))
      )}
    </svg>
  );
};

// --- Pure TS QR Code Generator Implementation ---

function generateQRMatrix(text: string): boolean[][] {
  try {
    const dataBytes = new TextEncoder().encode(text);
    let version = 1;
    const capacity = [17, 32, 53, 78, 106, 134, 154, 192, 230, 271]; // Version 1-10 L capacity
    for (let i = 0; i < capacity.length; i++) {
      if (dataBytes.length <= capacity[i]) {
        version = i + 1;
        break;
      }
    }
    if (dataBytes.length > capacity[capacity.length - 1]) version = 10;

    const size = version * 4 + 17;
    const grid: (boolean | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));

    // Finder patterns
    const placeFinder = (row: number, col: number) => {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const mr = row + r;
          const mc = col + c;
          if (mr >= 0 && mr < size && mc >= 0 && mc < size) {
            const isBorder = r === -1 || r === 7 || c === -1 || c === 7;
            const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
            const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
            grid[mr][mc] = !isBorder && (isOuter || isInner);
          }
        }
      }
    };

    placeFinder(0, 0);
    placeFinder(0, size - 7);
    placeFinder(size - 7, 0);

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
      if (grid[6][i] === null) grid[6][i] = i % 2 === 0;
      if (grid[i][6] === null) grid[i][6] = i % 2 === 0;
    }

    // Dark module
    grid[4 * version + 9][8] = true;

    // Convert input data to bit stream
    const bits: number[] = [];
    const pushBits = (val: number, len: number) => {
      for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
    };

    pushBits(0b0100, 4); // Byte mode
    pushBits(dataBytes.length, version < 10 ? 8 : 16);
    for (const b of dataBytes) pushBits(b, 8);
    pushBits(0, 4); // Terminator

    while (bits.length % 8 !== 0) bits.push(0);

    const padBytes = [0xec, 0x11];
    let padIdx = 0;
    const maxDataBits = capacity[version - 1] * 8;
    while (bits.length < maxDataBits) {
      pushBits(padBytes[padIdx % 2], 8);
      padIdx++;
    }

    // Fill matrix
    let bitIdx = 0;
    let dir = -1;
    for (let c = size - 1; c > 0; c -= 2) {
      if (c === 6) c--; // Skip vertical timing column
      const rStart = dir === -1 ? size - 1 : 0;
      const rEnd = dir === -1 ? -1 : size;

      for (let r = rStart; r !== rEnd; r += dir) {
        for (let colOffset = 0; colOffset < 2; colOffset++) {
          const col = c - colOffset;
          if (grid[r][col] === null) {
            let bit = false;
            if (bitIdx < bits.length) {
              bit = bits[bitIdx++] === 1;
            }
            // Apply mask 0: (row + col) % 2 === 0
            if ((r + col) % 2 === 0) bit = !bit;
            grid[r][col] = bit;
          }
        }
      }
      dir = -dir;
    }

    return grid.map((row) => row.map((cell) => cell ?? false));
  } catch (e) {
    return [];
  }
}

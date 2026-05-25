/**
 * Mathematical Symmetry Engine for Truchet Patterns
 * 
 * Implements pure calculations for wallpaper groups and pattern transformations
 * without any canvas drawing or audio engine dependencies.
 * Returns grid structures as 2D arrays of tile types (0, 1, 2, 3).
 */

// Helper functions for tile rotations (0-3 scale representing tile shapes)
export function rotateType180(type) {
  if (type === 0) return 1;
  if (type === 1) return 0;
  if (type === 2) return 3;
  if (type === 3) return 2;
  return type;
}

export function rotateTypeClockwise(type) {
  // Matches original logic
  if (type === 0) return 2;
  if (type === 1) return 3;
  if (type === 2) return 1;
  if (type === 3) return 0;
  return type;
}

export function rotateTypeCounterClockwise(type) {
  if (type === 0) return 3;
  if (type === 1) return 2;
  if (type === 2) return 0;
  if (type === 3) return 1;
  return type;
}

// Helper functions for tile mirroring
export function mirrorTypeHorizontally(type) {
  if (type === 0) return 2;
  if (type === 1) return 3;
  if (type === 2) return 0;
  if (type === 3) return 1;
  return type;
}

export function mirrorTypeVertically(type) {
  if (type === 0) return 3;
  if (type === 1) return 2;
  if (type === 2) return 1;
  if (type === 3) return 0;
  return type;
}

export function mirrorTypeDiagonally(type) {
  if (type === 0) return 0;
  if (type === 1) return 1;
  if (type === 2) return 3;
  if (type === 3) return 2;
  return type;
}

export function reflectTypeAcrossDiagonal(type) {
  if (type === 0) return 1;
  if (type === 1) return 0;
  if (type === 2) return 3;
  if (type === 3) return 2;
  return type;
}

export function mirrorAndFlipHorizontally(type) {
  if (type === 0) return 1;
  if (type === 1) return 0;
  if (type === 2) return 3;
  if (type === 3) return 2;
  return type;
}

export function mirrorAndFlipVertically(type) {
  if (type === 0) return 3;
  if (type === 1) return 2;
  if (type === 2) return 1;
  if (type === 3) return 0;
  return type;
}

/**
 * Creates a raw mathematical symmetry pattern (grid of integers 0..3)
 * @param {string} symmetryType - D4, C4, etc.
 * @param {number} cols 
 * @param {number} rows 
 * @param {number} motifRatio 
 * @returns {Array<Array<number>>} - 2D grid of tile types
 */
export function createSymmetricPattern(symmetryType, cols, rows, motifRatio = 2) {
  const pattern = [];
  const motifCols = cols / motifRatio;
  const motifRows = rows / motifRatio;
  
  const randInt = (max) => Math.floor(Math.random() * max);

  if (symmetryType === "D4") {
    // Generate top-left quadrant
    for (let y = 0; y < rows / 2; y++) {
      const row = [];
      for (let x = 0; x < cols / 2; x++) {
        let type;
        if (x < y) {
          type = randInt(2);
        } else if (x === y) {
          type = randInt(2);
        } else {
          type = randInt(4);
        }
        row.push(type);
      }
      pattern.push(row);
    }

    // Reflect diagonally in top-left quadrant
    for (let y = 0; y < rows / 2; y++) {
      for (let x = 0; x < cols / 2; x++) {
        if (x > y) {
          const type = pattern[y][x];
          pattern[x][y] = mirrorTypeDiagonally(type);
        }
      }
    }

    // Reflect horizontally to get top-right quadrant
    for (let y = 0; y < rows / 2; y++) {
      for (let x = 0; x < cols / 2; x++) {
        const type = pattern[y][x];
        pattern[y].push(mirrorTypeHorizontally(type));
      }
    }

    // Reflect vertically to get bottom-left quadrant
    for (let y = 0; y < rows / 2; y++) {
      const bottomRow = [];
      for (let x = 0; x < cols / 2; x++) {
        const type = pattern[y][x];
        bottomRow.push(mirrorTypeVertically(type));
      }
      pattern.push(bottomRow);
    }

    // Reflect vertically to get bottom-right quadrant
    for (let y = 0; y < rows / 2; y++) {
      for (let x = 0; x < cols / 2; x++) {
        const type = pattern[y][cols / 2 + x];
        pattern[rows / 2 + y].push(mirrorTypeVertically(type));
      }
    }
  } 
  else if (symmetryType === "C4") {
    // Top-left
    for (let y = 0; y < rows / 2; y++) {
      const row = [];
      for (let x = 0; x < cols / 2; x++) {
        row.push(randInt(4));
      }
      pattern.push(row);
    }

    for (let y = 0; y < rows / 2; y++) {
      pattern[y].length = cols;
    }
    for (let y = rows / 2; y < rows; y++) {
      pattern.push(new Array(cols).fill(undefined));
    }

    // Top-right (90 deg clockwise)
    for (let y = 0; y < rows / 2; y++) {
      for (let x = 0; x < cols / 2; x++) {
        const type = pattern[y][x];
        pattern[x][cols - y - 1] = rotateTypeClockwise(type);
      }
    }

    // Bottom-right (rotate again)
    for (let y = 0; y < rows / 2; y++) {
      for (let x = 0, x2 = cols - 1; x < cols / 2; x++, x2--) {
        const type = pattern[x2][cols - y - 1];
        pattern[rows - y - 1][cols - x - 1] = rotateTypeClockwise(type);
      }
    }

    // Bottom-left (rotate again)
    for (let y = 0; y < rows / 2; y++) {
      for (let x = 0; x < cols / 2; x++) {
        const type = pattern[rows - y - 1][cols - x - 1];
        pattern[rows - x - 1][y] = rotateTypeClockwise(type);
      }
    }
  }
  else if (symmetryType === "D2_s") {
    // Top-left quadrant
    for (let y = 0; y < rows / 2; y++) {
      const row = [];
      for (let x = 0; x < cols / 2; x++) {
        row.push(randInt(4));
      }
      pattern.push(row);
    }

    // Horizontal reflect to top-right
    for (let y = 0; y < rows / 2; y++) {
      for (let x = 0; x < cols / 2; x++) {
        const type = pattern[y][x];
        pattern[y].push(mirrorTypeHorizontally(type));
      }
    }

    // Vertical reflect to bottom-left
    for (let y = 0; y < rows / 2; y++) {
      const bottomRow = [];
      for (let x = 0; x < cols / 2; x++) {
        const type = pattern[y][x];
        bottomRow.push(mirrorTypeVertically(type));
      }
      pattern.push(bottomRow);
    }

    // Vertical reflect to bottom-right
    for (let y = 0; y < rows / 2; y++) {
      for (let x = 0; x < cols / 2; x++) {
        const type = pattern[y][cols / 2 + x];
        pattern[rows / 2 + y].push(mirrorTypeVertically(type));
      }
    }
  }
  else if (symmetryType === "C2") {
    // Left half
    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols / 2; x++) {
        row.push(randInt(4));
      }
      pattern.push(row);
    }

    for (let y = 0; y < rows; y++) {
      pattern[y].length = cols;
    }

    // 180 degree rotation to right half
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols / 2; x++) {
        const type = pattern[y][x];
        const newType = rotateType180(type);
        pattern[rows - y - 1][cols - x - 1] = newType;
      }
    }
  }
  else if (symmetryType === "D1_h") {
    // Left half
    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols / 2; x++) {
        row.push(randInt(4));
      }
      pattern.push(row);
    }
    
    // Mirror horizontally to right half
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols / 2; x++) {
        const type = pattern[y][x];
        pattern[y].push(mirrorTypeHorizontally(type));
      }
    }
  }
  else if (symmetryType === "D1_v") {
    // Top half
    for (let y = 0; y < rows / 2; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        row.push(randInt(4));
      }
      pattern.push(row);
    }
    
    // Mirror vertically to bottom half
    for (let y = 0; y < rows / 2; y++) {
      const bottomRow = [];
      for (let x = 0; x < cols; x++) {
        bottomRow.push(mirrorTypeVertically(pattern[y][x]));
      }
      pattern.push(bottomRow);
    }
  }
  else if (symmetryType === "p1") {
    // Random motif repeated
    const motifPattern = [];
    for (let y = 0; y < motifRows; y++) {
      const row = [];
      for (let x = 0; x < motifCols; x++) {
        row.push(randInt(4));
      }
      motifPattern.push(row);
    }

    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        row.push(motifPattern[y % motifRows][x % motifCols]);
      }
      pattern.push(row);
    }
  }
  else if (symmetryType === "p2") {
    const motifPattern = [];
    for (let y = 0; y < motifRows; y++) {
      const row = [];
      for (let x = 0; x < motifCols / 2; x++) {
        row.push(randInt(4));
      }
      motifPattern.push(row);
    }

    // 180 rotation for right half of motif
    for (let y = 0; y < motifRows; y++) {
      for (let x = 0; x < motifCols / 2; x++) {
        const type = motifPattern[y][x];
        motifPattern[motifRows - y - 1] = motifPattern[motifRows - y - 1] || [];
        motifPattern[motifRows - y - 1][motifCols - x - 1] = rotateType180(type);
      }
    }

    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        row.push(motifPattern[y % motifRows][x % motifCols]);
      }
      pattern.push(row);
    }
  }
  else if (symmetryType === "pm_v") {
    const motifPattern = [];
    for (let y = 0; y < motifRows; y++) {
      const row = [];
      for (let x = 0; x < motifCols / 2; x++) {
        row.push(randInt(4));
      }
      motifPattern.push(row);
    }

    for (let y = 0; y < motifRows; y++) {
      for (let x = 0, x2 = motifCols - 1; x < motifCols / 2; x++, x2--) {
        const type = motifPattern[y][x];
        motifPattern[y][x2] = mirrorTypeHorizontally(type);
      }
    }

    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        row.push(motifPattern[y % motifRows][x % motifCols]);
      }
      pattern.push(row);
    }
  }
  else if (symmetryType === "pm_h") {
    const motifPattern = [];
    for (let y = 0; y < motifRows / 2; y++) {
      const row = [];
      for (let x = 0; x < motifCols; x++) {
        row.push(randInt(4));
      }
      motifPattern.push(row);
    }

    for (let y = 0; y < motifRows / 2; y++) {
      for (let x = 0; x < motifCols; x++) {
        const type = motifPattern[y][x];
        const newY = motifRows - y - 1;
        motifPattern[newY] = motifPattern[newY] || [];
        motifPattern[newY][x] = mirrorTypeVertically(type);
      }
    }

    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        row.push(motifPattern[y % motifRows][x % motifCols]);
      }
      pattern.push(row);
    }
  }
  else if (symmetryType === "pg_h") {
    const motifPattern = [];
    for (let y = 0; y < motifRows; y++) {
      motifPattern.push(new Array(motifCols));
    }

    for (let y = 0; y < motifRows; y++) {
      for (let x = 0; x < motifCols / 2; x++) {
        const type = randInt(4);
        motifPattern[y][x] = type;
        motifPattern[y][motifCols - x - 1] = mirrorAndFlipHorizontally(type);
      }
    }

    for (let y = 0; y < motifRows; y++) {
      for (let x = 0; x < motifCols; x++) {
        const type = motifPattern[y][x];
        if (type === undefined) continue;
        motifPattern[(motifRows - y - 1) % motifRows][x] = mirrorAndFlipVertically(type);
      }
    }

    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        const motifX = (x + (y % 2) * (motifCols / 2)) % motifCols;
        row.push(motifPattern[y % motifRows][motifX]);
      }
      pattern.push(row);
    }
  }
  else if (symmetryType === "cm_s") {
    const motifPattern = [];
    for (let y = 0; y < motifRows; y++) {
      motifPattern.push(new Array(motifCols));
    }

    for (let y = 0; y < motifRows / 2; y++) {
      for (let x = 0; x < motifCols / 2; x++) {
        const type = randInt(4);
        motifPattern[y][x] = type;
        motifPattern[y][motifCols - x - 1] = mirrorTypeHorizontally(type);
      }
    }

    for (let y = 0; y < motifRows / 2; y++) {
      for (let x = 0; x < motifCols; x++) {
        motifPattern[motifRows - y - 1][x] = mirrorTypeVertically(motifPattern[y][x]);
      }
    }

    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        const motifX = (x + (y % 2) * (motifCols / 2)) % motifCols;
        row.push(motifPattern[y % motifRows][motifX]);
      }
      pattern.push(row);
    }
  }
  else if (symmetryType === "pmm") {
    const motifPattern = [];
    for (let y = 0; y < motifRows / 2; y++) {
      const row = [];
      for (let x = 0; x < motifCols / 2; x++) {
        row.push(randInt(4));
      }
      motifPattern.push(row);
    }

    for (let y = 0; y < motifRows / 2; y++) {
      for (let x = 0; x < motifCols / 2; x++) {
        const type = motifPattern[y][x];
        motifPattern[y][motifCols - x - 1] = mirrorTypeHorizontally(type);
      }
    }

    for (let y = 0; y < motifRows / 2; y++) {
      for (let x = 0; x < motifCols / 2; x++) {
        const type = motifPattern[y][x];
        motifPattern[motifRows - y - 1] = motifPattern[motifRows - y - 1] || [];
        motifPattern[motifRows - y - 1][x] = mirrorTypeVertically(type);
      }
    }

    for (let y = 0; y < motifRows / 2; y++) {
      for (let x = 0; x < motifCols / 2; x++) {
        const type = motifPattern[y][x];
        motifPattern[motifRows - y - 1][motifCols - x - 1] = rotateType180(type);
      }
    }

    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        row.push(motifPattern[y % motifRows][x % motifCols]);
      }
      pattern.push(row);
    }
  }
  else if (symmetryType === "pmg_h") {
    const motifPattern = [];
    for (let y = 0; y < motifRows / 2; y++) {
      const row = [];
      for (let x = 0; x < motifCols / 2; x++) {
        row.push(randInt(4));
      }
      motifPattern.push(row);
    }

    for (let y = 0; y < motifRows / 2; y++) {
      for (let x = 0; x < motifCols / 2; x++) {
        motifPattern[y][motifCols - x - 1] = rotateType180(motifPattern[y][x]);
      }
    }

    for (let y = 0; y < motifRows / 2; y++) {
      for (let x = 0; x < motifCols / 2; x++) {
        motifPattern[motifRows - y - 1] = motifPattern[motifRows - y - 1] || [];
        motifPattern[motifRows - y - 1][x] = mirrorTypeVertically(motifPattern[y][x]);
      }
    }

    for (let y = 0; y < motifRows / 2; y++) {
      for (let x = motifCols / 2; x < motifCols; x++) {
        motifPattern[motifRows - y - 1][x] = mirrorTypeVertically(motifPattern[y][x]);
      }
    }

    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        row.push(motifPattern[y % motifRows][x % motifCols]);
      }
      pattern.push(row);
    }
  }
  else if (symmetryType === "pmg_v") {
    const motifPattern = [];
    for (let y = 0; y < motifRows / 2; y++) {
      const row = [];
      for (let x = 0; x < motifCols / 2; x++) {
        row.push(randInt(4));
      }
      motifPattern.push(row);
    }

    for (let y = 0; y < motifRows / 2; y++) {
      for (let x = 0; x < motifCols / 2; x++) {
        motifPattern[y][motifCols - x - 1] = mirrorTypeHorizontally(motifPattern[y][x]);
      }
    }

    for (let y = 0; y < motifRows / 2; y++) {
      for (let x = 0; x < motifCols / 2; x++) {
        motifPattern[motifRows - y - 1] = motifPattern[motifRows - y - 1] || [];
        motifPattern[motifRows - y - 1][x] = rotateType180(motifPattern[y][x]);
      }
    }

    for (let y = motifRows / 2; y < motifRows; y++) {
      for (let x = 0; x < motifCols / 2; x++) {
        motifPattern[y][motifCols - x - 1] = mirrorTypeHorizontally(motifPattern[y][x]);
      }
    }

    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        row.push(motifPattern[y % motifRows][x % motifCols]);
      }
      pattern.push(row);
    }
  }
  else if (symmetryType === "pgg") {
    const motifPattern = [];
    for (let y = 0; y < motifRows; y++) {
      motifPattern.push(new Array(motifCols));
    }

    for (let y = 0; y < motifRows; y++) {
      for (let x = 0; x < motifCols / 2; x++) {
        const type = randInt(4);
        motifPattern[y][x] = type;
        motifPattern[y][motifCols - x - 1] = mirrorAndFlipHorizontally(type);
        motifPattern[motifRows - y - 1][x] = mirrorAndFlipVertically(type);
        motifPattern[motifRows - y - 1][motifCols - x - 1] = rotateType180(type);
      }
    }

    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        const motifX = (x + (y % 2) * (motifCols / 2)) % motifCols;
        row.push(motifPattern[y % motifRows][motifX]);
      }
      pattern.push(row);
    }
  }
  else if (symmetryType === "cmm") {
    const motifPattern = [];
    for (let y = 0; y < motifRows; y++) {
      motifPattern.push(new Array(motifCols));
    }

    for (let y = 0; y < motifRows; y++) {
      for (let x = 0; x < motifCols / 2; x++) {
        const type = randInt(4);
        motifPattern[y][x] = type;
        motifPattern[y][motifCols - x - 1] = mirrorTypeHorizontally(type);
        motifPattern[motifRows - y - 1][x] = mirrorTypeVertically(type);
        motifPattern[motifRows - y - 1][motifCols - x - 1] = rotateType180(type);
      }
    }

    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        const motifX = (x + (y % 2) * (motifCols / 2)) % motifCols;
        row.push(motifPattern[y % motifRows][motifX]);
      }
      pattern.push(row);
    }
  }
  else if (symmetryType === "p4") {
    const motifPattern = [];
    for (let y = 0; y < motifRows; y++) {
      motifPattern.push(new Array(motifCols));
    }

    for (let y = 0; y < motifRows / 2; y++) {
      for (let x = 0; x < motifCols / 2; x++) {
        const type = randInt(4);
        motifPattern[y][x] = type;
        motifPattern[x][motifCols - y - 1] = rotateTypeClockwise(type);
        motifPattern[motifRows - x - 1][y] = rotateTypeCounterClockwise(type);
        motifPattern[motifRows - y - 1][motifCols - x - 1] = rotateType180(type);
      }
    }

    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        row.push(motifPattern[y % motifRows][x % motifCols]);
      }
      pattern.push(row);
    }
  }
  else if (symmetryType === "p4m") {
    const motifPattern = [];
    for (let y = 0; y < motifRows; y++) {
      motifPattern.push(new Array(motifCols));
    }

    for (let y = 0; y < motifRows / 2; y++) {
      for (let x = 0; x <= y; x++) {
        const type = randInt(2);
        motifPattern[y][x] = type;
        if (x !== y) {
          motifPattern[x][y] = mirrorTypeDiagonally(type);
        }
      }
    }

    for (let y = 0; y < motifRows / 2; y++) {
      for (let x = 0; x < motifCols / 2; x++) {
        const type = motifPattern[y][x];
        motifPattern[y][motifCols - x - 1] = mirrorTypeHorizontally(type);
        motifPattern[motifRows - y - 1][x] = mirrorTypeVertically(type);
        motifPattern[motifRows - y - 1][motifCols - x - 1] = rotateType180(type);
      }
    }

    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        row.push(motifPattern[y % motifRows][x % motifCols]);
      }
      pattern.push(row);
    }
  }
  else if (symmetryType === "p4g") {
    const motifPattern = [];
    for (let y = 0; y < motifRows; y++) {
      motifPattern.push(new Array(motifCols));
    }

    for (let y = 0; y < motifRows / 2; y++) {
      for (let x = 0; x <= y; x++) {
        const type = x < y ? randInt(2) + 2 : randInt(2);
        motifPattern[y][x] = type;
      }
    }

    for (let y = 0; y < motifRows / 2; y++) {
      for (let x = 0; x < y; x++) {
        motifPattern[x][y] = reflectTypeAcrossDiagonal(motifPattern[y][x]);
      }
    }

    for (let y = 0; y < motifRows / 2; y++) {
      for (let x = motifCols / 2; x < motifCols; x++) {
        motifPattern[y][x] = mirrorTypeHorizontally(motifPattern[y][motifCols - x - 1]);
      }
    }

    for (let y = motifRows / 2; y < motifRows; y++) {
      for (let x = 0; x < motifCols / 2; x++) {
        motifPattern[y][x] = mirrorTypeVertically(motifPattern[motifRows - y - 1][x]);
      }
    }

    for (let y = motifRows / 2; y < motifRows; y++) {
      for (let x = 0; x < motifCols / 2; x++) {
        motifPattern[y][motifCols - x - 1] = rotateType180(motifPattern[motifRows - y - 1][x]);
      }
    }

    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        row.push(motifPattern[y % motifRows][x % motifCols]);
      }
      pattern.push(row);
    }
  }
  else {
    // Fallback: None / Chaos (pm1)
    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        row.push(randInt(4));
      }
      pattern.push(row);
    }
  }
  
  return pattern;
}

/**
 * Apply mathematical transformations directly on a grid matrix
 * @param {Array<Array<number>>} matrix 
 * @param {string} transformation 
 * @returns {Array<Array<number>>}
 */
export function applyTransformation(matrix, transformation) {
  if (transformation === "None" || !transformation) return matrix;

  const rows = matrix.length;
  const cols = matrix[0].length;
  const newMatrix = [];

  for (let y = 0; y < rows; y++) {
    const newRow = [];
    for (let x = 0; x < cols; x++) {
      const type = matrix[y][x];
      let newType = type;

      switch (transformation) {
        case "Inversion":
          newType = (3 - type) % 4;
          break;
        case "Augmentation":
          newType = (type + 1) % 4;
          break;
        default:
          break;
      }
      newRow.push(newType);
    }
    newMatrix.push(newRow);
  }

  // Retrograde is pure row reversal (mirroring the order of elements horizontally)
  if (transformation === "Retrograde") {
    return newMatrix.map(row => [...row].reverse());
  }

  return newMatrix;
}

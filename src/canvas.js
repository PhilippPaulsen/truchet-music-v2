/**
 * Canvas Manager Module for Truchet Music Studio
 * 
 * Encapsulates p5.js in Instance Mode. Manages drawing of the 2D Truchet
 * tiles grid, highlighting during music playback, canvas dynamic resizing,
 * and mouse/touch interactions for tile rotations with real-time symmetry mapping.
 */

import store from './state.js';
import { 
  createSymmetricPattern, 
  applyTransformation, 
  mirrorTypeDiagonally, 
  mirrorTypeHorizontally, 
  mirrorTypeVertically,
  rotateTypeClockwise,
  rotateType180
} from './symmetry.js';

export class CanvasManager {
  constructor(containerId) {
    this.containerId = containerId;
    this.p5Instance = null;
    this.motifTiles = []; // Core motif grid (generator) to preserve edits
    this.init();
  }

  init() {
    const sketch = (p) => {
      p.setup = () => {
        // High-DPI sharp rendering, lock 320x320 canvas
        const canvas = p.createCanvas(320, 320);
        canvas.parent(this.containerId);

        p.pixelDensity(p.displayDensity());
        p.frameRate(60);

        // Generate initial grid
        this.regenerateGrid(p);

        // Subscribe to state triggers that require canvas regeneration
        store.subscribe('tileSize', () => this.regenerateGrid(p));
        store.subscribe('symmetry', () => this.regenerateGrid(p));
        store.subscribe('transformation', () => this.regenerateGrid(p));
      };

      p.draw = () => {
        // High contrast grid drawing based on Light/Dark Duality
        const isDark = document.documentElement.classList.contains('dark');
        p.background(isDark ? 19 : 249); // Dark: #131313 (19), Light: #F9F9F9 (249)

        const tiles = store.get('tiles');
        const tileSize = store.get('tileSize');

        if (!tiles || tiles.length === 0) return;

        tiles.forEach((row, r) => {
          row.forEach((tile, c) => {
            this.drawTile(p, tile, tileSize, isDark);
          });
        });
      };

      p.mousePressed = () => {
        // Check if mouse is inside the canvas bounding box
        if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
          this.handleCanvasClick(p);
        }
      };
    };

    // Instantiate p5 in instance mode
    this.p5Instance = new p5(sketch);
  }

  /**
   * Generates a brand new mathematical pattern grid and sets it in the store
   */
  regenerateGrid(p) {
    const tileSize = store.get('tileSize');
    const cols = p.width / tileSize;
    const rows = p.height / tileSize;
    const symmetry = store.get('symmetry');

    // 1. Generate base mathematical pattern
    let rawPattern = createSymmetricPattern(symmetry, cols, rows, 2);

    // Apply active transformation if any (matches original generatePattern behavior)
    const transformation = store.get('transformation');
    if (transformation && transformation !== "None") {
      rawPattern = applyTransformation(rawPattern, transformation);
    }

    // 2. Wrap into Tile state objects
    const tilesGrid = rawPattern.map((row, r) => {
      return row.map((type, c) => {
        return {
          x: c * tileSize,
          y: r * tileSize,
          type: type,
          highlighted: false,
          row: r,
          col: c
        };
      });
    });

    store.set('tiles', tilesGrid);
    store.set('activeTilesCount', cols * rows);
  }

  /**
   * Draw individual Truchet Tile
   */
  drawTile(p, tile, size, isDark) {
    p.push();
    p.translate(tile.x, tile.y);

    // RGBY highlights during audio trigger pulses, otherwise high contrast duality
    let colorHex = isDark ? "#FFFFFF" : "#000000"; // Default foreground (triangles)
    let strokeColorHex = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";

    if (tile.highlighted) {
      const highlightColors = ["#FF6347", "#4682B4", "#32CD32", "#FFD700"]; // Red, Blue, Green, Yellow
      colorHex = highlightColors[tile.type];
    }

    p.fill(colorHex);
    p.stroke(strokeColorHex);
    p.strokeWeight(1);

    // Draw high contrast triangles matching tile types (0-3)
    p.beginShape();
    if (tile.type === 0) { p.vertex(size, 0); p.vertex(size, size); p.vertex(0, size); }
    if (tile.type === 1) { p.vertex(size, 0); p.vertex(0, 0); p.vertex(0, size); }
    if (tile.type === 2) { p.vertex(size, size); p.vertex(0, 0); p.vertex(0, size); }
    if (tile.type === 3) { p.vertex(size, size); p.vertex(0, 0); p.vertex(size, 0); }
    p.endShape(p.CLOSE);

    p.pop();
  }

  /**
   * Interactive Click handler: Rotates clicked tile and mirrors in real-time
   */
  handleCanvasClick(p) {
    const tiles = store.get('tiles');
    if (!tiles || tiles.length === 0) return;

    const tileSize = store.get('tileSize');
    const cols = p.width / tileSize;
    const rows = p.height / tileSize;

    const clickCol = Math.floor(p.mouseX / tileSize);
    const clickRow = Math.floor(p.mouseY / tileSize);

    if (clickCol < 0 || clickCol >= cols || clickRow < 0 || clickRow >= rows) return;

    const symmetry = store.get('symmetry');

    // Perform manual click-rotation on clicked tile (rotate 90 degrees)
    const clickedTile = tiles[clickRow][clickCol];
    const originalType = clickedTile.type;
    const rotatedType = (originalType + 1) % 4; // Rotate 90 deg (cyclic index 0..3)

    // Propagation of the rotated tile back into the symmetry grid
    // For D4 symmetry, we map any click back to the generator top-left quadrant (cols/2, rows/2)
    // and run mirroring over it to sync the entire canvas real-time.
    if (symmetry === "D4") {
      const halfCols = cols / 2;
      const halfRows = rows / 2;

      // Map back to motif coordinates
      let motifX = clickCol >= halfCols ? (cols - clickCol - 1) : clickCol;
      let motifY = clickRow >= halfRows ? (rows - clickRow - 1) : clickRow;

      // Handle diagonal quadrant symmetry mapping
      if (motifX < motifY) {
        // Click was below the diagonal, swap coordinates to map into independent motif area (above the diagonal)
        const temp = motifX;
        motifX = motifY;
        motifY = temp;
      }

      // 1. Mutate the main motif element in our grid
      const updatedType = rotatedType; 
      tiles[motifY][motifX].type = updatedType;

      // 2. Propagate symmetry calculations on the mutated quadrant element in real-time
      // Diagonal reflection inside the quadrant
      tiles[motifX][motifY].type = mirrorTypeDiagonally(updatedType);

      // Horizontal reflection to top-right quadrant
      for (let y = 0; y < halfRows; y++) {
        for (let x = 0; x < halfCols; x++) {
          const type = tiles[y][x].type;
          tiles[y][cols - x - 1].type = mirrorTypeHorizontally(type);
        }
      }

      // Vertical reflection to bottom-left quadrant
      for (let y = 0; y < halfRows; y++) {
        for (let x = 0; x < halfCols; x++) {
          const type = tiles[y][x].type;
          tiles[rows - y - 1][x].type = mirrorTypeVertically(type);
        }
      }

      // Vertical reflection to bottom-right quadrant
      for (let y = 0; y < halfRows; y++) {
        for (let x = 0; x < halfCols; x++) {
          const type = tiles[y][cols - x - 1].type;
          tiles[rows - y - 1][cols - x - 1].type = mirrorTypeVertically(type);
        }
      }
    } 
    else {
      // For general symmetries, simply rotate the specific clicked tile manually 
      // providing a freeform interactive editing experience.
      clickedTile.type = rotatedType;
    }

    // Trigger state notification to redraw canvas
    store.set('tiles', [...tiles]);
    console.log(`🎯 Tile manually rotated at (${clickCol}, ${clickRow}) -> Type ${rotatedType}`);
  }

  /**
   * Export the current p5.js canvas as a PNG download
   */
  exportPNG() {
    if (!this.p5Instance) return;
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const scaleName = store.get('scaleIndex');
    const tag = `${store.get('symmetry')}_${store.get('transformation')}_sz${store.get('tileSize')}`;
    this.p5Instance.saveCanvas(`pattern-${tag}-${ts}`, 'png');
    console.log("📸 Canvas exported as PNG.");
  }
}
export default CanvasManager;

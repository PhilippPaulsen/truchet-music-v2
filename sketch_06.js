let cols, rows;
let size = 100; // Size of each tile
let tiles = []; // Holds the tile objects
let currentSymmetry = "D4"; // Default symmetry type
let motifRatio = 2; // Determines the size of the repeating motif
let synth;
let speedSlider; // Slider to control playback speed
let symmetrySelector; // Dropdown for symmetry selection

function setup() {
  createCanvas(400, 400);

  // Initialize Tone.js Synth
  synth = new Tone.PolySynth().toDestination();

  // Create slider for speed control
  createP("Playback Speed:");
  speedSlider = createSlider(1, 20, 10, 1); // Range: 1x to 20x speed, default 10x

  // Create symmetry selection dropdown
  createP("Select Symmetry:");
  symmetrySelector = createSelect();
  symmetrySelector.option("D4");
  symmetrySelector.option("C4");
  symmetrySelector.selected(currentSymmetry); // Set default selection
  symmetrySelector.changed(() => {
    currentSymmetry = symmetrySelector.value();
    generatePattern(); // Regenerate pattern on change
  });

  // Setup tiles and generate initial pattern
  cols = width / size;
  rows = height / size;
  generatePattern();
}

function draw() {
  background(225);
  for (let row of tiles) {
    for (let tile of row) {
      tile.display();
    }
  }
}

// Generate the pattern based on the selected symmetry type
function generatePattern() {
  tiles = createSymmetricPattern(currentSymmetry, motifRatio);
}

// Tile class to handle individual tiles
class Tile {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.highlighted = false; // Flag for highlighting
  }

  display() {
    let colors = this.highlighted
      ? ["#FF6347", "#4682B4", "#32CD32", "#FFD700"] // Highlight colors
      : ["#000000", "#000000", "#000000", "#000000"]; // Default black tiles
    fill(colors[this.type]);
    push();
    translate(this.x, this.y);
    beginShape();
    if (this.type === 0) vertex(size, 0), vertex(size, size), vertex(0, size);
    if (this.type === 1) vertex(size, 0), vertex(0, 0), vertex(0, size);
    if (this.type === 2) vertex(size, size), vertex(0, 0), vertex(0, size);
    if (this.type === 3) vertex(size, size), vertex(0, 0), vertex(size, 0);
    endShape(CLOSE);
    pop();
    this.highlighted = false; // Reset highlight after display
  }

  highlight() {
    this.highlighted = true;
  }

  getNote() {
    let midiNotes = [57, 60, 64, 69]; // A3, C4, E4, A4 (A Minor)
    return midiNotes[this.type];
  }
}

function createSymmetricPattern(symmetryType, motifRatio) {
  let pattern = [];
  let motifCols = cols / motifRatio;
  let motifRows = rows / motifRatio;

  if (symmetryType === "D4") {
    // D4 symmetry logic (unchanged)
    for (let y = 0; y < rows / 2; y++) {
      let row = [];
      for (let x = 0; x < cols / 2; x++) {
        let type = floor(random(4)); // Random type
        row.push(new Tile(x * size, y * size, type));
      }
      pattern.push(row);
    }

    for (let y = 0; y < rows / 2; y++) {
      for (let x = 0; x < cols / 2; x++) {
        let type = pattern[y][x].type;

        // Top-right quadrant
        pattern[y].push(new Tile((cols - x - 1) * size, y * size, mirrorTypeHorizontally(type)));

        // Bottom-left quadrant
        if (!pattern[rows - y - 1]) pattern[rows - y - 1] = [];
        pattern[rows - y - 1].push(new Tile(x * size, (rows - y - 1) * size, mirrorTypeVertically(type)));

        // Bottom-right quadrant
        pattern[rows - y - 1].push(new Tile((cols - x - 1) * size, (rows - y - 1) * size, rotateType180(type)));
      }
    }
  } else if (symmetryType === "C4") {
    // C4 symmetry logic
    for (let y = 0; y < rows / 2; y++) {
      let row = [];
      for (let x = 0; x < cols / 2; x++) {
        let type = floor(random(4)); // Random type
        row.push(new Tile(x * size, y * size, type));
      }
      pattern.push(row);
    }

    for (let y = 0; y < rows / 2; y++) {
      for (let x = 0; x < cols / 2; x++) {
        let type = pattern[y][x].type;

        // Top-right quadrant (90-degree clockwise rotation)
        pattern[y].push(new Tile((cols - y - 1) * size, x * size, rotateTypeClockwise(type)));

        // Bottom-right quadrant (180-degree rotation)
        if (!pattern[rows - x - 1]) pattern[rows - x - 1] = [];
        pattern[rows - x - 1].push(new Tile((cols - y - 1) * size, (rows - x - 1) * size, rotateType180(type)));

        // Bottom-left quadrant (270-degree clockwise rotation)
        pattern[rows - x - 1].push(new Tile(y * size, (rows - x - 1) * size, rotateTypeCounterClockwise(type)));
      }
    }
  }

  return pattern;
}

// Rotation helper functions
// Helper function to rotate the tile types
function rotateType180(type) {
  if (type == 0) return 1;
  if (type == 1) return 0;
  if (type == 2) return 3;
  if (type == 3) return 2;
}

function rotateTypeClockwise(type) {
  if (type == 0) return 2;
  if (type == 1) return 3;
  if (type == 2) return 1;
  if (type == 3) return 0;
}

function rotateTypeCounterClockwise(type) {
  if (type == 0) return 3;
  if (type == 1) return 2;
  if (type == 2) return 0;
  if (type == 3) return 1;
}

// Helper functions to mirror the tile types
function mirrorTypeHorizontally(type) {
  if (type == 0) return 2;
  if (type == 1) return 3;
  if (type == 2) return 0;
  if (type == 3) return 1;
}

function mirrorTypeVertically(type) {
  if (type == 0) return 3;
  if (type == 1) return 2;
  if (type == 2) return 1;
  if (type == 3) return 0;
}

function mirrorTypeDiagonally(type) {
  if (type == 0) return 0;
  if (type == 1) return 1;
  if (type == 2) return 3;
  if (type == 3) return 2;
}

function reflectTypeAcrossDiagonal(type) {
  if (type == 0) return 1;
  if (type == 1) return 0;
  if (type == 2) return 3;
  if (type == 3) return 2;
}

function mirrorAndFlipHorizontally(type) {
  if (type == 0) return 1;
  if (type == 1) return 0;
  if (type == 2) return 3;
  if (type == 3) return 2;
}

function mirrorAndFlipVertically(type) {
  if (type == 0) return 3;
  if (type == 1) return 2;
  if (type == 2) return 1;
  if (type == 3) return 0;
}

// Play music with tile highlighting
function mousePressed() {
  if (Tone.context.state !== "running") {
    Tone.start();
  }

  let speed = speedSlider.value();
  let timeStep = 0.4 / speed;

  tiles.flat().forEach((tile, index) => {
    setTimeout(() => {
      tile.highlight();
      synth.triggerAttackRelease(
        Tone.Frequency(tile.getNote(), "midi").toNote(),
        "8n"
      );
    }, index * timeStep * 1000);
  });
}
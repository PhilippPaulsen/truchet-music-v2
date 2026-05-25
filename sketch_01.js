let cols, rows;
let size = 50; // Size of each tile
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
  speedSlider = createSlider(2, 8, 4, 1); // Range: 0.5x to 2x speed, default 1x

  // Create symmetry selection dropdown
  createP("Select Symmetry:");
  symmetrySelector = createSelect();
  symmetrySelector.option("D4");
  symmetrySelector.option("C4");
  symmetrySelector.option("D2");
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
  }

  display() {
    let colors = ["#FF6347", "#4682B4", "#32CD32", "#FFD700"]; // Colors for each type
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
  }

  // Generate a musical note based on tile type
  getNote() {
    let midiNotes = [60, 62, 64, 67]; // C4, D4, E4, G4
    return midiNotes[this.type];
  }
}

// Create the symmetric pattern for D4
function createSymmetricPattern(symmetryType, motifRatio) {
  let pattern = [];
  let motifCols = cols / motifRatio;
  let motifRows = rows / motifRatio;

  if (symmetryType === "D4") {
    // Generate the top-left quadrant
    for (let y = 0; y < rows / 2; y++) {
      let row = [];
      for (let x = 0; x < cols / 2; x++) {
        let type;
        if (x < y) {
          type = floor(random(2)); // 0 or 1 for the triangle below the diagonal
        } else if (x == y) {
          type = floor(random(2)); // Ensure diagonal only has types 0 and 1
        } else {
          type = floor(random(4)); // 0, 1, 2, 3 for the rest
        }
        row.push(new Tile(x * size, y * size, type)); // Top-left quadrant
      }
      pattern.push(row);
    }

    // Reflect the right triangle to fill the top-left quadrant
    for (let y = 0; y < rows / 2; y++) {
      for (let x = 0; x < cols / 2; x++) {
        if (x > y) {
          let type = pattern[y][x].type;
          pattern[x][y] = new Tile(
            y * size,
            x * size,
            mirrorTypeDiagonally(type)
          );
        }
      }
    }

    // Create the top-right quadrant by mirroring the top-left quadrant horizontally
    for (let y = 0; y < rows / 2; y++) {
      for (let x = 0; x < cols / 2; x++) {
        let type = pattern[y][x].type;
        pattern[y].push(
          new Tile(
            (cols - x - 1) * size,
            y * size,
            mirrorTypeHorizontally(type)
          )
        );
      }
    }

    // Initialize missing rows for bottom quadrants
    for (let y = rows / 2; y < rows; y++) {
      if (!pattern[y]) pattern[y] = [];
    }

    // Create the bottom-left quadrant by mirroring the top-left quadrant vertically
    for (let y = 0; y < rows / 2; y++) {
      let bottomRow = [];
      for (let x = 0; x < cols / 2; x++) {
        let type = pattern[y][x].type;
        bottomRow.push(
          new Tile(x * size, (rows - y - 1) * size, mirrorTypeVertically(type))
        );
      }
      pattern[rows - y - 1] = bottomRow;
    }

    // Create the bottom-right quadrant by mirroring the top-right quadrant vertically
    for (let y = 0; y < rows / 2; y++) {
      for (let x = 0; x < cols / 2; x++) {
        let type = pattern[y][cols / 2 + x].type;
        pattern[rows / 2 + y].push(
          new Tile(
            (cols - x - 1) * size,
            (rows - y - 1) * size,
            mirrorTypeVertically(type)
          )
        );
      }
    }
  }

  return pattern;
}

// Helper functions to reflect and transform tile types
function mirrorTypeHorizontally(type) {
  if (type === 0) return 2;
  if (type === 1) return 3;
  if (type === 2) return 0;
  if (type === 3) return 1;
}

function mirrorTypeVertically(type) {
  if (type === 0) return 3;
  if (type === 1) return 2;
  if (type === 2) return 1;
  if (type === 3) return 0;
}

function mirrorTypeDiagonally(type) {
  if (type == 0) return 1;
  if (type == 1) return 0;
  if (type == 2) return 2;
  if (type == 3) return 3;
}

// Play a musical sequence based on the tile types
function mousePressed() {
  if (Tone.context.state !== "running") {
    Tone.start();
  }

  let speed = speedSlider.value(); // Get speed from slider
  let timeOffset = 0;
  let timeStep = speed / tiles.flat().length; // Dynamic time offset step
  tiles.flat().forEach((tile) => {
    let note = tile.getNote();
    let duration = "8n"; // Eighth note duration
    synth.triggerAttackRelease(
      Tone.Frequency(note, "midi").toNote(),
      duration,
      `+${timeOffset}`
    );
    timeOffset += timeStep; // Stagger the notes dynamically
  });

  console.log("Playing music based on D4 pattern at speed:", speed);
}
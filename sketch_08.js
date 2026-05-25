let cols, rows;
let size = 100; // Size of each tile
let tiles = []; // Holds the tile objects
let currentSymmetry = "D4"; // Default symmetry type
let motifRatio = 2; // Determines the size of the repeating motif
let speedSlider; // Slider to control playback speed
let symmetrySelector; // Dropdown for symmetry selection
let scaleSelector; // Dropdown for scale selection

// Define scales
const scales = [
  [45, 48, 52, 57], // F Minor
  [40, 43, 47, 50], // E Minor
  [48, 50, 53, 57], // C Major
];

// Define instruments for each quadrant
const instruments = {
  TL: new Tone.Synth().toDestination(), // Top-Left
  TR: new Tone.FMSynth().toDestination(), // Top-Right
  BL: new Tone.AMSynth().toDestination(), // Bottom-Left
  BR: new Tone.PolySynth().toDestination(), // Bottom-Right
};

// Assign a scale to instruments
function assignScaleToInstruments(scaleIndex) {
  const selectedScale = scales[scaleIndex]; // Select scale by index
  const instrumentKeys = Object.keys(instruments);

  // Assign each note in the scale to an instrument
  instrumentKeys.forEach((key, i) => {
    instruments[key].note = selectedScale[i % selectedScale.length]; // Assign MIDI note cyclically
  });

  console.log("Assigned scale to instruments:", selectedScale);
}

// Play the assigned notes with rhythmic variety
function playAssignedNotes() {
  const startTime = Tone.now();
  const timeStep = 0.5; // Base time between notes
  const rhythmicPatterns = {
    TL: [0.5, 1, 0.25, null, 0.75], // Top-Left: Fast and short, with rests
    TR: [1, 0.25, 0.75, null, 1.5], // Top-Right: Medium and syncopated
    BL: [0.25, 0.5, 0.25, null, 1], // Bottom-Left: Faster rhythm
    BR: [1.5, null, 1, 0.5, 0.75], // Bottom-Right: Slower rhythm
  };

  Object.keys(instruments).forEach((key, quadrantIndex) => {
    const instrument = instruments[key];
    const rhythm = rhythmicPatterns[key];

    rhythm.forEach((relativeSpeed, noteIndex) => {
      if (relativeSpeed === null) return; // Skip rest

      const duration = `${Math.max(0.125, relativeSpeed)}n`; // Map speed to duration
      const timing = startTime + quadrantIndex * 1 + noteIndex * timeStep * relativeSpeed;

      setTimeout(() => {
        instrument.triggerAttackRelease(
          Tone.Frequency(instrument.note, "midi").toNote(),
          duration,
          timing
        );
      }, (timing - Tone.now()) * 1000);
    });
  });
}

function setup() {
  createCanvas(400, 400);

  // Create slider for speed control
  createP("Playback Speed:");
  speedSlider = createSlider(1, 80, 1, 1); // Range: 1x to 40x speed, default 10x

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

  // Create scale selection dropdown
  createP("Select Scale:");
  scaleSelector = createSelect();
  scaleSelector.option("F Minor", 0);
  scaleSelector.option("E Minor", 1);
  scaleSelector.option("C Major", 2);
  scaleSelector.changed(() => {
    const scaleIndex = parseInt(scaleSelector.value());
    assignScaleToInstruments(scaleIndex);
  });

  assignScaleToInstruments(2); // Default to C Major

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
}

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

    // Create the bottom-left quadrant by mirroring the top-left quadrant vertically
    for (let y = 0; y < rows / 2; y++) {
      let bottomRow = [];
      for (let x = 0; x < cols / 2; x++) {
        let type = pattern[y][x].type;
        bottomRow.push(
          new Tile(x * size, (rows - y - 1) * size, mirrorTypeVertically(type))
        );
      }
      pattern.push(bottomRow);
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
  } else if (symmetryType === "C4") {
    // Generate the top-left quadrant
    for (let y = 0; y < rows / 2; y++) {
      let row = [];
      for (let x = 0; x < cols / 2; x++) {
        let type = floor(random(4)); // 0, 1, 2, 3
        row.push(new Tile(x * size, y * size, type)); // Top-left quadrant
      }
      pattern.push(row);
    }

    // Ensure pattern array is fully constructed
    for (let y = 0; y < rows / 2; y++) {
      pattern[y].length = cols;
    }
    for (let y = rows / 2; y < rows; y++) {
      let newRow = [];
      for (let x = 0; x < cols; x++) {
        newRow.push(undefined); // Initialize with undefined
      }
      pattern.push(newRow);
    }

    // Create the top-right quadrant by rotating the top-left quadrant 90 degrees clockwise
    for (let y = 0; y < rows / 2; y++) {
      for (let x = 0; x < cols / 2; x++) {
        let type = pattern[y][x].type;
        let newType = rotateTypeClockwise(type);
        pattern[x][cols - y - 1] = new Tile(
          (cols - y - 1) * size,
          x * size,
          newType
        );
      }
    }

    // Create the bottom-right quadrant by rotating the top-right quadrant 90 degrees clockwise
    for (let y = 0; y < rows / 2; y++) {
      for (let x = 0; x < cols / 2; x++) {
        let type = pattern[x][cols - y - 1].type;
        let newType = rotateTypeClockwise(type);
        pattern[rows - y - 1][cols - x - 1] = new Tile(
          (cols - x - 1) * size,
          (rows - y - 1) * size,
          newType
        );
      }
    }

    // Create the bottom-left quadrant by rotating the bottom-right quadrant 90 degrees clockwise
    for (let y = 0; y < rows / 2; y++) {
      for (let x = 0; x < cols / 2; x++) {
        let type = pattern[rows - y - 1][cols - x - 1].type;
        let newType = rotateTypeClockwise(type);
        pattern[rows - x - 1][y] = new Tile(
          y * size,
          (rows - x - 1) * size,
          newType
        );
      }
    }
  }
  return pattern;
}

// Helper function to rotate the tile types
function rotateType180(type) {
  if (type == 0) return 1;
  if (type == 1) return 0;
  if (type == 2) return 3;
  if (type == 3) return 2;
}

function rotateTypeClockwise(type) {
  if (type == 0) return 3;
  if (type == 1) return 2;
  if (type == 2) return 1;
  if (type == 3) return 0;
}

function rotateTypeCounterClockwise(type) {
  if (type == 0) return 3;
  if (type == 1) return 2;
  if (type == 2) return 0;
  if (type == 3) return 1;
}

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

function mousePressed() {
  if (Tone.context.state !== "running") {
    Tone.start();
  }

  const startTime = Tone.now();
  const baseTimeStep = 0.5; // Base time step for note spacing
  const quadrantDelay = 1; // Delay between quadrants

  // Define rhythmic patterns
  const rhythmicPatterns = {
    TL: [0.5, 1, 0.25, null, 0.75], // Fast and short, with rests
    TR: [1, 0.25, 0.75, null, 1.5], // Medium and syncopated
    BL: [0.25, 0.5, 0.25, null, 1], // Faster rhythm
    BR: [1.5, null, 1, 0.5, 0.75], // Slower rhythm
  };

  // Map relative speed to duration (faster notes are shorter)
  const mapDuration = (relativeSpeed) => {
    const baseDuration = 0.5; // Base duration for reference
    return `${Math.max(0.125, baseDuration * relativeSpeed)}n`;
  };

  // Group tiles into quadrants
  const quadrants = {
    TL: tiles.flat().filter((tile) => tile.x < width / 2 && tile.y < height / 2),
    TR: tiles.flat().filter((tile) => tile.x >= width / 2 && tile.y < height / 2),
    BL: tiles.flat().filter((tile) => tile.x < width / 2 && tile.y >= height / 2),
    BR: tiles.flat().filter((tile) => tile.x >= width / 2 && tile.y >= height / 2),
  };

  // Play notes for each quadrant
  Object.keys(instruments).forEach((key, quadrantIndex) => {
    const instrument = instruments[key];
    const rhythm = rhythmicPatterns[key];
    const tilesInQuadrant = quadrants[key];

    tilesInQuadrant.forEach((tile, tileIndex) => {
      const relativeSpeed = rhythm[tileIndex % rhythm.length];
      if (relativeSpeed === null) return; // Skip rest

      const duration = mapDuration(relativeSpeed); // Map speed to note duration
      const timing =
        startTime + quadrantIndex * quadrantDelay + tileIndex * baseTimeStep * relativeSpeed;

      setTimeout(() => {
        // Highlight the tile
        tile.highlight();

        // Trigger the note
        const note = Tone.Frequency(instrument.note, "midi").toNote();
        instrument.triggerAttackRelease(note, duration, timing);

        // Reset the highlight after a short delay
        setTimeout(() => {
          tile.highlighted = false;
        }, 200); // Adjust duration as needed
      }, (timing - Tone.now()) * 1000);
    });
  });

  console.log("Playing dynamically generated rhythm with varying durations.");
}
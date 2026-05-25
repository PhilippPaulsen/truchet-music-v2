let cols, rows;
let size = 100; // Size of each tile
let tiles = [];
let currentSymmetry = "D4"; // Default symmetry type
let motifRatio = 2;
let synth;
let speedSlider;
let symmetrySelector;

function setup() {
  createCanvas(400, 400);

  synth = new Tone.PolySynth().toDestination();

  createP("Playback Speed:");
  speedSlider = createSlider(1, 40, 1, 1);

  createP("Select Symmetry:");
  symmetrySelector = createSelect();
  symmetrySelector.option("D4");
  symmetrySelector.option("C4");
  symmetrySelector.selected(currentSymmetry);
  symmetrySelector.changed(() => {
    currentSymmetry = symmetrySelector.value();
    generatePattern();
  });

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

function generatePattern() {
  tiles = createSymmetricPattern(currentSymmetry, motifRatio);
}

class Tile {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.highlighted = false;
  }

  display() {
    let colors = this.highlighted
      ? ["#FF6347", "#4682B4", "#32CD32", "#FFD700"] // Highlight colors
      : currentSymmetry === "D4"
      ? ["#000000", "#000000", "#000000", "#000000"] // Default black tiles for D4
      : ["#888888", "#444444", "#222222", "#666666"]; // Alternative colors for C4
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
    this.highlighted = false;
  }

  highlight() {
    this.highlighted = true;
  }

  getNote() {
    let midiNotes = [55, 59, 62, 65]; // G3, B3, D4, F4 //G7
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

// Rotation helper functions
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

  let speed = speedSlider.value();
  let timeStep = 0.4 / speed;

  let quadrants = {
    TL: [],
    TR: [],
    BL: [],
    BR: [],
  };

  tiles.flat().forEach((tile) => {
    if (tile.x < width / 2 && tile.y < height / 2) quadrants.TL.push(tile);
    else if (tile.x >= width / 2 && tile.y < height / 2) quadrants.TR.push(tile);
    else if (tile.x < width / 2 && tile.y >= height / 2) quadrants.BL.push(tile);
    else quadrants.BR.push(tile);
  });

  let motifs = {
    TL: generateMotif(quadrants.TL),
    TR: generateMotif(quadrants.TR, true),
    BL: generateMotif(quadrants.BL),
    BR: generateMotif(quadrants.BR, true),
  };

  let timeOffset = 0;
  Object.keys(quadrants).forEach((quadrant) => {
    let tiles = quadrants[quadrant];
    let motif = motifs[quadrant];

    tiles.forEach((tile, i) => {
      let note = motif[i % motif.length];
      let duration = "8n";
      let timing = `+${timeOffset + i * timeStep}`;

      tile.highlight();

      synth.triggerAttackRelease(
        Tone.Frequency(note, "midi").toNote(),
        duration,
        timing
      );
    });

    timeOffset += timeStep * tiles.length;
  });

  console.log("Playing dynamic music based on tile patterns.");
}

function generateMotif(tiles, invert = false) {
  const axis = 60; // C4 as the central note for inversion
  return tiles.map((tile) => {
    let note = tile.getNote();
    return invert ? axis - (note - axis) : note;
  });
}
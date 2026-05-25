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
  speedSlider = createSlider(1, 20, 1, 10); // Range: 1x to 20x speed, default 10x

  // Create symmetry selection dropdown
  createP("Select Symmetry:");
  symmetrySelector = createSelect();
  symmetrySelector.option("D4");
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
    let midiNotes = [57, 60, 64, 69]; // A3, C4, E4, A4 //A Minor
    return midiNotes[this.type];
  }
}

// Create the symmetric pattern for D4
function createSymmetricPattern(symmetryType, motifRatio) {
  let pattern = [];
  for (let y = 0; y < rows / 2; y++) {
    let row = [];
    for (let x = 0; x < cols / 2; x++) {
      let type = floor(random(4)); // Random tile type
      row.push(new Tile(x * size, y * size, type));
    }
    pattern.push(row);
  }

  // Reflect for D4 symmetry
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

function rotateType180(type) {
  if (type == 0) return 1;
  if (type == 1) return 0;
  if (type == 2) return 3;
  if (type == 3) return 2;
}

// Play a synchronized counterpoint musical sequence
function mousePressed() {
  if (Tone.context.state !== "running") {
    Tone.start();
  }

  let speed = speedSlider.value(); // Get speed from slider
  let timeStep = 0.4 / speed; // Time step for staggered entrances

  // Assign tiles to quadrants
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

  // Function to generate a dynamic motif based on tiles
  const generateMotif = (tiles) => {
    return tiles.map((tile) => tile.getNote());
  };

  // Generate unique motifs for each quadrant
  let motifs = {
    TL: generateMotif(quadrants.TL),
    TR: generateMotif(quadrants.TR),
    BL: generateMotif(quadrants.BL),
    BR: generateMotif(quadrants.BR),
  };

  // Play notes for all quadrants dynamically
  let timeOffset = 0;
  Object.keys(quadrants).forEach((quadrant, qIndex) => {
    let tiles = quadrants[quadrant];
    let motif = motifs[quadrant]; // Use the dynamically generated motif

    tiles.forEach((tile, tIndex) => {
      let note = motif[tIndex % motif.length]; // Cycle through motif notes
      let duration = "8n";
      let timing = `+${timeOffset + tIndex * timeStep}`;

      // Highlight the tile
      tile.highlight();

      // Log the note and timing
      console.log(
        `Quadrant: ${quadrant}, Note: ${note}, Timing: ${timing}, Tile: (${tile.x}, ${tile.y})`
      );

      // Play the note
      synth.triggerAttackRelease(
        Tone.Frequency(note, "midi").toNote(),
        duration,
        timing
      );
    });

    // Stagger quadrant entrances slightly
    timeOffset += timeStep * tiles.length;
  });

  console.log("Playing dynamic music based on tile patterns.");
}
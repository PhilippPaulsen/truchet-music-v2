let cols, rows;
let size = 100; // Size of each tile
let tiles = [];
let currentSymmetry = "D4"; // Default symmetry type
let currentTransformation = "None"; // Default transformation
let currentScale = [48, 50, 53, 57]; // Default to C Major
let motifRatio = 2; // Determines the size of the repeating motif
let speedSlider, symmetrySelector, scaleSelector, transformationSelector;
let instrumentSelector;
let playMode = "Harmony"; // Default to Harmony

// Define scales with meaningful names
const scaleNames = [
  "F Minor",
  "E Minor",
  "C Major",
  "G Major",
  "D Major",
  "A Minor",
  "Dorian Mode",
  "Mixolydian Mode",
];

const scales = [
  [45, 47, 48, 50, 52, 53, 55], // F Minor (Diatonic)
  [40, 42, 43, 45, 47, 48, 50], // E Minor
  [48, 60, 72, 84, 96, 108, 120], // C Major
  [43, 45, 47, 48, 50, 52, 54], // G Major
  [38, 40, 42, 43, 45, 47, 49], // D Major
  [45, 47, 48, 50, 52, 53, 55], // A Minor
  [45, 47, 48, 50, 52, 54, 56], // Dorian Mode
  [43, 45, 47, 49, 50, 52, 54], // Mixolydian Mode
];

// Define instruments for each quadrant
const instruments = {
  TL: new Tone.PolySynth().toDestination(),
  TR: new Tone.PolySynth().toDestination(),
  BL: new Tone.PolySynth().toDestination(),
  BR: new Tone.PolySynth().toDestination(),
};

// Update current scale
function assignScaleToInstruments(scaleIndex) {
  currentScale = scales[scaleIndex]; // Update the current scale
  console.log(`Scale selected: ${scaleNames[scaleIndex]}`);
}

function mapPitch(tileType) {
  const noteIndex = tileType % currentScale.length; // Cycle through scale notes
  const octaveOffset = Math.floor(tileType / currentScale.length) * 12; // Add dynamic octave offset
  const note = currentScale[noteIndex] + octaveOffset;

  return Math.max(36, Math.min(note, 96)); // Constrain within MIDI range (C2 to C7)
}

function mapChord(rootNote) {
  const third = rootNote + 4; // Major third
  const fifth = rootNote + 7; // Perfect fifth
  const octave = rootNote + 12; // Octave
  return [rootNote, third, fifth, octave];
}

// Introduce dynamic inversions for smoother transitions
function invertChord(chord, inversionLevel) {
  const inversion = chord.slice(inversionLevel).concat(chord.slice(0, inversionLevel).map((note) => note + 12));
  return inversion;
}

// Example: Use inversions based on tile type
function mapChordWithInversion(tileType) {
  const rootNote = mapPitch(tileType);
  const chord = mapChord(rootNote);
  const inversionLevel = tileType % 3; // Example inversion logic
  return invertChord(chord, inversionLevel);
}

function playMusic() {
  const startTime = Tone.now();
  const baseTimeStep = 0.5; // Base time step for note spacing
  const quadrantDelay = 1; // Delay between quadrants

function playChordWithTiming(instrument, chord, timing) {
  chord.forEach((note, index) => {
    setTimeout(() => {
      instrument.triggerAttackRelease(
        Tone.Frequency(note, "midi").toNote(),
        "0.5"
      );
    }, index * 200); // Evenly spaced
  });
}

  // Group tiles into quadrants
  const quadrants = {
    TL: tiles.flat().filter((tile) => tile.x < width / 2 && tile.y < height / 2),
    TR: tiles.flat().filter((tile) => tile.x >= width / 2 && tile.y < height / 2),
    BL: tiles.flat().filter((tile) => tile.x < width / 2 && tile.y >= height / 2),
    BR: tiles.flat().filter((tile) => tile.x >= width / 2 && tile.y >= height / 2),
  };

  function stopMusic() {
    Object.values(instruments).forEach((instrument) => {
      if (instrument instanceof Tone.PolySynth || instrument instanceof Tone.Sampler) {
        instrument.releaseAll(); // Stop all notes
      } else {
        instrument.dispose(); // Ensure synth is disposed properly
      }
    });
  }

  Object.keys(instruments).forEach((key, quadrantIndex) => {
    const instrument = instruments[key];
    const tilesInQuadrant = quadrants[key];

    tilesInQuadrant.forEach((tile, tileIndex) => {
      const timing =
        startTime + quadrantIndex * quadrantDelay + tileIndex * baseTimeStep;

      setTimeout(() => {
        // Highlight the tile
        tile.highlight();

        if (playMode === "Harmony") {
          instrument.triggerAttackRelease(
            chord.map((note) => Tone.Frequency(note, "midi").toNote()),
            "0.05",
            timing
          );
        } else if (playMode === "Melody") {
          // Generate a wide melodic range dynamically based on tiles
          const melody = baseMelodyPattern.map((note, index) => {
            const octaveOffset = Math.floor(tileIndex / 4) * 12; // Change octave every 4 notes
            return note + octaveOffset;
          });
        
          melody.forEach((note, noteIndex) => {
            const noteStartTime = timing + noteIndex * baseTimeStep; // Sequential timing
            setTimeout(() => {
              instrument.triggerAttackRelease(
                Tone.Frequency(note, "midi").toNote(),
                noteDuration,
                noteStartTime
              );
            }, (noteStartTime - Tone.now()) * 1000);
          });
        }

        // Reset the highlight after a short duration
        setTimeout(() => {
          tile.highlighted = false;
        }, 500);
      }, (timing - Tone.now()) * 1000);
    });
  });

  console.log(`Playing in ${playMode} mode based on tile patterns.`);
}

function setup() {
  createCanvas(400, 400);

  // Instrument selection dropdown
  createP("Select Instrument:");
  instrumentSelector = createSelect();
  instrumentSelector.option("Grand Piano and Organ");
  instrumentSelector.option("Default Synths");
  instrumentSelector.changed(() => {
    switchInstruments(instrumentSelector.value());
  });

  // Create slider for speed control
  createP("Playback Speed:");
  speedSlider = createSlider(1, 80, 1, 1);

  // Create symmetry selection dropdown
  createP("Select Symmetry:");
  symmetrySelector = createSelect();
  symmetrySelector.option("D4");
  symmetrySelector.option("C4");
  symmetrySelector.selected(currentSymmetry);
  symmetrySelector.changed(() => {
    currentSymmetry = symmetrySelector.value();
    generatePattern(); // Regenerate the pattern on change
  });

  // Create transformation selection dropdown
  createP("Select Transformation:");
  transformationSelector = createSelect();
  transformationSelector.option("None");
  transformationSelector.option("Inversion");
  transformationSelector.option("Retrograde");
  transformationSelector.option("Augmentation");
  transformationSelector.option("Canon");
  transformationSelector.option("Counterpoint");
  transformationSelector.selected(currentTransformation);
  transformationSelector.changed(() => {
    currentTransformation = transformationSelector.value();
    applyTransformation(currentTransformation);
  });

  // Create scale selection dropdown
  createP("Select Scale:");
  scaleSelector = createSelect();
  scaleNames.forEach((name, index) => {
    scaleSelector.option(name, index); // Populate dropdown with scale names
  });
  scaleSelector.selected(2); // Default to "C Major"
  scaleSelector.changed(() => {
    const scaleIndex = parseInt(scaleSelector.value());
    assignScaleToInstruments(scaleIndex);
  });

  // Add a dropdown for play mode
  createP("Select Play Mode:");
  let modeSelector = createSelect();
  modeSelector.option("Harmony (Chords)");
  modeSelector.option("Melody (Linear)");
  modeSelector.selected("Harmony (Chords)");
  modeSelector.changed(() => {
    playMode = modeSelector.value().includes("Harmony") ? "Harmony" : "Melody";
    console.log(`Play mode set to: ${playMode}`);
  });

  // Create the "Play" button
  createP("Play Experiment:");
  let playButton = createButton("Play");
  playButton.mousePressed(playMusic);

  assignScaleToInstruments(2); // Default to C Major
  cols = width / size;
  rows = height / size;
  generatePattern(); // Generate the initial pattern
}

function draw() {
  background(225);
  for (let row of tiles) {
    for (let tile of row) {
      tile.display();
    }
  }
}

// Tile Class
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
      : ["#000000", "#000000", "#000000", "#000000"]; // Default colors
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
}

// Generate Symmetric Pattern
function generatePattern() {
  tiles = createSymmetricPattern(currentSymmetry, motifRatio);
  applyTransformation(currentTransformation); // Apply any transformation
}

// Apply Transformation
function applyTransformation(transformation) {
  if (transformation === "None") return;

  tiles = tiles.map((row) =>
    row.map((tile) => {
      let newType = tile.type;

      if (transformation === "Inversion") {
        newType = (3 - tile.type) % 4;
      } else if (transformation === "Retrograde") {
        return new Tile(
          width - tile.x - size,
          tile.y,
          tile.type
        );
      } else if (transformation === "Augmentation") {
        newType = (tile.type + 1) % 4;
      }

      return new Tile(tile.x, tile.y, newType);
    })
  );

  console.log(`Transformation applied: ${transformation}`);
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

function switchInstruments(selection) {
  if (selection === "Grand Piano and Organ") {
    instruments.TL = new Tone.Sampler({ urls: { A4: "A4.mp3", C4: "C4.mp3" } }).toDestination();
    instruments.TR = new Tone.Sampler({ urls: { A4: "A4.mp3", C4: "C4.mp3" } }).toDestination();
  } else if (selection === "Default Synths") {
    instruments.TL = new Tone.Synth({ oscillator: { type: "triangle" }, envelope: { release: 0.5 } }).toDestination();
    instruments.TR = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { release: 0.3 } }).toDestination();
  }
}

function playMusic() {
  if (Tone.context.state !== "running") {
    Tone.context.resume().then(() => {
      console.log("Audio context resumed.");
    }).catch((err) => {
      console.error("Error resuming audio context:", err);
    });
  }

  if (tiles.length === 0) {
    console.error("No tiles to play. Ensure generatePattern() initializes tiles properly.");
    return;
  }

  const startTime = Tone.now();
  const baseTimeStep = 0.4; // Reduced time step between notes
  const quadrantDelay = 1.2; // Delay between quadrants
  const noteDuration = 0.3; // Shortened note duration

  // Define octave ranges for each quadrant
  const octaveRanges = {
    TL: 48, // Lower octave
    TR: 60, // Middle octave
    BL: 72, // Higher octave
    BR: 84, // Highest octave
  };

  const quadrants = {
    TL: tiles.flat().filter((tile) => tile.x < width / 2 && tile.y < height / 2),
    TR: tiles.flat().filter((tile) => tile.x >= width / 2 && tile.y < height / 2),
    BL: tiles.flat().filter((tile) => tile.x < width / 2 && tile.y >= height / 2),
    BR: tiles.flat().filter((tile) => tile.x >= width / 2 && tile.y >= height / 2),
  };

  Object.keys(instruments).forEach((key, quadrantIndex) => {
    const instrument = instruments[key];
    const tilesInQuadrant = quadrants[key];

    tilesInQuadrant.forEach((tile, tileIndex) => {
      const timing = startTime + quadrantIndex * quadrantDelay + tileIndex * baseTimeStep;

      setTimeout(() => {
        tile.highlight();

        if (playMode === "Harmony") {
          const chord = [mapPitch(tile.type), mapPitch(tile.type) + 4, mapPitch(tile.type) + 7];
          instrument.triggerAttackRelease(
            chord.map((note) => Tone.Frequency(note, "midi").toNote()),
            noteDuration,
            timing
          );
        } else if (playMode === "Melody") {
          const baseNote = mapPitch(tile.type);
          const note = baseNote + (octaveRanges[key] - 48); // Add octave offset based on quadrant

          instrument.triggerAttackRelease(
            Tone.Frequency(note, "midi").toNote(),
            noteDuration,
            timing
          );
        }

        setTimeout(() => {
          tile.highlighted = false;
        }, noteDuration * 1000);
      }, (timing - Tone.now()) * 1000);
    });
  });

  console.log(`Playing in ${playMode} mode with ${currentTransformation} transformation.`);
}
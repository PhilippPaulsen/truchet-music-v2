/**
 * Audio Engine Module for Truchet Music Studio
 * 
 * Encapsulates Web Audio API, Tone.js synthesizers, samplers,
 * playback sequencer, and audio recording/export logic.
 * Reads configurations from central State Store.
 */

import store from './state.js';

// Predefined Musical Scales (Identical to previous code)
export const scaleNames = [
  "C Major",
  "C Minor",
  "C Major Pentatonic",
  "C Minor Pentatonic",
  "C Blues Scale",
  "C Harmonic Minor",
  "C Lydian",
  "C Mixolydian",
  "C Dorian",
  "C Phrygian",
];

export const scales = [
  [48, 60, 72, 84, 96, 108, 120], // C Major
  [48, 51, 60, 63, 72, 75, 84],  // C Minor
  [48, 50, 52, 55, 57, 60, 62],  // C Major Pentatonic (default in UI comments)
  [48, 51, 53, 55, 58, 60, 63],  // C Minor Pentatonic
  [48, 51, 54, 55, 58, 60, 63],  // C Blues Scale
  [48, 51, 54, 60, 64, 67, 72],  // C Harmonic Minor
  [48, 52, 56, 60, 64, 67, 71],  // C Lydian
  [48, 52, 55, 60, 64, 67, 69],  // C Mixolydian
  [48, 50, 53, 60, 62, 67, 69],  // C Dorian
  [48, 49, 53, 60, 63, 67, 72],  // C Phrygian
];

class AudioManager {
  constructor() {
    this.grandPianoReady = false;
    this.timeoutIds = [];
    this.activeInstrumentNode = null;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;

    // 1. Setup Audio Recorder Node
    this.recorder = new Tone.Recorder();

    // 2. Setup Grand Piano Sampler (Salamander Piano)
    this.grandPiano = new Tone.Sampler({
      urls: { A4: "A4.mp3", C4: "C4.mp3" },
      baseUrl: "https://tonejs.github.io/audio/salamander/",
      onload: () => {
        this.grandPianoReady = true;
        console.log("🔊 Grand Piano Sampler loaded successfully.");
      }
    }).toDestination();
    this.grandPiano.connect(this.recorder);

    // 3. Setup FM Synth
    this.fmSynth = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 10,
      oscillator: { type: "sine" },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.8 },
      modulation: { type: "triangle" },
      modulationEnvelope: { attack: 0.02, decay: 0.1, sustain: 0.2, release: 0.5 }
    }).toDestination();
    this.fmSynth.connect(this.recorder);

    // 4. Setup Wavetable Synth (DuoSynth style)
    this.wavetableSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 1.2 }
    }).toDestination();
    this.wavetableSynth.connect(this.recorder);

    // Capture everything in Tone master destination
    Tone.Destination.connect(this.recorder);

    // 5. Connect State Store triggers
    store.subscribe('isPlaying', (isPlaying) => {
      if (isPlaying) {
        this.playMusic();
      } else {
        this.stopMusic();
      }
    });

    this.isInitialized = true;
  }

  /**
   * Resumes Tone.js context if suspended
   */
  async resumeContext() {
    if (Tone.context.state !== 'running') {
      await Tone.start();
      await Tone.context.resume();
      console.log("🔊 Tone context resumed successfully.");
    }
  }

  /**
   * Returns current active instrument based on state selection
   */
  getActiveInstrument() {
    const name = store.get('instrument');
    if (name === "Grand Piano") {
      return this.grandPianoReady ? this.grandPiano : this.fmSynth; // Fallback to synth if piano sampler not ready
    } else if (name === "FM Synth") {
      return this.fmSynth;
    } else {
      return this.wavetableSynth;
    }
  }

  /**
   * Play MIDI Pitch mapper
   */
  mapPitch(tileType, scale) {
    const noteIndex = tileType % scale.length;
    const octaveOffset = Math.floor(tileType / scale.length) * 12;
    const note = scale[noteIndex] + octaveOffset;
    return Math.max(36, Math.min(note, 96)); // Constrain between C2 and C7
  }

  /**
   * Map chords based on root note
   */
  mapChord(rootNote) {
    const third = rootNote + 4; // Major third
    const fifth = rootNote + 7; // Perfect fifth
    const octave = rootNote + 12; // Octave
    return [rootNote, third, fifth, octave];
  }

  /**
   * Inverts chords based on inversion level
   */
  invertChord(chord, inversionLevel) {
    return chord
      .slice(inversionLevel)
      .concat(chord.slice(0, inversionLevel).map((note) => note + 12));
  }

  /**
   * Clears all scheduled playback timers
   */
  clearAllTimeouts() {
    this.timeoutIds.forEach((id) => clearTimeout(id));
    this.timeoutIds = [];
  }

  /**
   * Core Sequencer Playback Logic
   */
  async playMusic() {
    await this.resumeContext();
    this.clearAllTimeouts();

    const tiles = store.get('tiles');
    if (!tiles || tiles.length === 0) {
      store.set('isPlaying', false);
      return;
    }

    const rows = tiles.length;
    const cols = tiles[0].length;

    const bpm = store.get('bpm');
    const playbackSpeed = bpm / 120; // Maps relative playback speed to BPM (120 BPM is speed 1.0)
    
    const scaleIndex = store.get('scaleIndex');
    const currentScale = scales[scaleIndex];
    const transformation = store.get('transformation');
    const playMode = store.get('playMode');

    const startTime = Tone.now();
    const baseTimeStep = 1 / playbackSpeed;
    const noteDuration = 0.5 / playbackSpeed;
    const highlightDuration = 200 / playbackSpeed;

    const instrument = this.getActiveInstrument();

    tiles.forEach((row, rowIndex) => {
      row.forEach((tile, colIndex) => {
        const motifStartTime =
          startTime + rowIndex * baseTimeStep + colIndex * (0.2 / playbackSpeed);

        const noteIndex = tile.type % currentScale.length;
        const baseNote = currentScale[noteIndex];

        let pitch = baseNote;
        let chord = this.mapChord(baseNote);

        // Grid Transformations
        switch (transformation) {
          case "Inversion":
            pitch = currentScale[0] + (currentScale[0] - baseNote);
            chord = this.mapChord(pitch);
            break;
          case "Retrograde":
            pitch = currentScale[currentScale.length - 1 - noteIndex];
            chord = this.mapChord(pitch);
            break;
          case "Augmentation":
            pitch += 12; // Octave shift
            chord = this.mapChord(pitch);
            break;
        }

        const inversionLevel = (rowIndex + colIndex) % chord.length;
        chord = this.invertChord(chord, inversionLevel);

        // Schedule triggers
        const h = setTimeout(() => {
          if (playMode === "Harmony (Chords)" || playMode === "Harmony") {
            chord.forEach((note, index) => {
              setTimeout(() => {
                instrument.triggerAttackRelease(
                  Tone.Frequency(note, "midi").toNote(),
                  noteDuration
                );
              }, index * (200 / playbackSpeed));
            });
          } else {
            // Melody (Linear)
            instrument.triggerAttackRelease(
              Tone.Frequency(pitch, "midi").toNote(),
              noteDuration
            );
          }

          // Highlight tile state in the grid
          tile.highlighted = true;
          setTimeout(() => {
            tile.highlighted = false;
          }, highlightDuration);

        }, (motifStartTime - Tone.now()) * 1000);
        
        this.timeoutIds.push(h);
      });
    });

    // Layering (Canon/Counterpoint)
    if (transformation === "Canon" || transformation === "Counterpoint") {
      tiles.forEach((row, rowIndex) => {
        row.forEach((tile, colIndex) => {
          const motifStartTime =
            startTime + rowIndex * baseTimeStep + colIndex * (0.2 / playbackSpeed);
          const canonOffset = 0.5 / playbackSpeed;
          const counterpointOffset = 7; // Fifth above
          
          const noteIndex = tile.type % currentScale.length;
          const baseNote = currentScale[noteIndex];
          const secondaryNote =
            transformation === "Canon"
              ? baseNote
              : baseNote + counterpointOffset;

          const h2 = setTimeout(() => {
            instrument.triggerAttackRelease(
              Tone.Frequency(secondaryNote, "midi").toNote(),
              noteDuration,
              motifStartTime + canonOffset
            );
            tile.highlighted = true;
            setTimeout(() => {
              tile.highlighted = false;
            }, highlightDuration);
          }, (motifStartTime + canonOffset - Tone.now()) * 1000);
          
          this.timeoutIds.push(h2);
        });
      });
    }

    // Auto Reset Play state when track ends
    const totalDuration =
      ((rows - 1) * baseTimeStep) +
      ((cols - 1) * (0.2 / playbackSpeed)) +
      noteDuration + 0.5;

    const resetId = setTimeout(() => {
      store.set('isPlaying', false);
    }, totalDuration * 1000);

    this.timeoutIds.push(resetId);
  }

  /**
   * Stop Playback
   */
  stopMusic() {
    this.clearAllTimeouts();
    Tone.Transport.stop();
    Tone.Transport.cancel();
    console.log("🔊 Music sequencer stopped.");
  }

  /**
   * Capture a fresh audio rendering and return it as a Blob
   */
  async recordCurrentAudio() {
    await this.resumeContext();
    const tiles = store.get('tiles');
    if (!tiles || tiles.length === 0) return null;

    const rows = tiles.length;
    const cols = tiles[0].length;
    const bpm = store.get('bpm');
    const playbackSpeed = bpm / 120;

    const totalDuration =
      ((rows - 1) * (1 / playbackSpeed)) +
      ((cols - 1) * (0.2 / playbackSpeed)) + 1.5;

    await this.recorder.start();
    store.set('isPlaying', true);
    
    await new Promise(r => setTimeout(r, totalDuration * 1000));
    
    store.set('isPlaying', false);
    return await this.recorder.stop();
  }

  /**
   * Export captured audio as .wav
   */
  async exportAudio(btnElement) {
    if (btnElement) btnElement.disabled = true;

    try {
      const wavBlob = await this.recordCurrentAudio();
      if (btnElement) btnElement.disabled = false;

      if (wavBlob && wavBlob.size) {
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        const tag = this.settingsSlug();
        this.downloadBlob(wavBlob, `truchet-${tag}-${ts}.wav`);
        console.log(`✅ Audio exported successfully (${(wavBlob.size / 1024).toFixed(1)} KB)`);
      } else {
        alert("Audio export failed. Empty output data recorded.");
      }
    } catch (e) {
      console.error(e);
      if (btnElement) btnElement.disabled = false;
      alert("Error occurred during recording/export.");
    }
  }

  /**
   * Helper slugs for download naming
   */
  settingsSlug() {
    const scaleName = scaleNames[store.get('scaleIndex')] || "custom";
    return `${store.get('symmetry')}_${store.get('transformation')}_${scaleName.replace(/\s+/g, '')}`
         + `_sz${store.get('tileSize')}_bpm${store.get('bpm')}`;
  }

  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 0);
  }
}

export const audioManager = new AudioManager();
export default audioManager;

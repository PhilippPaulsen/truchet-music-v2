/**
 * Responsive UI Controller Module for Truchet Music Studio
 * 
 * Binds DOM inputs (dropdowns, sliders, interactive pill buttons, dials)
 * to the central reactive State Store. Updates active UI button styling
 * and handles Dark/Light mode theme switching.
 */

import store from './state.js';
import { scaleNames } from './audio.js';

class UIController {
  constructor() {
    this.canvasManager = null;
    this.audioManager = null;
    this.isInitialized = false;
  }

  init(canvasManager, audioManager) {
    if (this.isInitialized) return;

    this.canvasManager = canvasManager;
    this.audioManager = audioManager;

    this.bindDOMEvents();
    this.setupStateSubscriptions();

    this.isInitialized = true;
    console.log("🎨 Responsive UI Controller initialized successfully.");
  }

  bindDOMEvents() {
    // 1. Play Button toggle
    const playBtn = document.getElementById('play-button');
    if (playBtn) {
      playBtn.addEventListener('click', async () => {
        const currentlyPlaying = store.get('isPlaying');
        // Resume AudioContext on user interaction
        await this.audioManager.resumeContext();
        store.set('isPlaying', !currentlyPlaying);
      });
    }

    // 2. Playback Tempo/BPM Slider
    const tempoSlider = document.getElementById('speed');
    const bpmVal = document.getElementById('bpm-val');
    if (tempoSlider) {
      tempoSlider.addEventListener('input', (e) => {
        const bpm = parseInt(e.target.value, 10);
        store.set('bpm', bpm);
        if (bpmVal) bpmVal.innerText = `${bpm} BPM`;
      });
    }

    // 3. Grid size selection (maps to tileSize in store)
    const sizeSelect = document.getElementById('size');
    if (sizeSelect) {
      sizeSelect.addEventListener('change', (e) => {
        const tileSize = parseInt(e.target.value, 10);
        store.set('tileSize', tileSize);
      });
    }

    // 4. Symmetry Group Selection
    const symmetrySelect = document.getElementById('symmetry');
    if (symmetrySelect) {
      symmetrySelect.addEventListener('change', (e) => {
        store.set('symmetry', e.target.value);
      });
    }

    // 5. Grid Transformation Selection
    const transformSelect = document.getElementById('transformation');
    if (transformSelect) {
      transformSelect.addEventListener('change', (e) => {
        store.set('transformation', e.target.value);
      });
    }

    // 6. Play Mode Selection (Melody vs Harmony)
    const modeSelect = document.getElementById('mode');
    if (modeSelect) {
      modeSelect.addEventListener('change', (e) => {
        store.set('playMode', e.target.value);
      });
    }

    // 7. Regenerate grid pattern
    const btnRegenerate = document.getElementById('btnRegenerate');
    if (btnRegenerate) {
      btnRegenerate.addEventListener('click', () => {
        if (store.get('isPlaying')) {
          store.set('isPlaying', false); // Stop playback before regenerating to avoid audio context glitches
        }
        this.canvasManager.regenerateGrid(this.canvasManager.p5Instance);
        console.log("♻️ Grid pattern manually regenerated.");
      });
    }

    // 8. Export pattern as PNG
    const btnExportPattern = document.getElementById('btnExportPattern');
    if (btnExportPattern) {
      btnExportPattern.addEventListener('click', () => {
        this.canvasManager.exportPNG();
      });
    }

    // 9. Export audio as WAV
    const btnExportAudio = document.getElementById('btnExportAudio');
    if (btnExportAudio) {
      btnExportAudio.addEventListener('click', (e) => {
        this.audioManager.exportAudio(e.currentTarget);
      });
    }

    // 10. Setup Instrument Pill Selections (Modern pills in Sidebar)
    const instrumentPills = document.querySelectorAll('[data-instrument]');
    instrumentPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        const selectedInstrument = e.currentTarget.getAttribute('data-instrument');
        store.set('instrument', selectedInstrument);

        // Highlight selected pill
        instrumentPills.forEach(p => {
          p.classList.remove('bg-primary', 'text-on-primary');
          p.classList.add('bg-surface-container-highest', 'text-on-surface-variant');
        });
        e.currentTarget.classList.add('bg-primary', 'text-on-primary');
        e.currentTarget.classList.remove('bg-surface-container-highest', 'text-on-surface-variant');
      });
    });

    // 11. Setup Musical Scale buttons in Sidebar (scrollable list)
    const scaleButtons = document.querySelectorAll('[data-scale-index]');
    scaleButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-scale-index'), 10);
        store.set('scaleIndex', idx);

        // Styling active outline / primary Container highlight
        scaleButtons.forEach(b => {
          b.classList.remove('bg-primary-container', 'text-on-primary-container');
          b.classList.add('text-on-surface-variant', 'hover:bg-secondary-container/50');
        });
        e.currentTarget.classList.add('bg-primary-container', 'text-on-primary-container');
        e.currentTarget.classList.remove('text-on-surface-variant', 'hover:bg-secondary-container/50');
      });
    });

    // 12. Responsive Dark/Light Mode Theme Switcher
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        const themeIcon = themeToggleBtn.querySelector('.material-symbols-outlined');
        if (themeIcon) {
          themeIcon.innerText = isDark ? 'light_mode' : 'dark_mode';
        }
      });
    }
  }

  setupStateSubscriptions() {
    const playBtn = document.getElementById('play-button');
    const activeTilesVal = document.getElementById('active-tiles-val');

    // Subscribe to play state changes to toggle play icon
    store.subscribe('isPlaying', (isPlaying) => {
      if (!playBtn) return;
      const icon = playBtn.querySelector('.material-symbols-outlined');
      if (icon) {
        icon.innerText = isPlaying ? 'stop' : 'play_arrow';
        if (isPlaying) {
          playBtn.classList.remove('bg-primary', 'text-on-primary');
          playBtn.classList.add('bg-error-container', 'text-on-error-container');
        } else {
          playBtn.classList.remove('bg-error-container', 'text-on-error-container');
          playBtn.classList.add('bg-primary', 'text-on-primary');
        }
      }
    });

    // Update active tiles dynamically in HUD overlay when size/grid changes
    store.subscribe('activeTilesCount', (count) => {
      if (activeTilesVal) {
        activeTilesVal.innerText = count.toLocaleString();
      }
    });
  }
}

export const uiController = new UIController();
export default uiController;

/**
 * Main Entry Script for Truchet Music Studio
 * 
 * Instantiates the CanvasManager (p5 in instance mode),
 * registers standard Tone.js synthesizer samplers, binds
 * all interactive controls with the reactive state observers,
 * and handles client preferences for Dark/Light mode theme switching.
 */

import store from './state.js';
import audioManager from './audio.js';
import CanvasManager from './canvas.js';
import uiController from './ui.js';

const initApp = () => {
  // 1. Initialize CanvasManager (attaches p5 instance mode to #canvas-container)
  const canvasManager = new CanvasManager('canvas-container');

  // 2. Initialize Audio Engine (Tone.js nodes & synth collections)
  audioManager.init();

  // 3. Initialize UI Controller (binds sidebar, sliders, buttons to state)
  uiController.init(canvasManager, audioManager);

  // 4. Synchronize theme with saved client preference or OS setting
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

  document.documentElement.classList.toggle('dark', shouldBeDark);

  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    const themeIcon = themeToggleBtn.querySelector('.material-symbols-outlined');
    if (themeIcon) {
      themeIcon.innerText = shouldBeDark ? 'light_mode' : 'dark_mode';
    }
  }

  console.log("⚡ Truchet Music Studio v3.0 successfully bootstrapped.");
};

// ES Modules run deferred and might load AFTER DOMContentLoaded has already fired.
// We check document.readyState to bootstrap robustly.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

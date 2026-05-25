# Truchet_Engine | Project Skills & Specifications (Final)

## Overview
Truchet_Engine is a minimalist generative music and pattern studio. It uses mathematical Truchet tiles to create complex visual symmetries that correspond to musical sequences.

## Design Principles
- **Minimalism:** Radically reduced interface, high contrast, no visual noise.
- **Precision:** Blueprint-inspired aesthetics, strict grid adherence.
- **Duality:** Identical layouts for Dark and Light modes (inverted).
- **Typography:** 
  - *UI/Interaction:* Hanken Grotesk (Mixed Case)
  - *Data/Logic:* Monospace (ALL CAPS)

## Core Features
### 1. Interactive Pattern Canvas
- **16x16 Grid:** High-contrast Truchet tiles.
- **Manual Composition:** Tiles rotate 90° on click/touch.
- **Symmetry Engine:** D4 symmetry logic (quadrant mirroring/rotation) applied in real-time to manual edits.
- **Audio-Visual Sync:** Tiles pulse in primary colors (Red, Blue, Yellow, Green) synchronized with the session BPM. Each orientation is mapped to a specific color/frequency.

### 2. Studio Controls
- **Size:** Grid dimensions (e.g., 16x16).
- **Symmetry:** Algorithmic rules (D4_SQUARE, D4_DIAGONAL, etc.).
- **Instrument:** Audio source selection (e.g., FM_DRONE_01).
- **Scale:** Musical mode (e.g., PHRYGIAN).
- **Transform:** Pattern modification (e.g., RECURSIVE, INVERT).
- **Mode:** Generation logic (e.g., FRACTIONAL).
- **Tempo:** Playback speed in BPM (linked to visual pulse frequency).

### 3. Responsive Behavior
- **Desktop:** Fixed header with dropdowns, centralized canvas, status bars at the bottom.
- **Mobile:** Vertical stack, simplified controls, persistent navigation bar at the bottom.

## Motion & Interactions
- **Transitions:** Smooth CSS transforms for tile rotations.
- **Feedback:** `active:scale-95` for tactile control response.
- **Visual Rhythm:** BPM-coupled opacity pulses for musical feedback.

## Technical Specs
- **Grid:** CSS Grid / Flexbox.
- **Icons:** Material Symbols (Minimal).
- **Colors:** 
  - **Dark:** BG #131313, Text #FFFFFF, UI Accents #393939.
  - **Light:** BG #F9F9F9, Text #000000, UI Accents #E0E0E0.
  - **Logic:** Primary colors (RGBY) for audio triggers.

# **Truchet_Music**
An interactive web-based tool for exploring symmetry, music, and visual art. This project combines p5.js and Tone.js to create dynamic visual patterns and generative music, offering a creative playground for enthusiasts and educators.

## **Features**
- Create symmetric patterns using multiple symmetry types (e.g., D4, C4, p4g).
- Generate music synchronized with visual patterns.
- Support for multiple scales, instruments, and transformations.
- Interactive GUI with controls for playback speed, mode, and more.
- Works on desktop and mobile devices (except for some known Safari speaker issues).

## **Demo**
https://philipppaulsen.github.io/Truchet_Music/

## **Table of Contents**
1. [Installation](#installation)
2. [Usage](#usage)
3. [Technologies Used](#technologies-used)
4. [Configuration](#configuration)
5. [Known Issues](#known-issues)
6. [Contributing](#contributing)
7. [License](#license)
8. [Acknowledgments](#acknowledgments)
9. [Next Steps](#next-steps)

## **Installation**
1. Clone the repository:
   ```bash
   git clone https://github.com/PhilippPaulsen/Truchet_Music
   cd Truchet_Music
2. Open this project.
	•	No build process is needed! Just open index.html in your browser.
3.	Optional: Use a local server for better performance.

## **Usage**
1. Open the app in your browser.
2. Use the GUI to:
   - Select symmetry types (e.g., D4, C4).
   - Choose scales and instruments for music generation.
   - Adjust playback speed and mode.
3. Click **Play** to start the music and visuals.

## **Technologies Used**
- [p5.js](https://p5js.org/) - Creative coding library for visual patterns.
- [Tone.js](https://tonejs.github.io/) - Library for generative music.
- HTML5, CSS3, JavaScript - Standard web technologies.

## **Configuration**
- Modify `sketch.js` to customize behavior:
  - Add new symmetry types or scales.
  - Change instrument configurations.
  - Adjust pattern generation logic.


## **Known Issues**
- **Mobile Safari:** The app may not play sound through speakers unless headphones are connected.
- **Delay in Play-Pause:** Minor delays can occur if multiple events stack up during pause/resume.

## **Contributing**
We welcome contributions! To get started:
1. Fork this repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m "Add a new feature"`).
4. Push to your branch (`git push origin feature-branch`).
5. Open a pull request.

For major changes, please open an issue to discuss your proposal first.

## **License**
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## **Acknowledgments**
- Inspired by the creative coding community.
- Thanks to [p5.js](https://p5js.org/) and [Tone.js](https://tonejs.github.io/) for their excellent libraries.

## **Next Steps**
The following features are planned for future development:

1. **Color-to-Tune Mapping**
   - Assign specific colors to musical notes or chords to enhance the interplay between visuals and music.
   
2. **Random Pattern Generation**
   - Enable the app to randomly generate new patterns while keeping the current configurations of scale, symmetry, and instruments intact.

3. **Auto-Play Mode**
   - Introduce an Auto-Play mode that continuously generates new patterns and music seamlessly, creating an endless generative experience.

4. **Pause, Stop, and Regenerate Controls**
   - Add controls for pausing, stopping, and regenerating patterns and music to give users greater control over playback.

5. **Improved User Interface**
   - Optimize the GUI for better usability and aesthetic appeal, including more intuitive controls and feedback mechanisms.

6. **Advanced Symmetry Options**
   - Expand the symmetry library with additional complex types and introduce interactive tools to customize symmetry rules.

7. **Pattern Saving and Export**
   - Allow users to save or export their favorite patterns and musical compositions for later use or sharing.

8. **Accessibility Improvements**
   - Ensure compatibility with all major browsers and devices, including resolving known issues with Mobile Safari.

9. **Educational Mode**
   - Introduce a mode for learning about symmetry, scales, and generative music through interactive tutorials.

10. **Community Contributions**
    - Open up the project for community-contributed features and patterns, enabling a collaborative creative space.


# 🎙️ J.A.R.V.I.S. (Just A Rather Very Intelligent System)
> **A high-performance, multimodal AI Desktop Assistant powered by Gemini 2.5 Flash.**

![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Gemini API](https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)

---

## 🌟 Overview
**J.A.R.V.I.S.** is a next-generation personal AI assistant designed to bridge the gap between cloud intelligence and local desktop control. Unlike legacy assistants that rely on heavy local transcription models, J.A.R.V.I.S. leverages **Multimodal Native Audio Processing**. 

By streaming raw audio directly to the Gemini 2.5 Flash brain, the system achieves near-zero latency, understands complex context, and maintains a highly conversational, energetic personality.

---

## 🔥 Key Features
*   🚀 **Low-Latency Audio Pipeline:** Direct-to-cloud audio streaming bypassing local bottlenecks.
*   🖥️ **System Level Integration:** Execute Windows shell commands to launch apps and manage files via voice.
*   🌈 **Holographic UI:** A transparent, always-on-top React interface with hardware-accelerated animations.
*   🌊 **Reactive Visualizer:** Custom SVG "Spiky Mesh" animation that responds in real-time to voice frequencies.
*   🧠 **Contextual Memory:** Maintains short-term conversational history for intelligent follow-up questions.
*   ⌨️ **Global Hotkey Control:** Instant access via `Ctrl + Space` with hold-to-talk functionality.

---

## 🛠️ Technical Architecture

### 1. The Brain (`src/main/index.js`)
Handles the Electron lifecycle, registers global shortcuts, and manages secure communication with the Gemini API. It translates AI intent into executable shell commands.

### 2. The Bridge (`src/preload/index.js`)
A secure IPC (Inter-Process Communication) layer that allows the React frontend to transmit raw audio data to the Node.js backend safely.

### 3. The UI (`src/renderer/src/App.jsx`)
Built with React and Tailwind CSS, handling high-fidelity audio capture via the MediaRecorder API and rendering the real-time visualizer.

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** or **yarn**
* A **Gemini API Key** (Get one for free at [Google AI Studio](https://aistudio.google.com/))

### Installation
1.  **Clone the Repo:**
    ```bash
    git clone [https://github.com/Ashis-Chetia/JARVIS.git](https://github.com/Ashis-Chetia/JARVIS.git)
    cd JARVIS
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env` file in the root directory and add your key:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

4.  **Launch Development Mode:**
    ```bash
    npm run dev
    ```

---

## ⌨️ Commands & Controls

| Action | Keybind |
| :--- | :--- |
| **Summon / Hide** | `Ctrl + Space` |
| **Start Talking** | `Hold Space` |
| **Stop Talking** | `Release Space` |
| **Open Console** | `Ctrl + Shift + I` |

---

## 🛡️ Security Note
**Never** commit your `.env` file or hardcode your API key when sharing this project publicly. This project includes a `.gitignore` file to prevent accidental leaks of your Google Cloud credentials to public repositories.

---

## 🤝 Acknowledgments
* **Google DeepMind** for the Gemini 2.5 Flash model.
* **The Electron-Vite community** for the streamlined build pipeline.
* *Inspired by the MCU J.A.R.V.I.S. interface.*

---

**Developed with ❤️ by [Ashis Chetia](https://github.com/Ashis-Chetia)**
<div align="center">

# JESUN<span style="color: #10b981">.</span>
**Data Analytics & Vibe Coding Studio**

[![Live Demo](https://img.shields.io/badge/Live-Demo-10b981?style=for-the-badge)](http://jesunahmadushno.com/) 
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[Live Demo](#-live-demo) • [Features](#-features) • [Tech Stack](#-tech-stack) • [Setup](#-running-locally)

A premium, AI-driven interactive portfolio for the modern data era. Merging advanced analytics with **"Vibe Coding"** to transform static resumes into immersive digital experiences.

---
</div>

## 💎 Overview
This portfolio is a serverless **Single Page Application (SPA)** designed to showcase the intersection of Data Engineering and Creative Development. Beyond a traditional landing page, it serves as a live demonstration of Generative AI integration, featuring a grounded AI twin and real-time architectural tools.

Built with a focus on speed and aesthetic, the application leverages the **Gemini API** to provide an interactive narrative of my professional journey at KPMG and academic research in Canada.

## 🚀 Features
* **🧠 Jesun.AI Twin:** A context-grounded RAG-lite chatbot trained on my professional history to provide instant, accurate answers to recruiters.
* **✨ Vibe Generator:** An AI-powered design architect that suggests tech stacks and aesthetic directions based on user project ideas.
* **⚡ Smart Carousel:** A custom text engine that dynamically adjusts display timing based on content length for optimal readability.
* **🎨 Spotlight UI:** High-performance cursor tracking for dynamic lighting effects on project cards.
* **📱 Responsive Flux:** A mobile-first design system built on Tailwind CSS for seamless viewing across all devices.

## 📦 Core Competencies
My work focuses on translating raw data into business intelligence through these core pillars:

| Domain | Expertise | Tooling |
| :--- | :--- | :--- |
| **Analytics** | Predictive Modeling & BI | Python, Power BI, SQL |
| **Automation** | Process Optimization | Power Automate, Scripts |
| **AI/ML** | GenAI & Neural Networks | TensorFlow, RAG, LLMs |
| **Web** | Vibe Coding & Frontend | React, Tailwind, JS |

## 🛠 How It Works
The architecture is designed to be lightweight and infinitely scalable without requiring a traditional backend server.

* **Core:** HTML5, CSS3, Vanilla JavaScript (ES6+).
* **Styling:** Tailwind CSS (via CDN), Custom CSS Variables, Glassmorphism.
* **AI Engine:** Google Gemini API (2.5 Flash Preview).
* **Deployment:** GitHub Pages with Custom Domain mapping.

---

## 💻 Running Locally
If you wish to run this offline or audit the code:

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/JesunAhmadUshno/portfolio.git](https://github.com/JesunAhmadUshno/portfolio.git)
    cd portfolio
    ```

2.  **Configuration**
    Open `script.js` and insert your Gemini API Key:
    ```javascript
    const apiKey = "YOUR_GEMINI_API_KEY";
    ```

3.  **Launch**
    Simply open the `index.html` file in any modern web browser.

## 🎨 Customization
The design system is centered around a sophisticated dark-mode palette. Modify the variables in the `:root` style to change the brand identity:

```css
:root {
    --bg-dark: #0a0a0a;       /* Deep Black */
    --accent: #10b981;        /* Emerald Green */
    --surface: #171717;       /* Card Background */
}
<br />

<div align="center">

🌐 Launch Portfolio
<small>Designed & Vibe Coded by Jesun Ahmad Ushno © 2026</small>

</div>

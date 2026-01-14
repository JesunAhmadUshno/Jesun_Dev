<div align="center">

✨ Jesun's Vibe Coding Portfolio

<br />

A Next-Gen Personal Portfolio blending Data Analytics, Engineering Precision, and "Vibe Coding".

<p align="center">
<a href="#-about-the-project">About</a> •
<a href="#-key-features">Features</a> •
<a href="#-tech-stack">Tech Stack</a> •
<a href="#-getting-started">Getting Started</a> •
<a href="#-deployment-guide">Deployment</a> •
<a href="#-license">License</a>
</p>
</div>

📖 About The Project

This is not just a static resume; it's an interactive digital experience. Built to showcase the intersection of Data Analytics and Creative Development, this portfolio features a "Vibe Coding" aesthetic—dark mode, neon accents, and fluid animations—powered by modern web technologies and Generative AI.

The core philosophy of this project is to demonstrate "Vibe Coding": the art of crafting digital experiences that feel as good as they look, backed by rigorous engineering and data science principles.

🌟 Key Features

🧠 Jesun.AI Twin (RAG-Lite)

A floating chat interface powered by Google Gemini 2.5 Flash.

Context-Aware: Pre-trained on my specific resume data (KPMG experience, research papers, certifications).

Persona: Responds with a "Vibe Coder" personality—professional yet creative.

Tech: Uses system prompting to ground answers in reality, preventing hallucinations about my background.

✨ The Vibe Generator

An interactive AI tool for visitors.

Input: Users type a vague project idea (e.g., "A dashboard for a cat cafe").

Output: The AI acts as a creative architect, returning a unique "Vibe" (aesthetic direction) and a recommended "Tech Stack" in real-time JSON format.

⚡ Smart Hero Carousel

A dynamic text engine that respects the user's reading speed.

Logic: Calculates display duration dynamically based on word count (~200wpm) + cognitive buffer time.

Effect: Ensures users have enough time to read complex descriptions about "Data Engineering" or "AI & ML" before the text rotates.

🎨 Spotlight UI

Interaction: Custom JavaScript tracks mouse movements over project cards.

Visuals: Creates a dynamic "flashlight" gradient effect that follows the cursor, highlighting borders and backgrounds without heavy WebGL overhead.

🛠️ Tech Stack

This project relies on a modern, lightweight stack designed for performance and zero-config deployment.

Category

Technology

Description

Core

HTML5, CSS3

Semantic markup and CSS variables.

Logic

Vanilla JavaScript (ES6+)

No frameworks (React/Vue). Pure DOM manipulation for maximum speed.

Styling

Tailwind CSS

Utility-first CSS framework (loaded via CDN for simplicity).

Icons

Lucide Icons

Consistent, lightweight SVG icons.

AI Model

Google Gemini API

gemini-2.5-flash-preview for low-latency text generation.

Hosting

GitHub Pages

Static hosting with custom domain support.

🚀 Getting Started

Follow these steps to run the portfolio locally or deploy it to your own repository.

Prerequisites

A GitHub Account.

A Google Cloud / AI Studio Account (for the API Key).

A Code Editor (VS Code recommended).

1. Clone the Repository

git clone [https://github.com/JesunAhmadUshno/portfolio.git](https://github.com/JesunAhmadUshno/portfolio.git)
cd portfolio


2. Configure the AI (Critical Step)

This portfolio requires a Google Gemini API key to function.

Get a free API key from Google AI Studio.

Open the script.js file in your code editor.

Locate the configuration section at the very top:

// --- CONFIGURATION ---
// PASTE YOUR API KEY HERE
const apiKey = "YOUR_ACTUAL_API_KEY_HERE"; 


Paste your key inside the quotes.

Security Note: Since this is a client-side application, your API key is visible in the source code. Go to the Google Cloud Console and restrict your API key's "Website restrictions" to jesunahmadushno.com and jesunahmadushno.github.io to prevent unauthorized usage.

3. Run Locally

You can simply open index.html in your browser. However, for the best experience (and to avoid CORS issues with some browser security settings), use a simple local server:

Using Python:

python -m http.server 8000
# Open http://localhost:8000 in your browser


Using VS Code:

Install the "Live Server" extension.

Right-click index.html.

Select "Open with Live Server".

🌍 Deployment Guide

Deploying to GitHub Pages

Push Code: Upload index.html, style.css, script.js, and this README.md to your GitHub repository.

Settings: Go to Repository Settings > Pages.

Source: Select Deploy from a branch.

Branch: Select main (or master) and / (root).

Save: Click Save.

Connecting Custom Domain (https://www.google.com/search?q=jesunahmadushno.com)

In the same Pages settings menu, scroll down to Custom domain.

Enter jesunahmadushno.com.

Click Save.

Check the box "Enforce HTTPS" (this creates a secure SSL certificate for you).

DNS Config: Ensure your domain registrar (Namecheap, GoDaddy, etc.) has these records:

A Records (@):

185.199.108.153

185.199.109.153

185.199.110.153

185.199.111.153

CNAME Record (www):

Target: jesunahmadushno.github.io

📂 Project Structure

portfolio/
├── index.html       # Main HTML structure and layout
├── style.css        # Custom animations, gradients, and scrollbar styles
├── script.js        # Logic for AI, Carousel, and Spotlight effects
└── README.md        # Documentation


📄 License

Distributed under the MIT License. This means you are free to use, modify, and distribute this code, provided you include the original copyright notice.

<details>
<summary><strong>View Full License</strong></summary>

MIT License

Copyright (c) 2026 Jesun Ahmad Ushno

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


</details>

📬 Contact

Jesun Ahmad Ushno Master's Candidate in Data Analytics | Vibe Coder

📧 Email: jesunushno@gmail.com

💼 LinkedIn: linkedin.com/in/jesunahmadushno

🐙 GitHub: github.com/JesunAhmadUshno

<div align="center">
<small>Designed & Vibe Coded by Jesun Ahmad Ushno © 2026</small>
</div>

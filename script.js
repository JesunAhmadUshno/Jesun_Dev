// --- CONFIGURATION ---
// PASTE YOUR API KEY HERE
const apiKey = "AIzaSyBJuiZntBK6O8Qyjo-KpvByJSDuO5m-EFc"; 

// --- HERO CAROUSEL DATA ---
const HERO_CONTENT = [
    {
      text: "Vibe Coding",
      description: "I blend engineering precision with creative flair. It's not just about writing code; it's about crafting mind-blowing digital experiences that feel as good as they look.",
      gradient: "from-emerald-400 to-cyan-500"
    },
    {
      text: "Data Analytics",
      description: "I translate complex datasets into actionable stories. From analyzing banking data at KPMG to predicting trends, I turn raw numbers into business growth.",
      gradient: "from-blue-400 to-indigo-500"
    },
    {
      text: "Python Scripts",
      description: "Scripting is my superpower. From complex data analysis using Pandas to automating boring tasks, I write clean, efficient Python that gets the job done.",
      gradient: "from-yellow-300 to-blue-500"
    },
    {
      text: "Data Engineering",
      description: "Building the pipelines that power insights. I design robust ETL processes and manage databases to ensure data is clean, accessible, and ready for action.",
      gradient: "from-orange-500 to-red-600"
    },
    {
      text: "AI & ML",
      description: "Pushing the boundaries of intelligence. My published research in Neural Networks and Wavelet Transforms proves I don't just use models; I understand them.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      text: "Process Automation",
      description: "Efficiency is my currency. I've saved clients over 200+ hours annually by automating repetitive workflows with Power Automate and custom scripts.",
      gradient: "from-teal-400 to-emerald-600"
    },
    {
      text: "GenAI",
      description: "Prompting the future. I leverage Large Language Models to create intelligent agents and solve complex challenges, just like I did in the KPMG AI Challenge.",
      gradient: "from-fuchsia-400 to-rose-500"
    },
    {
      text: "React",
      description: "Crafting modern interfaces. I build interactive, responsive, and dynamic web applications (like this one!) that engage users instantly.",
      gradient: "from-cyan-400 to-blue-600"
    },
    {
      text: "SQL",
      description: "The language of truth. I query, optimize, and manage massive datasets (PostgreSQL, Oracle) to uncover the hidden patterns that drive strategic decisions.",
      gradient: "from-blue-500 to-indigo-600"
    }
];

const RESUME_CONTEXT = `
  Name: Jesun Ahmad Ushno
  Role: Master's Candidate in Data Analytics, Former KPMG Consultant
  Location: Toronto, Ontario (Open to work)
  Tagline: "I do Vibe Coding."
  
  Education: 
  - Master's in Data Analytics, University of Niagara Falls Canada (Jan 2025 - Present)
  - BS in Computer Engineering, AIUB (Jan 2018 - Mar 2023)
  
  Experience:
  - IT Advisory Consultant at KPMG (Apr 2023 - Nov 2024): Built 20+ Power BI dashboards, automated workflows with Power Automate (saving 200+ hours), conducted ISO 27001 IT audits.
  - Student Engagement Facilitator at ESAB AIUB.
  
  Key Skills: 
  - Python (TensorFlow, Scikit-learn), SQL, Power BI, Tableau, React, Azure, Oracle Cloud.
  - Research: Published papers on "Automatic Fabric Defect Detection" (using Wavelet Transform) and "Global Optimization" (PSO algorithms).
  
  Personality: Innovative, tech-savvy, "Vibe Coder", combines engineering precision with creative flair.
`;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons(); // Initialize Icons
    initCarousel();
    initSpotlight();
    initChat();
    initVibeGenerator();
    renderTechStack();
    
    // Navbar Scroll Effect
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        if (window.scrollY > 50) {
            nav.classList.add('bg-neutral-950/80', 'backdrop-blur-md', 'border-b', 'border-neutral-800', 'py-4');
            nav.classList.remove('py-6');
        } else {
            nav.classList.remove('bg-neutral-950/80', 'backdrop-blur-md', 'border-b', 'border-neutral-800', 'py-4');
            nav.classList.add('py-6');
        }
    });
});

// --- GEMINI API CALLER ---
async function callGemini(prompt, systemInstruction) {
    if (!apiKey) return "API Key not set. Please add your key in script.js";
    
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                }),
            }
        );

        if (!response.ok) throw new Error("API call failed");
        
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, the vibe is off (API Error).";
    } catch (error) {
        console.error(error);
        return "I'm having trouble connecting to the neural net right now. Try again later!";
    }
}

// --- CAROUSEL LOGIC ---
function initCarousel() {
    let currentIndex = 0;
    const heroText = document.getElementById('hero-text');
    const heroDesc = document.getElementById('hero-desc');

    function updateCarousel() {
        const item = HERO_CONTENT[currentIndex];
        
        // Fade out
        heroText.style.opacity = '0';
        heroText.style.transform = 'translateY(10px)';
        heroDesc.style.opacity = '0';
        heroDesc.style.transform = 'translateY(10px)';

        setTimeout(() => {
            // Update Text
            heroText.innerText = item.text + ".";
            heroText.className = `text-transparent bg-clip-text inline-block transition-all duration-500 bg-gradient-to-r ${item.gradient}`;
            heroDesc.innerHTML = `<span class="text-white font-semibold">Hi, I'm Jesun.</span> ${item.description}`;
            
            // Fade in
            heroText.style.opacity = '1';
            heroText.style.transform = 'translateY(0)';
            heroDesc.style.opacity = '1';
            heroDesc.style.transform = 'translateY(0)';

            // Smart Timing Calculation
            // Base 2000ms + 300ms per word for reading time
            const wordCount = item.description.split(/\s+/).length;
            const duration = 2000 + (wordCount * 300);

            currentIndex = (currentIndex + 1) % HERO_CONTENT.length;
            setTimeout(updateCarousel, duration);

        }, 500);
    }

    // Initial Start
    updateCarousel();
}

// --- SPOTLIGHT EFFECT ---
function initSpotlight() {
    const cards = document.querySelectorAll('.spotlight-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

// --- CHAT WIDGET ---
function initChat() {
    const toggleBtn = document.getElementById('toggle-chat');
    const closeBtn = document.getElementById('close-chat');
    const chatBox = document.getElementById('chat-box');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat');
    const messages = document.getElementById('chat-messages');

    function toggle() {
        chatBox.classList.toggle('hidden');
        if (!chatBox.classList.contains('hidden')) input.focus();
    }

    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        // User Message
        addMessage(text, 'user');
        input.value = '';
        
        // Loading
        const loadingDiv = addMessage("Thinking...", 'model', true);

        // API Call
        const systemPrompt = `You are an AI avatar for Jesun Ahmad Ushno. Context: ${RESUME_CONTEXT}. Keep answers cool, professional, under 50 words.`;
        const response = await callGemini(text, systemPrompt);

        // Remove loading and add response
        loadingDiv.remove();
        addMessage(response, 'model');
    }

    function addMessage(text, sender, isLoading = false) {
        const div = document.createElement('div');
        div.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;
        div.innerHTML = `
            <div class="max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                sender === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-none' 
                : 'bg-neutral-800 text-neutral-200 rounded-tl-none'
            } ${isLoading ? 'animate-pulse' : ''}">
                ${text}
            </div>
        `;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
        return div;
    }

    toggleBtn.addEventListener('click', toggle);
    closeBtn.addEventListener('click', toggle);
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

// --- VIBE GENERATOR ---
function initVibeGenerator() {
    const input = document.getElementById('vibe-input');
    const btn = document.getElementById('vibe-btn');
    const resultDiv = document.getElementById('vibe-result');

    btn.addEventListener('click', async () => {
        const idea = input.value.trim();
        if (!idea) return;

        btn.disabled = true;
        btn.innerHTML = `<i class="animate-spin" data-lucide="loader-2"></i> Generating...`;
        lucide.createIcons();

        const systemPrompt = `You are a creative 'Vibe Architect'. Given a project idea, suggest a 'Vibe' and a 'Tech Stack'. Return JSON: { "vibe": "string", "stack": ["tool1", "tool2"], "desc": "string" }.`;
        const prompt = `Project idea: ${idea}. Return JSON only.`;

        try {
            const text = await callGemini(prompt, systemPrompt);
            const jsonStr = text.replace(/```json|```/g, '').trim();
            const data = JSON.parse(jsonStr);

            resultDiv.innerHTML = `
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="text-purple-400 text-sm font-bold uppercase tracking-wider mb-2">The Vibe ✨</h4>
                        <p class="text-xl font-bold text-white mb-2">${data.vibe}</p>
                        <p class="text-neutral-400 text-sm">${data.desc}</p>
                    </div>
                    <div>
                        <h4 class="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-2">The Stack 🛠️</h4>
                        <div class="flex flex-wrap gap-2">
                            ${data.stack.map(tech => `<span class="px-2 py-1 rounded bg-neutral-800 text-neutral-300 text-xs border border-neutral-700">${tech}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `;
            resultDiv.classList.remove('hidden');
        } catch (e) {
            console.error(e);
            resultDiv.innerHTML = `<p class="text-red-400">AI Vibe check failed. Try again.</p>`;
            resultDiv.classList.remove('hidden');
        }

        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="sparkles"></i> Generate`;
        lucide.createIcons();
    });
}

function renderTechStack() {
    const techs = ['Python', 'TensorFlow', 'Power BI', 'SQL', 'React', 'Oracle Cloud', 'Azure', 'Tailwind'];
    const container = document.getElementById('tech-stack');
    techs.forEach(tech => {
        const span = document.createElement('span');
        span.className = 'text-xl font-bold text-white';
        span.innerText = tech;
        container.appendChild(span);
    });
}
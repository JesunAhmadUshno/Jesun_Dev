// --- CONFIGURATION ---
// No API key needed! Using smart offline AI responses.

// --- EMAIL CONFIGURATION (FORMSPREE) ---
// The contact form uses Formspree (https://formspree.io/) - FREE & NO SETUP NEEDED!
// 1. Visit https://formspree.io/ and sign up (free)
// 2. Create a new form and get your form ID
// 3. Replace 'f/xyzqwvab' in initEmailModal() with your Formspree form ID
// 4. That's it! Emails will be sent to: jesunushno@gmail.com
// 
// Alternative: Use EmailJS instead by following these steps:
// 1. Sign up at https://www.emailjs.com/ (free plan: 200 emails/month)
// 2. Create an email service (Gmail, Outlook, etc.)
// 3. Create a template with variables: {{from_email}}, {{subject}}, {{message}}, {{reply_to}}
// 4. Update the fetch URL and body in initEmailModal() with your Service ID and Template ID 

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

// --- SMART AI RESPONSE SYSTEM (Enhanced Version!) ---

// Conversation memory
let conversationHistory = [];
let lastTopic = null;
let messageCount = 0;

// Knowledge base with rich responses
const KNOWLEDGE_BASE = {
    greetings: {
        keywords: ['hi', 'hello', 'hey', 'greetings', 'sup', 'yo', 'howdy', 'hola', 'good morning', 'good afternoon', 'good evening'],
        responses: [
            { text: "Hey there! 👋 I'm Jesun's AI twin. What brings you here today?", followUp: ["Tell me about KPMG experience", "What skills do you have?", "Are you open to work?"] },
            { text: "Hello! Great to meet you! I'm here to tell you all about Jesun. What would you like to know?", followUp: ["Your background", "Projects you've worked on", "How to contact you"] },
            { text: "Hi! Welcome to Jesun.Dev! 🚀 Feel free to ask me anything!", followUp: ["What is Vibe Coding?", "Your tech stack", "Education background"] }
        ],
        priority: 1
    },
    kpmg: {
        keywords: ['kpmg', 'consultant', 'advisory', 'audit', 'banking', 'healthcare', 'big 4', 'big four', 'consulting'],
        responses: [
            { text: "At KPMG (2023-2024), Jesun was an IT Advisory Consultant. Key achievements:\n\n• Built 20+ Power BI dashboards\n• Automated workflows saving 200+ hours/year\n• Conducted ISO 27001 IT audits\n• Worked with banking & healthcare clients 📊", followUp: ["What tools did you use?", "Tell me about the dashboards", "What's ISO 27001?"] },
            { text: "Jesun's KPMG journey was transformative! He specialized in data infrastructure for enterprise clients, turning complex data into actionable insights. Real Big 4 experience! 💼", followUp: ["What industries?", "What did you automate?", "Why did you leave?"] },
            { text: "During his 1.5+ years at KPMG, Jesun mastered enterprise-level data solutions. Power BI + Power Automate became his weapons of choice! ⚡", followUp: ["Power BI examples", "Automation details", "Client projects"] }
        ],
        priority: 2
    },
    skills: {
        keywords: ['skill', 'stack', 'python', 'sql', 'power bi', 'tableau', 'react', 'azure', 'tensorflow', 'tool', 'technology', 'tech', 'programming', 'language', 'framework', 'know', 'can you', 'capable'],
        responses: [
            { text: "Jesun's tech arsenal 🧙‍♂️:\n\n**Languages:** Python, SQL, JavaScript\n**AI/ML:** TensorFlow, Scikit-learn, Pandas\n**Viz:** Power BI, Tableau, Plotly\n**Cloud:** Azure, Oracle Cloud, AWS\n**Web:** React, Tailwind CSS", followUp: ["Favorite technology?", "Python projects", "Cloud experience"] },
            { text: "Full-stack data wizard alert! 💪 Jesun combines:\n• Data Engineering (ETL, pipelines)\n• AI/ML (neural networks, optimization)\n• Visualization (dashboards, reports)\n• Automation (scripts, workflows)", followUp: ["Data engineering details", "ML projects", "Automation examples"] },
            { text: "The stack that powers the vibe ✨:\nPython for data magic, SQL for truth-seeking, React for beautiful UIs, and Azure for cloud power. Plus TensorFlow for when things get neural! 🧠", followUp: ["TensorFlow projects", "SQL expertise", "React experience"] }
        ],
        priority: 2
    },
    education: {
        keywords: ['education', 'study', 'studying', 'master', 'degree', 'university', 'school', 'aiub', 'niagara', 'college', 'graduate', 'undergrad', 'bachelor', 'student', 'academic', 'learning', 'certification', 'certificate', 'certified', 'credential', 'license'],
        responses: [
            { text: "Jesun's academic journey 🎓:\n\n**Current:** Master's in Data Analytics\n📍 University of Niagara Falls Canada (Jan 2025)\n\n**Previous:** BS in Computer Engineering\n📍 AIUB, Bangladesh (2018-2023)\n\n**30+ Certifications** from Oracle, Cisco, KPMG, Microsoft & more!", followUp: ["Key certifications?", "Why Data Analytics?", "AIUB experience"] },
            { text: "Education + Certifications! 📚\n\n**Degrees:**\n• Master's in Data Analytics (current)\n• BS Computer Engineering (AIUB)\n\n**Top Certs:**\n• Oracle AI Foundations\n• CNSP (Network Security)\n• Lean Six Sigma\n• Cisco Cybersecurity Path", followUp: ["Oracle cert details", "Cisco certifications", "KPMG trainings"] },
            { text: "Continuous learner! 🚀 From degrees to 30+ industry certifications:\n\n✅ Oracle Cloud AI\n✅ Microsoft Data Analysis\n✅ Cisco Cybersecurity\n✅ KPMG Digital Foundations\n✅ Lean Six Sigma\n\nCheck the Certifications section!", followUp: ["Security certs", "Data certs", "All certifications"] }
        ],
        priority: 2
    },
    projects: {
        keywords: ['project', 'research', 'paper', 'fabric', 'defect', 'neural', 'wavelet', 'pso', 'publication', 'built', 'created', 'developed', 'portfolio', 'work sample', 'prism', 'nopara', 'sonicclear', 'wordme', 'refract'],
        responses: [
            { text: "Recent projects 🔬:\n\n**PRISM** - Zero-trust data analytics platform. Process Excel/CSV in-browser with AI insights. No data leaves your machine!\n\n**NoPara** - 100% private media converter using FFmpeg.wasm. Video, audio, image conversion—all client-side!\n\n**SonicClear AI** - Studio-grade audio enhancement with deep learning.", followUp: ["Tell me about PRISM", "How does NoPara work?", "SonicClear details"] },
            { text: "Research highlights 📄:\n\n**1. Fabric Defect Detection**\nNeural Networks + Wavelet Transforms for automated quality control.\n\n**2. Global Optimization**\nPSO algorithms for complex problem-solving.\n\nBoth peer-reviewed and published!", followUp: ["Fabric detection details", "PSO algorithm info", "Recent projects"] },
            { text: "Jesun builds things that matter! 🚀\n\n• **PRISM** - Browser-based data analytics (Pyodide + React)\n• **NoPara** - Private media converter (FFmpeg.wasm)\n• **SonicClear** - AI audio enhancement\n• **WordMe** - AI vocabulary builder\n\nCheck the Projects section below! ⬇️", followUp: ["PRISM features", "NoPara security", "How was this site built?"] }
        ],
        priority: 2
    },
    contact: {
        keywords: ['contact', 'email', 'reach', 'hire', 'hiring', 'job', 'opportunity', 'connect', 'linkedin', 'calendly', 'talk', 'meet', 'interview', 'resume', 'cv'],
        responses: [
            { text: "Let's connect! 🤝\n\n**LinkedIn:** linkedin.com/in/jesunahmadushno\n**Calendly:** Book a 30-min call\n**Email:** Use the contact form below\n\nJesun's actively looking for Data & AI roles in Toronto!", followUp: ["Open positions?", "Availability", "Work preferences"] },
            { text: "Jesun is OPEN TO WORK! 🟢 Best ways to reach him:\n• Hit the 'Let's Talk' button above\n• Connect on LinkedIn\n• Schedule a call via Calendly\n\nHe responds fast! ⚡", followUp: ["Response time", "Interview availability", "Location flexibility"] },
            { text: "Ready to vibe? 📧 Jesun's based in Toronto and excited about new opportunities. Whether it's a job, project, or just a chat—he's all ears! Use the contact section below. ✨", followUp: ["Job preferences", "Remote work?", "Start date"] }
        ],
        priority: 3
    },
    vibe: {
        keywords: ['vibe', 'vibe coding', 'coding style', 'philosophy', 'approach', 'creative', 'style', 'methodology', 'mindset'],
        responses: [
            { text: "Vibe Coding™ explained ✨:\n\nIt's not just writing code—it's crafting experiences. Engineering precision meets creative flair. Every project should:\n• Work flawlessly\n• Look beautiful\n• Feel memorable\n\nThat's the vibe! 🎨", followUp: ["Examples of this?", "How did you develop this?", "Apply it to my project"] },
            { text: "The Vibe Coder philosophy 🚀:\n\n1. **Precision** - Code that works perfectly\n2. **Aesthetics** - Design that captivates\n3. **Soul** - That special touch that makes it memorable\n\nJesun applies this to everything—from dashboards to AI models!", followUp: ["Dashboard examples", "AI projects", "This website"] },
            { text: "Why 'Vibe Coding'? Because Jesun believes technology should feel good, not just function. It's about bringing passion and creativity to every line of code. That's what sets him apart! 💫", followUp: ["Your inspiration", "Career impact", "Teaching others"] }
        ],
        priority: 2
    },
    location: {
        keywords: ['location', 'where', 'live', 'based', 'city', 'toronto', 'canada', 'country', 'relocate', 'remote', 'onsite', 'hybrid'],
        responses: [
            { text: "📍 Currently: Toronto, Ontario, Canada\n🏠 Originally: Bangladesh\n\nJesun relocated to Canada for his Master's program and is now building his career here. Open to opportunities across the GTA! 🍁", followUp: ["Work authorization", "Relocation?", "Remote preference"] },
            { text: "Toronto is home! 🌆 Jesun made the move from Bangladesh to pursue advanced studies and exciting tech opportunities. He's open to:\n• On-site (Toronto/GTA)\n• Hybrid\n• Remote", followUp: ["Commute range", "Travel willingness", "Time zone"] },
            { text: "Based in the heart of Toronto! 🇨🇦 Jesun's journey: Bangladesh → Master's in Canada → Future tech leader. The multicultural perspective adds depth to his work! 🌍", followUp: ["Cultural background", "Language skills", "Canadian experience"] }
        ],
        priority: 2
    },
    experience: {
        keywords: ['experience', 'work', 'career', 'professional', 'background', 'history', 'resume', 'years', 'previous'],
        responses: [
            { text: "Professional journey 💼:\n\n**KPMG** (2023-2024)\nIT Advisory Consultant\n→ Data solutions for banking & healthcare\n\n**ESAB AIUB**\nStudent Engagement Facilitator\n→ Leadership & community building\n\n**Now:** Master's student + Job hunting! 🎯", followUp: ["KPMG details", "Leadership experience", "Career goals"] },
            { text: "1.5+ years at a Big 4 firm + academic excellence = solid foundation! Jesun's experience spans:\n• Enterprise consulting\n• Data engineering\n• Process automation\n• Research & publication", followUp: ["Biggest achievement", "Challenges overcome", "Lessons learned"] },
            { text: "From student facilitator to KPMG consultant to Master's candidate—Jesun's career shows consistent growth and ambition. Each role added new skills and perspectives! 📈", followUp: ["Growth trajectory", "Skills gained", "Future direction"] }
        ],
        priority: 2
    },
    availability: {
        keywords: ['available', 'availability', 'start', 'when', 'join', 'notice', 'immediate', 'ready'],
        responses: [
            { text: "Great news! 🟢 Jesun is immediately available and actively seeking opportunities. He can start as soon as the right role comes along! No notice period required.", followUp: ["Interview availability", "Preferred roles", "Contact him"] },
            { text: "Ready to roll! ⚡ Jesun is currently focusing on his job search while completing his Master's. He has flexibility for:\n• Full-time roles\n• Internships\n• Contract work", followUp: ["Part-time ok?", "Work hours", "Schedule a call"] }
        ],
        priority: 3
    },
    thanks: {
        keywords: ['thank', 'thanks', 'thx', 'appreciate', 'helpful', 'great', 'awesome', 'cool', 'nice'],
        responses: [
            { text: "You're welcome! 😊 It was great chatting with you. Don't hesitate to reach out if you have more questions. Good vibes only! ✨", followUp: ["Contact Jesun", "View projects", "Connect on LinkedIn"] },
            { text: "Glad I could help! 🙌 Feel free to explore the rest of the portfolio or connect with Jesun directly. He'd love to hear from you!", followUp: ["Schedule a call", "Send an email", "View resume"] },
            { text: "Anytime! 💫 That's what I'm here for. Hope you found what you were looking for. Let's vibe again soon!", followUp: ["More questions", "Contact info", "Share feedback"] }
        ],
        priority: 1
    },
    humor: {
        keywords: ['joke', 'funny', 'laugh', 'humor', 'lol', 'haha', 'boring', 'fun'],
        responses: [
            { text: "Why do programmers prefer dark mode? Because light attracts bugs! 🐛😄\n\nBut seriously, Jesun's code is (mostly) bug-free. Ask me something real!", followUp: ["Actual skills", "Real projects", "Serious question"] },
            { text: "I'd tell you a joke about UDP, but you might not get it... 📡\n\nOkay okay, back to business! What would you like to know about Jesun?", followUp: ["Technical skills", "Work experience", "Projects"] },
            { text: "A SQL query walks into a bar, walks up to two tables and asks... 'Can I join you?' 🍺\n\nSpeaking of SQL, Jesun's pretty good at it! Want to know more?", followUp: ["SQL experience", "Database skills", "KPMG work"] }
        ],
        priority: 1
    },
    salary: {
        keywords: ['salary', 'pay', 'compensation', 'money', 'rate', 'hourly', 'annual', 'package'],
        responses: [
            { text: "Compensation discussions are best had directly with Jesun! 💼 He's open to competitive offers aligned with the Toronto market for Data Analytics roles. Schedule a call to discuss! 📞", followUp: ["Contact Jesun", "Role expectations", "Benefits interest"] },
            { text: "Let's save the numbers talk for a real conversation! 📊 Jesun is focused on finding the right opportunity where he can grow and contribute. Compensation follows value!", followUp: ["What he's looking for", "Schedule a chat", "View experience"] }
        ],
        priority: 3
    },
    goodbye: {
        keywords: ['bye', 'goodbye', 'see you', 'later', 'gtg', 'gotta go', 'leaving', 'exit'],
        responses: [
            { text: "Take care! 👋 It was great chatting. Don't be a stranger—Jesun's always happy to connect. Good vibes your way! ✨", followUp: null },
            { text: "Goodbye! 🌟 Thanks for stopping by Jesun.Dev. Hope to see you again soon. Stay creative, stay curious!", followUp: null },
            { text: "Later! 🚀 Remember: if you need a data-savvy vibe coder, you know where to find one. Take care!", followUp: null }
        ],
        priority: 1
    }
};

// Fuzzy matching helper
function fuzzyMatch(text, keywords) {
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    for (const keyword of keywords) {
        // Exact match
        if (text.includes(keyword)) {
            score += 10;
        }
        // Word starts with keyword
        for (const word of words) {
            if (word.startsWith(keyword.slice(0, 3)) && keyword.length > 3) {
                score += 3;
            }
        }
    }
    return score;
}

// Get the best matching topic
function findBestTopic(message) {
    const msg = message.toLowerCase();
    let bestTopic = null;
    let bestScore = 0;
    
    for (const [topic, data] of Object.entries(KNOWLEDGE_BASE)) {
        const score = fuzzyMatch(msg, data.keywords) * data.priority;
        if (score > bestScore) {
            bestScore = score;
            bestTopic = topic;
        }
    }
    
    // If no good match but we have context from last message
    if (bestScore < 5 && lastTopic) {
        // Check for follow-up indicators
        if (msg.match(/\b(more|detail|elaborate|explain|tell me more|what about|how about|and|also)\b/)) {
            return lastTopic;
        }
    }
    
    return bestScore >= 5 ? bestTopic : 'default';
}

// Generate contextual response
function getSmartResponse(message) {
    const msg = message.toLowerCase().trim();
    messageCount++;
    
    // Simulate realistic typing delay
    const baseDelay = 400;
    const variableDelay = Math.random() * 600;
    const lengthDelay = Math.min(msg.length * 10, 300);
    const delay = baseDelay + variableDelay + lengthDelay;
    
    return new Promise(resolve => {
        setTimeout(() => {
            // Handle empty or very short messages
            if (msg.length < 2) {
                resolve({ 
                    text: "I didn't quite catch that. Try asking about Jesun's skills, experience, or projects! 🤔",
                    followUp: ["Skills overview", "KPMG experience", "Research projects"]
                });
                return;
            }
            
            // Find the best matching topic
            const topic = findBestTopic(msg);
            lastTopic = topic;
            
            // Get responses for the topic
            const topicData = KNOWLEDGE_BASE[topic] || KNOWLEDGE_BASE.greetings;
            const responseObj = topicData.responses[Math.floor(Math.random() * topicData.responses.length)];
            
            // Add to conversation history
            conversationHistory.push({ role: 'user', content: msg });
            conversationHistory.push({ role: 'assistant', content: responseObj.text, topic });
            
            // Keep history manageable
            if (conversationHistory.length > 20) {
                conversationHistory = conversationHistory.slice(-20);
            }
            
            // Add personalization based on conversation length
            let response = responseObj.text;
            if (messageCount === 3) {
                response += "\n\n💡 Pro tip: You can also explore the sections below or hit 'Let's Talk' to connect directly!";
            }
            
            resolve({
                text: response,
                followUp: responseObj.followUp
            });
        }, delay);
    });
}

// Default responses for unknown queries
KNOWLEDGE_BASE.default = {
    keywords: [],
    responses: [
        { text: "Interesting question! 🤔 I'm best at answering about Jesun's:\n• Work experience (KPMG)\n• Technical skills\n• Education & research\n• Contact info\n\nWhat would you like to explore?", followUp: ["KPMG experience", "Tech skills", "Research papers"] },
        { text: "I want to help, but I'm not sure I understood that! 💭 Try asking about:\n• Professional background\n• Projects & research\n• The 'Vibe Coding' philosophy\n• How to connect", followUp: ["Work history", "Projects", "What is Vibe Coding?"] },
        { text: "Hmm, let me redirect! 🔄 I know lots about Jesun—his KPMG journey, Master's program, published research, and tech stack. Pick a topic!", followUp: ["KPMG work", "Education", "Skills & tools"] },
        { text: "That's outside my expertise! 😅 But I'm a pro at Jesun-related topics. Try asking about his experience, skills, or how to get in touch!", followUp: ["Experience overview", "Contact info", "Availability"] }
    ],
    priority: 0
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Start bootloader first, then initialize rest
    initBootloader(() => {
        lucide.createIcons(); // Initialize Icons
        initCarousel();
        initSpotlight();
        initChat();
        initVibeGenerator();
        initEmailModal();
        initCertifications();
        renderTechStack();
        
        // Initialize cinematic scroll for desktop, fallback for mobile
        if (window.innerWidth > 1024) {
            initCinematicScroll();
        } else {
            // Mobile: Remove all cinematic classes and ensure clean state
            const slides = document.querySelectorAll('.cinematic-slide');
            slides.forEach(slide => {
                slide.classList.remove('active', 'prev', 'next', 'far-prev', 'far-next', 'zigzag-reverse');
                slide.style.transform = 'none';
                slide.style.opacity = '1';
                slide.style.filter = 'none';
            });
            initAutoScroll(); // Mobile uses regular auto-scroll
        }
    
    // Navbar Scroll Effect (only for mobile/fallback)
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
    }); // Close bootloader callback
});

// --- ULTIMATE CINEMATIC BOOTLOADER ---
function initBootloader(onComplete) {
    const bootloader = document.getElementById('bootloader');
    const matrixCanvas = document.getElementById('matrix-canvas');
    const particleCanvas = document.getElementById('particle-canvas');
    const lightningCanvas = document.getElementById('lightning-canvas');
    const trailCanvas = document.getElementById('trail-canvas');
    const vortexCanvas = document.getElementById('vortex-canvas');
    const phase1 = document.getElementById('phase-1');
    const phase2 = document.getElementById('phase-2');
    const phase3 = document.getElementById('phase-3');
    const terminalOutput = document.getElementById('terminal-output');
    const bootTerminal = document.getElementById('boot-terminal');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const revealLine = document.getElementById('reveal-line');
    const revealHighlight = document.getElementById('reveal-highlight');
    const revealSubtitle = document.getElementById('reveal-subtitle');
    const shockwave = document.getElementById('shockwave');
    const shockwave2 = document.getElementById('shockwave-2');
    const shockwave3 = document.getElementById('shockwave-3');
    const lensFlare = document.getElementById('lens-flare');
    const screenGlitch = document.getElementById('screen-glitch');
    const glitchSlices = document.getElementById('glitch-slices');
    const powerSurge = document.getElementById('power-surge');
    const skipBtn = document.getElementById('skip-btn');
    const bootPercentage = document.getElementById('boot-percentage');
    
    let isSkipped = false;
    let matrixInterval, particleInterval, lightningInterval, trailInterval, vortexInterval;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let vortexActive = false;
    
    // Skip if already seen
    if (sessionStorage.getItem('bootloaderShown')) {
        bootloader.style.display = 'none';
        onComplete();
        return;
    }
    
    // ========== WEB AUDIO API SOUNDS ==========
    let audioContext = null;
    
    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    
    // Deep system boot tone - subtle low frequency hum
    function playSystemTone(freq = 80, duration = 0.3) {
        if (!audioContext) return;
        try {
            const osc = audioContext.createOscillator();
            const osc2 = audioContext.createOscillator();
            const gain = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();
            
            // Deep base tone
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            // Subtle harmonic
            osc2.type = 'sine';
            osc2.frequency.value = freq * 1.5;
            
            filter.type = 'lowpass';
            filter.frequency.value = 200;
            filter.Q.value = 1;
            
            gain.gain.setValueAtTime(0.04, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
            
            osc.connect(filter);
            osc2.connect(filter);
            filter.connect(gain);
            gain.connect(audioContext.destination);
            
            osc.start();
            osc2.start();
            osc.stop(audioContext.currentTime + duration);
            osc2.stop(audioContext.currentTime + duration);
        } catch(e) {}
    }
    
    // Soft digital click - like a relay or HDD
    function playDigitalClick() {
        if (!audioContext) return;
        try {
            const noise = audioContext.createBufferSource();
            const bufferSize = audioContext.sampleRate * 0.02;
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                const env = Math.exp(-i / (bufferSize * 0.1));
                data[i] = (Math.random() * 2 - 1) * env * 0.3;
            }
            
            noise.buffer = buffer;
            const filter = audioContext.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 2000;
            
            const gain = audioContext.createGain();
            gain.gain.value = 0.03;
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(audioContext.destination);
            noise.start();
        } catch(e) {}
    }
    
    // Soft data processing sound
    function playDataProcess() {
        if (!audioContext) return;
        try {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.05);
            
            filter.type = 'bandpass';
            filter.frequency.value = 1000;
            filter.Q.value = 5;
            
            gain.gain.setValueAtTime(0.02, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(audioContext.destination);
            osc.start();
            osc.stop(audioContext.currentTime + 0.05);
        } catch(e) {}
    }
    
    // Transition whoosh - filtered sweep
    function playWhoosh() {
        if (!audioContext) return;
        try {
            const noise = audioContext.createBufferSource();
            const bufferSize = audioContext.sampleRate * 0.4;
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                const env = Math.sin((i / bufferSize) * Math.PI) * 0.5;
                data[i] = (Math.random() * 2 - 1) * env;
            }
            
            noise.buffer = buffer;
            const filter = audioContext.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(200, audioContext.currentTime);
            filter.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.2);
            filter.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.4);
            filter.Q.value = 3;
            
            const gain = audioContext.createGain();
            gain.gain.setValueAtTime(0.06, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(audioContext.destination);
            noise.start();
        } catch(e) {}
    }
    
    // Power surge - deep rumble with high shimmer
    function playPowerUp() {
        if (!audioContext) return;
        try {
            // Deep rumble
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(40, audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.5);
            gain.gain.setValueAtTime(0.05, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.6);
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.start();
            osc.stop(audioContext.currentTime + 0.6);
            
            // High shimmer
            const noise = audioContext.createBufferSource();
            const bufferSize = audioContext.sampleRate * 0.5;
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                const env = Math.exp(-i / (bufferSize * 0.3));
                data[i] = (Math.random() * 2 - 1) * env * 0.2;
            }
            noise.buffer = buffer;
            const filter = audioContext.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 3000;
            const noiseGain = audioContext.createGain();
            noiseGain.gain.setValueAtTime(0.03, audioContext.currentTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(audioContext.destination);
            noise.start();
        } catch(e) {}
    }
    
    // Subtle confirmation tone
    function playConfirm() {
        if (!audioContext) return;
        try {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, audioContext.currentTime);
            osc.frequency.setValueAtTime(800, audioContext.currentTime + 0.08);
            gain.gain.setValueAtTime(0.02, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.start();
            osc.stop(audioContext.currentTime + 0.15);
        } catch(e) {}
    }
    
    // Initialize audio on first interaction
    bootloader.addEventListener('click', initAudio, { once: true });
    
    // ========== MOUSE PARALLAX ==========
    bootloader.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Subtle parallax on phases
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const deltaX = (e.clientX - centerX) / centerX;
        const deltaY = (e.clientY - centerY) / centerY;
        
        const phases = [phase1, phase2, phase3];
        phases.forEach(phase => {
            if (phase && phase.classList.contains('active')) {
                phase.style.transform = `translate(${deltaX * 10}px, ${deltaY * 10}px)`;
            }
        });
    });
    
    // ========== MOUSE TRAIL ==========
    const trailCtx = trailCanvas ? trailCanvas.getContext('2d') : null;
    const trailPoints = [];
    const maxTrailPoints = 30;
    
    if (trailCanvas) {
        trailCanvas.width = window.innerWidth;
        trailCanvas.height = window.innerHeight;
    }
    
    function updateTrail() {
        if (!trailCtx || isSkipped) return;
        
        trailPoints.push({ x: mouseX, y: mouseY, alpha: 1 });
        if (trailPoints.length > maxTrailPoints) {
            trailPoints.shift();
        }
        
        trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
        
        for (let i = 1; i < trailPoints.length; i++) {
            const p1 = trailPoints[i - 1];
            const p2 = trailPoints[i];
            const alpha = i / trailPoints.length * 0.6;
            
            trailCtx.beginPath();
            trailCtx.moveTo(p1.x, p1.y);
            trailCtx.lineTo(p2.x, p2.y);
            trailCtx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
            trailCtx.lineWidth = (i / trailPoints.length) * 6;
            trailCtx.lineCap = 'round';
            trailCtx.shadowBlur = 15;
            trailCtx.shadowColor = '#10b981';
            trailCtx.stroke();
            trailCtx.shadowBlur = 0;
        }
        
        // Glow at cursor
        if (trailPoints.length > 0) {
            const last = trailPoints[trailPoints.length - 1];
            const gradient = trailCtx.createRadialGradient(last.x, last.y, 0, last.x, last.y, 20);
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
            gradient.addColorStop(1, 'transparent');
            trailCtx.fillStyle = gradient;
            trailCtx.fillRect(last.x - 20, last.y - 20, 40, 40);
        }
    }
    
    trailInterval = setInterval(updateTrail, 35);
    
    // ========== DATA STREAMS ==========
    function createDataStreams() {
        const container = document.getElementById('data-streams');
        if (!container) return;
        
        for (let i = 0; i < 8; i++) {
            const stream = document.createElement('div');
            stream.className = 'data-stream';
            stream.style.top = `${Math.random() * 100}%`;
            stream.style.animationDuration = `${3 + Math.random() * 4}s`;
            stream.style.animationDelay = `${Math.random() * 2}s`;
            
            // Generate random binary/hex data
            let data = '';
            for (let j = 0; j < 50; j++) {
                data += Math.random() > 0.5 
                    ? Math.random().toString(2).substr(2, 8) + ' '
                    : Math.random().toString(16).substr(2, 4).toUpperCase() + ' ';
            }
            stream.textContent = data;
            container.appendChild(stream);
        }
    }
    createDataStreams();
    
    // ========== PARTICLE VORTEX ==========
    const vortexCtx = vortexCanvas ? vortexCanvas.getContext('2d') : null;
    const vortexParticles = [];
    
    if (vortexCanvas) {
        vortexCanvas.width = window.innerWidth;
        vortexCanvas.height = window.innerHeight;
        
        for (let i = 0; i < 150; i++) {
            vortexParticles.push({
                x: Math.random() * vortexCanvas.width,
                y: Math.random() * vortexCanvas.height,
                angle: Math.random() * Math.PI * 2,
                radius: 100 + Math.random() * Math.max(vortexCanvas.width, vortexCanvas.height) / 2,
                speed: 0.02 + Math.random() * 0.03,
                size: 1 + Math.random() * 2,
                color: ['#10b981', '#06b6d4', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 4)]
            });
        }
    }
    
    function drawVortex() {
        if (!vortexCtx || !vortexActive) return;
        
        vortexCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        vortexCtx.fillRect(0, 0, vortexCanvas.width, vortexCanvas.height);
        
        const centerX = vortexCanvas.width / 2;
        const centerY = vortexCanvas.height / 2;
        
        for (const p of vortexParticles) {
            p.angle += p.speed;
            p.radius *= 0.995; // Spiral inward
            
            p.x = centerX + Math.cos(p.angle) * p.radius;
            p.y = centerY + Math.sin(p.angle) * p.radius;
            
            if (p.radius < 5) {
                p.radius = 100 + Math.random() * Math.max(vortexCanvas.width, vortexCanvas.height) / 2;
                p.angle = Math.random() * Math.PI * 2;
            }
            
            vortexCtx.beginPath();
            vortexCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            vortexCtx.fillStyle = p.color;
            vortexCtx.shadowBlur = 10;
            vortexCtx.shadowColor = p.color;
            vortexCtx.fill();
            vortexCtx.shadowBlur = 0;
        }
    }
    
    vortexInterval = setInterval(drawVortex, 35);
    
    // ========== SCREEN GLITCH EFFECT ==========
    function triggerScreenGlitch() {
        if (screenGlitch) {
            screenGlitch.classList.add('active');
            setTimeout(() => screenGlitch.classList.remove('active'), 200);
        }
    }
    
    // ========== GLITCH SLICES ==========
    function triggerGlitchSlices() {
        if (glitchSlices) {
            glitchSlices.classList.add('active');
            setTimeout(() => glitchSlices.classList.remove('active'), 300);
        }
    }
    
    // ========== POWER SURGE ==========
    function triggerPowerSurge() {
        if (powerSurge) {
            powerSurge.classList.add('active');
            playPowerUp();
            setTimeout(() => powerSurge.classList.remove('active'), 600);
        }
    }
    
    // ========== TEXT SCRAMBLE EFFECT ==========
    const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*<>[]{}';
    
    function scrambleText(element, finalText, duration = 1500) {
        const chars = finalText.split('');
        const iterations = 8;
        const intervalTime = duration / (chars.length * iterations);
        let currentIteration = 0;
        
        element.innerHTML = '';
        chars.forEach((char, i) => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char === ' ' ? '\u00A0' : scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
            span.style.animationDelay = `${i * 60}ms`;
            element.appendChild(span);
        });
        
        const spans = element.querySelectorAll('.char');
        
        const interval = setInterval(() => {
            currentIteration++;
            spans.forEach((span, i) => {
                const charIndex = Math.floor(currentIteration / iterations);
                if (i < charIndex) {
                    span.textContent = chars[i] === ' ' ? '\u00A0' : chars[i];
                } else if (i === charIndex) {
                    span.textContent = chars[i] === ' ' ? '\u00A0' : scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                }
            });
            
            if (currentIteration >= chars.length * iterations) {
                clearInterval(interval);
                spans.forEach((span, i) => {
                    span.textContent = chars[i] === ' ' ? '\u00A0' : chars[i];
                });
            }
        }, intervalTime);
    }
    
    // ========== SPARK PARTICLES ON CLICK ==========
    const sparkParticles = [];
    
    bootloader.addEventListener('click', (e) => {
        if (isSkipped) return;
        initAudio();
        playDigitalClick();
        
        const sparkCount = 15;
        for (let i = 0; i < sparkCount; i++) {
            sparkParticles.push({
                x: e.clientX,
                y: e.clientY,
                vx: (Math.random() - 0.5) * 18,
                vy: (Math.random() - 0.5) * 18,
                life: 1,
                color: ['#10b981', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b'][Math.floor(Math.random() * 5)]
            });
        }
        triggerScreenGlitch();
    });
    
    // ========== MATRIX RAIN ==========
    const matrixCtx = matrixCanvas.getContext('2d');
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*<>[]{}|';
    const charArray = chars.split('');
    const fontSize = 14;
    const columns = Math.floor(matrixCanvas.width / fontSize);
    const drops = Array(columns).fill(0).map(() => Math.random() * -100);
    const speeds = Array(columns).fill(0).map(() => 0.3 + Math.random() * 1.2);
    
    function drawMatrix() {
        matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.04)';
        matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
        
        for (let i = 0; i < drops.length; i++) {
            const char = charArray[Math.floor(Math.random() * charArray.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;
            
            const rand = Math.random();
            if (rand > 0.98) {
                matrixCtx.fillStyle = '#ffffff';
                matrixCtx.shadowBlur = 25;
                matrixCtx.shadowColor = '#ffffff';
            } else if (rand > 0.9) {
                matrixCtx.fillStyle = '#6ee7b7';
                matrixCtx.shadowBlur = 15;
                matrixCtx.shadowColor = '#10b981';
            } else {
                matrixCtx.fillStyle = '#10b981';
                matrixCtx.shadowBlur = 8;
                matrixCtx.shadowColor = '#10b981';
            }
            
            matrixCtx.font = `${fontSize}px JetBrains Mono, monospace`;
            matrixCtx.fillText(char, x, y);
            matrixCtx.shadowBlur = 0;
            
            if (y > matrixCanvas.height && Math.random() > 0.99) {
                drops[i] = 0;
            }
            drops[i] += speeds[i];
        }
    }
    
    // ========== PARTICLES ==========
    const particleCtx = particleCanvas.getContext('2d');
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 80;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * particleCanvas.width,
            y: Math.random() * particleCanvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1,
            alpha: Math.random() * 0.5 + 0.2,
            color: Math.random() > 0.5 ? '#10b981' : '#06b6d4'
        });
    }
    
    function drawParticles() {
        particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
        
        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 120) {
                    particleCtx.beginPath();
                    particleCtx.strokeStyle = `rgba(16, 185, 129, ${0.15 * (1 - dist / 120)})`;
                    particleCtx.lineWidth = 0.5;
                    particleCtx.moveTo(particles[i].x, particles[i].y);
                    particleCtx.lineTo(particles[j].x, particles[j].y);
                    particleCtx.stroke();
                }
            }
        }
        
        // Draw particles
        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.x < 0 || p.x > particleCanvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > particleCanvas.height) p.vy *= -1;
            
            particleCtx.beginPath();
            particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            particleCtx.fillStyle = p.color;
            particleCtx.globalAlpha = p.alpha;
            particleCtx.fill();
            particleCtx.globalAlpha = 1;
        }
        
        // Draw spark particles from clicks
        for (let i = sparkParticles.length - 1; i >= 0; i--) {
            const sp = sparkParticles[i];
            sp.x += sp.vx;
            sp.y += sp.vy;
            sp.vy += 0.3; // gravity
            sp.life -= 0.03;
            
            if (sp.life <= 0) {
                sparkParticles.splice(i, 1);
                continue;
            }
            
            particleCtx.beginPath();
            particleCtx.arc(sp.x, sp.y, 3, 0, Math.PI * 2);
            particleCtx.fillStyle = sp.color;
            particleCtx.globalAlpha = sp.life;
            particleCtx.shadowBlur = 10;
            particleCtx.shadowColor = sp.color;
            particleCtx.fill();
            particleCtx.shadowBlur = 0;
            particleCtx.globalAlpha = 1;
        }
    }
    
    // ========== LIGHTNING ==========
    const lightningCtx = lightningCanvas ? lightningCanvas.getContext('2d') : null;
    if (lightningCanvas) {
        lightningCanvas.width = window.innerWidth;
        lightningCanvas.height = window.innerHeight;
    }
    
    let lightningBolts = [];
    
    function createLightningBolt(x1, y1, x2, y2, depth = 0) {
        if (depth > 4) return [];
        
        const bolts = [];
        const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * 100;
        const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * 100;
        
        bolts.push({ x1, y1, x2: midX, y2: midY, alpha: 1, width: 3 - depth * 0.5 });
        bolts.push({ x1: midX, y1: midY, x2, y2, alpha: 1, width: 3 - depth * 0.5 });
        
        if (Math.random() > 0.5) {
            const branchX = midX + (Math.random() - 0.5) * 150;
            const branchY = midY + (Math.random() - 0.5) * 150;
            bolts.push(...createLightningBolt(midX, midY, branchX, branchY, depth + 1));
        }
        
        return bolts;
    }
    
    function triggerLightning() {
        if (!lightningCtx) return;
        const startX = Math.random() * lightningCanvas.width;
        const endX = Math.random() * lightningCanvas.width;
        lightningBolts = createLightningBolt(startX, 0, endX, lightningCanvas.height);
    }
    
    function drawLightning() {
        if (!lightningCtx) return;
        lightningCtx.clearRect(0, 0, lightningCanvas.width, lightningCanvas.height);
        
        for (let i = lightningBolts.length - 1; i >= 0; i--) {
            const bolt = lightningBolts[i];
            bolt.alpha -= 0.08;
            
            if (bolt.alpha <= 0) {
                lightningBolts.splice(i, 1);
                continue;
            }
            
            lightningCtx.beginPath();
            lightningCtx.moveTo(bolt.x1, bolt.y1);
            lightningCtx.lineTo(bolt.x2, bolt.y2);
            lightningCtx.strokeStyle = `rgba(16, 185, 129, ${bolt.alpha})`;
            lightningCtx.lineWidth = bolt.width;
            lightningCtx.shadowBlur = 20;
            lightningCtx.shadowColor = '#10b981';
            lightningCtx.stroke();
            lightningCtx.shadowBlur = 0;
        }
    }
    
    // ========== TERMINAL ==========
    const terminalCommands = [
        { type: 'command', text: 'sudo ./init-portfolio.sh --mode=cinematic', delay: 0, progress: 3 },
        { type: 'output', text: '[sudo] password: ********', delay: 300, progress: 5 },
        { type: 'success', text: '✓ Root access granted', delay: 500, progress: 8 },
        { type: 'output', text: '', delay: 600, progress: 8 },
        { type: 'cyan', text: '╔════════════════════════════════════════╗', delay: 700, progress: 10 },
        { type: 'cyan', text: '║   JESUN.DEV PORTFOLIO SYSTEM v2.0    ║', delay: 800, progress: 12 },
        { type: 'cyan', text: '╚════════════════════════════════════════╝', delay: 900, progress: 14 },
        { type: 'output', text: '', delay: 1000, progress: 14 },
        { type: 'output', text: '[●] Initializing quantum core...', delay: 1100, progress: 20 },
        { type: 'success', text: '    ✓ Neural networks calibrated', delay: 1400, progress: 25 },
        { type: 'output', text: '[●] Loading creativity matrix...', delay: 1700, progress: 32 },
        { type: 'success', text: '    ✓ Vibe protocols engaged', delay: 2000, progress: 38 },
        { type: 'output', text: '[●] Syncing KPMG modules...', delay: 2300, progress: 45 },
        { type: 'success', text: '    ✓ 200+ automation hours loaded', delay: 2600, progress: 52 },
        { type: 'output', text: '[●] Mounting project repository...', delay: 2900, progress: 60 },
        { type: 'success', text: '    ✓ 10+ flagship projects ready', delay: 3200, progress: 68 },
        { type: 'output', text: '[●] Verifying certifications...', delay: 3500, progress: 76 },
        { type: 'success', text: '    ✓ 30+ credentials validated', delay: 3800, progress: 84 },
        { type: 'output', text: '[●] Optimizing experience layers...', delay: 4100, progress: 92 },
        { type: 'success', text: '    ✓ All systems optimal', delay: 4400, progress: 98 },
        { type: 'output', text: '', delay: 4600, progress: 98 },
        { type: 'highlight', text: '▶ INITIALIZATION COMPLETE', delay: 4800, progress: 100 },
        { type: 'pink', text: '▶ LAUNCHING CINEMATIC MODE...', delay: 5000, progress: 100 },
    ];
    
    function updateProgress(percent) {
        progressBar.style.setProperty('--progress', `${percent}%`);
        progressText.textContent = `${percent}%`;
    }
    
    function typeTerminalLine(cmd) {
        if (isSkipped) return;
        
        const line = document.createElement('div');
        line.className = 'terminal-line';
        
        const colorMap = {
            'command': `<span class="prompt">$</span> <span class="command">${cmd.text}</span>`,
            'success': `<span class="success">${cmd.text}</span>`,
            'highlight': `<span class="highlight">${cmd.text}</span>`,
            'warning': `<span class="warning">${cmd.text}</span>`,
            'cyan': `<span class="cyan">${cmd.text}</span>`,
            'pink': `<span class="pink">${cmd.text}</span>`,
            'output': `<span class="output">${cmd.text}</span>`
        };
        
        line.innerHTML = colorMap[cmd.type] || colorMap['output'];
        terminalOutput.appendChild(line);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        updateProgress(cmd.progress);
    }
    
    // ========== DIAGNOSTICS ==========
    function animateDiagnostics() {
        const items = [
            { id: 'diag-cpu', target: 87 },
            { id: 'diag-mem', target: 64 },
            { id: 'diag-net', target: 98 },
            { id: 'diag-ai', target: 100 }
        ];
        
        items.forEach((item, index) => {
            setTimeout(() => {
                if (isSkipped) return;
                const el = document.getElementById(item.id);
                if (!el) return;
                const fill = el.querySelector('.diag-fill');
                const value = el.querySelector('.diag-value');
                
                let current = 0;
                const interval = setInterval(() => {
                    if (current >= item.target || isSkipped) {
                        clearInterval(interval);
                        return;
                    }
                    current += 2;
                    fill.style.width = `${current}%`;
                    value.textContent = `${Math.min(current, item.target)}%`;
                }, 30);
            }, index * 400 + 500);
        });
        
        // Animate stats
        const stats = [
            { id: 'stat-projects', target: 10 },
            { id: 'stat-certs', target: 30 },
            { id: 'stat-hours', target: 200 }
        ];
        
        stats.forEach((stat, index) => {
            setTimeout(() => {
                if (isSkipped) return;
                const el = document.getElementById(stat.id);
                if (!el) return;
                let current = 0;
                const increment = stat.target / 30;
                const interval = setInterval(() => {
                    if (current >= stat.target || isSkipped) {
                        clearInterval(interval);
                        el.textContent = stat.target + '+';
                        return;
                    }
                    current += increment;
                    el.textContent = Math.floor(current);
                }, 50);
            }, index * 300 + 1500);
        });
    }
    
    // ========== REVEAL ==========
    function revealTextCharByChar(element, text, baseDelay = 0, charDelay = 60) {
        element.innerHTML = '';
        text.split('').forEach((char, i) => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.animationDelay = `${baseDelay + (i * charDelay)}ms`;
            element.appendChild(span);
        });
    }
    
    // ========== SKIP ==========
    function skipBootloader() {
        if (isSkipped) return;
        isSkipped = true;
        
        clearInterval(matrixInterval);
        clearInterval(particleInterval);
        if (lightningInterval) clearInterval(lightningInterval);
        if (trailInterval) clearInterval(trailInterval);
        if (vortexInterval) clearInterval(vortexInterval);
        bootloader.classList.add('fade-out');
        sessionStorage.setItem('bootloaderShown', 'true');
        
        setTimeout(() => {
            bootloader.style.display = 'none';
            onComplete();
        }, 500);
    }
    
    skipBtn.addEventListener('click', skipBootloader);
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && bootloader.style.display !== 'none') {
            e.preventDefault();
            skipBootloader();
        }
    });
    
    // ========== BOOT PERCENTAGE ANIMATION ==========
    function animateBootPercentage() {
        if (!bootPercentage) return;
        let percent = 0;
        const targetDuration = 2300; // Match phase 1 duration
        const steps = 100;
        const stepTime = targetDuration / steps;
        
        const interval = setInterval(() => {
            if (isSkipped || percent >= 100) {
                clearInterval(interval);
                if (bootPercentage) bootPercentage.textContent = '100.00%';
                return;
            }
            percent += 1;
            // Add decimal randomness for hacker feel
            const decimal = (Math.random() * 99).toFixed(0).padStart(2, '0');
            bootPercentage.textContent = `${percent}.${decimal}%`;
        }, stepTime);
    }
    
    // ========== START SEQUENCE ==========
    matrixInterval = setInterval(drawMatrix, 35);
    particleInterval = setInterval(drawParticles, 35);
    lightningInterval = setInterval(drawLightning, 35);
    
    // Random lightning strikes
    setInterval(() => {
        if (!isSkipped && Math.random() > 0.92) {
            triggerLightning();
        }
    }, 500);
    
    // Phase 1: Boot Logo
    phase1.classList.add('active');
    animateBootPercentage();
    
    // Boot sequence - deep system initialization tone
    setTimeout(() => { initAudio(); playSystemTone(60, 0.5); }, 100);
    setTimeout(() => playSystemTone(80, 0.4), 400);
    setTimeout(() => playDigitalClick(), 800);
    
    // Transition to Phase 2
    setTimeout(() => {
        if (isSkipped) return;
        phase1.classList.remove('active');
        phase2.classList.add('active');
        animateDiagnostics();
        triggerGlitchSlices();
        playWhoosh();
        
        // Type terminal commands
        terminalCommands.forEach((cmd) => {
            setTimeout(() => {
                if (!isSkipped) {
                    typeTerminalLine(cmd);
                    
                    // Soft data processing sound
                    if (cmd.type === 'command' || cmd.type === 'success') {
                        playDataProcess();
                    }
                    
                    // Glitch at milestones + screen glitch
                    if (cmd.progress === 50 || cmd.progress === 100) {
                        bootTerminal.classList.add('glitch');
                        triggerScreenGlitch();
                        triggerGlitchSlices();
                        triggerLightning();
                        playPowerUp();
                        setTimeout(() => bootTerminal.classList.remove('glitch'), 400);
                    }
                }
            }, cmd.delay);
        });
    }, 2500);
    
    // Transition to Phase 3
    setTimeout(() => {
        if (isSkipped) return;
        
        // Trigger power surge
        triggerPowerSurge();
        playWhoosh();
        
        // Trigger lightning storm
        triggerLightning();
        setTimeout(() => triggerLightning(), 100);
        setTimeout(() => triggerLightning(), 200);
        setTimeout(() => triggerLightning(), 300);
        
        // Activate particle vortex
        vortexActive = true;
        
        bootloader.classList.add('shake');
        triggerScreenGlitch();
        triggerGlitchSlices();
        setTimeout(() => bootloader.classList.remove('shake'), 800);
        
        phase2.classList.remove('active');
        phase3.classList.add('active');
        
        // Trigger shockwaves
        setTimeout(() => {
            if (isSkipped) return;
            shockwave.classList.add('active');
            if (shockwave2) shockwave2.classList.add('active');
            if (shockwave3) shockwave3.classList.add('active');
            if (lensFlare) lensFlare.classList.add('active');
            playSystemTone(50, 0.8);
        }, 200);
        
        // Reveal "I do" with scramble effect
        setTimeout(() => {
            if (isSkipped) return;
            scrambleText(revealLine, 'I do', 800);
            playDataProcess();
        }, 400);
        
        // Reveal "Vibe Coding." with scramble effect
        setTimeout(() => {
            if (isSkipped) return;
            scrambleText(revealHighlight, 'Vibe Coding.', 1200);
            playConfirm();
            
            // RGB Glitch + screen effects
            setTimeout(() => {
                if (isSkipped) return;
                revealHighlight.classList.add('glitch');
                triggerLightning();
                triggerScreenGlitch();
                triggerGlitchSlices();
                playPowerUp();
                setTimeout(() => revealHighlight.classList.remove('glitch'), 600);
            }, 1500);
        }, 900);
        
        // Subtitle
        setTimeout(() => {
            if (isSkipped) return;
            revealSubtitle.textContent = 'Data Analytics • AI • Creative Development';
            revealSubtitle.classList.add('active');
            playConfirm();
        }, 2500);
        
    }, 8500);
    
    // Complete
    setTimeout(() => {
        if (isSkipped) return;
        
        // Final power surge and sound
        triggerPowerSurge();
        playWhoosh();
        triggerGlitchSlices();
        
        clearInterval(matrixInterval);
        clearInterval(particleInterval);
        if (lightningInterval) clearInterval(lightningInterval);
        if (trailInterval) clearInterval(trailInterval);
        if (vortexInterval) clearInterval(vortexInterval);
        bootloader.classList.add('fade-out');
        sessionStorage.setItem('bootloaderShown', 'true');
        
        setTimeout(() => {
            bootloader.style.display = 'none';
            onComplete();
        }, 2500);
    }, 12000);
}

// --- AUTO-SCROLL FEATURE ---
function initAutoScroll() {
    const chatWidget = document.getElementById('chat-widget-container');
    const coffeeBtn = document.getElementById('coffee-button');
    
    let autoScrollInterval = null;
    let idleTimeout = null;
    let buttonsVisible = false;
    let scrollingActive = false;
    let interactionEnabled = false; // Don't detect interaction until scroll starts
    const INITIAL_DELAY = 10000; // 10 seconds before first scroll
    const IDLE_DELAY = 15000; // 15 seconds idle before resuming
    const SCROLL_SPEED = 2; // pixels per frame
    const SCROLL_INTERVAL = 16; // ms between scroll steps (~60fps smooth)
    const GRACE_PERIOD = 1000; // 1 second grace period after scroll starts
    
    // Show floating buttons with animation
    function showFloatingButtons() {
        if (buttonsVisible) return;
        buttonsVisible = true;
        
        if (coffeeBtn) {
            coffeeBtn.classList.remove('floating-hidden');
            coffeeBtn.classList.add('floating-visible');
        }
        if (chatWidget) {
            chatWidget.classList.remove('floating-hidden');
            chatWidget.classList.add('floating-visible');
        }
    }
    
    // Start auto-scrolling
    function startAutoScroll() {
        if (autoScrollInterval) return; // Already scrolling
        
        scrollingActive = true;
        
        // Show buttons when scroll starts
        if (!buttonsVisible) {
            showFloatingButtons();
        }
        
        // Enable interaction detection after grace period
        setTimeout(() => {
            interactionEnabled = true;
        }, GRACE_PERIOD);
        
        autoScrollInterval = setInterval(() => {
            // Check if we've reached the bottom
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (window.scrollY >= maxScroll - 10) {
                stopAutoScroll();
                return;
            }
            
            window.scrollBy(0, SCROLL_SPEED);
        }, SCROLL_INTERVAL);
    }
    
    // Stop auto-scrolling
    function stopAutoScroll() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        }
        scrollingActive = false;
    }
    
    // Reset idle timer
    function resetIdleTimer() {
        // Only respond to interactions if enabled and scrolling is active
        if (!interactionEnabled) return;
        
        // Stop current auto-scroll
        stopAutoScroll();
        
        // Clear existing idle timeout
        if (idleTimeout) {
            clearTimeout(idleTimeout);
        }
        
        // Set new idle timeout to resume scrolling
        idleTimeout = setTimeout(() => {
            interactionEnabled = false; // Reset for new grace period
            startAutoScroll();
        }, IDLE_DELAY);
    }
    
    // User interaction events - only active clicks, keys, touch, and wheel
    // Removed mousemove as it's too sensitive
    const interactionEvents = ['mousedown', 'keydown', 'touchstart', 'wheel'];
    
    interactionEvents.forEach(event => {
        window.addEventListener(event, () => {
            // Show buttons on any interaction too
            if (!buttonsVisible) {
                showFloatingButtons();
            }
            resetIdleTimer();
        }, { passive: true });
    });
    
    // Manual scroll detection (user scrolling themselves)
    let lastScrollTop = window.scrollY;
    window.addEventListener('scroll', () => {
        if (!buttonsVisible) {
            showFloatingButtons();
        }
        
        // Only trigger if user is manually scrolling (not auto-scroll)
        if (interactionEnabled && !scrollingActive) {
            resetIdleTimer();
        }
        
        // Detect if scroll direction changed or speed is different (user took over)
        const currentScroll = window.scrollY;
        const scrollDiff = Math.abs(currentScroll - lastScrollTop);
        if (scrollingActive && scrollDiff > SCROLL_SPEED * 3) {
            // User probably scrolled manually - bigger jump than auto-scroll
            resetIdleTimer();
        }
        lastScrollTop = currentScroll;
    }, { passive: true });
    
    // Start initial auto-scroll after delay
    setTimeout(() => {
        startAutoScroll();
    }, INITIAL_DELAY);
}

// --- CINEMATIC 3D SCROLL EXPERIENCE ---
function initCinematicScroll() {
    const slides = document.querySelectorAll('.cinematic-slide');
    const navDots = document.querySelectorAll('.slide-nav-dot');
    const navLinks = document.querySelectorAll('.slide-link');
    const progressBar = document.getElementById('slide-progress');
    const slideCounter = document.getElementById('slide-counter');
    const scrollHint = document.getElementById('scroll-hint');
    const chatWidget = document.getElementById('chat-widget-container');
    const coffeeBtn = document.getElementById('coffee-button');
    
    let currentSlide = 0;
    let isAnimating = false;
    let touchStartY = 0;
    let autoPlayTimeout = null;
    const totalSlides = slides.length;
    const ANIMATION_DURATION = 1000; // ms - increased for dramatic effect
    const AUTO_PLAY_DELAY = 10000; // 10 seconds initial delay
    const IDLE_AUTO_PLAY = 15000; // 15 seconds idle before auto-advance
    
    // Update slide classes based on position with zigzag effect
    function updateSlideClasses() {
        slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev', 'next', 'far-prev', 'far-next', 'zigzag-reverse');
            
            const diff = index - currentSlide;
            
            // Apply zigzag-reverse to odd-indexed slides for alternating direction
            if (index % 2 === 1) {
                slide.classList.add('zigzag-reverse');
            }
            
            if (diff === 0) {
                slide.classList.add('active');
            } else if (diff === -1) {
                slide.classList.add('prev');
            } else if (diff === 1) {
                slide.classList.add('next');
            } else if (diff < -1) {
                slide.classList.add('far-prev');
            } else {
                slide.classList.add('far-next');
            }
        });
    }
    
    // Update navigation dots
    function updateNavDots() {
        navDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }
    
    // Update progress bar
    function updateProgress() {
        const progress = ((currentSlide + 1) / totalSlides) * 100;
        progressBar.style.width = `${progress}%`;
    }
    
    // Update slide counter
    function updateCounter() {
        const current = String(currentSlide + 1).padStart(2, '0');
        slideCounter.innerHTML = `<span class="current">${current}</span> / ${String(totalSlides).padStart(2, '0')}`;
    }
    
    // Show floating buttons
    function showFloatingButtons() {
        if (coffeeBtn) {
            coffeeBtn.classList.remove('floating-hidden');
            coffeeBtn.classList.add('floating-visible');
        }
        if (chatWidget) {
            chatWidget.classList.remove('floating-hidden');
            chatWidget.classList.add('floating-visible');
        }
    }
    
    // Navigate to a specific slide
    function goToSlide(index, showButtons = true) {
        if (isAnimating || index === currentSlide) return;
        if (index < 0 || index >= totalSlides) return;
        
        isAnimating = true;
        currentSlide = index;
        
        // Reset scroll position of new slide to top
        slides[currentSlide].scrollTop = 0;
        
        updateSlideClasses();
        updateNavDots();
        updateProgress();
        updateCounter();
        
        // Show buttons when navigating
        if (showButtons && currentSlide > 0) {
            showFloatingButtons();
        }
        
        // Hide scroll hint after first navigation
        if (scrollHint && currentSlide > 0) {
            scrollHint.style.opacity = '0';
            setTimeout(() => scrollHint.style.display = 'none', 300);
        }
        
        // Reset animation lock
        setTimeout(() => {
            isAnimating = false;
        }, ANIMATION_DURATION);
        
        // Reset auto-play timer
        resetAutoPlay();
    }
    
    // Navigate to next slide (loops to first)
    function nextSlide() {
        if (currentSlide < totalSlides - 1) {
            goToSlide(currentSlide + 1);
        } else {
            // Loop back to first slide
            goToSlide(0);
        }
    }
    
    // Navigate to previous slide (loops to last)
    function prevSlide() {
        if (currentSlide > 0) {
            goToSlide(currentSlide - 1);
        } else {
            // Loop to last slide
            goToSlide(totalSlides - 1);
        }
    }
    
    // Auto-scroll functionality - scrolls through content then transitions
    let autoScrollInterval = null;
    let autoScrollActive = false;
    const AUTO_SCROLL_SPEED = 2; // pixels per frame
    const AUTO_SCROLL_INTERVAL = 16; // ~60fps
    
    function startAutoScroll() {
        if (autoScrollInterval) return;
        autoScrollActive = true;
        
        // Show floating buttons when auto-scroll starts
        showFloatingButtons();
        
        autoScrollInterval = setInterval(() => {
            const currentSlideEl = slides[currentSlide];
            const scrollTop = currentSlideEl.scrollTop;
            const scrollHeight = currentSlideEl.scrollHeight;
            const clientHeight = currentSlideEl.clientHeight;
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
            const hasScrollableContent = scrollHeight > clientHeight + 10;
            
            // If slide has scrollable content and not at bottom, scroll within slide
            if (hasScrollableContent && !isAtBottom) {
                currentSlideEl.scrollBy(0, AUTO_SCROLL_SPEED);
            } else {
                // At bottom or no scrollable content - go to next slide (loops infinitely)
                nextSlide();
                // Scroll new slide to top
                setTimeout(() => {
                    slides[currentSlide].scrollTop = 0;
                }, ANIMATION_DURATION);
            }
        }, AUTO_SCROLL_INTERVAL);
    }
    
    function stopAutoScroll() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        }
        autoScrollActive = false;
    }
    
    // Auto-play - restarts auto-scroll after idle (infinite loop)
    function startAutoPlay() {
        autoPlayTimeout = setTimeout(() => {
            startAutoScroll();
        }, IDLE_AUTO_PLAY);
    }
    
    function resetAutoPlay() {
        // Stop any active auto-scroll
        stopAutoScroll();
        
        if (autoPlayTimeout) {
            clearTimeout(autoPlayTimeout);
        }
        startAutoPlay();
    }
    
    // User interaction detection - stops auto-scroll
    const interactionEvents = ['mousedown', 'keydown', 'touchstart'];
    interactionEvents.forEach(event => {
        window.addEventListener(event, () => {
            resetAutoPlay();
        }, { passive: true });
    });
    
    // Wheel event for scroll navigation with internal scroll support
    let wheelAccumulator = 0;
    const WHEEL_THRESHOLD = 100; // Accumulated scroll needed to trigger slide change
    let lastWheelTime = 0;
    
    window.addEventListener('wheel', (e) => {
        // Prevent during animation
        if (isAnimating) return;
        
        const currentSlideEl = slides[currentSlide];
        const scrollTop = currentSlideEl.scrollTop;
        const scrollHeight = currentSlideEl.scrollHeight;
        const clientHeight = currentSlideEl.clientHeight;
        const isAtTop = scrollTop <= 5;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
        const hasScrollableContent = scrollHeight > clientHeight + 10;
        
        // Stop auto-scroll on any wheel interaction
        if (autoScrollActive) {
            resetAutoPlay();
        }
        
        // Reset accumulator if too much time passed
        const now = Date.now();
        if (now - lastWheelTime > 300) {
            wheelAccumulator = 0;
        }
        lastWheelTime = now;
        
        // Scrolling DOWN
        if (e.deltaY > 0) {
            // If slide has scrollable content and not at bottom, allow internal scroll
            if (hasScrollableContent && !isAtBottom) {
                wheelAccumulator = 0; // Reset accumulator
                return; // Allow default scroll
            }
            // At bottom or no scrollable content - accumulate for slide transition
            wheelAccumulator += e.deltaY;
            if (wheelAccumulator >= WHEEL_THRESHOLD) {
                wheelAccumulator = 0;
                nextSlide();
            }
        }
        // Scrolling UP
        else if (e.deltaY < 0) {
            // If slide has scrollable content and not at top, allow internal scroll
            if (hasScrollableContent && !isAtTop) {
                wheelAccumulator = 0; // Reset accumulator
                return; // Allow default scroll
            }
            // At top or no scrollable content - accumulate for slide transition
            wheelAccumulator += e.deltaY;
            if (wheelAccumulator <= -WHEEL_THRESHOLD) {
                wheelAccumulator = 0;
                prevSlide();
            }
        }
    }, { passive: true });
    
    // Touch events for mobile-like swipe on desktop
    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    window.addEventListener('touchend', (e) => {
        if (isAnimating) return;
        
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY - touchEndY;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }, { passive: true });
    
    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
        if (isAnimating) return;
        
        switch (e.key) {
            case 'ArrowDown':
            case 'PageDown':
            case ' ':
                e.preventDefault();
                nextSlide();
                break;
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                prevSlide();
                break;
            case 'Home':
                e.preventDefault();
                goToSlide(0);
                break;
            case 'End':
                e.preventDefault();
                goToSlide(totalSlides - 1);
                break;
        }
    });
    
    // Navigation dot clicks
    navDots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const slideIndex = parseInt(dot.dataset.slide);
            goToSlide(slideIndex);
        });
    });
    
    // Nav link clicks
    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const slideIndex = parseInt(link.dataset.slide);
            goToSlide(slideIndex);
        });
    });
    
    // Initial setup
    updateSlideClasses();
    updateNavDots();
    updateProgress();
    updateCounter();
    
    // Start auto-play after initial delay
    setTimeout(() => {
        startAutoPlay();
    }, AUTO_PLAY_DELAY);
    
    // Navbar always visible in cinematic mode
    const nav = document.getElementById('navbar');
    nav.classList.add('bg-neutral-950/80', 'backdrop-blur-md', 'border-b', 'border-neutral-800', 'py-4');
    nav.classList.remove('py-6');
}

// --- CERTIFICATIONS TOGGLE ---
function initCertifications() {
    const toggleBtn = document.getElementById('toggle-certs');
    const moreCerts = document.getElementById('more-certs');
    const chevron = document.getElementById('cert-chevron');
    
    if (toggleBtn && moreCerts && chevron) {
        toggleBtn.addEventListener('click', () => {
            moreCerts.classList.toggle('hidden');
            chevron.style.transform = moreCerts.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
        });
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

    async function sendMessage(text = null) {
        const messageText = text || input.value.trim();
        if (!messageText) return;

        // Disable input while processing
        input.disabled = true;
        sendBtn.disabled = true;

        // Remove any existing quick replies
        const existingQuickReplies = messages.querySelector('.quick-replies');
        if (existingQuickReplies) existingQuickReplies.remove();

        // User Message
        addMessage(messageText, 'user');
        input.value = '';
        
        // Loading
        const loadingDiv = addMessage("", 'model', true);

        try {
            // Smart AI Response (no API needed!)
            const response = await getSmartResponse(messageText);

            // Remove loading and add response
            loadingDiv.remove();
            addMessage(response.text, 'model', false, response.followUp);
        } catch (error) {
            loadingDiv.remove();
            addMessage("Oops! Something went wrong. Please try again.", 'model');
        } finally {
            // Re-enable input
            input.disabled = false;
            sendBtn.disabled = false;
            input.focus();
        }
    }

    function addMessage(text, sender, isLoading = false, followUp = null) {
        const div = document.createElement('div');
        div.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'} flex-col ${sender === 'user' ? 'items-end' : 'items-start'}`;
        
        const loadingHTML = `
            <span class="typing-dot inline-block w-2 h-2 bg-emerald-400 rounded-full mx-0.5"></span>
            <span class="typing-dot inline-block w-2 h-2 bg-emerald-400 rounded-full mx-0.5"></span>
            <span class="typing-dot inline-block w-2 h-2 bg-emerald-400 rounded-full mx-0.5"></span>
        `;
        
        // Format text with markdown-like styling
        const formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
            .replace(/\n/g, '<br>');
        
        div.innerHTML = `
            <div class="max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                sender === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-none' 
                : 'bg-neutral-800 text-neutral-200 rounded-tl-none'
            }">
                ${isLoading ? loadingHTML : formattedText}
            </div>
        `;
        
        messages.appendChild(div);
        
        // Add quick reply buttons if available
        if (followUp && followUp.length > 0 && !isLoading) {
            const quickRepliesDiv = document.createElement('div');
            quickRepliesDiv.className = 'quick-replies flex flex-wrap gap-2 mt-2 max-w-[85%]';
            
            followUp.forEach(suggestion => {
                const btn = document.createElement('button');
                btn.className = 'quick-reply-btn text-xs px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all';
                btn.textContent = suggestion;
                btn.addEventListener('click', () => sendMessage(suggestion));
                quickRepliesDiv.appendChild(btn);
            });
            
            messages.appendChild(quickRepliesDiv);
        }
        
        messages.scrollTop = messages.scrollHeight;
        return div;
    }

    toggleBtn.addEventListener('click', toggle);
    closeBtn.addEventListener('click', toggle);
    sendBtn.addEventListener('click', () => sendMessage());
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

// --- VIBE GENERATOR (Smart Offline Version) ---
const VIBE_TEMPLATES = [
    { keywords: ['ai', 'ml', 'machine learning', 'neural', 'deep learning'], vibe: "Neural Ninja", stack: ["Python", "TensorFlow", "FastAPI", "Docker", "AWS"], desc: "Cutting-edge AI with a focus on scalability and performance. Train models that learn and evolve!" },
    { keywords: ['web', 'website', 'frontend', 'ui', 'landing'], vibe: "Pixel Perfect", stack: ["React", "Tailwind CSS", "Framer Motion", "Vercel"], desc: "Modern, responsive design that captivates users from the first click. Beauty meets functionality!" },
    { keywords: ['data', 'analytics', 'dashboard', 'visualization', 'report'], vibe: "Data Storyteller", stack: ["Python", "Power BI", "SQL", "Pandas", "Plotly"], desc: "Transform raw numbers into compelling narratives. Let the data speak through beautiful visualizations!" },
    { keywords: ['mobile', 'app', 'ios', 'android', 'phone'], vibe: "Mobile Maverick", stack: ["React Native", "Firebase", "Expo", "TypeScript"], desc: "Cross-platform excellence with native performance. One codebase, infinite possibilities!" },
    { keywords: ['automation', 'bot', 'script', 'automate', 'workflow'], vibe: "Automation Architect", stack: ["Python", "Power Automate", "Selenium", "Zapier", "n8n"], desc: "Set it and forget it! Build systems that work while you sleep. Efficiency is the ultimate luxury!" },
    { keywords: ['api', 'backend', 'server', 'database', 'rest'], vibe: "Backend Beast", stack: ["Node.js", "PostgreSQL", "Redis", "Docker", "AWS Lambda"], desc: "Rock-solid infrastructure that scales effortlessly. The foundation that powers great apps!" },
    { keywords: ['game', 'gaming', '3d', 'interactive', 'unity'], vibe: "Game Changer", stack: ["Unity", "C#", "Blender", "Firebase", "Photon"], desc: "Immersive experiences that keep players coming back. Where imagination meets interaction!" },
    { keywords: ['ecommerce', 'shop', 'store', 'selling', 'product'], vibe: "Commerce Catalyst", stack: ["Next.js", "Stripe", "Shopify API", "Tailwind", "Vercel"], desc: "Seamless shopping experiences that convert browsers to buyers. Make every click count!" },
    { keywords: ['social', 'community', 'chat', 'messaging', 'network'], vibe: "Social Spark", stack: ["React", "Socket.io", "MongoDB", "Redis", "AWS"], desc: "Connect people in meaningful ways. Build communities that thrive and engage!" },
    { keywords: ['portfolio', 'personal', 'resume', 'showcase'], vibe: "Personal Brand Pro", stack: ["Next.js", "Tailwind CSS", "Framer Motion", "Vercel"], desc: "Stand out from the crowd! Your digital presence should be as unique as you are!" }
];

const DEFAULT_VIBE = { vibe: "Innovation Explorer", stack: ["Python", "React", "Node.js", "PostgreSQL", "Docker"], desc: "A versatile foundation for bringing any idea to life. Start building, keep iterating, stay creative!" };

function generateVibeResponse(idea) {
    const ideaLower = idea.toLowerCase();
    
    // Find matching template based on keywords
    for (const template of VIBE_TEMPLATES) {
        if (template.keywords.some(keyword => ideaLower.includes(keyword))) {
            // Add some randomization to the stack
            const extraTools = ["GitHub Actions", "Figma", "Notion", "Slack API", "OpenAI API", "Cloudflare"];
            const randomExtra = extraTools[Math.floor(Math.random() * extraTools.length)];
            
            return {
                vibe: template.vibe,
                stack: [...template.stack.slice(0, 4), randomExtra],
                desc: template.desc
            };
        }
    }
    
    return DEFAULT_VIBE;
}

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

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

        try {
            const data = generateVibeResponse(idea);

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

function initEmailModal() {
    const emailBtn = document.getElementById('contact-email-btn');
    const emailModal = document.getElementById('email-modal');
    const closeModalBtn = document.getElementById('close-email-modal');
    const emailForm = document.getElementById('email-form');

    // Open modal
    if (emailBtn) {
        emailBtn.addEventListener('click', () => {
            emailModal.classList.remove('hidden');
        });
    }

    // Close modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            emailModal.classList.add('hidden');
        });
    }

    // Close modal when clicking outside
    emailModal.addEventListener('click', (e) => {
        if (e.target === emailModal) {
            emailModal.classList.add('hidden');
        }
    });

    // Handle form submission
    if (emailForm) {
        emailForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const senderEmail = document.getElementById('sender-email').value;
            const inquiry = document.getElementById('inquiry').value;
            const message = document.getElementById('message').value;
            
            // Create mailto link
            const body = `From: ${senderEmail}\n\n${message}`;
            const mailtoLink = `mailto:jesunushno@gmail.com?subject=${encodeURIComponent(inquiry)}&body=${encodeURIComponent(body)}`;
            
            // Open default email client
            window.location.href = mailtoLink;
            
            // Close modal
            emailForm.reset();
            emailModal.classList.add('hidden');
        });
    }
}
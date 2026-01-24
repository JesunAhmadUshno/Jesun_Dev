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
    lucide.createIcons(); // Initialize Icons
    initCarousel();
    initSpotlight();
    initChat();
    initVibeGenerator();
    initEmailModal();
    initCertifications();
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
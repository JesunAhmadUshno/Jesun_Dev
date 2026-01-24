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

// --- SMART AI RESPONSE SYSTEM (No API needed!) ---
const AI_RESPONSES = {
    greetings: [
        "Hey there! 👋 I'm Jesun's AI twin. Ask me about his work at KPMG, skills, or projects!",
        "Hello! Great to meet you! I'm here to tell you all about Jesun. What would you like to know?",
        "Hi! Welcome to Jesun.Dev! Ask me anything about his experience, skills, or vibe coding style! 🚀"
    ],
    kpmg: [
        "At KPMG, Jesun worked as an IT Advisory Consultant from 2023-2024. He built 20+ Power BI dashboards and automated workflows saving 200+ hours annually! 📊",
        "Jesun's KPMG journey was epic! He conducted ISO 27001 IT audits for banking clients and created data automation solutions. Real enterprise stuff! 💼",
        "During his time at KPMG, Jesun specialized in data infrastructure for banking and healthcare clients. Power BI + Power Automate were his main tools!"
    ],
    skills: [
        "Jesun's stack: Python (TensorFlow, Scikit-learn), SQL, Power BI, Tableau, React, Azure, and Oracle Cloud. Full-stack data wizard! 🧙‍♂️",
        "Skills? Jesun's got: Data Engineering, AI/ML, Process Automation, and of course... Vibe Coding! Check out the About section for more! 💪",
        "Python, SQL, Power BI, React, Azure - Jesun blends engineering precision with creative flair. That's the vibe coding way! ✨"
    ],
    education: [
        "Jesun is pursuing his Master's in Data Analytics at University of Niagara Falls Canada (started Jan 2025). He has a BS in Computer Engineering from AIUB! 🎓",
        "Education: Master's in Data Analytics (current) + BS in Computer Engineering from AIUB, Bangladesh. Academic excellence meets practical skills!",
        "Currently a Master's candidate in Data Analytics! Before that, he completed his Computer Engineering degree at AIUB (2018-2023). 📚"
    ],
    projects: [
        "Jesun has published research on 'Automatic Fabric Defect Detection' using Neural Networks and Wavelet Transforms. He also worked on PSO algorithm optimization! 🔬",
        "Check out his research! Published papers on AI-powered fabric defect detection and global optimization algorithms. Real academic contributions! 📄",
        "Projects include Neural Network research, Power BI dashboards, and this very website! Scroll down to see his Research & Projects section! 🚀"
    ],
    contact: [
        "Want to connect? Hit the 'Let's Talk' button or check out the Contact section below! Jesun's open to opportunities in Toronto! 📧",
        "Best way to reach Jesun: LinkedIn (linkedin.com/in/jesunahmadushno) or schedule a call via Calendly! He's actively looking for Data & AI roles! 🤝",
        "Jesun's based in Toronto and open to work! Use the contact form below or connect on LinkedIn. Let's vibe! ✨"
    ],
    vibe: [
        "Vibe Coding = Engineering precision + Creative flair! It's not just writing code; it's crafting experiences that feel as good as they look! ✨",
        "The 'Vibe Coder' philosophy: Make it work, make it beautiful, make it memorable. That's Jesun's approach to every project! 🎨",
        "Vibe Coding is about passion meeting precision. Whether it's a dashboard or an AI model, Jesun makes sure it has that special touch! 🚀"
    ],
    location: [
        "Jesun is currently based in Toronto, Ontario, Canada! Open to work and ready for exciting Data & AI opportunities! 🍁",
        "Location: Toronto, ON. Originally from Bangladesh, now pursuing his Master's and building the future in Canada! 🌍",
        "Toronto is home now! Jesun moved to Canada for his Master's program and is actively seeking Data Analytics roles! 📍"
    ],
    default: [
        "Great question! Jesun specializes in Data Analytics, AI/ML, and Vibe Coding. Try asking about his KPMG experience or skills! 💡",
        "I'd love to help! Ask me about Jesun's education, projects, skills, or work at KPMG. I know a lot about him! 😊",
        "Hmm, let me think... Try asking about Jesun's experience, skills, research, or what 'Vibe Coding' means! I've got answers! 🤔",
        "Not sure about that one! But I can tell you all about Jesun's KPMG journey, his Master's program, or his tech stack. What interests you?"
    ]
};

function getSmartResponse(message) {
    const msg = message.toLowerCase();
    
    // Simulate typing delay (300-800ms)
    const delay = 300 + Math.random() * 500;
    
    return new Promise(resolve => {
        setTimeout(() => {
            let category = 'default';
            
            // Keyword matching
            if (msg.match(/\b(hi|hello|hey|greetings|sup|yo)\b/)) {
                category = 'greetings';
            } else if (msg.match(/\b(kpmg|consultant|advisory|audit|banking|healthcare)\b/)) {
                category = 'kpmg';
            } else if (msg.match(/\b(skill|stack|python|sql|power bi|tableau|react|azure|tensorflow|tool|technology|tech)\b/)) {
                category = 'skills';
            } else if (msg.match(/\b(education|study|master|degree|university|school|aiub|niagara|college)\b/)) {
                category = 'education';
            } else if (msg.match(/\b(project|research|paper|fabric|defect|neural|wavelet|pso|publication)\b/)) {
                category = 'projects';
            } else if (msg.match(/\b(contact|email|reach|hire|job|opportunity|connect|linkedin|calendly)\b/)) {
                category = 'contact';
            } else if (msg.match(/\b(vibe|coding style|philosophy|approach|creative)\b/)) {
                category = 'vibe';
            } else if (msg.match(/\b(location|where|live|based|city|toronto|canada|country)\b/)) {
                category = 'location';
            } else if (msg.match(/\b(experience|work|job|career|professional)\b/)) {
                category = 'kpmg';
            } else if (msg.match(/\b(who|about|tell me|introduce|yourself|jesun)\b/)) {
                category = 'greetings';
            }
            
            // Get random response from category
            const responses = AI_RESPONSES[category];
            const response = responses[Math.floor(Math.random() * responses.length)];
            
            resolve(response);
        }, delay);
    });
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons(); // Initialize Icons
    initCarousel();
    initSpotlight();
    initChat();
    initVibeGenerator();
    initEmailModal();
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

        // Disable input while processing
        input.disabled = true;
        sendBtn.disabled = true;

        // User Message
        addMessage(text, 'user');
        input.value = '';
        
        // Loading
        const loadingDiv = addMessage("Thinking...", 'model', true);

        try {
            // Smart AI Response (no API needed!)
            const response = await getSmartResponse(text);

            // Remove loading and add response
            loadingDiv.remove();
            addMessage(response, 'model');
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

    function addMessage(text, sender, isLoading = false) {
        const div = document.createElement('div');
        div.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;
        
        const loadingHTML = `
            <span class="typing-dot inline-block w-2 h-2 bg-emerald-400 rounded-full mx-0.5"></span>
            <span class="typing-dot inline-block w-2 h-2 bg-emerald-400 rounded-full mx-0.5"></span>
            <span class="typing-dot inline-block w-2 h-2 bg-emerald-400 rounded-full mx-0.5"></span>
        `;
        
        div.innerHTML = `
            <div class="max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                sender === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-none' 
                : 'bg-neutral-800 text-neutral-200 rounded-tl-none'
            }">
                ${isLoading ? loadingHTML : text}
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
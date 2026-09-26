/* Jesun.Dev AI twin knowledge base.
 * Built ONLY from real, published site content: bio, stack, projects,
 * team, Jesun.Code, papers, writing, community, contact.
 * Each entry: id, keys (match keywords), a: {en, bn} answers.
 * Nothing here is invented. Loaded by twin.js (browser) or required (node).
 */
(function (root) {
  'use strict';

  var TWIN_DATA = {
    greeting: {
      en: "Hello. I am Jesun's guided twin: rule-based Q&A over this site's data, not a live language model. Ask about his work, stack, papers, projects, or how to reach him.",
      bn: "হ্যালো। আমি জেসুনের গাইডেড টুইন: এই সাইটের ডেটার উপর রুল-বেসড প্রশ্নোত্তর, লাইভ ল্যাঙ্গুয়েজ মডেল নই। তার কাজ, স্ট্যাক, পেপার, প্রজেক্ট বা যোগাযোগের উপায় সম্পর্কে জিজ্ঞেস করো।"
    },
    fallback: {
      en: "That is outside my site data. I only answer from what is published on this site. Try asking about his work, stack, papers, or projects, or reach him at jesunahmadushno@gmail.com.",
      bn: "এটা আমার সাইট ডেটার বাইরে। আমি শুধু এই সাইটে যা প্রকাশিত তা থেকে উত্তর দিই। তার কাজ, স্ট্যাক, পেপার বা প্রজেক্ট সম্পর্কে জিজ্ঞেস করে দেখো, বা jesunahmadushno@gmail.com-এ যোগাযোগ করো।"
    },
    chips: [
      { en: "What is Jesun.Code?", bn: "Jesun.Code কী?", q: "What is Jesun.Code?" },
      { en: "His stack?", bn: "তার স্ট্যাক?", q: "What is his tech stack?" },
      { en: "His papers?", bn: "তার পেপার?", q: "Tell me about his research papers" },
      { en: "Contact", bn: "যোগাযোগ", q: "How do I contact him?" },
      { en: "Hire him?", bn: "তাকে হায়ার করা যাবে?", q: "Can I hire him?" }
    ],
    entries: [
      {
        id: "greeting",
        keys: ["hello", "hi", "hey", "yo", "salam", "salaam", "assalamu alaikum", "adab", "good morning", "good evening", "namaste", "greetings"],
        a: {
          en: "Hello. I am Jesun's guided twin: rule-based Q&A over this site's data, not a live language model. Ask about his work, stack, papers, projects, or how to reach him.",
          bn: "হ্যালো। আমি জেসুনের গাইডেড টুইন: এই সাইটের ডেটার উপর রুল-বেসড প্রশ্নোত্তর, লাইভ ল্যাঙ্গুয়েজ মডেল নই। তার কাজ, স্ট্যাক, পেপার, প্রজেক্ট বা যোগাযোগের উপায় সম্পর্কে জিজ্ঞেস করো।"
        }
      },
      {
        id: "who",
        keys: ["who is jesun", "who are you", "জেসুন", "about", "yourself", "bio", "introduction", "who is he", "jesun ahmad ushno", "twin"],
        a: {
          en: "Jesun Ahmad Ushno is a Toronto-based AI engineer and data specialist. He works at Gallea Ai on applied ML and RAG pipelines, runs the 49-seat autonomous AI crew Jesun.Ai, and built Jesun.Code, a programming language that reads like plain English. MSc Data Analytics, University of Niagara Falls Canada (2026), graduated with distinction.",
          bn: "জেসুন আহমদ উষ্ণো টরন্টোভিত্তিক একজন AI ইঞ্জিনিয়ার ও ডেটা স্পেশালিস্ট। তিনি Gallea Ai-তে অ্যাপ্লাইড ML ও RAG পাইপলাইন নিয়ে কাজ করেন, ৪৯ সিটের স্বয়ংক্রিয় AI ক্রু Jesun.Ai চালান, আর বানিয়েছেন Jesun.Code, প্লেইন ইংরেজির মতো পড়া যায় এমন প্রোগ্রামিং ভাষা। MSc Data Analytics, University of Niagara Falls Canada (২০২৬), ডিসটিংকশনসহ স্নাতক।"
        }
      },
      {
        id: "jesun-code",
        keys: ["jesun.code", "jesun code", "programming language", "language", "plain english", "playground", "jpm", "v0.6", "self-hosting", "self hosting", "interpreter", "catchphrase"],
        a: {
          en: "Jesun.Code is a programming language that reads like plain English: no semicolons, no braces, plain-English errors with line numbers. It ships as a single binary, runs the whole Python ecosystem via import, and includes a package manager (jpm), AI agent fleets, and tmux control. v0.6.0 runs 220/220 tests green; self-hosting is the v1.0 milestone. You can run it live in the playground section of this site.",
          bn: "Jesun.Code একটি প্রোগ্রামিং ভাষা যা প্লেইন ইংরেজির মতো পড়া যায়: সেমিকোলন নেই, ব্রেস নেই, লাইন নম্বরসহ প্লেইন-ইংরেজি এরর। এটি সিঙ্গেল বাইনারি হিসেবে শিপ হয়, import দিয়ে পুরো Python ইকোসিস্টেম চালায়, আর আছে প্যাকেজ ম্যানেজার (jpm), AI এজেন্ট ফ্লিট ও tmux কন্ট্রোল। v0.6.0-তে ২২০/২২০ টেস্ট সবুজ; সেলফ-হোস্টিং হলো v1.0 মাইলস্টোন। এই সাইটের প্লেগ্রাউন্ড সেকশনে এটি লাইভ চালাতে পারো।"
        }
      },
      {
        id: "stack",
        keys: ["stack", "technologies", "technology", "tools", "tech stack", "languages", "programming", "python", "typescript", "toolchain", "uses", "framework", "স্ট্যাক"],
        a: {
          en: "His stack: Python, TypeScript, SQL, Java; Flask, FastAPI, React, Next.js, Vite, Tailwind; Pandas, NumPy, SciPy, scikit-learn, TensorFlow, Pyodide, Power BI, Tableau; GCP (primary), Azure, OCI, AWS; plus Power Platform, WebRTC, WebCrypto, and WASM. There is a full uses page on this site.",
          bn: "তার স্ট্যাক: Python, TypeScript, SQL, Java; Flask, FastAPI, React, Next.js, Vite, Tailwind; Pandas, NumPy, SciPy, scikit-learn, TensorFlow, Pyodide, Power BI, Tableau; GCP (প্রাইমারি), Azure, OCI, AWS; সাথে Power Platform, WebRTC, WebCrypto ও WASM। এই সাইটে একটি পূর্ণ uses পেজ আছে।"
        }
      },
      {
        id: "projects",
        keys: ["projects", "project", "portfolio", "built", "prism", "nopara", "sonicclear", "bigfish", "tridrop", "side project", "apps", "case study"],
        a: {
          en: "Selected projects: PRISM (zero-trust browser data analytics), NoPara (100% private media converter), SonicClear (AI audio enhancement), BigFish (autonomous sports betting predictive terminal), TriDrop (peer-to-peer file sharing over WebRTC), and Jesun.Code (a plain-English programming language). Case studies live on the project pages.",
          bn: "বাছাই করা প্রজেক্ট: PRISM (জিরো-ট্রাস্ট ব্রাউজার ডেটা অ্যানালিটিক্স), NoPara (১০০% প্রাইভেট মিডিয়া কনভার্টার), SonicClear (AI অডিও এনহান্সমেন্ট), BigFish (স্বয়ংক্রিয় স্পোর্টস বেটিং প্রেডিক্টিভ টার্মিনাল), TriDrop (WebRTC-তে পিয়ার-টু-পিয়ার ফাইল শেয়ারিং), আর Jesun.Code (প্লেইন-ইংরেজি প্রোগ্রামিং ভাষা)। কেস স্টাডি প্রজেক্ট পেজগুলোতে আছে।"
        }
      },
      {
        id: "papers",
        keys: ["paper", "papers", "research", "published", "publication", "defect", "pso", "wavelet", "aip", "fabric", "particle swarm"],
        a: {
          en: "Two published ML papers, both in AIP Conference Proceedings (2023): wavelet transform plus neural networks for fabric defect detection (https://doi.org/10.13140/RG.2.2.10516.99203), and elitist particle swarm optimization with mutation and adaptive inertia (https://doi.org/10.1063/5.0148658).",
          bn: "দুটি প্রকাশিত ML পেপার, দুটোই AIP Conference Proceedings (২০২৩): ফ্যাব্রিক ডিফেক্ট ডিটেকশনে ওয়েভলেট ট্রান্সফর্ম ও নিউরাল নেটওয়ার্ক (https://doi.org/10.13140/RG.2.2.10516.99203), আর মিউটেশন ও অ্যাডাপ্টিভ ইনারশিয়াসহ এলিটিস্ট পার্টিকল সোয়ার্ম অপটিমাইজেশন (https://doi.org/10.1063/5.0148658)।"
        }
      },
      {
        id: "education",
        keys: ["education", "degree", "msc", "masters", "university", "study", "studied", "cgpa", "distinction", "college", "graduate", "niagara"],
        a: {
          en: "MSc in Data Analytics, University of Niagara Falls Canada, conferred June 2026, graduated with distinction. Earlier: BSc in Computer Engineering, AIUB (2018 to 2023).",
          bn: "MSc in Data Analytics, University of Niagara Falls Canada, জুন ২০২৬-এ কনফার্ড, ডিসটিংকশনসহ স্নাতক। আগে: BSc in Computer Engineering, AIUB (২০১৮ থেকে ২০২৩)।"
        }
      },
      {
        id: "experience",
        keys: ["experience", "work", "job", "kpmg", "gallea", "career", "consultant", "consulting", "employed", "advisory", "work history"],
        a: {
          en: "He is an AI Engineer and Data Specialist at Gallea Ai in Toronto (since Aug 2026): applied ML, RAG pipelines, data pipelines, 4,200+ records crawled, cleaned and sealed, 500+ buyer-query simulations, pipeline pass rate restored from 72.7% to 95%+. Before that: IT Advisory at KPMG Bangladesh (Apr 2023 to Nov 2024), with 20+ Power Automate workflows, 20+ Power BI dashboards, and 5+ ISO 27001 audits across banking and healthcare.",
          bn: "তিনি টরন্টোতে Gallea Ai-তে AI ইঞ্জিনিয়ার ও ডেটা স্পেশালিস্ট (আগস্ট ২০২৬ থেকে): অ্যাপ্লাইড ML, RAG পাইপলাইন, ডেটা পাইপলাইন, ৪,২০০+ রেকর্ড ক্রল, ক্লিন ও সিল করা, ৫০০+ বায়ার-কোয়েরি সিমুলেশন, পাইপলাইন পাস রেট ৭২.৭% থেকে ৯৫%+-এ ফেরানো। তার আগে: KPMG Bangladesh-এ IT Advisory (এপ্রিল ২০২৩ থেকে নভেম্বর ২০২৪), ২০+ Power Automate ওয়ার্কফ্লো, ২০+ Power BI ড্যাশবোর্ড, ব্যাংকিং ও হেলথকেয়ারে ৫+ ISO 27001 অডিট।"
        }
      },
      {
        id: "team",
        keys: ["team", "crew", "jesun.ai", "49", "seats", "company", "organization", "org", "employees", "founder"],
        a: {
          en: "Jesun.Ai is his company, founded September 2026, run as a 49-seat autonomous AI crew across three entities: Personal Socials (10 platform managers), Jesun.Ai (29 seats across engineering, data, design, growth), and Jesun.Code (6 seats). He is founder, CEO, and sole owner.",
          bn: "Jesun.Ai তার কোম্পানি, সেপ্টেম্বর ২০২৬-এ প্রতিষ্ঠিত, ৪৯ সিটের স্বয়ংক্রিয় AI ক্রু হিসেবে তিনটি এনটিটিতে চলে: Personal Socials (১০ প্ল্যাটফর্ম ম্যানেজার), Jesun.Ai (ইঞ্জিনিয়ারিং, ডেটা, ডিজাইন, গ্রোথে ২৯ সিট), আর Jesun.Code (৬ সিট)। তিনি প্রতিষ্ঠাতা, CEO ও একমাত্র মালিক।"
        }
      },
      {
        id: "contact",
        keys: ["contact", "email", "reach", "linkedin", "github", "phone", "message", "social", "profile", "যোগাযোগ", "ইমেইল"],
        a: {
          en: "Email: jesunahmadushno@gmail.com. LinkedIn: linkedin.com/in/jesunahmadushno. GitHub: github.com/JesunAhmadUshno. He is based in Toronto and open to full-time roles, freelance collaborations, and interesting problems.",
          bn: "ইমেইল: jesunahmadushno@gmail.com। LinkedIn: linkedin.com/in/jesunahmadushno। GitHub: github.com/JesunAhmadUshno। তিনি টরন্টোতে থাকেন; ফুল-টাইম রোল, ফ্রিল্যান্স কাজ ও মজার সমস্যার জন্য উন্মুক্ত।"
        }
      },
      {
        id: "hire",
        keys: ["hire", "hiring", "freelance", "available", "contract", "role", "position", "opening", "work with", "collaborate", "collaboration", "হায়ার"],
        a: {
          en: "He is open to full-time roles, freelance collaborations, and interesting problems. Best next step: email jesunahmadushno@gmail.com or book 30 minutes at calendly.com/jesunahmadushno/30min.",
          bn: "তিনি ফুল-টাইম রোল, ফ্রিল্যান্স কাজ ও মজার সমস্যার জন্য উন্মুক্ত। পরের ধাপ: jesunahmadushno@gmail.com-এ ইমেইল করো বা calendly.com/jesunahmadushno/30min-এ ৩০ মিনিট বুক করো।"
        }
      },
      {
        id: "writing",
        keys: ["writing", "writings", "blog", "medium", "essay", "article", "writes", "read", "firewall"],
        a: {
          en: "His essays live on Medium at @jesunahmadushno, including 'Beyond the Firewall: How Data-Driven Six Sigma is Quietly Solving the Multi-Billion Dollar Problem' (Nov 12, 2025). The writing section of this site loads his latest posts.",
          bn: "তার প্রবন্ধ Medium-এ @jesunahmadushno-তে, যার মধ্যে আছে 'Beyond the Firewall: How Data-Driven Six Sigma is Quietly Solving the Multi-Billion Dollar Problem' (১২ নভেম্বর, ২০২৫)। এই সাইটের writing সেকশনে তার সর্বশেষ পোস্ট লোড হয়।"
        }
      },
      {
        id: "community",
        keys: ["community", "gdg", "google developer", "coordinator", "volunteer", "campus"],
        a: {
          en: "He is the Social Media Coordinator for GDG on Campus at the University of Niagara Falls, a role he has held since September 2025.",
          bn: "তিনি University of Niagara Falls-এ GDG on Campus-এর সোশ্যাল মিডিয়া কো-অর্ডিনেটর, সেপ্টেম্বর ২০২৫ থেকে এই ভূমিকায় আছেন।"
        }
      },
      {
        id: "mias",
        keys: ["mias", "foundation", "humanitarian", "charity", "flood", "relief", "ngo", "co-founder", "cofounder"],
        a: {
          en: "He co-founded the MIAS Foundation (2018 to 2024), a humanitarian organization that reached 50,000+ families, ran flood relief operations worth 10+ lac BDT, and supported education for 5,000 children.",
          bn: "তিনি MIAS Foundation-এর সহ-প্রতিষ্ঠাতা (২০১৮ থেকে ২০২৪), একটি মানবিক সংস্থা যা ৫০,০০০+ পরিবারের কাছে পৌঁছেছে, ১০+ লাখ BDT-এর বন্যা ত্রাণ চালিয়েছে, আর ৫,০০০ শিশুর শিক্ষায় সহায়তা করেছে।"
        }
      },
      {
        id: "location",
        keys: ["where", "based", "live", "toronto", "location", "city", "country"],
        a: {
          en: "He is based in Toronto, Ontario, Canada.",
          bn: "তিনি টরন্টো, অন্টারিও, কানাডায় থাকেন।"
        }
      },
      {
        id: "resume",
        keys: ["resume", "cv", "curriculum"],
        a: {
          en: "His resume is linked as a PDF from the contact section of this site.",
          bn: "এই সাইটের contact সেকশন থেকে তার রেজুমে PDF হিসেবে লিংক করা আছে।"
        }
      },
      {
        id: "book",
        keys: ["book", "author", "published book"],
        a: {
          en: "No book is listed here: only verified items make the reading list, and the book title is not publicly verified yet. The list covers his two AIP papers and his Medium essay.",
          bn: "এখানে কোনো বই তালিকাভুক্ত নেই: reading list-এ শুধু যাচাইকৃত আইটেম থাকে, আর বইয়ের শিরোনাম এখনো প্রকাশ্যে যাচাই হয়নি। তালিকায় তার দুটি AIP পেপার ও Medium প্রবন্ধ আছে।"
        }
      },
      {
        id: "call",
        keys: ["call", "calendly", "book", "meeting", "schedule", "30 min", "chat", "talk", "book a call", "book 30 minutes", "schedule a call", "book a meeting"],
        a: {
          en: "You can book 30 minutes with him at calendly.com/jesunahmadushno/30min, or email jesunahmadushno@gmail.com.",
          bn: "calendly.com/jesunahmadushno/30min-এ তার সাথে ৩০ মিনিট বুক করতে পারো, বা jesunahmadushno@gmail.com-এ ইমেইল করো।"
        }
      },
      {
        id: "privacy",
        keys: ["privacy", "private", "local", "bytes", "data privacy", "tracking", "secure"],
        a: {
          en: "Privacy is a design constraint for him: 'no bytes ever leave your machine.' His tools PRISM and NoPara run fully in the browser for exactly that reason.",
          bn: "প্রাইভেসি তার কাছে ডিজাইন কনস্ট্রেইন্ট: 'no bytes ever leave your machine.' ঠিক এই কারণে তার PRISM ও NoPara টুল পুরোপুরি ব্রাউজারে চলে।"
        }
      },
      {
        id: "aimodel",
        keys: ["are you ai", "language model", "llm", "gemini", "gpt", "how do you work", "real ai", "do you think", "reasoning", "smart", "intelligent", "model"],
        a: {
          en: "Honest answer: I am not a live language model. I am guided Q&A: your question is matched by keywords against answers written from this site's data, right here in your browser. Nothing is sent anywhere, and I cannot reason beyond these answers.",
          bn: "সৎ উত্তর: আমি লাইভ ল্যাঙ্গুয়েজ মডেল নই। আমি গাইডেড প্রশ্নোত্তর: তোমার প্রশ্ন কীওয়ার্ড দিয়ে এই সাইটের ডেটা থেকে লেখা উত্তরের সাথে মেলানো হয়, ঠিক তোমার ব্রাউজারেই। কোথাও কিছু পাঠানো হয় না, আর এই উত্তরগুলোর বাইরে আমি যুক্তি করতে পারি না।"
        }
      }
    ]
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TWIN_DATA;
  } else {
    root.TWIN_DATA = TWIN_DATA;
  }
})(typeof window !== 'undefined' ? window : this);

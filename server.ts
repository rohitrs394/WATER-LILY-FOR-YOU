import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { AppState, Booking, SpaService, Therapist, DailyOffer, SpaLocation } from "./src/types";

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

// Helper to write default DB
const getInitialState = (): AppState => ({
  services: [
    // NORMAL MASSAGES
    {
      id: "1",
      name: "Swedish Massage",
      category: "Normal",
      price: 999,
      duration: 60,
      description: "A classic full-body massage utilizing long, flowing strokes to reduce tension, promote circulation, and ease muscle soreness. Perfect for first-time spa visitors seeking total relaxation.",
      image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=600",
      isPrivate: true,
      available: true
    },
    {
      id: "2",
      name: "Deep Tissue Massage",
      category: "Normal",
      price: 1499,
      duration: 60,
      description: "Designed to relieve severe tension in the muscle and connective tissue. Highly recommended for individuals with chronic pain, athletic stiffness, or heavy stress.",
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=600",
      isPrivate: true,
      available: true
    },
    {
      id: "3",
      name: "Aromatherapy Massage",
      category: "Normal",
      price: 1799,
      duration: 60,
      description: "Combines the therapeutic power of touch with pure organic essential oils curated to calm your mind, elevate your mood, and heal physical discomfort.",
      image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=600",
      isPrivate: true,
      available: true
    },
    {
      id: "4",
      name: "Hot Stone Massage",
      category: "Normal",
      price: 1999,
      duration: 75,
      description: "Heated, smooth basalt stones are placed on key energy points of the body, melting away stress and allowing deep muscle manipulation and ultimate soothing warmth.",
      image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=600",
      isPrivate: true,
      available: true
    },
    {
      id: "5",
      name: "Thai Massage",
      category: "Normal",
      price: 2199,
      duration: 60,
      description: "An interactive, dry therapy involving rhythmic compression, acupressure, and assisted yoga-like stretching. Energizes the body, improves flexibility, and clears energy blocks.",
      image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=600",
      isPrivate: true,
      available: true
    },
    {
      id: "6",
      name: "Reflexology",
      category: "Normal",
      price: 1299,
      duration: 45,
      description: "Focused pressure on precise reflex zones of the feet corresponding to vital organs. Restores natural energy flow, reduces anxiety, and enhances body-wide wellness.",
      image: "https://images.unsplash.com/photo-1519824141121-b9767426e021?auto=format&fit=crop&q=80&w=600",
      isPrivate: true,
      available: true
    },
    {
      id: "7",
      name: "Sports Massage",
      category: "Normal",
      price: 2499,
      duration: 60,
      description: "Geared toward active individuals. Focuses on preventing injuries, improving flexibility, and accelerating recovery times using targeted trigger point therapy.",
      image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=600",
      isPrivate: true,
      available: true
    },
    {
      id: "8",
      name: "Lymphatic Drainage",
      category: "Normal",
      price: 2799,
      duration: 60,
      description: "A gentle, rhythmic massage that stimulates lymph fluid movement. Highly effective for reducing bloating, boosting immunity, and helping detoxify the body naturally.",
      image: "https://images.unsplash.com/photo-1552693673-1bf9582f6fc3?auto=format&fit=crop&q=80&w=600",
      isPrivate: true,
      available: true
    },
    {
      id: "9",
      name: "Balinese Massage",
      category: "Normal",
      price: 2999,
      duration: 75,
      description: "A holistic deep-tissue therapy utilizing acupressure, skin rolling, and aromatherapy oils to bring a profound sense of peace and relaxation.",
      image: "https://images.unsplash.com/photo-1537861295351-7649622d1031?auto=format&fit=crop&q=80&w=600",
      isPrivate: true,
      available: true
    },
    {
      id: "10",
      name: "Couples Massage",
      category: "Normal",
      price: 3500,
      duration: 90,
      description: "Share the gift of blissful relaxation side-by-side in our private premium suite with dual therapists. Custom tailored to each partner's unique preferences.",
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600",
      isPrivate: true,
      available: true
    },

    // LUXURY MASSAGES
    {
      id: "11",
      name: "Royal Gold Massage",
      category: "Luxury",
      price: 3500,
      duration: 90,
      description: "A majestic treatment featuring real gold-infused luxury oils. Revitalizes skin luminosity, relaxes deep muscle layers, and leaves you feeling like royalty.",
      image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=600",
      isPrivate: true,
      available: true
    },
    {
      id: "12",
      name: "Diamond Pearl Therapy",
      category: "Luxury",
      price: 4999,
      duration: 90,
      description: "An exquisite skin-polishing and tension-release ritual utilizing crushed pearl extract and diamond dust oils for unparalleled dermal radiance and peace.",
      image: "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?auto=format&fit=crop&q=80&w=600",
      isPrivate: true,
      available: true
    },
    {
      id: "13",
      name: "24K Gold Facial Massage",
      category: "Luxury",
      price: 5999,
      duration: 75,
      description: "Ultimate skin luxury. Combines facial acupressure with a 24-karat gold leaf mask to boost collagen, eliminate fine lines, and hydrate deeply.",
      image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600",
      isPrivate: true,
      available: true
    },
    {
      id: "14",
      name: "Royal Couples Retreat",
      category: "Luxury",
      price: 7499,
      duration: 120,
      description: "The ultimate dual indulgence. Includes a gold body wrap, deep tissue hot-stone massage, custom facial, and a private warm herbal bath experience.",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600",
      isPrivate: true,
      available: true
    },
    {
      id: "15",
      name: "Platinum Body Scrub",
      category: "Luxury",
      price: 8999,
      duration: 90,
      description: "High-end body exfoliation using premium sea salt, platinum peptides, and rare organic essential botanical nectars for baby-soft skin texture.",
      image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600",
      isPrivate: true,
      available: true
    },
    {
      id: "16",
      name: "Royal Thai Herbal",
      category: "Luxury",
      price: 9999,
      duration: 90,
      description: "A deep therapeutic massage utilizing rare, hot herbal compresses filled with Thai therapeutic botanicals, paired with royal oil stretching techniques.",
      image: "https://images.unsplash.com/photo-1600334188221-3dfbec243d54?auto=format&fit=crop&q=80&w=600",
      isPrivate: true,
      available: true
    },
    {
      id: "17",
      name: "Diamond Bliss Package",
      category: "Luxury",
      price: 12499,
      duration: 120,
      description: "A signature experience. Immersive sound therapy, dual-therapist massage with micro-pearl serums, followed by a pure gold leaf full body lotion treatment.",
      image: "https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?auto=format&fit=crop&q=80&w=600",
      isPrivate: true,
      available: true
    },
    {
      id: "18",
      name: "Royal Spa Package",
      category: "Luxury",
      price: 15999,
      duration: 150,
      description: "Full-body premium purification. Steam bath, Himalayan pink salt scrub, luxury facial, signature hot-stone massage, and fresh botanical mocktails served.",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600",
      isPrivate: true,
      available: true
    },
    {
      id: "19",
      name: "Platinum Royal Experience",
      category: "Luxury",
      price: 18499,
      duration: 150,
      description: "Conducted inside our private imperial VIP suite. Private sauna session, premium full body exfoliation, custom anti-aging facial, and intensive four-hand massage.",
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600",
      isPrivate: true,
      available: true
    },
    {
      id: "20",
      name: "Crown Jewel Ultimate",
      category: "Luxury",
      price: 20000,
      duration: 180,
      description: "The peak of luxury wellness. Fully customizable 3-hour journey combining customized hot oil massage, collagen booster facial, hand & foot therapy, and champagne/tea.",
      image: "https://images.unsplash.com/photo-1489659639091-8b687bc4386e?auto=format&fit=crop&q=80&w=600",
      isPrivate: true,
      available: true
    }
  ],
  therapists: [
    {
      id: "t1",
      name: "Maya Sharma",
      specialization: "Royal Gold & Swedish Massage",
      experience: "6 Years",
      rating: 4.9,
      images: [
        "https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&q=80&w=300",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300"
      ],
      visible: true
    },
    {
      id: "t2",
      name: "Priya Patel",
      specialization: "Diamond Pearl & Aromatherapy",
      experience: "5 Years",
      rating: 4.8,
      images: [
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300"
      ],
      visible: true
    },
    {
      id: "t3",
      name: "Anjali Sen",
      specialization: "Thai Massage & 24K Gold Facial",
      experience: "7 Years",
      rating: 5.0,
      images: [
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
        "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=300"
      ],
      visible: true
    }
  ],
  offers: [
    {
      id: "o1",
      title: "Royal Welcome Special",
      discountDescription: "Flat 20% OFF on all Luxury services. Experience premium rejuvenation.",
      duration: "Expires tonight at 10 PM",
      animationEffect: "gold-glow",
      active: true,
      bannerHomepage: true,
      scheduleFuture: "",
      autoShowOnLoad: true
    }
  ],
  bookings: [
    {
      id: "b1",
      name: "Rohan Roy",
      phone: "+91 98765 43210",
      spaLocation: "Drop Spa",
      serviceName: "Swedish Massage",
      dateTime: "2026-07-03T14:00",
      specialRequests: "Please arrange a quiet corner room",
      status: "Confirmed",
      assignedTherapistId: "t1",
      createdAt: new Date().toISOString()
    }
  ],
  locations: [
    {
      id: "drop",
      name: "Drop Spa",
      address: "Drop Spa - Best Massage Parlour in DumDum, 1st Floor, 66/2, Dum Dum Rd, Ward Number 22, Amarpalli, Kolkata, West Bengal 700074",
      phoneNumbers: ["+91 98307 93242"],
      mapEmbedUrl: "https://maps.google.com/maps?q=Drop%20Spa%20Dum%20Dum%20Kolkata&t=&z=15&ie=UTF8&iwloc=&output=embed",
      visible: true
    },
    {
      id: "moon",
      name: "Moon Flower Spa",
      address: "Moon Flower Spa - Best Spa in Nager Bazar, 1st Floor P, 345, Jessore Rd, near UCO Bank, Dhopa Patty, Nagerbazar, DumDum, Kolkata, West Bengal 700074",
      phoneNumbers: ["+91 81003 11604", "+91 98744 65122"],
      mapEmbedUrl: "https://maps.google.com/maps?q=Moon%20Flower%20Spa%20Jessore%20Road%20Kolkata&t=&z=15&ie=UTF8&iwloc=&output=embed",
      visible: true
    },
    {
      id: "waterlilly",
      name: "The Waterlilly Spa",
      address: "The Waterlilly Spa, 3RD Floor, Aminia Building, 166, Jessore Rd, beside DIAMOND PLAZA, Ward Number 23, Nagerbazar, Dumdum, Kolkata, West Bengal 700055",
      phoneNumbers: ["+91 91635 78888", "+91 62897 43248"],
      mapEmbedUrl: "https://maps.google.com/maps?q=The%20Waterlilly%20Spa%20Diamond%20Plaza%20Kolkata&t=&z=15&ie=UTF8&iwloc=&output=embed",
      visible: true
    }
  ],
  content: {
    heroTitle: "ROYAL INDULGENCE FOR SOUL & SENSES",
    heroSubtitle: "Step into an oasis of pure serenity. Experiencing premium 5-star therapies in DumDum, Kolkata.",
    aboutText: "Welcome to Kolkata's ultimate luxury spa chain. Across our three premium locations in DumDum and Jessore Road, we specialize in high-end massage therapies, restorative facials, and wellness scrubs. Our certified female therapists combine international expertise with ancient oils to deliver an incomparable state of bliss.",
    galleryImages: [
      "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1537861295351-7649622d1031?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800"
    ],
    testimonials: [
      { name: "Debashree Sen", comment: "The Royal Gold Massage is an absolute masterpiece. I went to the Moon Flower Spa and it is exceptionally luxurious. Highly recommended!", rating: 5, date: "2026-06-15" },
      { name: "Rahul Das", comment: "The therapist was incredibly professional. Drop Spa has the perfect ambient lighting and absolute peace. No rush, pure bliss.", rating: 5, date: "2026-06-28" },
      { name: "Sreemoyee Dey", comment: "The Waterlilly Spa beside Diamond Plaza is beautifully designed. The voice chatbot on the site was also very helpful in booking!", rating: 5, date: "2026-07-01" }
    ],
    faqs: [
      { question: "What is the private service tag represent?", answer: "All our therapies are conducted in 100% private sound-isolated chambers styled with luxurious candles, private ambient lights, and attached showers." },
      { question: "Do you have certified female therapists?", answer: "Yes, 100% of our therapy staff consists of certified professional female therapists with over 5+ years of training in local and international treatments." },
      { question: "Can I customize my session?", answer: "Absolutely. You can select specific massage oils, pressure intensities, hot stone options, or request special aromatics in the booking form or on arrival." }
    ],
    backgroundVideoUrl: "https://player.cloudinary.com/embed/?cloud_name=tbpxcezd&public_id=From_Klickpin.com-_75_Fresh_Instagram_Growth_Tips_for_Everyday-pin-id-1128644356638366738_tajian&autoplay=1&loop=1&muted=1&controls=0",
    sectionVideoUrl: "https://res.cloudinary.com/kyyl8tuj/video/upload/v1783032912/Water_Lilly_Spa_Website_202607030424_adcvqo.mp4"
  },
  apiSettings: {
    provider: "none",
    deepseekKey: "",
    openaiKey: "",
    grokKey: "",
    kimiKey: "",
    geminiKey: "",
    deepseekModel: "deepseek-chat",
    openaiModel: "gpt-4o-mini",
    grokModel: "grok-2-1212",
    kimiModel: "moonshot-v1-8k",
    geminiModel: "gemini-1.5-flash",
    responseTimeout: 15,
    verified: false
  }
});

// Load DB
function loadDb(): AppState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(data);
      
      // Ensure apiSettings has all the keys (retro-compatibility)
      const defaultState = getInitialState();
      parsed.apiSettings = {
        ...defaultState.apiSettings,
        ...(parsed.apiSettings || {})
      };
      
      return parsed;
    }
  } catch (err) {
    console.error("Error reading database file, using fallback initial state.", err);
  }
  const defaultState = getInitialState();
  saveDb(defaultState);
  return defaultState;
}

// Save DB
function saveDb(state: AppState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving to database file.", err);
  }
}

// OpenAI-compatible validation helper with robust 10-second timeout
async function testOpenAICompatible(url: string, key: string, model: string): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: "hi" }],
        max_tokens: 5
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`API returned HTTP ${response.status}: ${errText || "No response body"}`);
    }
    return true;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError" || err.name === "Aborted") {
      throw new Error("Connection to API timed out (10s)");
    }
    throw err;
  }
}

// OpenAI-compatible chat completion helper
async function callOpenAICompatible(url: string, key: string, model: string, messages: any[], timeoutSec: number): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), (timeoutSec || 15) * 1000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`API returned HTTP ${response.status}: ${errText}`);
    }

    const resData = await response.json();
    let reply = resData?.choices?.[0]?.message?.content || "";
    
    // Clean up any thinking tags
    reply = reply.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    return reply;
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Configure Multer for disk storage of uploaded files
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    }
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 15 * 1024 * 1024, // 15MB max file size
    }
  });

  // Expose uploads directory publicly so uploaded files can be fetched
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // API endpoints FIRST

  // Upload file API
  app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file was uploaded" });
      }
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({
        success: true,
        url: fileUrl,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get full state
  app.get("/api/state", (req, res) => {
    res.json(loadDb());
  });

  // Save full state
  app.post("/api/state", (req, res) => {
    try {
      const newState = req.body as AppState;
      if (!newState || !Array.isArray(newState.services)) {
        return res.status(400).json({ error: "Invalid state object" });
      }
      saveDb(newState);
      res.json({ success: true, message: "Database updated successfully" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Reset state to initial default
  app.post("/api/state/reset", (req, res) => {
    const defaultState = getInitialState();
    saveDb(defaultState);
    res.json({ success: true, message: "Database reset to defaults", state: defaultState });
  });

  // Verify API endpoint (supports deepseek, openai, grok, kimi, gemini)
  app.post("/api/verify-api", async (req, res) => {
    try {
      const { provider, key, model } = req.body || {};
      if (!provider || !key) {
        return res.status(400).json({ valid: false, error: "Provider and key are required" });
      }

      if (provider === "openai") {
        await testOpenAICompatible("https://api.openai.com/v1/chat/completions", key, model || "gpt-4o-mini");
      } else if (provider === "deepseek") {
        await testOpenAICompatible("https://api.deepseek.com/chat/completions", key, model || "deepseek-chat");
      } else if (provider === "grok") {
        await testOpenAICompatible("https://api.x.ai/v1/chat/completions", key, model || "grok-2-1212");
      } else if (provider === "kimi") {
        await testOpenAICompatible("https://api.moonshot.cn/v1/chat/completions", key, model || "moonshot-v1-8k");
      } else if (provider === "gemini") {
        const ai = new GoogleGenAI({
          apiKey: key,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });
        const geminiPromise = ai.models.generateContent({
          model: model || "gemini-1.5-flash",
          contents: "hi",
          config: { maxOutputTokens: 5 }
        });
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Gemini API connection timed out (10s)")), 10000)
        );
        const result = await Promise.race([geminiPromise, timeoutPromise]);
        if (!result.text) {
          throw new Error("No response text returned from Gemini");
        }
      } else {
        return res.status(400).json({ valid: false, error: "Unknown API provider" });
      }

      // Automatically save verified details on success
      const db = loadDb();
      db.apiSettings.provider = provider;
      db.apiSettings[`${provider}Key`] = key;
      if (model) {
        db.apiSettings[`${provider}Model`] = model;
      }
      db.apiSettings.verified = true;
      saveDb(db);

      res.json({ valid: true });
    } catch (e: any) {
      console.error(`Verification failed:`, e);
      res.status(400).json({ valid: false, error: e.message || "Failed to connect or authorize API Key" });
    }
  });

  // Booking endpoint with simulated WhatsApp replies
  app.post("/api/bookings", (req, res) => {
    try {
      const db = loadDb();
      const bookingData = req.body;

      if (!bookingData.name || !bookingData.phone || !bookingData.spaLocation || !bookingData.serviceName) {
        return res.status(400).json({ error: "Required fields are missing" });
      }

      const newBooking: Booking = {
        id: "b_" + Date.now(),
        name: bookingData.name,
        phone: bookingData.phone,
        spaLocation: bookingData.spaLocation,
        serviceName: bookingData.serviceName,
        dateTime: bookingData.dateTime || new Date().toISOString(),
        specialRequests: bookingData.specialRequests || "",
        status: "Pending",
        createdAt: new Date().toISOString()
      };

      db.bookings.push(newBooking);
      saveDb(db);

      // Construct a highly realistic WhatsApp notification mock that the admin sees
      // We also send back the WhatsApp deep link for the client so clicking it starts the WhatsApp auto-reply!
      // Format a nice messages text
      const messageText = `✨ *LUXURY SPA BOOKING CONFIRMED* ✨\n\n` +
        `👤 *Name:* ${newBooking.name}\n` +
        `📞 *Phone:* ${newBooking.phone}\n` +
        `📍 *Branch:* ${newBooking.spaLocation}\n` +
        `💆 *Service:* ${newBooking.serviceName}\n` +
        `📅 *Date/Time:* ${newBooking.dateTime.replace("T", " ")}\n` +
        `✍️ *Requests:* ${newBooking.specialRequests || "None"}\n\n` +
        `Our team is preparing your private room. Thank you for choosing absolute luxury! 🤤`;

      // We'll return this text so the frontend can trigger an automatic window.open for WhatsApp or display the alert.
      res.json({
        success: true,
        booking: newBooking,
        whatsappText: encodeURIComponent(messageText),
        whatsappNumber: "919830793242" // Default destination for notification
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // AI Assistant chat endpoint
  app.post("/api/chat", async (req, res) => {
    const { message, history, language } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const db = loadDb();
    const settings = db.apiSettings;

    // Check if API is verified and enabled
    if (!settings.verified || settings.provider === "none") {
      const offlineMsg = language === "Bengali" 
        ? "আমার দুঃখিত, কিন্তু আমার ভার্চুয়াল রিসেপশনিস্ট পরিষেবাটি বর্তমানে নিষ্ক্রিয় রয়েছে। অনুগ্রহ করে এডমিন প্যানেলে একটি এপিআই কী সক্রিয় এবং যাচাই করুন।" 
        : language === "Hindi" 
        ? "क्षमा करें, लेकिन मेरी वर्चुअल रिसेप्शनिस्ट सेवा वर्तमान में बंद है। कृपया एडमिन पैनल में एपीआई कुंजी को सत्यापित और सहेजें।" 
        : "My apologies, but my virtual receptionist consciousness is currently offline. Please verify and save an API key in the Admin Panel to enable my service!";
      return res.json({ 
        text: offlineMsg, 
        offline: true 
      });
    }

    const systemPrompt = `You are "Sia", the premium female virtual receptionist of Kolkata's most luxury spa brand. Your voice is elegant, soothing, professional, and highly persuasive.
We have 3 world-class locations in Kolkata (DumDum / Jessore Road):
1. DROP SPA: DumDum Road near Ward 22. Phone: +91 98307 93242
2. MOON FLOWER SPA: Jessore Road near UCO Bank. Phone: +91 81003 11604 / +91 98744 65122
3. THE WATERLILLY SPA: Jessore Road beside Diamond Plaza. Phone: +91 91635 78888 / +91 62897 43248

ALL our 20 services include a unique "🤤 Private Service" premium gold-styled suite treatment. We have Normal Massages (₹999-₹3500) and Luxury Massages (₹3500-₹20000).
Active Offers: ${db.offers.filter(o => o.active).map(o => `${o.title} (${o.discountDescription})`).join(", ") || "None"}

CRITICAL RULES:
1. LANGUAGE ENFORCEMENT:
- If language is "Bengali", you MUST speak 100% in Bengali (using correct Bengali alphabet script only, no English or Hinglish).
- If language is "Hindi", you MUST speak 100% in Hindi (using correct Devanagari Hindi alphabet script only, no English or Latin script).
- If language is "English", you MUST speak 100% in English.
2. PERSONALITY:
- Talk like an extremely classy, gentle, 5-star spa hostess. Always refer to the client as "Sir/Ma'am" or respected guest.
- Be very encouraging and suggest booking a service. Highlight the "Private Service" suite which is 100% exclusive, pristine, and sound-proofed.
3. CONTENT RESTRICTIONS:
- NEVER say anything explicit or suggestive. We are a high-end, 100% professional family-wellness spa chain. If anyone asks any inappropriate questions, gracefully, firmly, and politely decline and redirect to wellness therapies.
4. SERVICES & LOCATIONS:
- Provide accurate prices, durations, and details from our list of services if asked.
- Help them choose the right spa location. Offer to send a direct contact link (where they can tap to call or WhatsApp us).
- Always keep responses relatively concise, persuasive, and beautifully paced for voice speech.

List of Services for Reference:
${db.services.map(s => `- ${s.name}: ₹${s.price} for ${s.duration} mins (${s.category} category). Description: ${s.description}`).join("\n")}`;

    // Compile messages for LLM
    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((h: any) => ({
        role: h.sender === "user" ? "user" : "assistant",
        content: h.text
      })),
      { role: "user", content: message }
    ];

    const provider = settings.provider;
    const timeoutSec = settings.responseTimeout || 15;

    try {
      if (provider === "openai") {
        const key = settings.openaiKey;
        const model = settings.openaiModel || "gpt-4o-mini";
        const reply = await callOpenAICompatible("https://api.openai.com/v1/chat/completions", key, model, formattedMessages, timeoutSec);
        return res.json({ text: reply, provider: `OpenAI (${model})` });
      } 
      
      if (provider === "deepseek") {
        const key = settings.deepseekKey;
        const model = settings.deepseekModel || "deepseek-chat";
        const reply = await callOpenAICompatible("https://api.deepseek.com/chat/completions", key, model, formattedMessages, timeoutSec);
        return res.json({ text: reply, provider: `DeepSeek (${model})` });
      } 
      
      if (provider === "grok") {
        const key = settings.grokKey;
        const model = settings.grokModel || "grok-2-1212";
        const reply = await callOpenAICompatible("https://api.x.ai/v1/chat/completions", key, model, formattedMessages, timeoutSec);
        return res.json({ text: reply, provider: `Grok (${model})` });
      } 
      
      if (provider === "kimi") {
        const key = settings.kimiKey;
        const model = settings.kimiModel || "moonshot-v1-8k";
        const reply = await callOpenAICompatible("https://api.moonshot.cn/v1/chat/completions", key, model, formattedMessages, timeoutSec);
        return res.json({ text: reply, provider: `Kimi (${model})` });
      } 

      if (provider === "gemini") {
        const key = settings.geminiKey;
        const model = settings.geminiModel || "gemini-1.5-flash";
        const ai = new GoogleGenAI({
          apiKey: key,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });

        const contents = formattedMessages
          .filter(m => m.role !== "system")
          .map(m => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }]
          }));

        const response = await ai.models.generateContent({
          model: model,
          contents: contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
            maxOutputTokens: 500
          }
        });

        const reply = response.text || "I am here to assist you.";
        return res.json({ text: reply, provider: `Gemini (${model})` });
      }

      return res.status(400).json({ error: "Unsupported API provider configured" });
    } catch (err: any) {
      console.error(`Chat completion failed for provider ${provider}:`, err);
      res.status(500).json({ error: err.message || "Failed to generate AI response. Please check API Key status." });
    }
  });

  // Vite development middleware or production static folder
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Luxury Spa server running on port ${PORT}`);
  });
}

startServer();

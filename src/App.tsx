import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, MapPin, Phone, MessageSquare, Menu, X, Calendar, User, Clock, 
  Shield, Database, ArrowRight, Star, ExternalLink, RefreshCw, Check, AlertCircle, HelpCircle,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { AppState, SpaService, Booking, Therapist } from "./types";
import { GoldSparkles } from "./components/GoldSparkles";
import { AIBot } from "./components/AIBot";
import { AdminPanel } from "./components/AdminPanel";

const isVideoUrl = (url?: string) => {
  if (!url) return false;
  return (
    /\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(url) ||
    url.includes("video/upload") ||
    url.includes("player.cloudinary.com") ||
    url.includes("youtube.com/embed") ||
    url.includes("youtu.be")
  );
};

const renderMedia = (url: string, className: string, altText: string) => {
  if (isVideoUrl(url)) {
    if (url.includes("player.cloudinary.com") || url.includes("youtube.com/embed") || url.includes("youtu.be")) {
      return (
        <iframe
          src={url}
          className={`${className} pointer-events-none`}
          allow="autoplay; encrypted-media; picture-in-picture"
          title={altText}
        />
      );
    }
    return (
      <video
        src={url}
        autoPlay
        loop
        muted
        playsInline
        className={className}
      />
    );
  }
  return (
    <img
      src={url}
      alt={altText}
      className={className}
      referrerPolicy="no-referrer"
    />
  );
};

const INITIAL_STATE: AppState = {
  services: [
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
        "https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&q=80&w=300"
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
      autoShowOnLoad: false
    }
  ],
  bookings: [],
  locations: [
    {
      id: "drop",
      name: "Drop Spa",
      address: "Drop Spa - Best Massage Parlour in DumDum, 1st Floor, 66/2, Dum Dum Rd, Ward Number 22, Amarpalli, Kolkata, West Bengal 700074",
      phoneNumbers: ["+91 98307 93242"],
      mapEmbedUrl: "https://maps.google.com/maps?q=Drop%20Spa%20Dum%20Dum%20Kolkata&t=&z=15&ie=UTF8&iwloc=&output=embed",
      visible: true
    }
  ],
  content: {
    heroTitle: "ROYAL INDULGENCE FOR SOUL & SENSES",
    heroSubtitle: "Step into an oasis of pure serenity. Experiencing premium 5-star therapies in DumDum, Kolkata.",
    aboutText: "Welcome to Kolkata's ultimate luxury spa chain. Across our three premium locations in DumDum and Jessore Road, we specialize in high-end massage therapies, restorative facials, and wellness scrubs.",
    galleryImages: [
      "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800"
    ],
    testimonials: [
      { name: "Debashree Sen", comment: "The Royal Gold Massage is an absolute masterpiece.", rating: 5, date: "2026-06-15" }
    ],
    faqs: [
      { question: "Do you have certified female therapists?", answer: "Yes, 100% of our therapy staff consists of certified professional female therapists." }
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
};

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const cached = localStorage.getItem("spa_state");
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error("Error reading initial spa_state from localStorage", e);
    }
    return INITIAL_STATE;
  });
  const [loading, setLoading] = useState(false);



  // General App Toggles
  const [activeCategory, setActiveCategory] = useState<"Normal" | "Luxury">("Normal");
  const [activeLocationTab, setActiveLocationTab] = useState<string>("drop");
  const [showBot, setShowBot] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<string | null>(null);

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    name: "",
    phone: "",
    spaLocation: "Drop Spa" as any,
    serviceName: "Swedish Massage",
    dateTime: "",
    specialRequests: ""
  });
  const [bookingStatus, setBookingStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [recentBookingResult, setRecentBookingResult] = useState<any>(null);

  // Fetch full state from backend
  const fetchState = async () => {
    try {
      const res = await fetch("/api/state");
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setState(data);
          localStorage.setItem("spa_state", JSON.stringify(data));
        }
      }
    } catch (e) {
      console.warn("Failed to load live spa state from server, using cached local state", e);
    } finally {
      setLoading(false);
    }
  };

  // Sync state initially
  useEffect(() => {
    fetchState();
  }, []);

  // Sync state periodically (every 5 seconds) to ensure admin edits reflect immediately
  useEffect(() => {
    const interval = setInterval(() => {
      fetchState();
    }, 5000);
    return () => clearInterval(interval);
  }, []);



  // Update State handler for Admin Panel
  const handleUpdateState = async (updated: AppState) => {
    // Always update client-side immediately for 100% responsiveness and offline support
    setState(updated);
    try {
      localStorage.setItem("spa_state", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save state to localStorage", err);
    }

    try {
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (!res.ok) {
        console.warn("Server update unsuccessful, saved changes to local storage");
      }
    } catch (e) {
      console.warn("Failed to save state to backend, changes are preserved locally in browser", e);
    }
  };

  // Pre-fill booking form via Sia Helper Bot recommendation
  const handleAutoFillBooking = (spa: string, service: string) => {
    const loc = spa || "Drop Spa";
    const srv = service || "Swedish Massage";
    setBookingForm((prev) => ({
      ...prev,
      spaLocation: loc,
      serviceName: srv
    }));
    // Scroll to booking section smoothly
    const element = document.getElementById("booking-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Submit Booking
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingStatus("submitting");

    const localBooking: Booking = {
      id: "b_" + Date.now(),
      name: bookingForm.name,
      phone: bookingForm.phone,
      spaLocation: bookingForm.spaLocation,
      serviceName: bookingForm.serviceName,
      dateTime: bookingForm.dateTime,
      specialRequests: bookingForm.specialRequests,
      status: "Pending",
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingForm)
      });

      if (res.ok) {
        const contentType = res.headers.get("content-type");
        let data;
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        } else {
          data = { success: true, booking: localBooking };
        }
        setRecentBookingResult(data);
        setBookingStatus("success");
        // Clear form
        setBookingForm({
          name: "",
          phone: "",
          spaLocation: "Drop Spa",
          serviceName: "Swedish Massage",
          dateTime: "",
          specialRequests: ""
        });
        // Fetch state to load new booking in lists
        fetchState();
      } else {
        // Fallback to local save if server fails (e.g., Netlify/static build)
        const updatedBookings = [localBooking, ...(state.bookings || [])];
        const updatedState = { ...state, bookings: updatedBookings };
        setState(updatedState);
        localStorage.setItem("spa_state", JSON.stringify(updatedState));

        setRecentBookingResult({ success: true, booking: localBooking });
        setBookingStatus("success");
        setBookingForm({
          name: "",
          phone: "",
          spaLocation: "Drop Spa",
          serviceName: "Swedish Massage",
          dateTime: "",
          specialRequests: ""
        });
      }
    } catch (err) {
      console.warn("API booking submit failed, falling back to local booking save", err);
      // Fallback to local save if connection fails (e.g., Netlify offline/static build)
      const updatedBookings = [localBooking, ...(state.bookings || [])];
      const updatedState = { ...state, bookings: updatedBookings };
      setState(updatedState);
      localStorage.setItem("spa_state", JSON.stringify(updatedState));

      setRecentBookingResult({ success: true, booking: localBooking });
      setBookingStatus("success");
      setBookingForm({
        name: "",
        phone: "",
        spaLocation: "Drop Spa",
        serviceName: "Swedish Massage",
        dateTime: "",
        specialRequests: ""
      });
    }
  };

  if (!state) {
    return null;
  }

  // Active Daily Offer
  const activeOffer = state.offers.find((o) => o.active);

  return (
    <div className="relative min-h-screen text-[#FFF8F0] font-sans selection:bg-[#C9A84C]/30 selection:text-[#FFF8F0] overflow-x-hidden">
      
      {/* 1. AUTO-LOOP SILENT VIDEO BACKGROUND (Cloudinary Embed) */}
      <div className="fixed inset-0 w-full h-full -z-30 pointer-events-none overflow-hidden bg-[#041a0f]">
        <iframe
          src={state.content.backgroundVideoUrl || "https://player.cloudinary.com/embed/?cloud_name=tbpxcezd&public_id=From_Klickpin.com-_75_Fresh_Instagram_Growth_Tips_for_Everyday-pin-id-1128644356638366738_tajian&autoplay=1&loop=1&muted=1&controls=0"}
          className="absolute top-1/2 left-1/2 w-[115%] h-[115%] -translate-x-1/2 -translate-y-1/2 object-cover scale-110 pointer-events-none opacity-80"
          allow="autoplay; encrypted-media; picture-in-picture"
          title="Ambient Spa Background"
        />
        {/* Luxury color tint overlays: clear blend for video detail + high readability gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#092617]/55 to-black/90 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#041a0f]/95 via-transparent to-black/35" />
      </div>

      {/* 2. DYNAMIC GOLDEN SPARKLES ENGINE */}
      <GoldSparkles />



      {/* 4. PREMIUM NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-[#061d11]/80 backdrop-blur-md border-b border-[#C9A84C]/25 px-6 py-4 flex items-center justify-between transition-colors">
        <a href="#" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#C9A84C] flex items-center justify-center text-[#061d11] font-serif font-bold text-lg shadow-lg">
            R
          </div>
          <span className="font-serif font-bold text-base tracking-widest text-[#FFF8F0]">ROYAL SPA</span>
        </a>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold tracking-wider text-gray-300 uppercase">
          <a href="#services" className="hover:text-[#C9A84C] transition-colors">Therapies</a>
          <a href="#therapists" className="hover:text-[#C9A84C] transition-colors">Staff</a>
          <a href="#locations" className="hover:text-[#C9A84C] transition-colors">Branches</a>
          <a href="#booking-section" className="hover:text-[#C9A84C] transition-colors">Reserve Suite</a>
          <button 
            onClick={() => setShowAdmin(true)}
            className="hover:text-[#C9A84C] text-purple-300 transition-colors flex items-center gap-1 font-mono uppercase text-[11px]"
          >
            <Shield className="w-3.5 h-3.5" /> Staff Portal
          </button>
        </nav>

        {/* Action button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBot(true)}
            className="rgb-button px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4 animate-pulse" /> Ask Sia AI
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-white/5 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[68px] left-0 w-full z-30 bg-[#0A251A] border-b border-[#C9A84C]/25 p-6 space-y-4 md:hidden text-center text-sm font-semibold tracking-wide shadow-2xl"
          >
            <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white">Therapies</a>
            <a href="#therapists" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white">Our Certified Staff</a>
            <a href="#locations" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white">Branch Directions</a>
            <a href="#booking-section" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white">Book Private Suite</a>
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                setShowAdmin(true);
              }}
              className="rgb-button w-full py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <Shield className="w-4 h-4" /> Staff Portal Entrance
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. HERO SECTION WITH 3D INTERACTIVE MASSAGE TABLE */}
      <section className="relative px-6 py-12 md:py-24 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          {activeOffer && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#D4AF37]/15 to-[#C9A84C]/15 border border-[#C9A84C]/30 rounded-full text-xs text-[#C9A84C]">
              <Sparkles className="w-3.5 h-3.5 animate-spin" /> {activeOffer.title} Active Today!
            </div>
          )}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#FFF8F0] tracking-tight leading-none uppercase text-shadow-premium">
            {state.content.heroTitle}
          </h1>
          <p className="text-sm md:text-base text-gray-200 font-sans leading-relaxed max-w-xl text-shadow-premium">
            {state.content.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <a
              href="#booking-section"
              className="rgb-button px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1.5"
            >
              Reserve Private Suite
            </a>
            <button
              onClick={() => setShowBot(true)}
              className="rgb-button px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              Consult Virtual Hostess <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Luxury AutoPlay Video Player Panel */}
        <div className="relative flex items-center justify-center">
          <div className="w-full max-w-md p-6 rounded-3xl glass-premium-dark rgb-neon-border shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/50 to-transparent h-20 z-10 pointer-events-none" />
            <div className="h-[280px] w-full flex items-center justify-center bg-black rounded-2xl overflow-hidden relative border border-white/10 shadow-inner">
              <video
                src={state.content.sectionVideoUrl || "https://res.cloudinary.com/kyyl8tuj/video/upload/v1783032912/Water_Lilly_Spa_Website_202607030424_adcvqo.mp4"}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>
            <div className="text-center mt-4 space-y-1 relative z-10">
              <span className="text-[9px] uppercase tracking-widest font-mono text-gray-400">Atmospheric Video</span>
              <h3 className="font-serif text-base text-[#FFF8F0] font-semibold">Water Lilly Spa Sanctuary</h3>
              <p className="text-[10px] text-[#C9A84C]">Experience our ultimate luxury suite live in Kolkata</p>
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVE OFFERS HORIZONTAL BANNER TICKER */}
      {activeOffer && (
        <div className="w-full bg-[#061d11] py-3.5 border-y border-[#C9A84C]/25 overflow-hidden relative z-10">
          <div className="flex justify-around items-center gap-8 text-xs font-serif text-center uppercase tracking-wider text-[#C9A84C] px-6">
            <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse" /> {activeOffer.title}: {activeOffer.discountDescription}</span>
            <span className="hidden md:flex items-center gap-2"><Clock className="w-4 h-4" /> {activeOffer.duration}</span>
            <span className="hidden lg:flex items-center gap-2"><Check className="w-4 h-4" /> Certified Professional Staff</span>
          </div>
        </div>
      )}

      {/* 6. SERVICES SECTION (20 Total, Cat Switcher in Premium Transparent Section with Gold Side Glow) */}
      <div className="w-full bg-[#031109]/75 backdrop-blur-md py-24 px-6 relative z-10 rounded-t-[48px] rounded-b-[48px] border-x-4 border-[#C9A84C]/50 shadow-[0_0_35px_rgba(201,168,76,0.3)]">
        <section id="services" className="max-w-7xl mx-auto space-y-14">
          <div className="text-center space-y-4">
            <p className="text-[10px] uppercase font-mono tracking-widest text-[#C9A84C] font-bold">Premium Wellness Catalog</p>
            <h2 className="font-serif text-4xl md:text-5xl font-extrabold text-white text-shadow-premium tracking-tight">
              Discover Our <span className="italic font-serif font-normal text-[#C9A84C]">Collection</span>
            </h2>
            <p className="text-xs text-gray-200 max-w-lg mx-auto font-sans leading-relaxed">
              Explore our range of 100% private, sound-proofed suites led by expert female therapists. Tailored with organic botanicals.
            </p>

            {/* Category Switcher */}
            <div className="inline-flex p-1 bg-black/40 backdrop-blur-sm rounded-xl border border-[#C9A84C]/30 mt-6 gap-1.5">
              <button
                onClick={() => setActiveCategory("Normal")}
                className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeCategory === "Normal" 
                    ? "rgb-button-active" 
                    : "rgb-button text-gray-300"
                }`}
              >
                Normal Massages (₹999-₹3500)
              </button>
              <button
                onClick={() => setActiveCategory("Luxury")}
                className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeCategory === "Luxury" 
                    ? "rgb-button-active" 
                    : "rgb-button text-gray-300"
                }`}
              >
                Luxury Massages (₹3500-₹20000)
              </button>
            </div>
          </div>

          {/* 20 Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {state.services
              .filter((s) => s.category === activeCategory && s.available)
              .map((service) => (
                <div
                  key={service.id}
                  className="bg-black/45 backdrop-blur-sm border border-[#C9A84C]/25 hover:border-[#C9A84C]/70 hover:shadow-[0_0_20px_rgba(201,168,76,0.25)] transition-all duration-500 rounded-3xl overflow-hidden flex flex-col justify-between group"
                >
                  {/* Image panel */}
                  <div className="relative h-52 overflow-hidden shrink-0 bg-black">
                    {renderMedia(service.image, "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500", service.name)}
                    
                    {/* Badge */}
                    {service.isPrivate && (
                      <span className="absolute top-4 left-4 py-1.5 px-3 rounded-full bg-black/75 backdrop-blur-sm text-[#C9A84C] border border-[#C9A84C]/40 text-[9px] uppercase font-bold shadow-md flex items-center gap-1 tracking-widest">
                        ✨ Private Suite
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <h3 className="font-serif text-xl font-bold text-white group-hover:text-[#C9A84C] transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans">
                        {service.description}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#C9A84C]/15">
                      <div className="font-mono text-xs space-y-0.5">
                        <p className="text-gray-400 uppercase text-[9px] tracking-widest font-semibold">Package Rate</p>
                        <p className="text-white font-mono font-bold text-sm">₹{service.price} <span className="text-[10px] text-gray-300 font-sans font-normal">/ {service.duration} mins</span></p>
                      </div>

                      <a
                        href="#booking-section"
                        onClick={() => handleAutoFillBooking(bookingForm.spaLocation, service.name)}
                        className="rgb-button px-5 py-2.5 rounded-xl text-xs font-bold uppercase transition-all duration-300 flex items-center gap-1"
                      >
                        Book Now
                      </a>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </div>

      {/* LUXURY PHOTO GALLERY SECTION */}
      {state.content.galleryImages && state.content.galleryImages.length > 0 && (
        <section id="gallery" className="py-24 px-6 max-w-7xl mx-auto space-y-12 relative z-10">
          <div className="text-center space-y-3">
            <p className="text-[10px] uppercase font-mono tracking-widest text-[#C9A84C] font-bold">Sanctuary Gallery</p>
            <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-white text-shadow-premium uppercase">
              Our Luxury <span className="italic font-serif font-normal text-[#C9A84C]">Suites & Ambience</span>
            </h2>
            <p className="text-xs text-gray-300 max-w-md mx-auto text-shadow-premium">
              Step inside our world of premium gold suites, custom aromatherapy baths, and tranquil relaxation zones.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {state.content.galleryImages.map((img, idx) => (
              <div 
                key={idx} 
                className="relative group rounded-3xl overflow-hidden h-64 border border-[#C9A84C]/25 shadow-xl glass-premium"
              >
                <img 
                  src={img} 
                  alt={`Gallery Image ${idx + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A84C] font-bold">View Suite Details</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FLOATING SPA COMPONENTS ACCENT SECTION */}
      <section className="bg-gradient-to-b from-transparent via-[#1D1129]/40 to-transparent py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center border border-[#C9A84C]/25 rounded-3xl p-8 backdrop-blur-xl bg-[#2D1B3D]/30">
          <div className="grid grid-cols-3 gap-3 h-56 items-center">
            <div className="glass-premium p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 border border-[#C9A84C]/20 gold-glow h-full">
              <span className="text-3xl">🪨</span>
              <h4 className="font-serif text-xs font-bold text-white leading-tight">Basalt Stones</h4>
              <p className="text-[9px] text-gray-400 font-mono">Earth Energy</p>
            </div>
            <div className="glass-premium p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 border border-[#C9A84C]/20 gold-glow h-full">
              <span className="text-3xl">🕯️</span>
              <h4 className="font-serif text-xs font-bold text-white leading-tight">Soy Candles</h4>
              <p className="text-[9px] text-gray-400 font-mono">Aromatic Oils</p>
            </div>
            <div className="glass-premium p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 border border-[#C9A84C]/20 gold-glow h-full">
              <span className="text-3xl">🪷</span>
              <h4 className="font-serif text-xs font-bold text-white leading-tight">Lotus Flower</h4>
              <p className="text-[9px] text-gray-400 font-mono">Mental Stillness</p>
            </div>
          </div>
          <div className="space-y-4">
            <span className="text-[9px] font-mono tracking-widest uppercase text-[#C9A84C]">Holistic Atmosphere</span>
            <h3 className="font-serif text-2xl text-white font-bold">Nature's Essence In Pure Harmony</h3>
            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              Every detail in our suites is customized to perfection. Stacking basalt stones representing earth energy, pure soy candles releasing warm aromatic oils, and a delicate floating lotus reminding you of absolute mental stillness.
            </p>
          </div>
        </div>
      </section>

      {/* 7. THERAPISTS REGISTRY SECTION */}
      <section id="therapists" className="py-24 px-6 max-w-7xl mx-auto space-y-14">
        <div className="text-center space-y-3">
          <p className="text-[10px] uppercase font-mono tracking-widest text-[#C9A84C] font-bold">Our Expert Staff</p>
          <h2 className="font-serif text-4xl md:text-5xl font-extrabold text-white text-shadow-premium">
            Certified Female <span className="italic font-serif font-normal text-[#C9A84C]">Therapists</span>
          </h2>
          <p className="text-xs text-gray-300 max-w-md mx-auto text-shadow-premium font-sans">
            Trained professionals dedicated to providing deep physical relaxation, organic aromatherapy, and mental healing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {state.therapists
            .filter((t) => t.visible)
            .map((therapist) => (
              <div 
                key={therapist.id} 
                onClick={() => setSelectedTherapist(therapist)}
                className="glass-premium card-micro-light neon-glow-emerald hover:neon-glow-gold transition-all duration-500 p-8 rounded-3xl flex flex-col items-center text-center space-y-6 cursor-pointer group hover:scale-[1.02]"
              >
                {/* Elegant Circular Photo with Gold Glowing Frame */}
                <div className="relative w-36 h-36 rounded-full p-1.5 bg-gradient-to-tr from-[#D4AF37] to-[#C9A84C] shadow-xl group-hover:shadow-[0_0_20px_rgba(201,168,76,0.35)] transition-all duration-500">
                  <div className="w-full h-full rounded-full overflow-hidden border border-black/30">
                    <img
                      src={therapist.images[0]}
                      alt={therapist.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-1 bg-[#0A251A] border border-[#C9A84C]/50 px-2.5 py-1 rounded-full text-[10px] text-[#C9A84C] font-bold shadow">
                    ★ {therapist.rating}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-2xl font-bold text-[#FFF8F0] tracking-tight group-hover:text-[#C9A84C] transition-colors">{therapist.name}</h3>
                  <p className="text-[11px] text-[#C9A84C] font-semibold uppercase tracking-widest font-mono">
                    {therapist.experience} Experience
                  </p>
                </div>

                <div className="w-full pt-4 border-t border-[#C9A84C]/15 space-y-2">
                  <p className="text-[9px] uppercase tracking-wider text-gray-400 font-mono font-semibold">Specialization Area</p>
                  <p className="text-sm text-gray-200 font-medium leading-relaxed font-sans px-4 line-clamp-2">
                    {therapist.specialization}
                  </p>
                </div>

                {/* Instagram style prompt link */}
                <div className="pt-2 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-1 text-[#C9A84C] text-xs">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-sm">★</span>
                    ))}
                  </div>
                  <span className="text-[10px] text-[#C9A84C] font-bold uppercase tracking-widest font-mono group-hover:underline flex items-center gap-1 mt-1">
                    📸 View Instagram Profile & Feed
                  </span>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* 8. ACTIVE LOCATIONS & DIRECTIONS (Google Maps & Contacts) */}
      <section id="locations" className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <p className="text-[10px] uppercase font-mono tracking-widest text-[#C9A84C] font-semibold">Branch Coordinates</p>
          <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-white text-shadow-premium">Three Luxury Spa Locations</h2>
          <p className="text-xs text-gray-300 max-w-md mx-auto text-shadow-premium">Choose your nearest premium branch. Easily access map coordinates or request direct voice assistance.</p>

          {/* Branch selector tabs */}
          <div className="inline-flex flex-wrap p-1 bg-black/40 backdrop-blur-md rounded-xl border border-[#C9A84C]/25 mt-4 gap-1.5 justify-center">
            {state.locations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => setActiveLocationTab(loc.id)}
                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeLocationTab === loc.id ? "rgb-button-active" : "rgb-button"
                }`}
              >
                {loc.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Location Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {state.locations
            .filter((l) => l.id === activeLocationTab)
            .map((loc) => (
              <React.Fragment key={loc.id}>
                
                {/* Details card */}
                <div className="glass-premium card-micro-light neon-glow-emerald p-8 rounded-3xl flex flex-col justify-between space-y-8">
                  <div className="space-y-4 font-sans">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A84C]">Active Branch</span>
                    <h3 className="font-serif text-2xl font-bold text-white leading-none">{loc.name}</h3>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {loc.address}
                    </p>
                  </div>

                  {/* Hidden Contact Display (CALL / WHATSAPP ONLY as requested) */}
                  <div className="space-y-3.5 pt-6 border-t border-white/5">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-mono font-semibold">Immediate Assistance Shortcuts</p>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => window.open(`tel:${loc.phoneNumbers[0].replace(/[^0-9+]/g, "")}`)}
                        className="rgb-button py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                        title="Click to Call Spa Hotline"
                      >
                        <Phone className="w-4 h-4" /> Tap to Call 📞
                      </button>
                      <button
                        onClick={() => window.open(`https://wa.me/${loc.phoneNumbers[0].replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello Royal Spa Reception, I would like to enquire about active package reservations.")}`, "_blank")}
                        className="rgb-button py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                        title="Click to Chat on WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" /> WhatsApp Us 💬
                      </button>
                    </div>
                    <p className="text-[9px] text-gray-400 text-center font-mono">Note: Contact digits are masked for security. Tapping buttons connects immediately.</p>
                  </div>
                </div>

                {/* Google Maps Frame */}
                <div className="rounded-3xl overflow-hidden glass-premium neon-glow-emerald relative h-[320px] md:h-auto min-h-[280px]">
                  <iframe
                    src={loc.mapEmbedUrl}
                    className="w-full h-full border-0 absolute inset-0 opacity-80"
                    allowFullScreen
                    loading="lazy"
                    title={`${loc.name} Navigation Directions`}
                  />
                </div>
              </React.Fragment>
            ))}
        </div>
      </section>

      {/* 9. BOOKING SYSTEM FORM */}
      <section id="booking-section" className="py-20 px-6 max-w-4xl mx-auto space-y-8 relative">
        <div className="text-center space-y-2">
          <p className="text-[10px] uppercase font-mono tracking-widest text-[#C9A84C] font-semibold">Reservation Desk</p>
          <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-white text-shadow-premium">Schedule Private Suite</h2>
          <p className="text-xs text-gray-300 max-w-md mx-auto text-shadow-premium">Secure your luxury therapy chamber instantly. Sia will auto-confirm your slot.</p>
        </div>

        <div className="glass-premium neon-glow-gold rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-[#C9A84C]/5 to-transparent h-12" />

          {bookingStatus === "success" && recentBookingResult ? (
            <div className="text-center py-8 space-y-6 font-sans">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto text-green-400">
                <Check className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-2xl font-bold text-white">Booking Slots Reserved!</h3>
                <p className="text-xs text-gray-300">Your private chamber is being sanitized and prepared.</p>
              </div>

              {/* Redirection / WhatsApp Action */}
              <div className="p-5 rounded-2xl bg-white/5 border border-[#C9A84C]/30 max-w-sm mx-auto space-y-4">
                <p className="text-xs text-yellow-400 font-medium">✨ Finalizing Confirmation via WhatsApp ✨</p>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Please tap the auto-reply button below to finalize your booking details directly with our reception counter on WhatsApp.
                </p>
                <button
                  onClick={() => window.open(`https://wa.me/${recentBookingResult.whatsappNumber}?text=${recentBookingResult.whatsappText}`, "_blank")}
                  className="rgb-button w-full py-3 rounded-xl font-bold text-xs uppercase cursor-pointer"
                >
                  Trigger WhatsApp Auto-Reply 💬
                </button>
              </div>

              <button
                onClick={() => setBookingStatus("idle")}
                className="text-xs text-gray-400 hover:text-white transition-colors underline decoration-[#C9A84C] underline-offset-4"
              >
                Submit another reservation
              </button>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} className="space-y-6 text-xs text-gray-300 font-sans">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#C9A84C]" /> Guest Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                    className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-[#C9A84C]" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98307 93242"
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                    className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#C9A84C]" /> Select Spa Branch
                  </label>
                  <select
                    value={bookingForm.spaLocation}
                    onChange={(e) => setBookingForm({ ...bookingForm, spaLocation: e.target.value as any })}
                    className="w-full py-3 px-4 rounded-xl bg-[#0A251A] border border-white/10 text-white outline-none focus:border-[#C9A84C]"
                  >
                    <option value="Drop Spa">Drop Spa (DumDum Rd)</option>
                    <option value="Moon Flower Spa">Moon Flower Spa (Jessore Rd)</option>
                    <option value="The Waterlilly Spa">The Waterlilly Spa (beside Diamond Plaza)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#C9A84C]" /> Select Wellness Package
                  </label>
                  <select
                    value={bookingForm.serviceName}
                    onChange={(e) => setBookingForm({ ...bookingForm, serviceName: e.target.value })}
                    className="w-full py-3 px-4 rounded-xl bg-[#0A251A] border border-white/10 text-white outline-none focus:border-[#C9A84C]"
                  >
                    {state.services.filter(s => s.available).map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} - ₹{s.price} ({s.duration} mins)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#C9A84C]" /> Date & Time Slot
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={bookingForm.dateTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, dateTime: e.target.value })}
                    className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-[#C9A84C]" /> Special Requests (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Attached shower preference, specific aromatics..."
                    value={bookingForm.specialRequests}
                    onChange={(e) => setBookingForm({ ...bookingForm, specialRequests: e.target.value })}
                    className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={bookingStatus === "submitting"}
                className="rgb-button w-full py-4 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                {bookingStatus === "submitting" ? "Locking in Room..." : "Submit Booking & Get WhatsApp Confirmation 🤤"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* REVIEW & ACCORDION FAQ GRID */}
      <section className="py-20 px-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-white/10">
        
        {/* Testimonials */}
        <div className="space-y-6 font-sans">
          <div className="space-y-2">
            <p className="text-[10px] uppercase font-mono tracking-widest text-[#C9A84C]">Verified Reviews</p>
            <h3 className="font-serif text-2xl text-white font-bold">What Our Guests Say</h3>
          </div>
          <div className="space-y-4">
            {state.content.testimonials.map((test, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white text-xs">{test.name}</p>
                  <span className="text-[10px] text-yellow-400">★ ★ ★ ★ ★</span>
                </div>
                <p className="text-xs text-gray-300 italic leading-relaxed">"{test.comment}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-6 font-sans">
          <div className="space-y-2">
            <p className="text-[10px] uppercase font-mono tracking-widest text-[#C9A84C]">Answers & Details</p>
            <h3 className="font-serif text-2xl text-white font-bold">Frequently Asked Questions</h3>
          </div>
          <div className="space-y-4">
            {state.content.faqs.map((faq, i) => (
              <div key={i} className="space-y-1.5">
                <p className="font-semibold text-white text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" /> {faq.question}
                </p>
                <p className="text-xs text-gray-400 pl-3 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. ELEGANT FOOTER */}
      <footer className="bg-black/40 border-t border-white/5 py-12 px-6 text-center text-xs text-gray-400 space-y-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#C9A84C] text-[#061d11] font-serif font-bold text-sm flex items-center justify-center">R</div>
            <span className="font-serif font-bold text-[#FFF8F0]">ROYAL SPA CHANCERY</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <a href="#services" className="hover:text-white transition-colors">Therapies</a>
            <a href="#therapists" className="hover:text-white transition-colors">Staffing</a>
            <a href="#locations" className="hover:text-white transition-colors">Directions</a>
            <button 
              onClick={() => setShowAdmin(true)}
              className="text-[#C9A84C] hover:text-white transition-colors flex items-center gap-1 font-mono uppercase text-[11px]"
            >
              <Shield className="w-3.5 h-3.5" /> Admin Terminal
            </button>
          </div>
        </div>

        <p className="text-[10px] font-mono">© 2026 Royal Spa Group Kolkata. All rights reserved. Managed durably under CJS Container standards.</p>
      </footer>

      {/* 11. MULTILINGUAL AI CONCIERGE BOT PANEL (Sia) */}
      <AnimatePresence>
        {showBot && (
          <AIBot
            onClose={() => setShowBot(false)}
            onAutoFillBooking={handleAutoFillBooking}
          />
        )}
      </AnimatePresence>

      {/* 12. FLOATING STAFF TERMINAL (ADMIN PANEL) MODAL */}
      <AnimatePresence>
        {showAdmin && (
          <AdminPanel
            state={state}
            onUpdateState={handleUpdateState}
            onClose={() => setShowAdmin(false)}
          />
        )}
      </AnimatePresence>

      {/* 13. INSTAGRAM STYLE THERAPIST PROFILE GALLERY MODAL */}
      <AnimatePresence>
        {selectedTherapist && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-[#031109] border border-[#C9A84C]/30 rounded-[32px] max-w-2xl w-full text-white overflow-hidden shadow-2xl relative my-8 flex flex-col max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedTherapist(null)}
                className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors p-2 bg-black/40 hover:bg-black/80 rounded-full border border-white/10 z-10 cursor-pointer"
                title="Close Profile"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Scrollable Container */}
              <div className="overflow-y-auto flex-1 custom-scrollbar">
                {/* Header Section */}
                <div className="p-6 md:p-8 border-b border-[#C9A84C]/15 bg-gradient-to-b from-[#0A251A]/60 to-[#031109]">
                  <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                    {/* Story Circle Profile Photo */}
                    <div className="relative shrink-0">
                      <div className="w-28 h-28 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-tr from-[#D4AF37] via-pink-500 to-amber-500">
                        <div className="w-full h-full rounded-full p-0.5 bg-[#031109]">
                          <img
                            src={selectedTherapist.images[0]}
                            alt={selectedTherapist.name}
                            className="w-full h-full rounded-full object-cover border border-black/40"
                          />
                        </div>
                      </div>
                      <span className="absolute bottom-0 right-2 bg-blue-500 text-white rounded-full p-1 border-2 border-[#031109] flex items-center justify-center w-6 h-6 shadow">
                        <Check className="w-3 stroke-[4.5]" />
                      </span>
                    </div>

                    {/* Profile Stats & Bio */}
                    <div className="flex-1 space-y-4 text-center md:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center md:justify-start">
                        <h3 className="font-serif text-2xl font-extrabold text-[#FFF8F0] tracking-tight flex items-center justify-center md:justify-start gap-1">
                          {selectedTherapist.name}
                        </h3>
                        <span className="inline-flex px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono tracking-widest uppercase self-center">
                          Active Now
                        </span>
                      </div>

                      {/* Instagram-style Stats Row */}
                      <div className="flex items-center justify-center md:justify-start gap-8 font-sans text-xs border-y border-white/5 py-2.5">
                        <div className="text-center md:text-left">
                          <span className="block font-bold text-lg text-white">{selectedTherapist.images.length}</span>
                          <span className="text-gray-400 text-[10px] uppercase font-mono">Posts</span>
                        </div>
                        <div className="text-center md:text-left">
                          <span className="block font-bold text-lg text-[#C9A84C]">{selectedTherapist.experience}</span>
                          <span className="text-gray-400 text-[10px] uppercase font-mono">Exp</span>
                        </div>
                        <div className="text-center md:text-left">
                          <span className="block font-bold text-lg text-amber-400 flex items-center justify-center md:justify-start gap-0.5">
                            ★ {selectedTherapist.rating}
                          </span>
                          <span className="text-gray-400 text-[10px] uppercase font-mono">Rating</span>
                        </div>
                      </div>

                      {/* Bio Details */}
                      <div className="space-y-1 font-sans text-xs">
                        <p className="text-gray-300 font-medium leading-relaxed">
                          ✨ Certified expert female therapist with top-tier ratings. Specialized in: <span className="text-[#C9A84C] font-semibold">{selectedTherapist.specialization}</span>
                        </p>
                        <p className="text-gray-400 text-[10px]">
                          📍 Serving Royal soundproofed luxury suites in Kolkata.
                        </p>
                      </div>

                      {/* Action Button: Book Now */}
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setBookingForm((prev) => ({
                              ...prev,
                              specialRequests: `Preferred certified female therapist: ${selectedTherapist.name}. (Assigned via Instagram profile click)`
                            }));
                            setSelectedTherapist(null);
                            const el = document.getElementById("booking-section");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C9A84C] text-[#0A251A] font-extrabold text-xs tracking-wider uppercase hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          Book Session with {selectedTherapist.name.split(" ")[0]} <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Posts Section Grid Header */}
                <div className="flex items-center justify-center border-b border-[#C9A84C]/15 font-sans text-[11px] font-bold tracking-widest text-[#C9A84C] uppercase bg-black/20">
                  <span className="px-6 py-3 border-b-2 border-[#C9A84C] flex items-center gap-1.5">
                    🎦 Therapist Portfolio Grid
                  </span>
                </div>

                {/* Grid of gallery pictures and videos */}
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                    {selectedTherapist.images.map((img, index) => (
                      <div
                        key={index}
                        onClick={() => setLightboxMedia(img)}
                        className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group bg-black border border-white/5"
                      >
                        {renderMedia(img, "w-full h-full object-cover", `Post ${index + 1}`)}

                        {/* Interactive Stats Overlay on Hover */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 text-xs font-semibold text-white">
                          <span className="flex items-center gap-1">❤️ {120 + index * 14}</span>
                          <span className="flex items-center gap-1">💬 {12 + index * 3}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedTherapist.images.length === 0 && (
                    <p className="text-center py-12 text-gray-400 italic">No media posts added to this portfolio yet.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 14. POLISHED LIGHTBOX MODAL WITH PREVIOUS/NEXT CAROUSEL NAVIGATION */}
      <AnimatePresence>
        {lightboxMedia && selectedTherapist && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-lg z-[60] flex items-center justify-center p-4">
            {/* Close Lightbox */}
            <button
              onClick={() => setLightboxMedia(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors p-2 bg-black/60 rounded-full border border-white/10 z-[70] cursor-pointer"
              title="Close View"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Media Content Container */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-3xl w-full h-full max-h-[80vh] flex items-center justify-center bg-black/40 rounded-3xl overflow-hidden p-2"
            >
              {/* Previous Button */}
              {selectedTherapist.images.length > 1 && (
                <button
                  onClick={() => {
                    const currentIdx = selectedTherapist.images.indexOf(lightboxMedia);
                    const prevIdx = (currentIdx - 1 + selectedTherapist.images.length) % selectedTherapist.images.length;
                    setLightboxMedia(selectedTherapist.images[prevIdx]);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-[#C9A84C] bg-black/50 p-2.5 rounded-full border border-white/10 z-10 hover:scale-105 transition-all cursor-pointer"
                  title="Previous"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Central Media Render */}
              <div className="w-full h-full flex items-center justify-center">
                {isVideoUrl(lightboxMedia) ? (
                  <video
                    src={lightboxMedia}
                    autoPlay
                    loop
                    muted
                    controls
                    playsInline
                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                  />
                ) : (
                  <img
                    src={lightboxMedia}
                    alt="Expanded view"
                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>

              {/* Next Button */}
              {selectedTherapist.images.length > 1 && (
                <button
                  onClick={() => {
                    const currentIdx = selectedTherapist.images.indexOf(lightboxMedia);
                    const nextIdx = (currentIdx + 1) % selectedTherapist.images.length;
                    setLightboxMedia(selectedTherapist.images[nextIdx]);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-[#C9A84C] bg-black/50 p-2.5 rounded-full border border-white/10 z-10 hover:scale-105 transition-all cursor-pointer"
                  title="Next"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

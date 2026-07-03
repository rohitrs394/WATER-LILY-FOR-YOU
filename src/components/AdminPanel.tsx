import React, { useState } from "react";
import { 
  LayoutDashboard, Sliders, FileText, Settings, Key, Trash2, Edit3, Plus, 
  ArrowRight, Star, RefreshCw, Eye, EyeOff, Check, AlertCircle, Calendar, 
  Users, DollarSign, Award, Bell, Shield, MapPin, Sparkles, LogOut, Download, Upload
} from "lucide-react";
import { AppState, SpaService, Therapist, DailyOffer, Booking, SpaLocation, FAQ, Testimonial, APISettings } from "../types";

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

interface AdminPanelProps {
  state: AppState;
  onUpdateState: (newState: AppState) => Promise<void>;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ state, onUpdateState, onClose }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "services" | "offers" | "therapists" | "bookings" | "locations" | "content" | "api"
  >("dashboard");

  // Key-specific loading or edit states
  const [isSaving, setIsSaving] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [verifyError, setVerifyError] = useState("");

  // Edit/Add modal states
  const [editingService, setEditingService] = useState<SpaService | null>(null);
  const [editingTherapist, setEditingTherapist] = useState<Therapist | null>(null);
  const [editingOffer, setEditingOffer] = useState<DailyOffer | null>(null);
  const [editingLocation, setEditingLocation] = useState<SpaLocation | null>(null);

  // New item form templates
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState<Omit<SpaService, "id">>({
    name: "", category: "Normal", price: 1000, duration: 60, description: "",
    image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=600",
    isPrivate: true, available: true
  });

  const [showAddTherapist, setShowAddTherapist] = useState(false);
  const [newGalleryImg, setNewGalleryImg] = useState("");
  const [newTherapistMediaUrl, setNewTherapistMediaUrl] = useState("");
  const [newTherapist, setNewTherapist] = useState<Omit<Therapist, "id">>({
    name: "", specialization: "", experience: "5 Years", rating: 5.0,
    images: ["https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300"],
    visible: true
  });

  const [uploadingField, setUploadingField] = useState<"primary" | "additional" | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "primary" | "additional") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadingField(field);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file. Please try again.");
      }

      const data = await response.json();
      if (data.success && data.url) {
        if (field === "primary") {
          if (showAddTherapist) {
            const arr = [...newTherapist.images];
            arr[0] = data.url;
            setNewTherapist({ ...newTherapist, images: arr });
          } else if (editingTherapist) {
            const arr = [...editingTherapist.images];
            arr[0] = data.url;
            setEditingTherapist({ ...editingTherapist, images: arr });
          }
        } else {
          if (showAddTherapist) {
            setNewTherapist({
              ...newTherapist,
              images: [...newTherapist.images, data.url]
            });
          } else if (editingTherapist) {
            setEditingTherapist({
              ...editingTherapist,
              images: [...editingTherapist.images, data.url]
            });
          }
        }
      } else {
        throw new Error(data.error || "Failed to upload file.");
      }
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Something went wrong during file upload.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "spa-luxury-secret") {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Invalid credentials. Try: admin / spa-luxury-secret");
    }
  };

  const handleSaveState = async (updatedState: AppState) => {
    setIsSaving(true);
    await onUpdateState(updatedState);
    setIsSaving(false);
  };

  // Live Verify API Credentials
  const handleVerifyAPI = async (provider: string, key: string, model: string) => {
    if (!key) {
      setVerifyStatus("error");
      setVerifyError(`Please enter the API Key for ${provider} first.`);
      return;
    }
    setVerifyStatus("verifying");
    try {
      const res = await fetch("/api/verify-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, key, model })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setVerifyStatus("success");
        // Retrieve fresh database state after successful verification
        const stateRes = await fetch("/api/state");
        if (stateRes.ok) {
          const freshState = await stateRes.json();
          await onUpdateState(freshState);
        }
      } else {
        setVerifyStatus("error");
        setVerifyError(data.error || `Failed to authorize API Key for ${provider}`);
        // Reset verified state on error
        await handleSaveState({
          ...state,
          apiSettings: {
            ...state.apiSettings,
            verified: false
          }
        });
      }
    } catch (e: any) {
      setVerifyStatus("error");
      setVerifyError(e.message || "Network connection error");
    }
  };

  // Export Bookings
  const handleExportBookings = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.bookings, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `spa_bookings_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Dashboard calculations
  const totalBookingsToday = state.bookings.length;
  const totalRevenueToday = state.bookings
    .filter(b => b.status === "Confirmed" || b.status === "Completed")
    .reduce((sum, b) => {
      const srv = state.services.find(s => s.name === b.serviceName);
      return sum + (srv ? srv.price : 0);
    }, 0);
  const pendingRequests = state.bookings.filter(b => b.status === "Pending").length;
  const activeOffersCount = state.offers.filter(o => o.active).length;

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A251A]/95 backdrop-blur-xl">
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#0A251A]/70 border border-[#C9A84C]/40 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C]">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-[#FFF8F0] text-2xl font-bold tracking-tight">Staff Administration</h2>
            <p className="text-xs text-gray-400">Please authenticate to access location databases & schedules.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Username</label>
              <input
                type="text"
                required
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Security Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-400 flex items-center gap-1.5 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                <AlertCircle className="w-4 h-4 shrink-0" /> {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C9A84C] text-[#0A251A] font-sans font-bold text-sm hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 shadow-lg shadow-[#C9A84C]/20"
            >
              Sign In to Terminal <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-white/5">
            <button onClick={onClose} className="text-xs text-gray-400 hover:text-white transition-colors">
              Return to Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0A251A] text-[#FFF8F0] overflow-hidden">
      
      {/* Admin Header */}
      <header className="bg-[#05120c] border-b border-[#C9A84C]/30 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-xl text-[#C9A84C]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg text-[#FFF8F0] flex items-center gap-2">
              ROYAL SPA TERMINAL <span className="text-[10px] font-sans font-normal px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">LIVE</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-mono">Control panel synchronized in real-time</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSaveState(state)}
            className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#FFF8F0] hover:bg-white/10 transition-all flex items-center gap-1.5"
            disabled={isSaving}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSaving ? "animate-spin" : ""}`} />
            {isSaving ? "Saving..." : "Force Sync"}
          </button>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all"
            title="Log Out"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C9A84C] text-[#0A251A] text-xs font-bold hover:opacity-90 transition-opacity"
          >
            Exit Terminal
          </button>
        </div>
      </header>

      {/* Main Terminal Grid */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-64 bg-[#05120c]/60 border-r border-[#C9A84C]/20 flex flex-col p-4 space-y-2 shrink-0">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-sans font-medium transition-all ${
              activeTab === "dashboard" ? "bg-[#C9A84C]/15 text-[#C9A84C] border-l-2 border-[#C9A84C]" : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-4.5 h-4.5" /> Dashboard Overview
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-sans font-medium transition-all ${
              activeTab === "services" ? "bg-[#C9A84C]/15 text-[#C9A84C] border-l-2 border-[#C9A84C]" : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Sliders className="w-4.5 h-4.5" /> Services Pricing ({state.services.length})
          </button>
          <button
            onClick={() => setActiveTab("offers")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-sans font-medium transition-all ${
              activeTab === "offers" ? "bg-[#C9A84C]/15 text-[#C9A84C] border-l-2 border-[#C9A84C]" : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Sparkles className="w-4.5 h-4.5" /> Offer Manager ({state.offers.length})
          </button>
          <button
            onClick={() => setActiveTab("therapists")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-sans font-medium transition-all ${
              activeTab === "therapists" ? "bg-[#C9A84C]/15 text-[#C9A84C] border-l-2 border-[#C9A84C]" : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Users className="w-4.5 h-4.5" /> Therapist Registry ({state.therapists.length})
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-sans font-medium transition-all ${
              activeTab === "bookings" ? "bg-[#C9A84C]/15 text-[#C9A84C] border-l-2 border-[#C9A84C]" : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Calendar className="w-4.5 h-4.5" /> Bookings Register ({state.bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("locations")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-sans font-medium transition-all ${
              activeTab === "locations" ? "bg-[#C9A84C]/15 text-[#C9A84C] border-l-2 border-[#C9A84C]" : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <MapPin className="w-4.5 h-4.5" /> Branch Coordinates
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-sans font-medium transition-all ${
              activeTab === "content" ? "bg-[#C9A84C]/15 text-[#C9A84C] border-l-2 border-[#C9A84C]" : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <FileText className="w-4.5 h-4.5" /> Content Management
          </button>
          <button
            onClick={() => setActiveTab("api")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-sans font-medium transition-all ${
              activeTab === "api" ? "bg-[#C9A84C]/15 text-[#C9A84C] border-l-2 border-[#C9A84C]" : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Settings className="w-4.5 h-4.5" /> AI Engine & API Keys
          </button>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#231530]">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <h2 className="font-serif text-[#FFF8F0] text-2xl font-semibold">Operations Command</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[#05120c]/60 border border-[#C9A84C]/20 p-5 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-gray-400 tracking-wider font-semibold">Total Bookings</p>
                    <h3 className="text-2xl font-bold font-mono">{totalBookingsToday}</h3>
                  </div>
                </div>
                <div className="bg-[#05120c]/60 border border-[#C9A84C]/20 p-5 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 text-green-400 rounded-xl">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-gray-400 tracking-wider font-semibold">Estimated Revenue</p>
                    <h3 className="text-2xl font-bold font-mono text-[#C9A84C]">₹{totalRevenueToday}</h3>
                  </div>
                </div>
                <div className="bg-[#05120c]/60 border border-[#C9A84C]/20 p-5 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-xl">
                    <Bell className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-gray-400 tracking-wider font-semibold">Pending Requests</p>
                    <h3 className="text-2xl font-bold font-mono text-yellow-400">{pendingRequests}</h3>
                  </div>
                </div>
                <div className="bg-[#05120c]/60 border border-[#C9A84C]/20 p-5 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-gray-400 tracking-wider font-semibold">Active Offers</p>
                    <h3 className="text-2xl font-bold font-mono text-purple-400">{activeOffersCount}</h3>
                  </div>
                </div>
              </div>

              {/* Recent Bookings Queue */}
              <div className="bg-[#05120c]/40 border border-white/5 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg text-[#FFF8F0]">Recent Bookings Live Queue</h3>
                  <button 
                    onClick={handleExportBookings}
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs flex items-center gap-1.5 border border-white/10"
                  >
                    <Download className="w-3.5 h-3.5" /> Export as JSON
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 uppercase text-[9px] tracking-wider font-mono">
                        <th className="py-3 px-4">Client</th>
                        <th className="py-3 px-4">Branch</th>
                        <th className="py-3 px-4">Therapy Selected</th>
                        <th className="py-3 px-4">Schedule Date/Time</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-sans">
                      {state.bookings.slice(-8).reverse().map((b) => (
                        <tr key={b.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-white">{b.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{b.phone}</p>
                          </td>
                          <td className="py-3.5 px-4 font-medium">{b.spaLocation}</td>
                          <td className="py-3.5 px-4 text-[#C9A84C] font-medium">{b.serviceName}</td>
                          <td className="py-3.5 px-4 font-mono">{b.dateTime.replace("T", " ")}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] border ${
                              b.status === "Pending" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                              b.status === "Confirmed" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                              b.status === "Completed" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                              "bg-red-500/10 text-red-400 border-red-500/20"
                            }`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SERVICES */}
          {activeTab === "services" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-[#FFF8F0] text-2xl font-semibold">Services Management</h2>
                  <p className="text-xs text-gray-400">Add, edit, or remove normal and luxury wellness packages.</p>
                </div>
                <button
                  onClick={() => setShowAddService(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C9A84C] text-[#0A251A] text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add New Service
                </button>
              </div>

              {/* List of services in a grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.services.map((service) => (
                  <div key={service.id} className="bg-[#05120c]/60 border border-[#C9A84C]/20 rounded-2xl overflow-hidden flex flex-col">
                    <div className="w-full h-32 overflow-hidden bg-black relative shrink-0">
                      {renderMedia(service.image, "w-full h-full object-cover opacity-80", service.name)}
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                            service.category === "Luxury" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                          }`}>
                            {service.category}
                          </span>
                          {service.isPrivate && (
                            <span className="text-[10px] text-yellow-400">🤤 Private</span>
                          )}
                        </div>
                        <h3 className="font-serif text-[#FFF8F0] font-semibold mt-1">{service.name}</h3>
                        <p className="text-[11px] text-gray-400 mt-1.5 line-clamp-2">{service.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-xs font-mono text-[#C9A84C] font-semibold">₹{service.price} / {service.duration} mins</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingService(service)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this service?")) {
                                const list = state.services.filter(s => s.id !== service.id);
                                handleSaveState({ ...state, services: list });
                              }
                            }}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Service Modals */}
              {(editingService || showAddService) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                  <div className="w-full max-w-lg p-6 rounded-2xl bg-[#0A251A] border border-[#C9A84C]/40 space-y-4">
                    <h3 className="font-serif text-[#FFF8F0] text-xl font-bold">
                      {showAddService ? "Create New Spa Package" : "Edit Spa Package Details"}
                    </h3>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (showAddService) {
                          const newId = String(state.services.length + 1);
                          const completeSrv: SpaService = { ...newService, id: newId };
                          handleSaveState({ ...state, services: [...state.services, completeSrv] });
                          setShowAddService(false);
                        } else if (editingService) {
                          const list = state.services.map(s => s.id === editingService.id ? editingService : s);
                          handleSaveState({ ...state, services: list });
                          setEditingService(null);
                        }
                      }}
                      className="space-y-4 text-xs font-sans"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-gray-400">Package Name</label>
                          <input
                            type="text"
                            required
                            value={showAddService ? newService.name : editingService?.name || ""}
                            onChange={(e) => showAddService ? setNewService({ ...newService, name: e.target.value }) : setEditingService({ ...editingService!, name: e.target.value })}
                            className="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-400">Category</label>
                          <select
                            value={showAddService ? newService.category : editingService?.category || "Normal"}
                            onChange={(e) => showAddService ? setNewService({ ...newService, category: e.target.value as "Normal" | "Luxury" }) : setEditingService({ ...editingService!, category: e.target.value as "Normal" | "Luxury" })}
                            className="w-full py-2 px-3 rounded-lg bg-[#0A251A] border border-white/10 text-white"
                          >
                            <option value="Normal">Normal</option>
                            <option value="Luxury">Luxury</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-gray-400">Price (INR ₹)</label>
                          <input
                            type="number"
                            required
                            value={showAddService ? newService.price : editingService?.price || 0}
                            onChange={(e) => showAddService ? setNewService({ ...newService, price: Number(e.target.value) }) : setEditingService({ ...editingService!, price: Number(e.target.value) })}
                            className="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-400">Duration (mins)</label>
                          <input
                            type="number"
                            required
                            value={showAddService ? newService.duration : editingService?.duration || 0}
                            onChange={(e) => showAddService ? setNewService({ ...newService, duration: Number(e.target.value) }) : setEditingService({ ...editingService!, duration: Number(e.target.value) })}
                            className="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-400">Image or Video URL (MP4 / Cloudinary / Unsplash)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. https://example.com/video.mp4 or https://images.unsplash.com/..."
                          value={showAddService ? newService.image : editingService?.image || ""}
                          onChange={(e) => showAddService ? setNewService({ ...newService, image: e.target.value }) : setEditingService({ ...editingService!, image: e.target.value })}
                          className="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-[11px]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-400">Description</label>
                        <textarea
                          rows={3}
                          required
                          value={showAddService ? newService.description : editingService?.description || ""}
                          onChange={(e) => showAddService ? setNewService({ ...newService, description: e.target.value }) : setEditingService({ ...editingService!, description: e.target.value })}
                          className="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-white resize-none"
                        />
                      </div>

                      <div className="flex items-center gap-4 py-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showAddService ? newService.isPrivate : editingService?.isPrivate || false}
                            onChange={(e) => showAddService ? setNewService({ ...newService, isPrivate: e.target.checked }) : setEditingService({ ...editingService!, isPrivate: e.target.checked })}
                            className="rounded border-white/15 text-[#C9A84C]"
                          />
                          <span>Show Private Service Badge</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showAddService ? newService.available : editingService?.available || false}
                            onChange={(e) => showAddService ? setNewService({ ...newService, available: e.target.checked }) : setEditingService({ ...editingService!, available: e.target.checked })}
                            className="rounded border-white/15 text-[#C9A84C]"
                          />
                          <span>Currently Available</span>
                        </label>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddService(false);
                            setEditingService(null);
                          }}
                          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C9A84C] text-[#0A251A] font-bold"
                        >
                          Save Package
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OFFERS */}
          {activeTab === "offers" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-[#FFF8F0] text-2xl font-semibold">Offers & Campaigns</h2>
                  <p className="text-xs text-gray-400">Create countdown discount banners and popups for first-time visitors.</p>
                </div>
                <button
                  onClick={() => {
                    const nextId = "o_" + Date.now();
                    const newOffer: DailyOffer = {
                      id: nextId, title: "Special Rejuvenation Offer", discountDescription: "20% off Swedish packages",
                      duration: "Ends in 4 hours", animationEffect: "gold-glow", active: true, bannerHomepage: true,
                      scheduleFuture: "", autoShowOnLoad: true
                    };
                    handleSaveState({ ...state, offers: [...state.offers, newOffer] });
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C9A84C] text-[#0A251A] text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Create Daily Offer
                </button>
              </div>

              {/* Offer Listing */}
              <div className="space-y-4">
                {state.offers.map((offer) => (
                  <div key={offer.id} className="bg-[#05120c]/60 border border-[#C9A84C]/20 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-base text-white font-bold">{offer.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-mono border ${
                          offer.active ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                        }`}>
                          {offer.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-[#C9A84C]">{offer.discountDescription}</p>
                      <p className="text-[10px] text-gray-400 font-mono">Timer details: {offer.duration} | Style: {offer.animationEffect}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          const updated = state.offers.map(o => o.id === offer.id ? { ...o, active: !o.active } : o);
                          handleSaveState({ ...state, offers: updated });
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                          offer.active ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" : "bg-white/5 text-gray-300 border-white/10"
                        }`}
                      >
                        {offer.active ? "Set Inactive" : "Activate"}
                      </button>
                      <button
                        onClick={() => {
                          const updated = state.offers.map(o => o.id === offer.id ? { ...o, autoShowOnLoad: !o.autoShowOnLoad } : o);
                          handleSaveState({ ...state, offers: updated });
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                          offer.autoShowOnLoad ? "bg-purple-500/15 text-purple-400 border-purple-500/30" : "bg-white/5 text-gray-300 border-white/10"
                        }`}
                        title="Popup 5-10 seconds on load"
                      >
                        {offer.autoShowOnLoad ? "Popup Active" : "No Popup"}
                      </button>
                      <button
                        onClick={() => setEditingOffer(offer)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this campaign?")) {
                            const updated = state.offers.filter(o => o.id !== offer.id);
                            handleSaveState({ ...state, offers: updated });
                          }
                        }}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit Offer Modal */}
              {editingOffer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                  <div className="w-full max-w-md p-6 rounded-2xl bg-[#0A251A] border border-[#C9A84C]/40 space-y-4">
                    <h3 className="font-serif text-[#FFF8F0] text-lg font-bold">Customize Daily Offer</h3>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const updated = state.offers.map(o => o.id === editingOffer.id ? editingOffer : o);
                        handleSaveState({ ...state, offers: updated });
                        setEditingOffer(null);
                      }}
                      className="space-y-4 text-xs font-sans"
                    >
                      <div className="space-y-1">
                        <label className="text-gray-400">Offer Title</label>
                        <input
                          type="text"
                          required
                          value={editingOffer.title}
                          onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                          className="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-400">Discount Description Banner</label>
                        <input
                          type="text"
                          required
                          value={editingOffer.discountDescription}
                          onChange={(e) => setEditingOffer({ ...editingOffer, discountDescription: e.target.value })}
                          className="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-400">Timer/Duration Subtitle</label>
                        <input
                          type="text"
                          required
                          value={editingOffer.duration}
                          placeholder="e.g. Ends tonight at 10:00 PM"
                          onChange={(e) => setEditingOffer({ ...editingOffer, duration: e.target.value })}
                          className="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-400">Glowing Animation Effect</label>
                        <select
                          value={editingOffer.animationEffect}
                          onChange={(e) => setEditingOffer({ ...editingOffer, animationEffect: e.target.value as any })}
                          className="w-full py-2 px-3 rounded-lg bg-[#0A251A] border border-white/10 text-white"
                        >
                          <option value="gold-glow">Luxury Gold Glow</option>
                          <option value="pulse">Pulse Scale</option>
                          <option value="slide-up">Slide Up</option>
                          <option value="fade-in">Fade In</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setEditingOffer(null)}
                          className="px-4 py-2 rounded-xl bg-white/5 text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C9A84C] text-[#0A251A] font-bold"
                        >
                          Apply Offer Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: THERAPISTS */}
          {activeTab === "therapists" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-[#FFF8F0] text-2xl font-semibold">Therapist Registry</h2>
                  <p className="text-xs text-gray-400">Update certified female therapists, experience, specialized fields, and rating details.</p>
                </div>
                <button
                  onClick={() => setShowAddTherapist(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C9A84C] text-[#0A251A] text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Therapist
                </button>
              </div>

              {/* Therapist Profiles List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.therapists.map((therapist) => (
                  <div key={therapist.id} className="bg-[#05120c]/60 border border-[#C9A84C]/20 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-4">
                      <img src={therapist.images[0]} alt={therapist.name} className="w-16 h-16 rounded-full object-cover border border-[#C9A84C]/40" />
                      <div>
                        <h3 className="font-serif font-bold text-[#FFF8F0]">{therapist.name}</h3>
                        <p className="text-[10px] text-gray-400">Exp: {therapist.experience}</p>
                        <p className="text-[10px] text-[#C9A84C] flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-[#C9A84C]" /> {therapist.rating} Verified Rating
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-gray-400 tracking-wider">Specialty</p>
                      <p className="text-xs text-[#FFF8F0] font-medium">{therapist.specialization}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-[10px] text-gray-400">Profile photos: {therapist.images.length}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingTherapist(therapist)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete therapist profile?")) {
                              const list = state.therapists.filter(t => t.id !== therapist.id);
                              handleSaveState({ ...state, therapists: list });
                            }
                          }}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Therapist Modal */}
              {(editingTherapist || showAddTherapist) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                  <div className="w-full max-w-md p-6 rounded-2xl bg-[#0A251A] border border-[#C9A84C]/40 space-y-4">
                    <h3 className="font-serif text-[#FFF8F0] text-lg font-bold">
                      {showAddTherapist ? "Register Therapist" : "Modify Therapist Profile"}
                    </h3>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (showAddTherapist) {
                          const completeT: Therapist = {
                            ...newTherapist,
                            id: "t_" + Date.now()
                          };
                          handleSaveState({ ...state, therapists: [...state.therapists, completeT] });
                          setShowAddTherapist(false);
                        } else if (editingTherapist) {
                          const list = state.therapists.map(t => t.id === editingTherapist.id ? editingTherapist : t);
                          handleSaveState({ ...state, therapists: list });
                          setEditingTherapist(null);
                        }
                      }}
                      className="space-y-4 text-xs font-sans"
                    >
                      <div className="space-y-1">
                        <label className="text-gray-400">Therapist Name</label>
                        <input
                          type="text"
                          required
                          value={showAddTherapist ? newTherapist.name : editingTherapist?.name || ""}
                          onChange={(e) => showAddTherapist ? setNewTherapist({ ...newTherapist, name: e.target.value }) : setEditingTherapist({ ...editingTherapist!, name: e.target.value })}
                          className="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-gray-400">Experience Years</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 5 Years"
                            value={showAddTherapist ? newTherapist.experience : editingTherapist?.experience || ""}
                            onChange={(e) => showAddTherapist ? setNewTherapist({ ...newTherapist, experience: e.target.value }) : setEditingTherapist({ ...editingTherapist!, experience: e.target.value })}
                            className="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-gray-400">Rating Scale</label>
                          <input
                            type="number"
                            step="0.1"
                            max="5.0"
                            required
                            value={showAddTherapist ? newTherapist.rating : editingTherapist?.rating || 5.0}
                            onChange={(e) => showAddTherapist ? setNewTherapist({ ...newTherapist, rating: Number(e.target.value) }) : setEditingTherapist({ ...editingTherapist!, rating: Number(e.target.value) })}
                            className="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-400">Specializations</label>
                        <input
                          type="text"
                          required
                          placeholder="Swedish Massage, facials..."
                          value={showAddTherapist ? newTherapist.specialization : editingTherapist?.specialization || ""}
                          onChange={(e) => showAddTherapist ? setNewTherapist({ ...newTherapist, specialization: e.target.value }) : setEditingTherapist({ ...editingTherapist!, specialization: e.target.value })}
                          className="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-white"
                        />
                      </div>

                      <div className="space-y-3 p-3.5 bg-black/40 border border-white/5 rounded-xl">
                        <p className="font-serif text-[#FFF8F0] font-semibold text-xs border-b border-white/5 pb-1 flex items-center gap-1.5">
                          📸 Instagram-style Media Gallery
                        </p>

                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">Primary Profile Pic URL *</label>
                          <input
                            type="text"
                            required
                            placeholder="Primary photo URL..."
                            value={showAddTherapist ? (newTherapist.images[0] || "") : (editingTherapist?.images[0] || "")}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (showAddTherapist) {
                                const arr = [...newTherapist.images];
                                arr[0] = val;
                                setNewTherapist({ ...newTherapist, images: arr });
                              } else if (editingTherapist) {
                                const arr = [...editingTherapist.images];
                                arr[0] = val;
                                setEditingTherapist({ ...editingTherapist, images: arr });
                              }
                            }}
                            className="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-[11px]"
                          />
                          
                          {/* Primary file uploader */}
                          <div className="flex items-center justify-between gap-2 mt-1.5 bg-black/20 p-2 rounded-lg border border-white/5">
                            <span className="text-[10px] text-gray-400 font-sans">Or select from your gallery:</span>
                            <label className={`flex items-center gap-1.5 px-2.5 py-1 bg-[#C9A84C]/15 hover:bg-[#C9A84C]/25 text-[#C9A84C] font-semibold rounded-md text-[10px] cursor-pointer transition-all border border-[#C9A84C]/20 ${uploadingField ? 'opacity-50 pointer-events-none' : ''}`}>
                              <Upload className="w-3 h-3" />
                              {uploadingField === "primary" ? "Uploading..." : "Upload Profile Pic"}
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                disabled={uploadingField !== null}
                                onChange={(e) => handleFileUpload(e, "primary")} 
                              />
                            </label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">Add Additional Photo/Video URL</label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              placeholder="Paste MP4 or Image URL..."
                              value={newTherapistMediaUrl}
                              onChange={(e) => setNewTherapistMediaUrl(e.target.value)}
                              className="flex-1 py-1.5 px-3 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-[11px]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!newTherapistMediaUrl.trim()) return;
                                const url = newTherapistMediaUrl.trim();
                                if (showAddTherapist) {
                                  setNewTherapist({
                                    ...newTherapist,
                                    images: [...newTherapist.images, url]
                                  });
                                } else if (editingTherapist) {
                                  setEditingTherapist({
                                    ...editingTherapist,
                                    images: [...editingTherapist.images, url]
                                  });
                                }
                                setNewTherapistMediaUrl("");
                              }}
                              className="px-3 py-1.5 bg-[#C9A84C] text-[#0A251A] font-bold rounded-lg text-xs hover:opacity-90 transition-all cursor-pointer"
                            >
                              Add
                            </button>
                          </div>

                          {/* Additional file uploader */}
                          <div className="flex items-center justify-between gap-2 mt-1 bg-black/20 p-2 rounded-lg border border-white/5">
                            <span className="text-[10px] text-gray-400 font-sans">Or upload from your gallery:</span>
                            <label className={`flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-semibold rounded-md text-[10px] cursor-pointer transition-all border border-emerald-500/20 ${uploadingField ? 'opacity-50 pointer-events-none' : ''}`}>
                              <Upload className="w-3 h-3" />
                              {uploadingField === "additional" ? "Uploading..." : "Upload Media File"}
                              <input 
                                type="file" 
                                accept="image/*,video/*" 
                                className="hidden" 
                                disabled={uploadingField !== null}
                                onChange={(e) => handleFileUpload(e, "additional")} 
                              />
                            </label>
                          </div>
                        </div>

                        {uploadError && (
                          <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[10px] flex items-center gap-1.5">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            {uploadError}
                          </div>
                        )}

                        {/* Display list of current therapist images */}
                        <div className="space-y-1">
                          <p className="text-[9px] text-gray-400 font-mono uppercase">Current Gallery Assets ({showAddTherapist ? newTherapist.images.length : editingTherapist?.images.length || 0}):</p>
                          <div className="grid grid-cols-4 gap-2 pt-1 max-h-36 overflow-y-auto">
                            {(showAddTherapist ? newTherapist.images : editingTherapist?.images || []).map((url, idx) => (
                              <div key={idx} className="relative aspect-square rounded bg-black/60 border border-white/10 overflow-hidden group">
                                {renderMedia(url, "w-full h-full object-cover", `Media ${idx}`)}
                                <div className="absolute top-0 right-0 bg-black/80 hover:bg-red-600 text-white text-[9px] p-0.5 rounded cursor-pointer transition-all"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (idx === 0) {
                                      alert("Primary profile pic cannot be removed, replace it instead.");
                                      return;
                                    }
                                    if (showAddTherapist) {
                                      const arr = newTherapist.images.filter((_, i) => i !== idx);
                                      setNewTherapist({ ...newTherapist, images: arr });
                                    } else if (editingTherapist) {
                                      const arr = editingTherapist.images.filter((_, i) => i !== idx);
                                      setEditingTherapist({ ...editingTherapist, images: arr });
                                    }
                                  }}
                                >
                                  ✕
                                </div>
                                <span className="absolute bottom-0 left-0 bg-black/60 px-1 text-[8px] text-gray-300">
                                  {idx === 0 ? "P" : idx}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddTherapist(false);
                            setEditingTherapist(null);
                          }}
                          className="px-4 py-2 rounded-xl bg-white/5 text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C9A84C] text-[#0A251A] font-bold"
                        >
                          Save Profile
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: BOOKINGS */}
          {activeTab === "bookings" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-[#FFF8F0] text-2xl font-semibold">Bookings Register</h2>
                <p className="text-xs text-gray-400 font-sans">Filter bookings, assign female therapists, confirm details, and simulate automatic WhatsApp reminders.</p>
              </div>

              {/* Bookings Queue */}
              <div className="bg-[#05120c]/60 border border-white/5 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300 divide-y divide-white/5 font-sans">
                    <thead className="bg-black/35 text-[9px] uppercase tracking-wider font-mono text-gray-400">
                      <tr>
                        <th className="py-3.5 px-4">Guest</th>
                        <th className="py-3.5 px-4">Spa Branch</th>
                        <th className="py-3.5 px-4">Therapy & Fee</th>
                        <th className="py-3.5 px-4">Date & Time</th>
                        <th className="py-3.5 px-4">Assigned Staff</th>
                        <th className="py-3.5 px-4">Status & Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {state.bookings.map((booking) => {
                        const srv = state.services.find(s => s.name === booking.serviceName);
                        return (
                          <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4">
                              <p className="font-bold text-white">{booking.name}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{booking.phone}</p>
                              {booking.specialRequests && (
                                <p className="text-[10px] italic text-[#C9A84C] mt-1 bg-white/5 px-2 py-0.5 rounded inline-block">
                                  "{booking.specialRequests}"
                                </p>
                              )}
                            </td>
                            <td className="py-4 px-4 font-semibold">{booking.spaLocation}</td>
                            <td className="py-4 px-4">
                              <p className="text-[#C9A84C] font-semibold">{booking.serviceName}</p>
                              <p className="text-[10px] text-gray-400 font-mono">₹{srv ? srv.price : "Custom"}</p>
                            </td>
                            <td className="py-4 px-4 font-mono">{booking.dateTime.replace("T", " ")}</td>
                            <td className="py-4 px-4">
                              <select
                                value={booking.assignedTherapistId || ""}
                                onChange={(e) => {
                                  const list = state.bookings.map(b => b.id === booking.id ? { ...b, assignedTherapistId: e.target.value } : b);
                                  handleSaveState({ ...state, bookings: list });
                                }}
                                className="bg-[#0A251A] border border-white/10 rounded px-2 py-1 text-[11px] text-[#C9A84C] outline-none"
                              >
                                <option value="">Select Therapist</option>
                                {state.therapists.map(t => (
                                  <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-4 px-4 space-y-2">
                              <div className="flex items-center gap-2">
                                <select
                                  value={booking.status}
                                  onChange={(e) => {
                                    const list = state.bookings.map(b => b.id === booking.id ? { ...b, status: e.target.value as any } : b);
                                    handleSaveState({ ...state, bookings: list });
                                  }}
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                                    booking.status === "Pending" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                                    booking.status === "Confirmed" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                    booking.status === "Completed" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                    "bg-red-500/10 text-red-400 border-red-500/20"
                                  }`}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                                <button
                                  onClick={() => {
                                    // Trigger realistic simulated WhatsApp auto reminder
                                    const msg = `💆 *ROYAL SPA UPDATE* 💆\n\n` +
                                      `Hello ${booking.name}, your booking for *${booking.serviceName}* at *${booking.spaLocation}* is now *${booking.status}*!\n\n` +
                                      `📍 Address: ${state.locations.find(l => l.name === booking.spaLocation)?.address || ""}\n\n` +
                                      `We look forward to pampering you! 🤤`;
                                    window.open(`https://wa.me/${booking.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
                                  }}
                                  className="text-[10px] px-2 py-0.5 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white rounded border border-green-500/30 font-medium"
                                  title="Open WhatsApp Auto-Notify Dialog"
                                >
                                  Notify WhatsApp
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: LOCATIONS */}
          {activeTab === "locations" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-[#FFF8F0] text-2xl font-semibold">Location Coordinates</h2>
                <p className="text-xs text-gray-400">Configure address blocks, direct maps embedding links, and visibility toggles.</p>
              </div>

              <div className="space-y-6">
                {state.locations.map((loc) => (
                  <div key={loc.id} className="bg-[#05120c]/60 border border-[#C9A84C]/20 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 text-xs font-sans">
                      <h3 className="font-serif text-lg font-bold text-[#C9A84C]">{loc.name}</h3>
                      <div className="space-y-2">
                        <label className="text-gray-400 uppercase text-[9px] tracking-wider font-semibold">📍 Full Address</label>
                        <textarea
                          rows={3}
                          value={loc.address}
                          onChange={(e) => {
                            const updated = state.locations.map(l => l.id === loc.id ? { ...l, address: e.target.value } : l);
                            handleSaveState({ ...state, locations: updated });
                          }}
                          className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white resize-none text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-gray-400 uppercase text-[9px] tracking-wider font-semibold">📞 Contact Numbers (separated by commas)</label>
                        <input
                          type="text"
                          value={loc.phoneNumbers.join(", ")}
                          onChange={(e) => {
                            const nums = e.target.value.split(",").map(n => n.trim());
                            const updated = state.locations.map(l => l.id === loc.id ? { ...l, phoneNumbers: nums } : l);
                            handleSaveState({ ...state, locations: updated });
                          }}
                          className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-gray-400 uppercase text-[9px] tracking-wider font-semibold block">🗺️ Google Maps Embed Query/URL</label>
                      <input
                        type="text"
                        value={loc.mapEmbedUrl}
                        onChange={(e) => {
                          const updated = state.locations.map(l => l.id === loc.id ? { ...l, mapEmbedUrl: e.target.value } : l);
                          handleSaveState({ ...state, locations: updated });
                        }}
                        className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-[10px]"
                      />
                      <iframe src={loc.mapEmbedUrl} className="w-full h-36 rounded-xl border border-white/10 opacity-75 mt-2" loading="lazy" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: CONTENT */}
          {activeTab === "content" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-[#FFF8F0] text-2xl font-semibold">Content & Media Customization</h2>
                <p className="text-xs text-gray-400">Edit homepage titles, about description, background loop videos, signature atmospheric suite videos, and the sanctuary photo gallery.</p>
              </div>

              {/* Text content card */}
              <div className="bg-[#05120c]/60 border border-[#C9A84C]/20 p-6 rounded-2xl space-y-4 font-sans text-xs">
                <h3 className="font-serif text-base text-white font-semibold">Homepage Text Headings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-gray-400 font-semibold uppercase text-[9px] tracking-wider">Hero Main Title (Serif)</label>
                    <input
                      type="text"
                      value={state.content.heroTitle}
                      onChange={(e) => handleSaveState({ ...state, content: { ...state.content, heroTitle: e.target.value } })}
                      className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-400 font-semibold uppercase text-[9px] tracking-wider">Hero Subtitle</label>
                    <input
                      type="text"
                      value={state.content.heroSubtitle}
                      onChange={(e) => handleSaveState({ ...state, content: { ...state.content, heroSubtitle: e.target.value } })}
                      className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold block uppercase text-[9px] tracking-wider">About Block Text</label>
                  <textarea
                    rows={4}
                    value={state.content.aboutText}
                    onChange={(e) => handleSaveState({ ...state, content: { ...state.content, aboutText: e.target.value } })}
                    className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white resize-none"
                  />
                </div>
              </div>

              {/* Media Settings (Videos) card */}
              <div className="bg-[#05120c]/60 border border-[#C9A84C]/20 p-6 rounded-2xl space-y-4 font-sans text-xs">
                <h3 className="font-serif text-base text-white font-semibold">Atmospheric Videos & Backgrounds</h3>
                <p className="text-[10px] text-gray-400">Pasting links here instantly updates the background loops and signature showcase players across the main website.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-gray-400 font-semibold uppercase text-[9px] tracking-wider block">🎥 Background Silent Video Loop (Iframe URL)</label>
                    <input
                      type="text"
                      placeholder="Enter Cloudinary or Youtube embed link..."
                      value={state.content.backgroundVideoUrl || ""}
                      onChange={(e) => handleSaveState({ ...state, content: { ...state.content, backgroundVideoUrl: e.target.value } })}
                      className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-[11px]"
                    />
                    <span className="text-[10px] text-gray-400 block font-mono">Current: {state.content.backgroundVideoUrl || "Default Cloudinary Silent Loop"}</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-400 font-semibold uppercase text-[9px] tracking-wider block">🎬 Signature Sanctuary Video (MP4 / Direct URL)</label>
                    <input
                      type="text"
                      placeholder="Enter .mp4 or direct video link..."
                      value={state.content.sectionVideoUrl || ""}
                      onChange={(e) => handleSaveState({ ...state, content: { ...state.content, sectionVideoUrl: e.target.value } })}
                      className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-[11px]"
                    />
                    <span className="text-[10px] text-gray-400 block font-mono">Current: {state.content.sectionVideoUrl || "Water Lilly Spa Sanctuary MP4"}</span>
                  </div>
                </div>
              </div>

              {/* Sanctuary Photo Gallery management card */}
              <div className="bg-[#05120c]/60 border border-[#C9A84C]/20 p-6 rounded-2xl space-y-4 font-sans text-xs">
                <h3 className="font-serif text-base text-white font-semibold">Sanctuary Photo Gallery Manager</h3>
                
                {/* Form to add a photo */}
                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <label className="text-gray-400 font-semibold uppercase text-[9px] tracking-wider block">Add New Gallery Image URL</label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={newGalleryImg}
                      onChange={(e) => setNewGalleryImg(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-[11px]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newGalleryImg.trim()) return;
                      const updatedImages = [...(state.content.galleryImages || []), newGalleryImg.trim()];
                      handleSaveState({ ...state, content: { ...state.content, galleryImages: updatedImages } });
                      setNewGalleryImg("");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C9A84C] text-[#0A251A] font-bold text-xs hover:opacity-90 flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Add Photo
                  </button>
                </div>

                {/* Thumbnails grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-4 border-t border-white/5">
                  {(state.content.galleryImages || []).map((img, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/40 h-24 flex flex-col justify-between">
                      <img src={img} alt={`Thumbnail ${index}`} className="w-full h-16 object-cover" />
                      <div className="flex items-center justify-between p-1 bg-black/60 text-[9px] text-gray-400">
                        <span>Image #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Remove this image from the sanctuary gallery?")) {
                              const updatedImages = state.content.galleryImages.filter((_, i) => i !== index);
                              handleSaveState({ ...state, content: { ...state.content, galleryImages: updatedImages } });
                            }
                          }}
                          className="text-red-400 hover:text-red-500 font-bold"
                          title="Delete Photo"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {(state.content.galleryImages || []).length === 0 && (
                    <p className="col-span-full text-center text-gray-500 py-4 italic">No gallery images added yet.</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 8: API SETTINGS */}
          {activeTab === "api" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-[#FFF8F0] text-2xl font-semibold">AI Receptionist Credentials & Engine</h2>
                <p className="text-xs text-gray-400">Configure credentials for Sia (your virtual receptionist). Sia works exclusively using your verified provider configuration below.</p>
              </div>

              <div className="max-w-2xl bg-[#05120c]/60 border border-[#C9A84C]/20 p-6 rounded-3xl space-y-6 text-xs font-sans">
                {/* Active Provider Selector */}
                <div className="space-y-2">
                  <label className="text-gray-300 font-semibold text-xs block">Active AI Provider</label>
                  <select
                    value={state.apiSettings.provider || "none"}
                    onChange={(e) => {
                      const newProvider = e.target.value as any;
                      handleSaveState({
                        ...state,
                        apiSettings: {
                          ...state.apiSettings,
                          provider: newProvider,
                          verified: false // Must re-verify whenever switching providers
                        }
                      });
                      setVerifyStatus("idle");
                    }}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-sans text-xs focus:outline-none focus:border-[#C9A84C]"
                  >
                    <option value="none" className="bg-[#0A251A] text-white">None (Disabled)</option>
                    <option value="deepseek" className="bg-[#0A251A] text-white">DeepSeek API</option>
                    <option value="openai" className="bg-[#0A251A] text-white">OpenAI API</option>
                    <option value="grok" className="bg-[#0A251A] text-white">xAI Grok API</option>
                    <option value="kimi" className="bg-[#0A251A] text-white">Kimi (Moonshot) API</option>
                    <option value="gemini" className="bg-[#0A251A] text-white">Google Gemini API</option>
                  </select>
                  <p className="text-[10px] text-gray-400">Changing active provider requires clicking "Verify & Activate" below to enable the assistant.</p>
                </div>

                {state.apiSettings.provider !== "none" && (
                  <div className="space-y-4 p-4 rounded-2xl bg-black/30 border border-white/5">
                    <h3 className="font-semibold text-xs text-[#C9A84C] capitalize flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {state.apiSettings.provider} Configuration Settings
                    </h3>

                    {/* API Key Input */}
                    <div className="space-y-1.5">
                      <label className="text-gray-300 text-[11px] font-medium block">API Key</label>
                      <input
                        type="password"
                        placeholder={`Enter your ${state.apiSettings.provider} API Key...`}
                        value={
                          state.apiSettings.provider === "deepseek" ? state.apiSettings.deepseekKey || "" :
                          state.apiSettings.provider === "openai" ? state.apiSettings.openaiKey || "" :
                          state.apiSettings.provider === "grok" ? state.apiSettings.grokKey || "" :
                          state.apiSettings.provider === "kimi" ? state.apiSettings.kimiKey || "" :
                          state.apiSettings.provider === "gemini" ? state.apiSettings.geminiKey || "" : ""
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          const field = `${state.apiSettings.provider}Key`;
                          handleSaveState({
                            ...state,
                            apiSettings: {
                              ...state.apiSettings,
                              [field]: val,
                              verified: false // Must re-verify on change
                            }
                          });
                          setVerifyStatus("idle");
                        }}
                        className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#C9A84C]"
                      />
                    </div>

                    {/* Model Selector / Custom Input */}
                    <div className="space-y-1.5">
                      <label className="text-gray-300 text-[11px] font-medium block">AI Model Name</label>
                      <input
                        type="text"
                        placeholder="e.g. gpt-4o-mini, deepseek-chat..."
                        value={
                          state.apiSettings.provider === "deepseek" ? state.apiSettings.deepseekModel || "deepseek-chat" :
                          state.apiSettings.provider === "openai" ? state.apiSettings.openaiModel || "gpt-4o-mini" :
                          state.apiSettings.provider === "grok" ? state.apiSettings.grokModel || "grok-2-1212" :
                          state.apiSettings.provider === "kimi" ? state.apiSettings.kimiModel || "moonshot-v1-8k" :
                          state.apiSettings.provider === "gemini" ? state.apiSettings.geminiModel || "gemini-1.5-flash" : ""
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          const field = `${state.apiSettings.provider}Model`;
                          handleSaveState({
                            ...state,
                            apiSettings: {
                              ...state.apiSettings,
                              [field]: val,
                              verified: false
                            }
                          });
                          setVerifyStatus("idle");
                        }}
                        className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#C9A84C]"
                      />
                    </div>

                    {/* Verification and activation trigger */}
                    <button
                      onClick={() => {
                        const prov = state.apiSettings.provider;
                        const keyField = `${prov}Key` as keyof APISettings;
                        const modelField = `${prov}Model` as keyof APISettings;
                        const key = state.apiSettings[keyField] as string;
                        const model = state.apiSettings[modelField] as string;
                        handleVerifyAPI(prov, key, model);
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C9A84C] hover:from-[#e2be4c] hover:to-[#d8b958] text-[#0A251A] font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      Verify Key & Activate Provider
                    </button>
                  </div>
                )}

                {/* State verification banner */}
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                  state.apiSettings.verified && state.apiSettings.provider !== "none"
                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                    : "bg-amber-500/5 border-amber-500/20 text-amber-400"
                }`}>
                  {state.apiSettings.verified && state.apiSettings.provider !== "none" ? (
                    <Check className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                  )}
                  <div className="space-y-1">
                    <span className="font-bold text-xs block">
                      {state.apiSettings.verified && state.apiSettings.provider !== "none"
                        ? `Sia is ONLINE (Powered by ${state.apiSettings.provider.toUpperCase()})`
                        : "Sia is OFFLINE / DISABLED"}
                    </span>
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      {state.apiSettings.verified && state.apiSettings.provider !== "none"
                        ? `The active AI receptionist configuration is fully verified and functional. Sia will respond using the active model settings.`
                        : `Sia chatbot will not respond to clients until you successfully verify and save a credential. Select a provider above, enter your key, and click "Verify Key & Activate Provider" to get started.`}
                    </p>
                  </div>
                </div>

                {/* Key Verification Status */}
                {verifyStatus !== "idle" && (
                  <div className={`p-4 rounded-xl border ${
                    verifyStatus === "verifying" ? "bg-blue-500/5 border-blue-500/20 text-blue-400" :
                    verifyStatus === "success" ? "bg-green-500/5 border-green-500/20 text-green-400" :
                    "bg-red-500/5 border-red-500/20 text-red-400"
                  } flex items-center gap-2`}>
                    {verifyStatus === "verifying" && <RefreshCw className="w-4 h-4 animate-spin shrink-0" />}
                    {verifyStatus === "success" && <Check className="w-4 h-4 shrink-0" />}
                    {verifyStatus === "error" && <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>
                      {verifyStatus === "verifying" && `Verifying authentication key validity with ${state.apiSettings.provider} servers...`}
                      {verifyStatus === "success" && `Key successfully authorized! Sia is now fully active with ${state.apiSettings.provider.toUpperCase()} backing.`}
                      {verifyStatus === "error" && `Key Verification Failed: ${verifyError}`}
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-300 font-semibold block">Response Timeout Duration</label>
                    <span className="font-mono text-[#C9A84C] font-semibold">{state.apiSettings.responseTimeout || 15} seconds</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={state.apiSettings.responseTimeout || 15}
                    onChange={(e) => handleSaveState({ ...state, apiSettings: { ...state.apiSettings, responseTimeout: Number(e.target.value) } })}
                    className="w-full accent-[#C9A84C]"
                  />
                  <p className="text-[10px] text-gray-400">Specifies the timeout limit for API requests before returning a helpful network notification.</p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

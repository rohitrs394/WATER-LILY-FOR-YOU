import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Mic, MicOff, Volume2, VolumeX, Send, Globe, Sparkles, X, ChevronRight, HelpCircle } from "lucide-react";

interface AIBotProps {
  onClose: () => void;
  onAutoFillBooking: (spa: string, service: string) => void;
}

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

type Lang = "English" | "Hindi" | "Bengali";

export const AIBot: React.FC<AIBotProps> = ({ onClose, onAutoFillBooking }) => {
  const [lang, setLang] = useState<Lang | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize web speech recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setInputText(text);
        setIsListening(false);
        // Automatically send the voice recognition output
        sendMessage(text);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [lang]);

  // Handle auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping]);

  // Change voice-over language code
  const speakResponse = (text: string, currentLang: Lang) => {
    if (!voiceEnabled) return;
    try {
      window.speechSynthesis.cancel(); // Stop any current speech
      const cleanText = text.replace(/[*#]/g, ""); // clean markdown bold markers
      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Map language codes
      if (currentLang === "Bengali") {
        utterance.lang = "bn-IN";
      } else if (currentLang === "Hindi") {
        utterance.lang = "hi-IN";
      } else {
        utterance.lang = "en-US";
      }

      // Try to find a female voice
      const voices = window.speechSynthesis.getVoices();
      let femaleVoice = voices.find(
        (v) =>
          v.lang.startsWith(utterance.lang.substring(0, 2)) &&
          (v.name.toLowerCase().includes("female") ||
            v.name.toLowerCase().includes("zira") ||
            v.name.toLowerCase().includes("samantha") ||
            v.name.toLowerCase().includes("google") ||
            v.name.toLowerCase().includes("premium"))
      );

      if (!femaleVoice) {
        femaleVoice = voices.find((v) => v.lang.startsWith(utterance.lang.substring(0, 2)));
      }

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      // Voice settings
      utterance.pitch = 1.1; // Slightly higher pitch for smooth feminine receptionist tone
      utterance.rate = 0.95; // Slightly slower, highly professional and comforting

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech Synthesis Error", e);
    }
  };

  // Select language and boot conversation
  const selectLanguage = (selected: Lang) => {
    setLang(selected);
    let initialGreeting = "";
    if (selected === "English") {
      initialGreeting = "Greetings, beloved guest! I am Sia, your luxury virtual receptionist. I am here to guide you in choosing the perfect Private Suite therapy or assist you with booking details. How may I pamper you today?";
    } else if (selected === "Hindi") {
      initialGreeting = "सादर प्रणाम आदरणीय अतिथि! मैं सिया हूँ, आपकी लग्जरी वर्चुअल रिसेप्शनिस्ट। मैं हमारी किसी भी 100% प्राइवेट सुइट थेरेपी को चुनने में या बुकिंग करने में आपकी मदद कर सकती हूँ। आज मैं आपकी क्या सेवा कर सकती हूँ?";
    } else if (selected === "Bengali") {
      initialGreeting = "নমস্কার প্রিয় অতিথি! আমি সিয়া, আপনার লাক্সারি ভার্চুয়াল রিসেপশনিস্ট। আমাদের যেকোনো ১০০% প্রাইভেট স্যুট থেরাপি বেছে নিতে বা বুকিং করতে আমি আপনাকে সাহায্য করতে পারি। আজ আপনাকে কীভাবে সেবা করতে পারি?";
    }

    const firstMsg: ChatMessage = {
      sender: "bot",
      text: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([firstMsg]);
    
    // Play initial voice
    setTimeout(() => {
      speakResponse(initialGreeting, selected);
    }, 400);
  };

  // Toggle listening mic
  const toggleListening = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser. Please type your message.");
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      if (lang === "Bengali") recognition.lang = "bn-IN";
      else if (lang === "Hindi") recognition.lang = "hi-IN";
      else recognition.lang = "en-US";

      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Send massage
  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !lang) return;

    if (!textToSend) setInputText("");

    // Add user message
    const userMsg: ChatMessage = {
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsBotTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages,
          language: lang
        })
      });

      if (response.ok) {
        const data = await response.json();
        const botText = data.text;

        const botMsg: ChatMessage = {
          sender: "bot",
          text: botText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, botMsg]);
        speakResponse(botText, lang);

        // Check if bot mentioned location names or booking keywords
        // Provide clickable smart action suggestions
        handleSmartTriggers(botText);

      } else {
        throw new Error("Chat response failed");
      }
    } catch (e) {
      console.error(e);
      const errorMsgText = lang === "Bengali" 
        ? "দুঃখিত, সংযোগে কিছু ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" 
        : lang === "Hindi" 
        ? "क्षमा करें, कनेक्शन में कुछ समस्या है। कृपया पुनः प्रयास करें।" 
        : "I apologize, but my connections are currently offline. Please try again.";
      
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: errorMsgText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleSmartTriggers = (botText: string) => {
    // If bot talks about booking, trigger a tiny button helping fill form
    const normalized = botText.toLowerCase();
    
    // Simple lookups to auto-prefill
    let matchedLocation = "";
    if (normalized.includes("drop spa") || normalized.includes("ড্ৰপ") || normalized.includes("ड्रॉप")) {
      matchedLocation = "Drop Spa";
    } else if (normalized.includes("moon flower") || normalized.includes("মুন ফ্লাওয়ার") || normalized.includes("मून फ्लावर")) {
      matchedLocation = "Moon Flower Spa";
    } else if (normalized.includes("waterlilly") || normalized.includes("ওয়াটারলিলি") || normalized.includes("वॉटरलिली")) {
      matchedLocation = "The Waterlilly Spa";
    }

    let matchedService = "";
    if (normalized.includes("swedish") || normalized.includes("সুইডিশ") || normalized.includes("स्वीडिश")) {
      matchedService = "Swedish Massage";
    } else if (normalized.includes("deep tissue") || normalized.includes("ডিপ টিস্যু") || normalized.includes("डीप टिशू")) {
      matchedService = "Deep Tissue Massage";
    } else if (normalized.includes("thai") || normalized.includes("থাই") || normalized.includes("थाई")) {
      matchedService = "Traditional Thai Massage";
    }

    if (matchedLocation || matchedService) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `🎯 Quick Action: Would you like me to prefill your reservation for ${matchedService || "therapy"} at ${matchedLocation || "our Spa"} branch?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-[420px] h-[600px] flex flex-col bg-[#0A251A]/95 border border-[#C9A84C]/40 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl transition-all duration-300">
      
      {/* Bot Header */}
      <div className="bg-gradient-to-r from-[#0A251A] to-[#0F3D24] border-b border-[#C9A84C]/25 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C9A84C] flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-[#0A251A]" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0A251A]" />
          </div>
          <div>
            <h3 className="font-serif text-[#FFF8F0] font-semibold text-base flex items-center gap-1.5">
              Sia <span className="text-xs text-[#C9A84C]/80 font-sans font-normal">(Virtual Concierge)</span>
            </h3>
            <p className="text-[10px] text-green-400 font-sans flex items-center gap-1">
              Active female voice helper
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lang && (
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="p-2 rounded-full hover:bg-white/5 text-[#C9A84C] transition-colors"
              title={voiceEnabled ? "Mute Voice" : "Unmute Voice"}
            >
              {voiceEnabled ? <Volume2 className="w-4.5 h-4.5" /> : <VolumeX className="w-4.5 h-4.5" />}
            </button>
          )}
          <button
            onClick={() => {
              window.speechSynthesis.cancel();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Language Selection Screen */}
      {!lang ? (
        <div className="flex-1 p-6 flex flex-col justify-center items-center text-center bg-[#0A251A]/30">
          <div className="w-16 h-16 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center mb-4">
            <Globe className="w-8 h-8 text-[#C9A84C] animate-pulse" />
          </div>
          <h4 className="font-serif text-[#FFF8F0] text-xl font-medium mb-1">Select Language</h4>
          <p className="text-xs text-gray-400 mb-6 max-w-xs">
            Choose your preferred language to start a 5-star voice conversation with Sia.
          </p>
          <div className="w-full space-y-3 px-4">
            <button
              onClick={() => selectLanguage("English")}
              className="rgb-button w-full py-3.5 px-5 rounded-xl font-sans flex items-center justify-between group cursor-pointer"
            >
              <span>English Receptionist</span>
              <ChevronRight className="w-4.5 h-4.5 text-[#C9A84C] group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => selectLanguage("Hindi")}
              className="rgb-button w-full py-3.5 px-5 rounded-xl font-sans flex items-center justify-between group cursor-pointer"
            >
              <span>हिंदी रिसेप्शनिस्ट</span>
              <ChevronRight className="w-4.5 h-4.5 text-[#C9A84C] group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => selectLanguage("Bengali")}
              className="rgb-button w-full py-3.5 px-5 rounded-xl font-sans flex items-center justify-between group cursor-pointer"
            >
              <span>বাংলা রিসেপশনিস্ট</span>
              <ChevronRight className="w-4.5 h-4.5 text-[#C9A84C] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      ) : (
        /* Chat History & Input */
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-[#0A251A]/20">
            {messages.map((m, idx) => {
              const isBot = m.sender === "bot";
              const isQuickAction = m.text.includes("Quick Action:");
              
              if (isQuickAction) {
                // Parse prefill parameters
                const locMatch = m.text.match(/at\s([a-zA-Z\s]+Spa)/);
                const srvMatch = m.text.match(/for\s([a-zA-Z\s]+Massage|therapy)/);
                const locStr = locMatch ? locMatch[1] : "";
                const srvStr = srvMatch && srvMatch[1] !== "therapy" ? srvMatch[1] : "";
 
                return (
                  <div key={idx} className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl p-3 text-xs bg-yellow-500/10 border border-yellow-500/30 text-[#FFF8F0] space-y-2">
                      <p>{m.text}</p>
                      <button
                        onClick={() => {
                          onAutoFillBooking(locStr, srvStr);
                          setMessages((prev) => [
                            ...prev,
                            {
                              sender: "bot",
                              text: `✅ Wonderful choice! I have filled the booking form with ${srvStr || "selected massage"} for our ${locStr || "spa"} branch. Please review and tap Submit Booking!`,
                              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            }
                          ]);
                        }}
                        className="rgb-button w-full py-1.5 px-3 rounded-lg font-sans font-semibold cursor-pointer"
                      >
                        Yes, Fill Booking Form
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={idx} className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs font-sans leading-relaxed shadow-md ${
                    isBot 
                      ? "bg-white/5 border border-white/10 text-[#FFF8F0] rounded-tl-none" 
                      : "bg-gradient-to-r from-[#D4AF37] to-[#C9A84C] text-[#061d11] font-medium rounded-tr-none"
                  }`}>
                    <p className="whitespace-pre-line">{m.text}</p>
                    <span className={`block text-[8px] text-right mt-1.5 ${isBot ? "text-gray-400" : "text-[#061d11]/70"}`}>
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isBotTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 text-[#FFF8F0] rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Info & Input Strip */}
          <div className="bg-black/20 border-t border-[#C9A84C]/20 p-3 flex items-center gap-2">
            <button
              onClick={toggleListening}
              className={`p-3 rounded-xl transition-all cursor-pointer ${
                isListening 
                  ? "bg-red-500 text-white animate-pulse" 
                  : "rgb-button"
              }`}
              title={isListening ? "Listening... click to stop" : "Speak to Sia"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex-1 flex gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  lang === "Bengali" 
                    ? "সিয়াকে কিছু জিজ্ঞাসা করুন..." 
                    : lang === "Hindi" 
                    ? "सिया से कुछ पूछें..." 
                    : "Ask Sia about our premium services..."
                }
                className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#C9A84C] transition-colors"
              />
              <button
                type="submit"
                className="rgb-button p-3 rounded-xl font-semibold cursor-pointer"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          </div>
          <div className="bg-[#061d11] text-[9px] text-[#C9A84C]/70 py-1.5 text-center border-t border-white/5 flex justify-center items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> Speak in Hindi, Bengali, or English!
          </div>
        </>
      )}
    </div>
  );
};

export interface SpaService {
  id: string;
  name: string;
  category: 'Normal' | 'Luxury';
  price: number;
  duration: number; // in minutes
  description: string;
  image: string;
  isPrivate: boolean; // toggle "🤤 Private Service" badge
  available: boolean;
}

export interface Therapist {
  id: string;
  name: string;
  specialization: string;
  experience: string; // e.g. "5 Years"
  rating: number; // e.g. 4.9
  images: string[]; // Carousel images
  visible: boolean;
}

export interface DailyOffer {
  id: string;
  title: string;
  discountDescription: string;
  duration: string; // e.g., "Ends tonight at 10 PM"
  animationEffect: 'gold-glow' | 'pulse' | 'slide-up' | 'fade-in';
  active: boolean;
  bannerHomepage: boolean;
  scheduleFuture: string; // empty or ISO date
  autoShowOnLoad: boolean; // show 5-10 sec popup on page load
}

export interface Booking {
  id: string;
  name: string;
  phone: string;
  spaLocation: 'Drop Spa' | 'Moon Flower Spa' | 'The Waterlilly Spa';
  serviceName: string;
  dateTime: string;
  specialRequests: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  assignedTherapistId?: string;
  createdAt: string;
}

export interface SpaLocation {
  id: string; // 'drop' | 'moon' | 'waterlilly'
  name: string;
  address: string;
  phoneNumbers: string[]; // clicking calls/WhatsApp
  mapEmbedUrl: string;
  visible: boolean;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Testimonial {
  name: string;
  comment: string;
  rating: number;
  date: string;
}

export interface SiteContent {
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  galleryImages: string[];
  testimonials: Testimonial[];
  faqs: FAQ[];
  backgroundVideoUrl?: string;
  sectionVideoUrl?: string;
}

export interface APISettings {
  provider: 'deepseek' | 'openai' | 'grok' | 'kimi' | 'gemini' | 'none';
  deepseekKey: string;
  openaiKey: string;
  grokKey: string;
  kimiKey: string;
  geminiKey: string;
  deepseekModel: string;
  openaiModel: string;
  grokModel: string;
  kimiModel: string;
  geminiModel: string;
  responseTimeout: number; // in seconds
  verified: boolean;
}

export interface AppState {
  services: SpaService[];
  therapists: Therapist[];
  offers: DailyOffer[];
  bookings: Booking[];
  locations: SpaLocation[];
  content: SiteContent;
  apiSettings: APISettings;
}

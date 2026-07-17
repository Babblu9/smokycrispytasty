import { useState, useRef, useEffect } from "react";
import {
  Search, Mic, Star, Clock, Heart, MessageCircle, Share2,
  Zap, Crown, Check, ArrowRight, Mail, Phone,
  Instagram, Twitter, Youtube, Facebook, Download,
  Bell, Lock, Globe, Moon, Shield, HelpCircle, LogOut,
  Trash2, Edit, Camera, Plus, X, Send, Sparkles,
  Flame, Leaf, ChefHat, TrendingUp, Award, Settings,
  User, BookOpen, Apple, ChevronDown, Bookmark, Eye, EyeOff,
  ChevronRight, Play, Timer, Utensils
} from "lucide-react";
import { SavedProvider, useSaved } from "@/store/saved";
import { loadRecipes, searchRecipes, type Card } from "@/lib/recipes";
import { getMealById } from "@/lib/mealdb";
import { ratingFor, caloriesFor } from "@/lib/cookora";
import { generateRecipe } from "@/lib/ai";
import { saveGeneratedRecipe, getAllSavedRecipes } from "@/store/generatedRecipes";
import type { Recipe, CookStep } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────
type Page =
  | "home" | "recipes" | "ai-chef" | "community" | "premium"
  | "login" | "signup" | "recipe-detail" | "cook" | "profile" | "settings" | "onboarding";

// ─── Image catalog ────────────────────────────────────────────────────
const IMG = {
  hero1:    "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=800&h=1000&fit=crop&auto=format",
  hero2:    "https://images.unsplash.com/photo-1622021142947-da7dedc7c39a?w=600&h=700&fit=crop&auto=format",
  pasta:    "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=600&h=480&fit=crop&auto=format",
  salad:    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=480&fit=crop&auto=format",
  pancakes: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=600&h=480&fit=crop&auto=format",
  pizza:    "https://images.unsplash.com/photo-1761315632034-3dd5ccd1239f?w=600&h=480&fit=crop&auto=format",
  grill:    "https://images.unsplash.com/photo-1763343146204-50aec9ab91ef?w=600&h=480&fit=crop&auto=format",
  bowl:     "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=480&fit=crop&auto=format",
  steak:    "https://images.unsplash.com/photo-1772285466459-072608a170ff?w=600&h=480&fit=crop&auto=format",
  cake:     "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=600&h=480&fit=crop&auto=format",
  chef:     "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&h=480&fit=crop&auto=format",
  scallops: "https://images.unsplash.com/photo-1761314036992-c510c93ff30c?w=600&h=480&fit=crop&auto=format",
  pasta2:   "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&h=480&fit=crop&auto=format",
  herbs:    "https://images.unsplash.com/photo-1677940734891-c578ea42b4ca?w=600&h=400&fit=crop&auto=format",
  chefFull: "https://images.unsplash.com/photo-1572715376701-98568319fd0b?w=800&h=1000&fit=crop&auto=format",
};

// ─── Brand Logo Components ────────────────────────────────────────────
function SctLogo({ size = 40 }: { size?: number }) {
  const id = `sct${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-label="SmokyCrispyTasty logo">
      <rect width="40" height="40" rx="11" fill={`url(#${id}bg)`} />
      {/* Outer flame */}
      <path d="M20 34C13.4 34 8 28.6 8 22C8 16.4 11.8 13 14.5 11C14 14.5 16 16.5 17.5 16C16.5 12.5 18 9 21 7C20.5 11.5 23.5 13.5 23.5 17C25.5 14 25.5 11 24.5 9C28.5 12 32 17 32 22C32 28.6 26.6 34 20 34Z" fill="white" fillOpacity="0.92" />
      {/* Inner golden core */}
      <path d="M20 29C16.5 29 14 26.5 14 23.5C14 21 15.5 19.5 17 18.5C16.5 20 17.5 21 18.5 20.5C18 19 19 17.5 20.5 17C20 18.5 21.2 19.8 21.2 21.5C22.5 19.8 22.5 18 22 17C25 19 26 21.5 26 23.5C26 26.5 23.5 29 20 29Z" fill={`url(#${id}core)`} />
      {/* Smoke wisps */}
      <path d="M14.5 9.5Q13 8 13.5 5.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.5" fill="none" />
      <path d="M25.5 8Q25 5.5 25.5 4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.35" fill="none" />
      {/* Crispy bottom texture */}
      <path d="M14 32Q17 30.5 20 32Q23 33.5 26 32" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.45" fill="none" />
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF6B35" />
          <stop offset="55%" stopColor="#F7931E" />
          <stop offset="100%" stopColor="#E05A25" />
        </linearGradient>
        <linearGradient id={`${id}core`} x1="20" y1="17" x2="20" y2="29" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE566" />
          <stop offset="100%" stopColor="#FF9500" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SctWordmark({ dark = false }: { dark?: boolean }) {
  return (
    <span className="font-black tracking-tight leading-none select-none" style={{ fontFamily: "Fraunces, serif" }}>
      <span className="text-primary">Smoky</span>
      <span style={{ color: "#F7931E" }}>Crispy</span>
      <span className={dark ? "text-white" : "text-foreground"}>Tasty</span>
    </span>
  );
}

// ─── Reusable primitives ──────────────────────────────────────────────
function Btn({
  children, variant = "primary", size = "md", onClick, className = "", type = "button"
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline" | "accent" | "dark";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 cursor-pointer select-none whitespace-nowrap";
  const sizes = { sm: "px-4 py-2 text-sm", md: "px-6 py-3 text-base", lg: "px-8 py-4 text-lg" };
  const variants: Record<string, string> = {
    primary:   "bg-primary text-white hover:bg-orange-600 shadow-lg shadow-orange-200/60 hover:shadow-orange-300/60 hover:scale-[1.02] active:scale-[0.98]",
    secondary: "bg-secondary text-secondary-foreground hover:bg-orange-100",
    ghost:     "bg-transparent text-foreground hover:bg-muted",
    outline:   "border-2 border-primary text-primary hover:bg-primary hover:text-white",
    accent:    "bg-accent text-white hover:bg-green-600 shadow-lg shadow-green-200/50 hover:scale-[1.02]",
    dark:      "bg-foreground text-white hover:bg-foreground/90",
  };
  return (
    <button type={type} onClick={onClick} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

function Pill({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${active ? "bg-primary text-white shadow-md shadow-orange-200/60" : "bg-white text-foreground/60 hover:text-primary hover:bg-secondary border border-border"}`}>
      {children}
    </button>
  );
}

function Tag({ children, color = "orange" }: { children: React.ReactNode; color?: "orange" | "green" | "blue" | "purple" }) {
  const colors: Record<string, string> = { orange: "bg-orange-100 text-orange-700", green: "bg-green-100 text-green-700", blue: "bg-blue-100 text-blue-700", purple: "bg-purple-100 text-purple-700" };
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors[color]}`}>{children}</span>;
}

function RecipeCard({ img, title, time, rating, calories, category, onClick, saved = false, onToggleSave }: {
  img: string; title: string; time: string; rating: number;
  calories: string; category: string; onClick?: () => void; saved?: boolean; onToggleSave?: () => void;
}) {
  // Controlled by the saved store when onToggleSave is passed; otherwise local (mock cards).
  const [liked, setLiked] = useState(saved);
  const isSaved = onToggleSave ? saved : liked;
  return (
    <div onClick={onClick} className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 border border-border/40">
      <div className="relative overflow-hidden h-48 bg-orange-50">
        <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
        <button onClick={e => { e.stopPropagation(); onToggleSave ? onToggleSave() : setLiked(l => !l); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow transition-transform hover:scale-110">
          <Heart className={`w-4 h-4 transition-colors ${isSaved ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
        </button>
        <div className="absolute top-3 left-3"><Tag>{category}</Tag></div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-base text-foreground mb-2 line-clamp-1" style={{ fontFamily: "Fraunces, serif" }}>{title}</h3>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {time}</span>
          <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> {rating}</span>
          <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-orange-400" /> {calories}</span>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
      <span className="text-primary text-sm font-semibold tracking-widest uppercase">{children}</span>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────
function Navbar({ page, navigate }: { page: Page; navigate: (p: Page) => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links: { label: string; page: Page }[] = [
    { label: "Home", page: "home" }, { label: "Recipes", page: "recipes" },
    { label: "AI Chef", page: "ai-chef" }, { label: "Community", page: "community" },
    { label: "Premium", page: "premium" },
  ];

  const isHome = page === "home";
  const navBg = scrolled ? "bg-white/96 backdrop-blur-md shadow-sm border-b border-border/40" : isHome ? "bg-transparent" : "bg-white/96 backdrop-blur-md border-b border-border/40";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => navigate("home")} className="flex items-center gap-2.5">
            <SctLogo size={38} />
            <SctWordmark dark={!scrolled && isHome} />
          </button>

          <div className="hidden lg:flex items-center gap-1">
            {links.map(l => (
              <button key={l.page} onClick={() => navigate(l.page)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  page === l.page
                    ? (!scrolled && isHome ? "bg-white/20 text-white" : "bg-secondary text-primary")
                    : (!scrolled && isHome ? "text-white/75 hover:text-white hover:bg-white/15" : "text-foreground/65 hover:text-primary hover:bg-secondary/60")}`}>
                {l.label}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <button onClick={() => navigate("login")} className={`text-sm font-medium transition-colors px-4 py-2 ${(!scrolled && isHome) ? "text-white/80 hover:text-white" : "text-foreground/65 hover:text-primary"}`}>Login</button>
            <Btn size="sm" onClick={() => navigate("signup")}>Get Started</Btn>
          </div>

          <button onClick={() => setOpen(o => !o)} className={`lg:hidden p-2 rounded-xl transition-colors ${(!scrolled && isHome) ? "hover:bg-white/15" : "hover:bg-muted"}`}>
            {open
              ? <X className={`w-5 h-5 ${(!scrolled && isHome) ? "text-white" : ""}`} />
              : <div className="flex flex-col gap-1.5">{[5, 4, 5].map((w, i) => <span key={i} className={`h-0.5 bg-current rounded ${(!scrolled && isHome) ? "text-white" : "text-foreground"}`} style={{ width: `${w * 4}px` }} />)}</div>}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-white/98 backdrop-blur border-t border-border px-5 pb-6 pt-2 shadow-xl">
          {links.map(l => (
            <button key={l.page} onClick={() => { navigate(l.page); setOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-colors ${page === l.page ? "bg-secondary text-primary" : "hover:bg-muted text-foreground"}`}>
              {l.label}
            </button>
          ))}
          <div className="flex gap-3 mt-4">
            <Btn variant="outline" size="sm" className="flex-1" onClick={() => { navigate("login"); setOpen(false); }}>Login</Btn>
            <Btn size="sm" className="flex-1" onClick={() => { navigate("signup"); setOpen(false); }}>Get Started</Btn>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────
function Footer({ navigate }: { navigate: (p: Page) => void }) {
  return (
    <footer className="bg-[#120A04] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <SctLogo size={36} />
              <SctWordmark dark />
            </div>
            <p className="text-white/45 text-sm leading-relaxed mb-6 max-w-[220px]">Your AI-powered culinary companion. Discover, create, and share recipes intelligently.</p>
            <div className="flex gap-2.5">
              {[Instagram, Twitter, Youtube, Facebook].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-full bg-white/8 hover:bg-primary transition-all duration-200 flex items-center justify-center"><Icon className="w-4 h-4" /></button>
              ))}
            </div>
          </div>

          {[
            { h: "Platform", items: [["Home","home"],["Recipes","recipes"],["AI Chef","ai-chef"],["Community","community"]] as [string,Page][] },
            { h: "Company",  items: [["Premium","premium"],["Privacy","home"],["Terms","home"]] as [string,Page][] },
          ].map(col => (
            <div key={col.h}>
              <h4 className="text-white font-semibold mb-4 text-sm" style={{ fontFamily: "Fraunces, serif" }}>{col.h}</h4>
              <ul className="space-y-2.5">
                {col.items.map(([label, p]) => (
                  <li key={label}><button onClick={() => navigate(p)} className="text-white/45 text-sm hover:text-primary transition-colors">{label}</button></li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm" style={{ fontFamily: "Fraunces, serif" }}>Download</h4>
            <div className="space-y-3">
              <button className="flex items-center gap-2.5 bg-white/8 hover:bg-white/15 transition-colors px-4 py-2.5 rounded-xl w-full">
                <Apple className="w-5 h-5 flex-shrink-0" />
                <div className="text-left"><p className="text-[10px] text-white/45 leading-none">Download on the</p><p className="text-sm font-semibold leading-tight">App Store</p></div>
              </button>
              <button className="flex items-center gap-2.5 bg-white/8 hover:bg-white/15 transition-colors px-4 py-2.5 rounded-xl w-full">
                <Download className="w-5 h-5 flex-shrink-0" />
                <div className="text-left"><p className="text-[10px] text-white/45 leading-none">Get it on</p><p className="text-sm font-semibold leading-tight">Google Play</p></div>
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/8 pt-8">
          <p className="text-white/25 text-sm text-center">© 2025 SmokyCrispyTasty Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────
function HomePage({ navigate }: { navigate: (p: Page, id?: string) => void }) {
  const { saved, toggle } = useSaved();
  const [activeCat, setActiveCat] = useState("All");
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const cats = ["All", "🌅 Breakfast", "🥗 Lunch", "🍽️ Dinner", "🍰 Desserts", "🥦 Healthy", "🌿 Veg", "🥩 Non-Veg"];

  // Featured tabs pull real MealDB recipes (Trending/Quick/Healthy/Festival → mapped categories).
  const [tabCards, setTabCards] = useState<Card[]>([]);
  const [tabLoading, setTabLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    setTabLoading(true);
    const cat = ["Non-Veg", "Lunch", "Healthy", "Desserts"][activeTab];
    loadRecipes(cat)
      .then(c => { if (alive) { setTabCards(c.slice(0, 4)); setTabLoading(false); } })
      .catch(() => { if (alive) { setTabCards([]); setTabLoading(false); } });
    return () => { alive = false; };
  }, [activeTab]);

  const faqs = [
    { q: "How does the AI Chef work?", a: "Our AI understands your pantry, dietary needs, and taste profile to generate personalized recipes and step-by-step cooking guides in seconds." },
    { q: "Is SmokyCrispyTasty free to use?", a: "SmokyCrispyTasty has a generous free tier with 5,000+ recipes. Premium unlocks AI Chef, 50K+ recipes, nutrition tracking, offline access, and more." },
    { q: "Can I customize recipes?", a: "Yes — adjust servings, swap ingredients, and our AI recalculates everything: quantities, nutrition, and cooking times automatically." },
    { q: "Does the app work offline?", a: "The mobile app supports offline access for saved recipes. AI features require an internet connection." },
  ];

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-screen bg-[#0F0804] flex flex-col overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMG.chefFull} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F0804]/60 via-[#0F0804]/40 to-[#0F0804]" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto px-5 sm:px-8 pt-24 pb-12 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 border border-white/20 bg-white/8 backdrop-blur rounded-full px-4 py-1.5 mb-8">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-white/80 text-xs font-medium tracking-wide">AI-Powered Cooking Platform</span>
              </div>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] mb-6" style={{ fontFamily: "Fraunces, serif" }}>
                Smoke.<br />
                <em className="not-italic text-primary">Crisp.</em><br />
                Taste Perfected.
              </h1>
              <p className="text-white/55 text-lg md:text-xl leading-relaxed mb-10 max-w-md">
                From low-and-slow brisket to lightning-crispy stir-fries — your AI pit boss has every technique, temperature, and flavour dialled in.
              </p>
              <div className="flex gap-2 bg-white/10 backdrop-blur border border-white/15 rounded-2xl p-2 mb-8 max-w-md">
                <Search className="w-5 h-5 text-white/40 self-center ml-1 flex-shrink-0" />
                <input placeholder="Search any recipe, ingredient…" className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-sm min-w-0" />
                <Btn size="sm" onClick={() => navigate("ai-chef")}>Search</Btn>
              </div>
              <div className="flex flex-wrap gap-3">
                <Btn size="lg" onClick={() => navigate("ai-chef")}><Flame className="w-5 h-5" /> Try AI Pit Boss</Btn>
                <Btn size="lg" variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 border border-white/20" onClick={() => navigate("recipes")}>
                  Explore Recipes <ArrowRight className="w-4 h-4" />
                </Btn>
              </div>
            </div>

            <div className="hidden lg:block relative h-[560px]">
              <div className="absolute right-0 top-0 w-64 h-80 rounded-3xl overflow-hidden shadow-2xl">
                <img src={IMG.hero1} alt="Chef cooking" className="w-full h-full object-cover" />
              </div>
              <div className="absolute left-0 bottom-0 w-72 h-72 rounded-3xl overflow-hidden shadow-2xl">
                <img src={IMG.hero2} alt="Gourmet dish" className="w-full h-full object-cover" />
              </div>
              <div className="absolute left-8 top-16 bg-white rounded-2xl shadow-2xl p-4 w-52 border border-border/30">
                <img src={IMG.pasta} alt="Pasta" className="w-full h-24 rounded-xl object-cover mb-3" />
                <p className="font-semibold text-sm leading-tight mb-2" style={{ fontFamily: "Fraunces, serif" }}>Creamy Garlic Pasta</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 25 min</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> 4.9</span>
                </div>
              </div>
              <div className="absolute right-8 bottom-16 bg-primary rounded-2xl shadow-xl p-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-white text-sm font-semibold">AI Generated</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-8 mt-16 pt-10 border-t border-white/8">
            {[["2.4M+", "Trusted Users"], ["50K+", "Recipes"], ["180K+", "Community Cooks"], ["4.9★", "App Rating"]].map(([v, l]) => (
              <div key={l}>
                <div className="text-3xl font-black text-white" style={{ fontFamily: "Fraunces, serif" }}>{v}</div>
                <div className="text-white/40 text-sm">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex justify-center pb-8">
          <div className="w-6 h-9 rounded-full border border-white/20 flex items-start justify-center pt-1.5 animate-bounce">
            <div className="w-1 h-2.5 rounded-full bg-white/40" />
          </div>
        </div>
      </section>

      {/* ── Category strip ───────────────────────────────── */}
      <section className="bg-white py-5 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-0.5">
            {cats.map(c => <Pill key={c} active={activeCat === c} onClick={() => { setActiveCat(c); navigate("recipes"); }}>{c}</Pill>)}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────── */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-xl mb-14">
            <SectionLabel>How It Works</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground" style={{ fontFamily: "Fraunces, serif" }}>From craving to plate<br />in three steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: "01", icon: Search, title: "Tell the AI what you want", body: "Type an ingredient, describe a craving, or snap a photo of your fridge. Our AI understands natural language perfectly." },
              { n: "02", icon: Sparkles, title: "Get a personalized recipe", body: "The AI generates a recipe tailored to your dietary needs, skill level, and available cookware — in seconds." },
              { n: "03", icon: Flame, title: "Cook with live guidance", body: "Follow step-by-step instructions with built-in timers, video clips, and instant answers to your cooking questions." },
            ].map((step, i) => (
              <div key={i} className={`rounded-3xl p-8 relative overflow-hidden ${i === 1 ? "bg-primary text-white" : "bg-card border border-border/50"}`}>
                <span className={`text-7xl font-black leading-none absolute -top-2 -right-1 select-none ${i === 1 ? "text-white/10" : "text-foreground/5"}`} style={{ fontFamily: "Fraunces, serif" }}>{step.n}</span>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${i === 1 ? "bg-white/20" : "bg-secondary"}`}>
                  <step.icon className={`w-6 h-6 ${i === 1 ? "text-white" : "text-primary"}`} />
                </div>
                <h3 className={`text-xl font-bold mb-3 ${i === 1 ? "text-white" : "text-foreground"}`} style={{ fontFamily: "Fraunces, serif" }}>{step.title}</h3>
                <p className={`text-sm leading-relaxed ${i === 1 ? "text-white/70" : "text-muted-foreground"}`}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bento feature grid ───────────────────────────── */}
      <section className="py-4 pb-16 bg-background">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] gap-4">
            <div className="col-span-2 row-span-2 bg-[#0F0804] rounded-3xl overflow-hidden relative">
              <img src={IMG.chef} alt="AI Chef" className="w-full h-full object-cover opacity-40 absolute inset-0" />
              <div className="relative z-10 p-8 flex flex-col justify-end h-full">
                <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: "Fraunces, serif" }}>AI Pit Boss, always fired up</h3>
                <p className="text-white/55 text-sm leading-relaxed mb-5">Ask anything — recipe ideas, substitutions, cooking times, dietary tweaks. Never sleeps, never judges your fridge.</p>
                <button onClick={() => navigate("ai-chef")} className="self-start flex items-center gap-2 text-primary text-sm font-semibold hover:gap-3 transition-all">Try AI Chef <ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="col-span-1 bg-secondary rounded-3xl p-6 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm"><Leaf className="w-5 h-5 text-accent" /></div>
              <div><h3 className="font-bold text-base mb-1" style={{ fontFamily: "Fraunces, serif" }}>Nutrition</h3><p className="text-muted-foreground text-xs leading-relaxed">Macros calculated for every recipe automatically.</p></div>
            </div>
            <div className="col-span-1 bg-card border border-border/50 rounded-3xl p-6 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center"><Download className="w-5 h-5 text-primary" /></div>
              <div><h3 className="font-bold text-base mb-1" style={{ fontFamily: "Fraunces, serif" }}>Offline</h3><p className="text-muted-foreground text-xs leading-relaxed">Save recipes and cook anywhere, no internet needed.</p></div>
            </div>
            <div className="col-span-1 bg-foreground rounded-3xl p-6 flex flex-col justify-between">
              <div className="text-4xl font-black text-primary" style={{ fontFamily: "Fraunces, serif" }}>50K+</div>
              <div><h3 className="font-bold text-base text-white mb-1" style={{ fontFamily: "Fraunces, serif" }}>Recipes</h3><p className="text-white/40 text-xs">From every cuisine, updated daily.</p></div>
            </div>
            <div className="col-span-1 bg-primary rounded-3xl p-6 flex flex-col justify-between">
              <div className="text-4xl font-black text-white" style={{ fontFamily: "Fraunces, serif" }}>180K</div>
              <div><h3 className="font-bold text-base text-white mb-1" style={{ fontFamily: "Fraunces, serif" }}>Community</h3><p className="text-white/60 text-xs">Home cooks sharing every day.</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured recipes ─────────────────────────────── */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <SectionLabel>Discover</SectionLabel>
              <h2 className="text-4xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>Recipes you'll love</h2>
            </div>
            <div className="flex gap-2 flex-wrap">
              {["Trending", "Quick Meals", "Healthy", "Festival"].map((t, i) => (
                <Pill key={t} active={activeTab === i} onClick={() => setActiveTab(i)}>{t}</Pill>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {tabLoading
              ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-72 rounded-2xl bg-muted/50 animate-pulse" />)
              : tabCards.map(c => (
                  <RecipeCard key={c.id} {...c}
                    onClick={() => navigate("recipe-detail", c.id)}
                    saved={saved.has(c.id)}
                    onToggleSave={() => toggle(c.id)} />
                ))}
          </div>
          <div className="text-center mt-10">
            <Btn variant="outline" onClick={() => navigate("recipes")}>View All Recipes <ArrowRight className="w-4 h-4" /></Btn>
          </div>
        </div>
      </section>

      {/* ── AI Chef preview ──────────────────────────────── */}
      <section className="py-24 bg-[#FEFAF4]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="bg-white rounded-3xl shadow-xl border border-border/40 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
                <SctLogo size={36} />
                <div>
                  <p className="font-semibold text-sm" style={{ fontFamily: "Fraunces, serif" }}>SmokyCrispyTasty AI Chef</p>
                  <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" /><span className="text-xs text-muted-foreground">Online</span></div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                {[
                  { role: "ai", text: "Hi! Tell me what's in your fridge and I'll create the perfect recipe for you. 🍳" },
                  { role: "user", text: "I have chicken, lemon, garlic, and some fresh herbs." },
                  { role: "ai", text: "Perfect! Try Lemon Herb Roasted Chicken — 35 mins, 520 cal/serving. Want the full step-by-step?" },
                ].map((m, i) => (
                  <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    {m.role === "ai" && <div className="flex-shrink-0 mt-0.5"><SctLogo size={28} /></div>}
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "ai" ? "bg-muted text-foreground rounded-tl-none" : "bg-primary text-white rounded-tr-none"}`}>{m.text}</div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-border/50">
                <div className="flex gap-2 bg-muted/60 rounded-xl px-3 py-2">
                  <input readOnly value="I'd love that!" className="flex-1 bg-transparent text-sm outline-none text-foreground/50" />
                  <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center"><Send className="w-3.5 h-3.5 text-white" /></div>
                </div>
              </div>
            </div>
            <div>
              <SectionLabel>AI Pit Boss</SectionLabel>
              <h2 className="text-4xl md:text-5xl font-bold mb-5 leading-tight" style={{ fontFamily: "Fraunces, serif" }}>Your personal chef,<br />powered by AI</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">Chat naturally about food — smoke temps, rub ratios, crispy techniques, ingredient swaps. The AI Pit Boss learns your setup and gets smarter with every cook.</p>
              <div className="space-y-4 mb-8">
                {["Works with any ingredient you have", "Understands dietary restrictions and allergies", "Step-by-step cooking instructions", "Answers questions mid-cook in real time"].map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-primary" /></div>
                    <span className="text-sm text-foreground/80">{f}</span>
                  </div>
                ))}
              </div>
              <Btn size="lg" onClick={() => navigate("ai-chef")}><Sparkles className="w-5 h-5" /> Start Chatting Free</Btn>
            </div>
          </div>
        </div>
      </section>

      {/* ── Magazine grid ────────────────────────────────── */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="mb-10"><SectionLabel>Chef's Picks</SectionLabel><h2 className="text-4xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>This week's favourites</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div onClick={() => navigate("recipe-detail")} className="md:col-span-2 relative rounded-3xl overflow-hidden cursor-pointer group h-80 bg-orange-50">
              <img src={IMG.steak} alt="Steak" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-7">
                <Tag>Chef's Pick</Tag>
                <h3 className="text-white text-2xl font-bold mt-2 mb-1" style={{ fontFamily: "Fraunces, serif" }}>Herb Seasoned Ribeye</h3>
                <div className="flex gap-3 text-white/70 text-sm">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 35 min</span>
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> 4.9</span>
                  <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-400" /> 680 cal</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              {[{ img: IMG.scallops, title: "Baked Scallops au Gratin", time: "25 min", cal: "310" }, { img: IMG.pasta2, title: "Spicy Arrabiata", time: "18 min", cal: "420" }].map((r, i) => (
                <div key={i} onClick={() => navigate("recipe-detail")} className="relative rounded-3xl overflow-hidden cursor-pointer group flex-1 min-h-36 bg-orange-50">
                  <img src={r.img} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5">
                    <h3 className="text-white font-bold text-sm mb-1" style={{ fontFamily: "Fraunces, serif" }}>{r.title}</h3>
                    <div className="flex gap-3 text-white/60 text-xs">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {r.time}</span>
                      <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-400" /> {r.cal} cal</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────── */}
      <section className="py-24 bg-[#FEFAF4]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <SectionLabel>Community Love</SectionLabel>
            <h2 className="text-4xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>2.4 million cooks can't be wrong</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Priya Sharma", role: "Home Cook, Mumbai", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop", text: "SmokyCrispyTasty transformed my weeknight cooking. The AI knows exactly what I feel like eating before I even finish typing." },
              { name: "James Mitchell", role: "Food Blogger, London", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop", text: "The AI Chef is the real deal. I asked for a 20-minute vegetarian dinner and got a restaurant-quality recipe instantly." },
              { name: "Ananya Patel", role: "Chef & Creator, Delhi", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop", text: "Premium is 100% worth it. The exclusive collections and nutrition insights have helped me eat so much better." },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-3xl p-7 shadow-sm border border-border/40 hover:shadow-md transition-shadow">
                <div className="flex gap-0.5 mb-4">{[0,1,2,3,4].map(j => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}</div>
                <p className="text-foreground/75 leading-relaxed mb-6 text-sm">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-sm" style={{ fontFamily: "Fraunces, serif" }}>{t.name}</p>
                    <p className="text-muted-foreground text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="py-24 bg-background">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-12"><SectionLabel>Questions</SectionLabel><h2 className="text-4xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>Frequently asked</h2></div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="bg-card border border-border/50 rounded-2xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors gap-4">
                  <span className="font-semibold text-foreground" style={{ fontFamily: "Fraunces, serif" }}>{f.q}</span>
                  <ChevronDown className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-border/40 pt-3">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── App download ─────────────────────────────────── */}
      <section className="py-24 bg-primary overflow-hidden relative">
        <div className="absolute inset-0 opacity-10"><img src={IMG.herbs} alt="" className="w-full h-full object-cover" /></div>
        <div className="relative max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-4" style={{ fontFamily: "Fraunces, serif" }}>Cook anywhere,<br />anytime</h2>
          <p className="text-white/70 text-lg mb-10">Take your AI kitchen companion on the go.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="flex items-center gap-3 bg-white text-foreground px-6 py-3.5 rounded-2xl hover:shadow-2xl transition-shadow">
              <Apple className="w-6 h-6" />
              <div className="text-left"><p className="text-xs text-foreground/50 leading-none">Download on the</p><p className="font-bold text-base leading-tight" style={{ fontFamily: "Fraunces, serif" }}>App Store</p></div>
            </button>
            <button className="flex items-center gap-3 bg-white text-foreground px-6 py-3.5 rounded-2xl hover:shadow-2xl transition-shadow">
              <Download className="w-6 h-6" />
              <div className="text-left"><p className="text-xs text-foreground/50 leading-none">Get it on</p><p className="font-bold text-base leading-tight" style={{ fontFamily: "Fraunces, serif" }}>Google Play</p></div>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────
function OnboardingPage({ navigate }: { navigate: (p: Page) => void }) {
  const [step, setStep] = useState(0);
  const [diet, setDiet] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [skill, setSkill] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const totalSteps = 4;

  const toggle = (arr: string[], setArr: (a: string[]) => void, val: string) =>
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  const canContinue = [true, diet.length > 0, cuisines.length > 0, !!skill][step] ?? goals.length > 0;

  const steps = [
    {
      title: "What do you eat?", sub: "Select all that apply — we'll filter recipes for you.",
      options: [
        { e: "🥩", l: "Non-Vegetarian" }, { e: "🌿", l: "Vegetarian" },
        { e: "🌱", l: "Vegan" }, { e: "🌾", l: "Gluten-Free" },
        { e: "🥛", l: "Dairy-Free" }, { e: "🥑", l: "Keto" },
        { e: "🐟", l: "Pescatarian" }, { e: "🍽️", l: "No Restrictions" },
      ],
      sel: diet, toggle: (v: string) => toggle(diet, setDiet, v), multi: true,
    },
    {
      title: "Favourite cuisines?", sub: "Pick as many as you like.",
      options: [
        { e: "🇮🇳", l: "Indian" }, { e: "🇮🇹", l: "Italian" }, { e: "🇯🇵", l: "Japanese" },
        { e: "🇲🇽", l: "Mexican" }, { e: "🇨🇳", l: "Chinese" }, { e: "🇬🇷", l: "Mediterranean" },
        { e: "🇫🇷", l: "French" }, { e: "🇹🇭", l: "Thai" }, { e: "🇺🇸", l: "American" }, { e: "🇱🇧", l: "Middle Eastern" },
      ],
      sel: cuisines, toggle: (v: string) => toggle(cuisines, setCuisines, v), multi: true,
    },
    {
      title: "Your cooking level?", sub: "We'll match recipe complexity to your kitchen confidence.",
      options: [
        { e: "🌱", l: "Beginner", desc: "I burn toast sometimes" },
        { e: "🍳", l: "Home Cook", desc: "I follow recipes well" },
        { e: "👨‍🍳", l: "Intermediate", desc: "I improvise confidently" },
        { e: "⭐", l: "Advanced", desc: "I could run a kitchen" },
      ],
      sel: skill ? [skill] : [], toggle: (v: string) => setSkill(v), multi: false,
    },
    {
      title: "What's your goal?", sub: "Select all your cooking goals.",
      options: [
        { e: "🥦", l: "Eat healthier" }, { e: "⚡", l: "Save time" },
        { e: "💰", l: "Reduce waste" }, { e: "📚", l: "Learn new skills" },
        { e: "❤️", l: "Cook for family" }, { e: "🌍", l: "Explore cuisines" },
        { e: "🎉", l: "Impress guests" }, { e: "💪", l: "Meal prep" },
      ],
      sel: goals, toggle: (v: string) => toggle(goals, setGoals, v), multi: true,
    },
  ];

  if (step === totalSteps) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-200/60">
            <SctLogo size={48} />
          </div>
          <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "Fraunces, serif" }}>You're all set! 🎉</h1>
          <p className="text-muted-foreground text-lg mb-5">Your personalized SmokyCrispyTasty experience is ready.</p>
          <div className="bg-secondary/60 rounded-2xl p-5 mb-8 text-left space-y-2.5">
            {diet.length > 0 && <p className="text-sm"><span className="font-semibold">Diet:</span> <span className="text-muted-foreground">{diet.join(", ")}</span></p>}
            {cuisines.length > 0 && <p className="text-sm"><span className="font-semibold">Cuisines:</span> <span className="text-muted-foreground">{cuisines.slice(0, 3).join(", ")}{cuisines.length > 3 ? ` +${cuisines.length - 3} more` : ""}</span></p>}
            {skill && <p className="text-sm"><span className="font-semibold">Level:</span> <span className="text-muted-foreground">{skill}</span></p>}
            {goals.length > 0 && <p className="text-sm"><span className="font-semibold">Goals:</span> <span className="text-muted-foreground">{goals.join(", ")}</span></p>}
          </div>
          <Btn size="lg" className="w-full" onClick={() => navigate("home")}>Start Cooking <ArrowRight className="w-5 h-5" /></Btn>
        </div>
      </div>
    );
  }

  const current = steps[step];
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-5 sm:px-8 pt-8 pb-6 border-b border-border/40 bg-white">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <SctLogo size={32} />
              <span className="font-bold text-lg" style={{ fontFamily: "Fraunces, serif" }}>SmokyCrispyTasty</span>
            </div>
            <span className="text-sm text-muted-foreground font-medium">{step + 1} / {totalSteps}</span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${i <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-8 pb-36">
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Fraunces, serif" }}>{current.title}</h1>
          <p className="text-muted-foreground mb-8">{current.sub}</p>
          <div className={`grid gap-3 ${!current.multi ? "grid-cols-1" : "grid-cols-2"}`}>
            {current.options.map((opt) => {
              const sel = current.sel.includes(opt.l);
              return (
                <button key={opt.l} onClick={() => current.toggle(opt.l)}
                  className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${sel ? "border-primary bg-secondary shadow-md shadow-orange-100/60" : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"}`}>
                  <span className="text-2xl flex-shrink-0">{opt.e}</span>
                  <div className="flex-1 min-w-0">
                    <span className={`font-semibold text-sm ${sel ? "text-primary" : "text-foreground"}`}>{opt.l}</span>
                    {"desc" in opt && <p className="text-muted-foreground text-xs mt-0.5">{opt.desc}</p>}
                  </div>
                  {current.multi
                    ? sel && <Check className="w-4 h-4 text-primary ml-auto flex-shrink-0" />
                    : <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${sel ? "border-primary bg-primary" : "border-border"}`}>{sel && <div className="w-2 h-2 rounded-full bg-white" />}</div>
                  }
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/96 backdrop-blur border-t border-border/40 px-5 sm:px-8 py-5 shadow-xl shadow-black/5">
        <div className="max-w-xl mx-auto flex gap-3">
          {step > 0 && <Btn variant="ghost" className="border border-border" onClick={() => setStep(s => s - 1)}>Back</Btn>}
          <Btn className={`flex-1 ${!canContinue ? "opacity-50" : ""}`} size="lg" onClick={() => canContinue && setStep(s => s + 1)}>
            {step === totalSteps - 1 ? "Finish Setup" : "Continue"} <ArrowRight className="w-5 h-5" />
          </Btn>
        </div>
        {!canContinue && <p className="text-center text-xs text-muted-foreground mt-2">Make at least one selection to continue</p>}
      </div>
    </div>
  );
}

// ─── RECIPES PAGE ─────────────────────────────────────────────────────
function RecipesPage({ navigate }: { navigate: (p: Page, id?: string) => void }) {
  const { saved, toggle } = useSaved();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const cats = ["All", "Breakfast", "Lunch", "Dinner", "Desserts", "Healthy", "Veg", "Non-Veg", "Seafood"];

  // Live MealDB fetch. Search (debounced) overrides the category filter when non-empty.
  useEffect(() => {
    let alive = true;
    setLoading(true);
    const q = search.trim();
    const t = setTimeout(() => {
      (q ? searchRecipes(q) : loadRecipes(cat))
        .then(r => { if (alive) { setCards(r); setLoading(false); } })
        .catch(() => { if (alive) { setCards([]); setLoading(false); } });
    }, q ? 350 : 0);
    return () => { alive = false; clearTimeout(t); };
  }, [cat, search]);

  const filtered = cards;

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="bg-[#FEFAF4] py-14">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-3" style={{ fontFamily: "Fraunces, serif" }}>Explore Recipes</h1>
          <p className="text-muted-foreground text-lg mb-8">Discover thousands of handpicked dishes, updated daily</p>
          <div className="max-w-2xl mx-auto flex gap-2 bg-white rounded-2xl shadow-sm border border-border/40 p-2">
            <Search className="w-5 h-5 text-muted-foreground ml-2 self-center flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search recipes, ingredients, cuisines…" className="flex-1 bg-transparent outline-none text-sm placeholder-muted-foreground min-w-0" />
            <button className="p-2.5 rounded-xl hover:bg-muted transition-colors"><Mic className="w-4 h-4 text-primary" /></button>
            <Btn size="sm" onClick={() => navigate("ai-chef")}><Sparkles className="w-4 h-4" /> AI</Btn>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        <div className="flex gap-2.5 overflow-x-auto pb-3 mb-8 scrollbar-hide">
          {cats.map(c => <Pill key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Pill>)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-72 rounded-2xl bg-muted/50 animate-pulse" />)
            : filtered.map(c => (
                <RecipeCard key={c.id} {...c}
                  onClick={() => navigate("recipe-detail", c.id)}
                  saved={saved.has(c.id)}
                  onToggleSave={() => toggle(c.id)} />
              ))}
        </div>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "Fraunces, serif" }}>No results</h3>
            <p className="text-muted-foreground">Try a different search or clear filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── RECIPE DETAIL ────────────────────────────────────────────────────
function RecipeDetailPage({ navigate, recipeId }: { navigate: (p: Page, id?: string) => void; recipeId: string | null }) {
  const { saved, toggle } = useSaved();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [servings, setServings] = useState(4);
  const [tab, setTab] = useState<"ingredients" | "steps" | "nutrition">("ingredients");

  useEffect(() => {
    if (!recipeId) { setLoading(false); return; }
    let alive = true;
    setLoading(true);
    getMealById(recipeId.replace(/^mdb_/, ""))
      .then(r => { if (alive) { setRecipe(r); setServings(r?.servings ?? 4); setLoading(false); } })
      .catch(() => { if (alive) { setRecipe(null); setLoading(false); } });
    return () => { alive = false; };
  }, [recipeId]);

  if (loading) return (
    <div className="pt-32 min-h-screen bg-background flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );
  if (!recipe) return (
    <div className="pt-32 min-h-screen bg-background text-center px-5">
      <div className="text-5xl mb-4">🍽️</div>
      <h2 className="text-2xl font-black mb-2" style={{ fontFamily: "Fraunces, serif" }}>Recipe not found</h2>
      <Btn onClick={() => navigate("recipes")}>Back to recipes</Btn>
    </div>
  );

  const isSaved = saved.has(recipe.id);
  const base = recipe.servings || 4;
  const cal = caloriesFor(recipe.id);
  // MealDB has no macros — scale a plausible baseline by servings. Calories are decorative-stable per id.
  const nutrition = [
    { label: "Calories", value: Math.round(cal * servings / base), unit: "kcal", bg: "bg-orange-50", text: "text-orange-700" },
    { label: "Protein", value: Math.round(18 * servings / base), unit: "g", bg: "bg-blue-50", text: "text-blue-700" },
    { label: "Carbs", value: Math.round(64 * servings / base), unit: "g", bg: "bg-yellow-50", text: "text-yellow-700" },
    { label: "Fat", value: Math.round(16 * servings / base), unit: "g", bg: "bg-green-50", text: "text-green-700" },
  ];
  const ingredients = recipe.ingredients.map(i => `${i.quantity} ${i.unit} ${i.name}`.replace(/\s+/g, " ").trim());
  const steps = recipe.steps.map(s => s.instruction);

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="relative h-72 md:h-96 bg-foreground overflow-hidden">
        <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <button onClick={() => navigate("recipes")} className="absolute top-6 left-6 bg-white/20 backdrop-blur rounded-full p-2 hover:bg-white/30 transition-colors">
          <ChevronRight className="w-5 h-5 text-white rotate-180" />
        </button>
        <div className="absolute bottom-6 left-6 right-6">
          <Tag>{recipe.category}</Tag>
          <h1 className="text-3xl md:text-4xl font-black text-white mt-2" style={{ fontFamily: "Fraunces, serif" }}>{recipe.name}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <span className="flex items-center gap-1 text-white/70 text-sm"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {ratingFor(recipe.id)}</span>
            <span className="flex items-center gap-1 text-white/70 text-sm"><Clock className="w-4 h-4" /> {recipe.cookTimeMinutes} min</span>
            <span className="flex items-center gap-1 text-white/70 text-sm"><Flame className="w-4 h-4 text-orange-400" /> {cal} cal</span>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag>{recipe.category}</Tag>
            <span className="text-muted-foreground text-sm">{recipe.difficulty} · {recipe.cookTimeMinutes} min · serves {recipe.servings}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => toggle(recipe.id)} className={`p-2.5 rounded-xl border transition-all ${isSaved ? "bg-red-50 border-red-200 text-red-500" : "border-border text-muted-foreground hover:border-primary"}`}>
              <Heart className={`w-5 h-5 ${isSaved ? "fill-red-500" : ""}`} />
            </button>
            <button className="p-2.5 rounded-xl border border-border text-muted-foreground hover:border-primary transition-colors"><Share2 className="w-5 h-5" /></button>
            <button className="p-2.5 rounded-xl border border-border text-muted-foreground hover:border-primary transition-colors"><Bookmark className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm mb-8 flex items-center justify-between">
          <div>
            <p className="font-semibold" style={{ fontFamily: "Fraunces, serif" }}>Servings</p>
            <p className="text-muted-foreground text-sm">Quantities adjust automatically</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setServings(s => Math.max(1, s - 1))} className="w-9 h-9 rounded-full bg-muted hover:bg-primary hover:text-white transition-all flex items-center justify-center text-xl font-bold">−</button>
            <span className="text-2xl font-black w-8 text-center" style={{ fontFamily: "Fraunces, serif" }}>{servings}</span>
            <button onClick={() => setServings(s => s + 1)} className="w-9 h-9 rounded-full bg-primary text-white hover:bg-orange-600 transition-all flex items-center justify-center text-xl font-bold">+</button>
          </div>
        </div>
        <div className="flex gap-1 mb-6 bg-muted/40 rounded-2xl p-1">
          {(["ingredients", "steps", "nutrition"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${tab === t ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
          ))}
        </div>
        {tab === "ingredients" && <div className="space-y-2.5">{ingredients.map((ing, i) => <div key={i} className="flex items-center gap-3 bg-card border border-border/40 p-4 rounded-xl"><div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" /><span className="text-sm">{ing}</span></div>)}</div>}
        {tab === "steps" && <div className="space-y-4">{steps.map((s, i) => <div key={i} className="flex gap-4 bg-card border border-border/40 p-5 rounded-xl"><div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">{i + 1}</div><p className="text-sm leading-relaxed text-foreground/80 pt-1">{s}</p></div>)}</div>}
        {tab === "nutrition" && <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{nutrition.map(n => <div key={n.label} className={`${n.bg} rounded-2xl p-5 text-center`}><p className={`text-3xl font-black ${n.text}`} style={{ fontFamily: "Fraunces, serif" }}>{n.value}</p><p className={`text-sm ${n.text} opacity-70`}>{n.unit}</p><p className={`font-semibold mt-1 text-sm ${n.text}`}>{n.label}</p></div>)}</div>}
        <div className="mt-10 bg-gradient-to-r from-primary to-orange-500 rounded-3xl p-7 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-white font-bold text-lg" style={{ fontFamily: "Fraunces, serif" }}>Ready to cook?</h3>
            <p className="text-white/65 text-sm">Step-by-step mode with built-in timers</p>
          </div>
          <Btn variant="secondary" className="bg-white text-primary hover:bg-orange-50 flex-shrink-0" size="lg" onClick={() => navigate("cook", recipe.id)}><Play className="w-5 h-5" /> Start</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── COOK MODE ────────────────────────────────────────────────────────
function CookModePage({ navigate, recipeId }: { navigate: (p: Page, id?: string) => void; recipeId: string | null }) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [steps, setSteps] = useState<CookStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!recipeId) { setLoading(false); return; }
    let alive = true;
    (async () => {
      setLoading(true);
      const r = await getMealById(recipeId.replace(/^mdb_/, "")).catch(() => null);
      if (!alive) return;
      setRecipe(r);
      const raw = r?.steps ?? [];
      setSteps(raw);
      setLoading(false); // show steps immediately — never block on the LLM
      // Background: MealDB steps carry no timers — ask the LLM to add durations, swap in if it returns.
      if (r && raw.length && raw.every(st => !st.durationSeconds)) {
        structureRecipeSteps(r.name, raw.map(x => x.instruction).join("\n"))
          .then(enh => { if (alive && enh.length) setSteps(enh); })
          .catch(() => {});
      }
    })();
    return () => { alive = false; };
  }, [recipeId]);

  const step = steps[idx];
  useEffect(() => { setSecondsLeft(step?.durationSeconds ?? 0); setRunning(false); }, [idx, step?.durationSeconds]);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSecondsLeft(s => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [running]);
  useEffect(() => { if (secondsLeft === 0) setRunning(false); }, [secondsLeft]);

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <p className="text-muted-foreground">Preparing your cook session…</p>
    </div>
  );
  if (!recipe || !steps.length) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-5 text-center">
      <div className="text-5xl">🍳</div>
      <h2 className="text-2xl font-black" style={{ fontFamily: "Fraunces, serif" }}>Couldn't load cook steps</h2>
      <Btn onClick={() => navigate("recipes")}>Back to recipes</Btn>
    </div>
  );

  if (done) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-5 px-5 text-center">
      <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center"><Check className="w-10 h-10 text-accent" /></div>
      <h1 className="text-4xl font-black" style={{ fontFamily: "Fraunces, serif" }}>Meal complete! 🎉</h1>
      <p className="text-muted-foreground max-w-md">You finished <span className="font-semibold text-foreground">{recipe.name}</span> — {steps.length} steps done. Enjoy your dish!</p>
      <div className="flex gap-3 mt-2">
        <Btn variant="outline" onClick={() => { setDone(false); setIdx(0); }}>Cook again</Btn>
        <Btn onClick={() => navigate("recipe-detail", recipe.id)}>Back to recipe</Btn>
      </div>
    </div>
  );

  const pct = Math.round(((idx + 1) / steps.length) * 100);
  const mmss = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;
  const hasTimer = (step?.durationSeconds ?? 0) > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* header */}
      <div className="px-5 sm:px-8 pt-6 pb-4 border-b border-border/50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate("recipe-detail", recipe.id)} className="p-2 rounded-xl hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
          <p className="font-semibold text-sm truncate px-3" style={{ fontFamily: "Fraunces, serif" }}>{recipe.name}</p>
          <span className="text-sm text-muted-foreground tabular-nums">{idx + 1}/{steps.length}</span>
        </div>
        <div className="max-w-2xl mx-auto mt-4 h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* current step */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-8">
        <div className="max-w-2xl w-full text-center">
          <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold mb-5"><Flame className="w-4 h-4" /> Step {idx + 1}</div>
          <p className="text-2xl md:text-3xl font-bold leading-snug mb-6" style={{ fontFamily: "Fraunces, serif" }}>{step.instruction}</p>
          {step.tip && <div className="inline-block bg-secondary/60 text-secondary-foreground text-sm rounded-xl px-4 py-2 mb-8">💡 {step.tip}</div>}

          {hasTimer && (
            <div className="mt-4 mb-8">
              <div className={`text-6xl font-black tabular-nums mb-4 ${secondsLeft === 0 ? "text-accent" : "text-foreground"}`} style={{ fontFamily: "Fraunces, serif" }}>{mmss}</div>
              <div className="flex items-center justify-center gap-3">
                {secondsLeft === 0
                  ? <span className="text-accent font-semibold flex items-center gap-1"><Check className="w-5 h-5" /> Time's up!</span>
                  : <>
                      <Btn size="sm" variant={running ? "outline" : "primary"} onClick={() => setRunning(r => !r)}>{running ? "Pause" : <><Play className="w-4 h-4" /> Start timer</>}</Btn>
                      <Btn size="sm" variant="ghost" onClick={() => setSecondsLeft(s => s + 60)}>+1 min</Btn>
                    </>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* nav controls */}
      <div className="px-5 sm:px-8 pb-8 pt-4 border-t border-border/50">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Btn variant="outline" className={`flex-1 ${idx === 0 ? "opacity-40 pointer-events-none" : ""}`} onClick={() => setIdx(i => Math.max(0, i - 1))}>Previous</Btn>
          {idx < steps.length - 1
            ? <Btn className="flex-1" onClick={() => setIdx(i => i + 1)}>Next step <ChevronRight className="w-4 h-4" /></Btn>
            : <Btn variant="accent" className="flex-1" onClick={() => setDone(true)}><Check className="w-4 h-4" /> Finish</Btn>}
        </div>
      </div>
    </div>
  );
}

// ─── AI CHEF PAGE ─────────────────────────────────────────────────────
function AIChefPage() {
  const [messages, setMessages] = useState([{ role: "ai", content: "Hey! I'm your AI Pit Boss 🔥 Tell me what you're cooking — an ingredient, a craving, a cut of meat — and I'll craft the perfect recipe with exact temps, timings, and smoke or crisp technique." }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const suggestions = ["I have chicken, garlic & lemon — what can I make?", "Quick 15-min healthy breakfast ideas", "How do I make perfect pasta carbonara?", "Romantic dinner for two suggestions"];
  const [recent, setRecent] = useState<Recipe[]>([]);
  useEffect(() => { getAllSavedRecipes().then(setRecent).catch(() => {}); }, []);
  const formatRecipe = (r: Recipe): string => {
    const ing = r.ingredients.map(i => `• ${`${i.quantity} ${i.unit} ${i.name}`.replace(/\s+/g, " ").trim()}`).join("\n");
    const st = r.steps.map((s, i) => `${i + 1}. ${s.instruction}${s.tip ? `\n   💡 ${s.tip}` : ""}`).join("\n");
    return `${r.name} — ${r.category}\n${r.description}\n\n⏱ ${r.prepTimeMinutes + r.cookTimeMinutes} min · ${r.servings} servings · ${r.difficulty}\n\nIngredients\n${ing}\n\nSteps\n${st}`;
  };
  const send = async (text = input) => {
    if (!text.trim() || typing) return;
    setMessages(m => [...m, { role: "user", content: text }]);
    setInput("");
    setTyping(true);
    try {
      const mode = /\bhave\b|ingredient/i.test(text) ? "ingredients" : "dish";
      const recipe = await generateRecipe(text, mode);
      saveGeneratedRecipe(recipe);
      setRecent(r => [recipe, ...r]);
      setMessages(m => [...m, { role: "ai", content: formatRecipe(recipe) }]);
    } catch (e: any) {
      setMessages(m => [...m, { role: "ai", content: `⚠️ ${e?.message ?? "Couldn't generate a recipe. Please try again."}` }]);
    } finally {
      setTyping(false);
    }
  };
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  return (
    <div className="pt-16 min-h-screen bg-background flex">
      <div className="hidden md:flex w-64 flex-col bg-card border-r border-border h-[calc(100vh-64px)] sticky top-16">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div>
            <span className="font-bold" style={{ fontFamily: "Fraunces, serif" }}>AI Pit Boss</span>
          </div>
          <p className="text-xs text-muted-foreground">Your personal culinary AI</p>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent</p>
          {recent.length === 0
            ? <p className="text-sm text-muted-foreground/70 px-3">No recipes yet — ask below to generate one.</p>
            : recent.map((r) => (
                <button key={r.id} onClick={() => send(r.name)} className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-foreground/65 hover:bg-muted hover:text-foreground transition-colors truncate block">{r.name}</button>
              ))}
        </div>
        <div className="p-4 border-t border-border"><Btn size="sm" className="w-full"><Plus className="w-4 h-4" /> New Chat</Btn></div>
      </div>

      <div className="flex-1 flex flex-col h-[calc(100vh-64px)] sticky top-16">
        <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SctLogo size={40} />
            <div>
              <h2 className="font-bold text-sm" style={{ fontFamily: "Fraunces, serif" }}>SmokyCrispyTasty AI Pit Boss</h2>
              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" /><span className="text-xs text-muted-foreground">Online</span></div>
            </div>
          </div>
          <button className="p-2 rounded-xl hover:bg-muted transition-colors"><Mic className="w-4 h-4 text-primary" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.length === 1 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center mb-3">Quick prompts to get started</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.map((s, i) => <button key={i} onClick={() => send(s)} className="text-left text-sm bg-card border border-border rounded-xl px-4 py-3 hover:border-primary hover:bg-secondary transition-all">{s}</button>)}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              {m.role === "ai"
                ? <div className="flex-shrink-0 mt-1"><SctLogo size={32} /></div>
                : <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1"><User className="w-4 h-4 text-muted-foreground" /></div>}
              <div className={`max-w-[76%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${m.role === "ai" ? "bg-card border border-border rounded-tl-none" : "bg-primary text-white rounded-tr-none"}`}>{m.content}</div>
            </div>
          ))}
          {typing && (
            <div className="flex gap-3">
              <div className="flex-shrink-0"><SctLogo size={32} /></div>
              <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                {[0,1,2].map(j => <div key={j} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${j * 0.15}s` }} />)}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="p-4 bg-card border-t border-border">
          <div className="flex gap-3 bg-muted/40 rounded-2xl p-2 border border-border/40">
            <button className="p-2 rounded-xl hover:bg-white transition-colors flex-shrink-0"><Mic className="w-5 h-5 text-primary" /></button>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} placeholder="Ask anything about cooking…" className="flex-1 bg-transparent outline-none text-sm placeholder-muted-foreground min-w-0" />
            <button onClick={() => send()} className="p-2 rounded-xl bg-primary text-white hover:bg-orange-600 transition-colors flex-shrink-0"><Send className="w-5 h-5" /></button>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">Always verify cooking temperatures and times.</p>
        </div>
      </div>
    </div>
  );
}

// ─── COMMUNITY PAGE ───────────────────────────────────────────────────
function CommunityPage({ navigate }: { navigate: (p: Page) => void }) {
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const posts = [
    { user: "Priya Sharma", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop", time: "2h ago", img: IMG.salad, caption: "Made this gorgeous rainbow salad bowl! 🌈 AI Chef suggested adding roasted chickpeas for protein — absolute game changer!", likes: 3241, comments: 87, tag: "Healthy" },
    { user: "James Mitchell", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop", time: "5h ago", img: IMG.pasta, caption: "Perfected my carbonara after 6 failed attempts 😅 SmokyCrispyTasty AI walked me through every step. The pasta is silky and divine!", likes: 5890, comments: 213, tag: "Italian" },
    { user: "Ananya Patel", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop", time: "1d ago", img: IMG.cake, caption: "Festival season baking! 🎉 Dark chocolate ganache cake for 20. From SmokyCrispyTasty Premium — worth every penny.", likes: 8120, comments: 445, tag: "Dessert" },
  ];
  const creators = [
    { name: "Chef Marcus", sub: "94K followers · 284 recipes", img: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=60&h=60&fit=crop" },
    { name: "Maya Patel", sub: "67K followers · 193 recipes", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop" },
    { name: "David Chen", sub: "52K followers · 156 recipes", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop" },
  ];

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-3xl font-black" style={{ fontFamily: "Fraunces, serif" }}>Community</h1><p className="text-muted-foreground mt-1">Discover and share amazing food moments</p></div>
          <Btn><Plus className="w-4 h-4" /> Create Post</Btn>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {posts.map((p, i) => (
              <div key={i} className="bg-card rounded-3xl shadow-sm overflow-hidden border border-border/40">
                <div className="flex items-center justify-between p-5 pb-3">
                  <div className="flex items-center gap-3">
                    <img src={p.avatar} alt={p.user} className="w-10 h-10 rounded-full object-cover" />
                    <div><p className="font-semibold text-sm" style={{ fontFamily: "Fraunces, serif" }}>{p.user}</p><p className="text-muted-foreground text-xs">{p.time}</p></div>
                  </div>
                  <div className="flex items-center gap-2"><Tag>{p.tag}</Tag><Btn size="sm" variant="outline">Follow</Btn></div>
                </div>
                <div className="relative">
                  <img src={p.img} alt="" className="w-full h-72 object-cover" />
                  <button className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold"><Play className="w-3.5 h-3.5 text-primary fill-primary" /> Watch</button>
                </div>
                <div className="p-5">
                  <p className="text-sm text-foreground/80 leading-relaxed mb-4">{p.caption}</p>
                  <div className="flex items-center gap-4 pt-3 border-t border-border">
                    <button onClick={() => setLiked(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; })} className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${liked.has(i) ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}>
                      <Heart className={`w-5 h-5 ${liked.has(i) ? "fill-red-500" : ""}`} /> {(p.likes + (liked.has(i) ? 1 : 0)).toLocaleString()}
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"><MessageCircle className="w-5 h-5" /> {p.comments}</button>
                    <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors"><Share2 className="w-5 h-5" /> Share</button>
                    <button className="ml-auto text-muted-foreground hover:text-primary transition-colors"><Bookmark className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="bg-card rounded-3xl shadow-sm p-5 border border-border/40">
              <h3 className="font-bold mb-4" style={{ fontFamily: "Fraunces, serif" }}>Popular Creators</h3>
              <div className="space-y-4">
                {creators.map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img src={c.img} alt={c.name} className="w-11 h-11 rounded-full object-cover" />
                    <div className="flex-1 min-w-0"><p className="font-semibold text-sm truncate" style={{ fontFamily: "Fraunces, serif" }}>{c.name}</p><p className="text-muted-foreground text-xs">{c.sub}</p></div>
                    <Btn size="sm" variant="outline">Follow</Btn>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-3xl shadow-sm p-5 border border-border/40">
              <h3 className="font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "Fraunces, serif" }}><TrendingUp className="w-4 h-4 text-primary" /> Trending</h3>
              <div className="flex flex-wrap gap-2">
                {["#QuickMeals", "#HealthyEating", "#AIChef", "#PastaLovers", "#MealPrep", "#VeganFood", "#HomeChef"].map(t => (
                  <button key={t} className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-colors font-medium">{t}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PREMIUM PAGE ─────────────────────────────────────────────────────
function PremiumPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const plans = [
    { name: "Free", price: { monthly: 0, yearly: 0 }, border: "border-border", features: ["5,000+ recipes", "Basic AI search", "Save 20 recipes", "Community access"], cta: "Current Plan", v: "ghost" as const },
    { name: "Premium", price: { monthly: 9.99, yearly: 6.99 }, border: "border-primary", highlight: true, features: ["50,000+ recipes", "Unlimited AI Pit Boss", "Unlimited saves", "Nutrition tracking", "Offline access", "Ad-free", "Video recipes", "Priority support"], cta: "Get Premium", v: "primary" as const },
    { name: "Family", price: { monthly: 15.99, yearly: 11.99 }, border: "border-accent", features: ["Everything in Premium", "Up to 6 accounts", "Family meal planner", "Shared collections", "Kids-friendly filters"], cta: "Get Family Plan", v: "accent" as const },
  ];
  const features = [
    { icon: Sparkles, t: "Unlimited AI Pit Boss", d: "Personalized recipes, tips, and substitutions — 24/7." },
    { icon: BookOpen, t: "50,000+ Recipes", d: "Complete library with pro chef recipes and exclusive collections." },
    { icon: Leaf, t: "Nutrition Tracking", d: "Detailed macros and vitamins calculated automatically." },
    { icon: Download, t: "Offline Access", d: "Download recipes and cook without internet." },
    { icon: Crown, t: "Exclusive Collections", d: "Celebrity chef collections updated monthly." },
    { icon: Zap, t: "Ad-Free", d: "Pure, distraction-free cooking. No ads, ever." },
  ];

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="bg-[#0F0804] py-20 text-center">
        <div className="max-w-2xl mx-auto px-5">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary rounded-full px-4 py-1.5 mb-6 text-sm font-semibold"><Crown className="w-4 h-4" /> Premium</div>
          <h1 className="text-5xl font-black text-white mb-4" style={{ fontFamily: "Fraunces, serif" }}>Elevate your <em className="not-italic text-primary">cooking</em></h1>
          <p className="text-white/50 text-lg mb-10">Join 400K+ premium members cooking smarter every day</p>
          <div className="inline-flex items-center gap-1 bg-white/8 rounded-full p-1">
            {(["monthly", "yearly"] as const).map(b => (
              <button key={b} onClick={() => setBilling(b)} className={`px-6 py-2 rounded-full text-sm font-semibold transition-all capitalize ${billing === b ? "bg-primary text-white" : "text-white/60 hover:text-white"}`}>
                {b}{b === "yearly" && <span className="ml-1.5 text-xs bg-accent px-2 py-0.5 rounded-full">−30%</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 -mt-8 pb-20">
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {plans.map(plan => (
            <div key={plan.name} className={`bg-card rounded-3xl border-2 ${plan.border} ${plan.highlight ? "shadow-2xl shadow-orange-100 scale-[1.03]" : "shadow-sm"} p-7 relative`}>
              {plan.highlight && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">Most Popular</div>}
              <h3 className="font-black text-xl mb-1" style={{ fontFamily: "Fraunces, serif" }}>{plan.name}</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-5xl font-black" style={{ fontFamily: "Fraunces, serif" }}>${billing === "monthly" ? plan.price.monthly : plan.price.yearly}</span>
                {plan.price.monthly > 0 && <span className="text-muted-foreground mb-1">/mo</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlight ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}><Check className="w-3 h-3" /></div>{f}
                  </li>
                ))}
              </ul>
              <Btn variant={plan.v} className="w-full">{plan.cta}</Btn>
            </div>
          ))}
        </div>
        <div className="text-center mb-10"><SectionLabel>What You Get</SectionLabel><h2 className="text-3xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>Premium features</h2></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={i} className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-border/40">
              <div className="w-11 h-11 rounded-2xl bg-secondary flex items-center justify-center mb-4"><f.icon className="w-5 h-5 text-primary" /></div>
              <h3 className="font-bold mb-2" style={{ fontFamily: "Fraunces, serif" }}>{f.t}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────
function LoginPage({ navigate }: { navigate: (p: Page) => void }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pt-16 min-h-screen bg-background flex">
      <div className="hidden md:flex flex-1 relative overflow-hidden">
        <img src={IMG.chef} alt="Chef cooking" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-[#0F0804]/90" />
        <div className="absolute inset-0 flex flex-col justify-center p-14">
          <div className="flex items-center gap-2.5 mb-10">
            <SctLogo size={40} />
            <span className="text-2xl font-black text-white" style={{ fontFamily: "Fraunces, serif" }}>SmokyCrispyTasty</span>
          </div>
          <h2 className="text-5xl font-black text-white leading-tight mb-4" style={{ fontFamily: "Fraunces, serif" }}>Cook smarter,<br /><em className="not-italic text-orange-300">eat better.</em></h2>
          <p className="text-white/60 text-lg max-w-sm">Join 2.4M home cooks using AI to discover amazing recipes every day.</p>
          <div className="flex flex-wrap gap-2 mt-8">
            {["AI Recipes", "Nutrition", "Community", "Offline"].map(f => <span key={f} className="bg-white/12 backdrop-blur text-white text-sm px-4 py-1.5 rounded-full">{f}</span>)}
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-black mb-1" style={{ fontFamily: "Fraunces, serif" }}>Welcome back</h1>
          <p className="text-muted-foreground mb-8">Sign in to your SmokyCrispyTasty account</p>
          <div className="space-y-3 mb-6">
            <button className="w-full flex items-center justify-center gap-3 bg-card border border-border rounded-2xl py-3 hover:bg-muted transition-colors font-medium text-sm">
              <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
            <button className="w-full flex items-center justify-center gap-3 bg-foreground text-white rounded-2xl py-3 hover:bg-foreground/90 transition-colors font-medium text-sm"><Apple className="w-5 h-5" /> Continue with Apple</button>
          </div>
          <div className="flex items-center gap-3 mb-6"><div className="flex-1 h-px bg-border" /><span className="text-xs text-muted-foreground">or</span><div className="flex-1 h-px bg-border" /></div>
          <form className="space-y-4">
            <div><label className="text-sm font-medium block mb-1.5">Email</label>
              <input type="email" className="w-full bg-input-background rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 border border-transparent focus:border-primary/30 transition-all" placeholder="you@example.com" /></div>
            <div>
              <div className="flex justify-between mb-1.5"><label className="text-sm font-medium">Password</label><button type="button" className="text-xs text-primary hover:underline">Forgot?</button></div>
              <div className="relative">
                <input type={show ? "text" : "password"} className="w-full bg-input-background rounded-2xl px-4 py-3 pr-11 text-sm outline-none focus:ring-2 focus:ring-primary/25 border border-transparent focus:border-primary/30 transition-all" placeholder="••••••••" />
                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <div className="flex items-center gap-2"><input type="checkbox" id="rem" className="w-4 h-4 accent-primary rounded" /><label htmlFor="rem" className="text-sm text-muted-foreground cursor-pointer">Remember me for 30 days</label></div>
            <Btn type="submit" className="w-full" size="lg">Sign In</Btn>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">No account? <button onClick={() => navigate("signup")} className="text-primary font-semibold hover:underline">Create one free</button></p>
        </div>
      </div>
    </div>
  );
}

// ─── SIGNUP PAGE ──────────────────────────────────────────────────────
function SignupPage({ navigate }: { navigate: (p: Page) => void }) {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(1);
  return (
    <div className="pt-16 min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><SctLogo size={56} /></div>
          <h1 className="text-3xl font-black" style={{ fontFamily: "Fraunces, serif" }}>Join SmokyCrispyTasty</h1>
          <p className="text-muted-foreground mt-1">Free forever · No credit card needed</p>
        </div>
        <div className="flex gap-1.5 mb-8">{[1,2].map(s => <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-400 ${step >= s ? "bg-primary" : "bg-muted"}`} />)}</div>
        <div className="space-y-3 mb-6">
          <button className="w-full flex items-center justify-center gap-3 bg-card border border-border rounded-2xl py-3 hover:bg-muted transition-colors font-medium text-sm">
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Sign up with Google
          </button>
          <button className="w-full flex items-center justify-center gap-3 bg-foreground text-white rounded-2xl py-3 hover:bg-foreground/90 transition-colors font-medium text-sm"><Apple className="w-5 h-5" /> Sign up with Apple</button>
        </div>
        <div className="flex items-center gap-3 mb-6"><div className="flex-1 h-px bg-border" /><span className="text-xs text-muted-foreground">or</span><div className="flex-1 h-px bg-border" /></div>
        <form onSubmit={e => { e.preventDefault(); if (step < 2) setStep(2); else navigate("onboarding"); }} className="space-y-4">
          {step === 1 ? (
            <>
              <div><label className="text-sm font-medium block mb-1.5">Full Name</label><input className="w-full bg-input-background rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 border border-transparent focus:border-primary/30 transition-all" placeholder="Jane Doe" required /></div>
              <div><label className="text-sm font-medium block mb-1.5">Email</label><input type="email" className="w-full bg-input-background rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 border border-transparent focus:border-primary/30 transition-all" placeholder="jane@example.com" required /></div>
              <Btn type="submit" className="w-full" size="lg">Continue <ArrowRight className="w-4 h-4" /></Btn>
            </>
          ) : (
            <>
              <div><label className="text-sm font-medium block mb-1.5">Password</label>
                <div className="relative">
                  <input type={show ? "text" : "password"} className="w-full bg-input-background rounded-2xl px-4 py-3 pr-11 text-sm outline-none focus:ring-2 focus:ring-primary/25 border border-transparent focus:border-primary/30 transition-all" placeholder="Create a strong password" required />
                  <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div></div>
              <div><label className="text-sm font-medium block mb-1.5">Confirm Password</label><input type="password" className="w-full bg-input-background rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 border border-transparent focus:border-primary/30 transition-all" placeholder="Repeat password" required /></div>
              <Btn type="submit" className="w-full" size="lg">Create Account <Sparkles className="w-4 h-4" /></Btn>
            </>
          )}
        </form>
        <p className="text-center text-xs text-muted-foreground mt-5">By joining, you agree to our <button className="text-primary hover:underline">Terms</button> and <button className="text-primary hover:underline">Privacy Policy</button></p>
        <p className="text-center text-sm text-muted-foreground mt-3">Already a member? <button onClick={() => navigate("login")} className="text-primary font-semibold hover:underline">Sign in</button></p>
      </div>
    </div>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────
function ProfilePage({ navigate }: { navigate: (p: Page) => void }) {
  const [tab, setTab] = useState("recipes");
  const saved = [
    { img: IMG.pasta, title: "Creamy Garlic Pasta", time: "25 min", rating: 4.9, calories: "480", category: "Dinner" },
    { img: IMG.salad, title: "Rainbow Veggie Salad", time: "10 min", rating: 4.8, calories: "210", category: "Healthy" },
    { img: IMG.cake, title: "Dark Chocolate Cake", time: "60 min", rating: 5.0, calories: "520", category: "Dessert" },
    { img: IMG.bowl, title: "Protein Power Bowl", time: "15 min", rating: 4.9, calories: "390", category: "Healthy" },
  ];
  const achievements = [
    { e: "🍳", l: "First Recipe", ok: true }, { e: "⭐", l: "5-Star Cook", ok: true },
    { e: "🔥", l: "7-Day Streak", ok: true }, { e: "👨‍🍳", l: "Master Chef", ok: false },
    { e: "🌍", l: "Global Palate", ok: true }, { e: "💎", l: "Premium", ok: true },
  ];
  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="relative h-44 bg-gradient-to-br from-primary via-orange-400 to-orange-300 overflow-hidden">
        <img src={IMG.herbs} alt="" className="w-full h-full object-cover mix-blend-multiply opacity-50" />
      </div>
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-14 mb-8 relative z-10">
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop" alt="Profile" className="w-28 h-28 rounded-full border-4 border-background object-cover shadow-xl" />
            <button className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow"><Camera className="w-3.5 h-3.5" /></button>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-2xl font-black" style={{ fontFamily: "Fraunces, serif" }}>Priya Sharma</h1>
              <Crown className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-muted-foreground text-sm">@priyacooks · San Francisco</p>
          </div>
          <div className="flex gap-2.5">
            <Btn variant="outline" size="sm" onClick={() => navigate("settings")}><Edit className="w-4 h-4" /> Edit</Btn>
            <Btn size="sm" variant="ghost" className="border border-border" onClick={() => navigate("settings")}><Settings className="w-4 h-4" /></Btn>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-7 bg-card rounded-2xl p-5 shadow-sm border border-border/40">
          {[["284", "Recipes"], ["12.4K", "Followers"], ["830", "Following"], ["4.9★", "Rating"]].map(([v, l]) => (
            <div key={l} className="text-center">
              <p className="text-2xl font-black" style={{ fontFamily: "Fraunces, serif" }}>{v}</p>
              <p className="text-muted-foreground text-xs">{l}</p>
            </div>
          ))}
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/60 rounded-2xl p-4 flex items-center gap-3 mb-7">
          <Crown className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          <div className="flex-1"><p className="font-semibold text-sm">Premium Member</p><p className="text-muted-foreground text-xs">Renews Jan 15, 2026</p></div>
          <Tag color="green">Active</Tag>
        </div>
        <div className="flex gap-1 mb-8 bg-muted/40 rounded-2xl p-1">
          {["recipes", "saved", "ai-history", "achievements"].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${tab === t ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"}`}>{t.replace("-", " ")}</button>
          ))}
        </div>
        {(tab === "recipes" || tab === "saved") && <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-12">{saved.map((r, i) => <RecipeCard key={i} {...r} saved onClick={() => navigate("recipe-detail")} />)}</div>}
        {tab === "ai-history" && (
          <div className="space-y-3 pb-12">
            {[
              { q: "Quick pasta for dinner tonight", t: "Today, 6:30 PM", r: "3 recipes suggested" },
              { q: "High protein breakfast ideas", t: "Yesterday, 8:12 AM", r: "5 recipes generated" },
              { q: "How to make croissants from scratch", t: "Dec 28, 2024", r: "Full guide provided" },
              { q: "Low calorie comfort food ideas", t: "Dec 25, 2024", r: "8 recipes suggested" },
            ].map((item, i) => (
              <div key={i} className="bg-card border border-border/40 rounded-xl p-4 shadow-sm flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0"><Sparkles className="w-4 h-4 text-primary" /></div>
                <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{item.q}</p><p className="text-muted-foreground text-xs">{item.t} · {item.r}</p></div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
        {tab === "achievements" && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 pb-12">
            {achievements.map((a, i) => (
              <div key={i} className={`bg-card border border-border/40 rounded-2xl p-4 text-center shadow-sm ${!a.ok ? "opacity-35 grayscale" : ""}`}>
                <div className="text-3xl mb-2">{a.e}</div>
                <p className="text-xs font-semibold">{a.l}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────
function SettingsPage({ navigate }: { navigate: (p: Page) => void }) {
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("English");
  const [notifs, setNotifs] = useState({ push: true, email: true, weekly: false });

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate("profile")} className="p-2 rounded-xl hover:bg-muted transition-colors"><ChevronRight className="w-5 h-5 rotate-180" /></button>
          <h1 className="text-2xl font-black" style={{ fontFamily: "Fraunces, serif" }}>Settings</h1>
        </div>
        <div className="bg-card border border-border/40 rounded-2xl p-5 shadow-sm mb-5 flex items-center gap-4">
          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop" alt="User" className="w-14 h-14 rounded-full object-cover" />
          <div className="flex-1"><p className="font-bold" style={{ fontFamily: "Fraunces, serif" }}>Priya Sharma</p><p className="text-muted-foreground text-sm">priya@example.com</p></div>
          <Crown className="w-5 h-5 text-yellow-500" />
        </div>

        <div className="bg-card border border-border/40 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div className="px-5 py-3 border-b border-border/40"><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Notifications</p></div>
          {[{ l: "Push Notifications", k: "push" }, { l: "Email Notifications", k: "email" }, { l: "Weekly Digest", k: "weekly" }].map(item => (
            <div key={item.k} className="flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors border-b border-border/30 last:border-0">
              <div className="flex items-center gap-3"><Bell className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-medium">{item.l}</span></div>
              <button onClick={() => setNotifs(n => ({ ...n, [item.k]: !n[item.k as keyof typeof n] }))} className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${notifs[item.k as keyof typeof notifs] ? "bg-primary" : "bg-muted"}`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${notifs[item.k as keyof typeof notifs] ? "translate-x-5" : ""}`} />
              </button>
            </div>
          ))}
        </div>

        {[
          { title: "Account", items: [{ icon: User, l: "Edit Profile", fn: undefined }, { icon: Lock, l: "Change Password", fn: undefined }, { icon: Crown, l: "Premium Status", badge: "Active", fn: () => navigate("premium") }] },
          { title: "Preferences", items: [{ icon: Moon, l: "Dark Mode", toggle: true, fn: undefined }, { icon: Globe, l: "Language", val: lang, fn: undefined }] },
          { title: "Security", items: [{ icon: Shield, l: "Privacy Settings", fn: undefined }, { icon: Lock, l: "Two-Factor Auth", fn: undefined }] },
          { title: "Help", items: [{ icon: HelpCircle, l: "Help Center", fn: undefined }, { icon: BookOpen, l: "Terms of Service", fn: undefined }] },
        ].map(sec => (
          <div key={sec.title} className="bg-card border border-border/40 rounded-2xl shadow-sm overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-border/40"><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{sec.title}</p></div>
            {sec.items.map((item, i) => (
              <button key={i} onClick={item.fn} className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors border-b border-border/30 last:border-0 text-left">
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{item.l}</span>
                  {"badge" in item && item.badge && <Tag color="green">{item.badge}</Tag>}
                </div>
                {"toggle" in item && item.toggle ? (
                  <div onClick={e => { e.stopPropagation(); setDark(d => !d); }} className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${dark ? "bg-primary" : "bg-muted"}`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${dark ? "translate-x-5" : ""}`} />
                  </div>
                ) : "val" in item ? (
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm"><span>{item.val}</span><ChevronRight className="w-4 h-4" /></div>
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        ))}

        <div className="bg-card border border-border/40 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div className="px-5 py-3 border-b border-border/40"><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Language</p></div>
          {["English", "Telugu", "Hindi"].map(l => (
            <button key={l} onClick={() => setLang(l)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors border-b border-border/30 last:border-0">
              <span className="text-sm font-medium">{l}</span>
              {lang === l && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>

        <div className="bg-card border border-border/40 rounded-2xl shadow-sm overflow-hidden">
          <button className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-50/50 transition-colors border-b border-border/30"><LogOut className="w-4 h-4 text-red-500" /><span className="text-sm font-medium text-red-500">Sign Out</span></button>
          <button className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-50/50 transition-colors"><Trash2 className="w-4 h-4 text-red-500" /><span className="text-sm font-medium text-red-500">Delete Account</span></button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-8">SmokyCrispyTasty v2.4.1 · Made with ❤️ in San Francisco</p>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const navigate = (p: Page, id?: string) => {
    if (id) setSelectedId(id);
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const noNav    = page === "onboarding" || page === "cook";
  const noFooter = ["login", "signup", "ai-chef", "onboarding", "cook"].includes(page);

  return (
    <SavedProvider>
      <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: "Outfit, sans-serif" }}>
        {!noNav && <Navbar page={page} navigate={navigate} />}
        <main className="flex-1">
          {page === "home"          && <HomePage navigate={navigate} />}
          {page === "recipes"       && <RecipesPage navigate={navigate} />}
          {page === "ai-chef"       && <AIChefPage />}
          {page === "community"     && <CommunityPage navigate={navigate} />}
          {page === "premium"       && <PremiumPage />}
          {page === "login"         && <LoginPage navigate={navigate} />}
          {page === "signup"        && <SignupPage navigate={navigate} />}
          {page === "onboarding"    && <OnboardingPage navigate={navigate} />}
          {page === "recipe-detail" && <RecipeDetailPage navigate={navigate} recipeId={selectedId} />}
          {page === "cook"          && <CookModePage navigate={navigate} recipeId={selectedId} />}
          {page === "profile"       && <ProfilePage navigate={navigate} />}
          {page === "settings"      && <SettingsPage navigate={navigate} />}
        </main>
        {!noFooter && <Footer navigate={navigate} />}
      </div>
    </SavedProvider>
  );
}

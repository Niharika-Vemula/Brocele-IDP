import { useState, useEffect, useRef } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = async (path, method = "GET", body = null) => {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API + path, opts);
  return res.json();
};

// Accurate outfit images matched by name keyword
const OUTFIT_IMAGES = {
  "slim fit blazer":    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&fit=crop",
  "a-line kurti":       "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&fit=crop",
  "high waist jeans":   "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&fit=crop",
  "long gown":          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&fit=crop",
  "silk saree":         "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&fit=crop",
  "casual tee":         "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&fit=crop",
  "floral maxi dress":  "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&fit=crop",
  "formal suit":        "https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=500&fit=crop",
  "anarkali suit":      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&fit=crop",
  "denim jacket":       "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=500&fit=crop",
  "lehenga choli":      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&fit=crop",
  "office formals":     "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&fit=crop",
};

const CATEGORY_IMAGES = {
  "Formal":      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&fit=crop",
  "Ethnic":      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&fit=crop",
  "Traditional": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&fit=crop",
  "Casual":      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&fit=crop",
  "Party Wear":  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&fit=crop",
  "Office Wear": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&fit=crop",
  "Western":     "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&fit=crop",
};

function getOutfitImage(outfit) {
  if (outfit.image && !outfit.image.includes("566479179817")) return outfit.image;
  const key = Object.keys(OUTFIT_IMAGES).find(k => outfit.name?.toLowerCase().includes(k));
  if (key) return OUTFIT_IMAGES[key];
  return CATEGORY_IMAGES[outfit.category] || CATEGORY_IMAGES[outfit.style] ||
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&fit=crop";
}

const HERO_IMGS = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&fit=crop",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&fit=crop",
  "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&fit=crop",
  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&fit=crop",
];

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className="toast">{msg}</div>;
}
function Loader() { return <div className="loader"><div className="loader-spin"></div></div>; }
function Stars({ n = 5 }) { return <div className="stars">{"★".repeat(Math.round(n))}{"☆".repeat(5 - Math.round(n))}</div>; }

// ─── AI CHATBOT ───────────────────────────────────────────────────────────────
const CHAT_KB = [
  { q: ["hello","hi","hey","namaste"], a: "Hello! 👋 Welcome to Brocele AI Stylist! I can help you with outfit suggestions, style tips, tailor booking, and more. What would you like to know?" },
  { q: ["outfit","suggest","recommend","wear","dress"], a: "✨ For outfit suggestions, go to **Features → AI-Powered Outfit Suggestions**. Fill in your gender, body type, skin tone and preferred style — our AI will recommend perfect outfits for you!" },
  { q: ["kurti","kurta","ethnic","traditional","saree","lehenga","anarkali"], a: "🌸 For ethnic wear like Kurtis, Sarees, Lehengas and Anarkali suits, check our **Ethnic & Traditional** collection in Features → Smart Wardrobe. Select 'Ethnic' or 'Traditional' category!" },
  { q: ["jeans","casual","tee","denim","western"], a: "👖 For casual western wear like jeans, tees and denim jackets, go to **Features → Smart Wardrobe** and select 'Casual' or 'Western' category." },
  { q: ["formal","suit","blazer","office","interview"], a: "👔 For formal wear and office outfits, try **Features → AI Outfit Suggestions** with 'Formal' style, or use the **Occasion Planner** and select 'Interview'." },
  { q: ["party","gown","maxi","dress","birthday","celebration"], a: "🎉 For party wear and gowns, use **Features → Occasion Planner** and select 'Birthday' or 'Party'. You can also browse 'Party Wear' in Smart Wardrobe!" },
  { q: ["wedding","bridal","lehenga","bride"], a: "💍 For wedding outfits, use **Occasion Planner → Wedding** or browse 'Traditional' in Smart Wardrobe. We also have expert tailors for custom bridal wear!" },
  { q: ["budget","cheap","affordable","price","cost","expensive","premium"], a: "💰 Use **Features → Budget-Based Suggestions**! Choose from Under ₹1000, ₹1000–₹3000, ₹3000–₹7000, or Premium. We have beautiful outfits for every budget." },
  { q: ["color","colour","black","white","red","blue","pink","beige"], a: "🎨 Go to **Features → Personalized Style Analysis** to choose your favourite colors and materials. Our AI will suggest the best matching outfit combinations!" },
  { q: ["tailor","stitch","custom","alteration","booking","book"], a: "✂️ You can book a tailor from the **Tailor Booking** page in the navbar! We have expert tailors like Ravi Kumar, Priya Sharma, Arjun Mehta and Sunita Devi." },
  { q: ["virtual","try","tryon","try-on","photo","upload"], a: "📸 Try **Features → Virtual Try-On Experience**! Upload your photo, select a style (Traditional/Casual/Formal/Party) and see how you may look in that outfit." },
  { q: ["body","type","slim","curvy","petite","athletic","plus"], a: "💪 Our AI considers your body type! In **AI Outfit Suggestions**, select your body type (Slim/Athletic/Curvy/Plus Size/Petite) and get perfectly matched outfits." },
  { q: ["skin","tone","fair","dark","medium","olive"], a: "🌟 Skin tone matters for outfit colors! In **AI Outfit Suggestions**, select your skin tone and our AI will suggest colors that complement you best." },
  { q: ["wishlist","save","favourite","favorite","like","heart"], a: "♥ Click the **Wishlist** button on any outfit card to save it! View all saved outfits in the **Wishlist** page from the navbar." },
  { q: ["season","summer","winter","rainy","monsoon"], a: "🌤️ Use **Features → Occasion Planner** and select your season (Summer/Winter/Rainy) along with the occasion for season-appropriate outfit suggestions!" },
  { q: ["mood","happy","romantic","confident","relaxed","professional"], a: "😊 Go to **Features → Smart Wardrobe** and select your mood! Whether you feel Happy, Romantic, Confident, Relaxed or Professional — we have the perfect outfit." },
  { q: ["contact","help","support","email","phone","address"], a: "📞 Visit our **Contact** page from the navbar! Email: hello@brocele.com | Phone: +91 98765 43210 | Address: 123 Fashion Street, Mumbai." },
  { q: ["about","company","brocele","mission","who"], a: "🏢 Brocele is an AI-powered fashion styling boutique! We combine Artificial Intelligence with Fashion Styling to help every customer look their best. Visit the **About Us** page to learn more!" },
  { q: ["feature","what can","capabilities","options"], a: "🌟 Brocele offers 6 amazing features:\n1. 👗 AI Outfit Suggestions\n2. 🎨 Style Analysis\n3. 🛍 Smart Wardrobe\n4. 📸 Virtual Try-On\n5. 💰 Budget Suggestions\n6. 📅 Occasion Planner\n\nClick **Features** in the navbar to explore!" },
  { q: ["thank","thanks","bye","goodbye","great","awesome","nice"], a: "You're welcome! 😊 Stay stylish with Brocele! ✨ Feel free to ask me anything about fashion, outfits, or our features anytime." },
];

function getAIReply(msg) {
  const lower = msg.toLowerCase();
  for (const item of CHAT_KB) {
    if (item.q.some(k => lower.includes(k))) return item.a;
  }
  return "🤔 I'm not sure about that, but I'm here to help with fashion! Try asking about:\n• Outfit suggestions\n• Style analysis\n• Tailor booking\n• Budget-based outfits\n• Virtual try-on\n• Occasion planning";
}

function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { from: "bot", text: "Hi! 👋 I'm Brocele AI Stylist. Ask me anything about fashion, outfits, or our features!" }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  const send = () => {
    const txt = input.trim();
    if (!txt) return;
    setMsgs(prev => [...prev, { from: "user", text: txt }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply = getAIReply(txt);
      setMsgs(prev => [...prev, { from: "bot", text: reply }]);
      setTyping(false);
    }, 800);
  };

  const handleKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  const quickBtns = ["Outfit suggestions", "Tailor booking", "Budget outfits", "Virtual try-on"];

  return (
    <>
      <button className={"chatbot-fab" + (open ? " open" : "")} onClick={() => setOpen(!open)} title="AI Stylist Chat">
        {open ? "✕" : "🤖"}
        {!open && <span className="chatbot-fab-label">AI Stylist</span>}
      </button>
      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">🤖</div>
              <div>
                <h4>Brocele AI Stylist</h4>
                <span className="chatbot-status">● Online</span>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="chatbot-messages">
            {msgs.map((m, i) => (
              <div key={i} className={"chat-msg " + m.from}>
                {m.from === "bot" && <div className="chat-bot-icon">✨</div>}
                <div className="chat-bubble">{m.text}</div>
              </div>
            ))}
            {typing && (
              <div className="chat-msg bot">
                <div className="chat-bot-icon">✨</div>
                <div className="chat-bubble typing"><span></span><span></span><span></span></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="chatbot-quick">
            {quickBtns.map(q => (
              <button key={q} className="quick-btn" onClick={() => { setInput(q); setTimeout(send, 50); }}>{q}</button>
            ))}
          </div>
          <div className="chatbot-input-row">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about fashion, outfits..."
            />
            <button onClick={send} disabled={!input.trim()}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState(""); const [suc, setSuc] = useState(""); const [loading, setLoading] = useState(false);
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async e => {
    e.preventDefault(); setErr(""); setSuc(""); setLoading(true);
    try {
      if (tab === "register") {
        if (!form.name || !form.email || !form.password) { setErr("All fields required"); setLoading(false); return; }
        const r = await api("/register", "POST", form);
        if (r.error) setErr(r.error); else { setSuc("Registered! Please login."); setTab("login"); }
      } else {
        if (!form.email || !form.password) { setErr("Email and password required"); setLoading(false); return; }
        const r = await api("/login", "POST", { email: form.email, password: form.password });
        if (r.error) setErr(r.error); else onLogin(r.user);
      }
    } catch { setErr("Server error. Make sure backend is running."); }
    setLoading(false);
  };
  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content fade-in">
          <div className="auth-logo">Brocele</div>
          <p className="auth-tagline">Where <span>Artificial Intelligence</span> meets the art of <span>Fashion Styling</span></p>
          <div className="auth-fashion-imgs">
            {HERO_IMGS.map((src, i) => <img key={i} src={src} alt="fashion" loading="lazy" />)}
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-box fade-in">
          <div className="auth-tabs">
            <button className={"auth-tab" + (tab === "login" ? " active" : "")} onClick={() => { setTab("login"); setErr(""); setSuc(""); }}>Login</button>
            <button className={"auth-tab" + (tab === "register" ? " active" : "")} onClick={() => { setTab("register"); setErr(""); setSuc(""); }}>Register</button>
          </div>
          <h2>{tab === "login" ? "Welcome Back" : "Join Brocele"}</h2>
          <p>{tab === "login" ? "Sign in to your style journey" : "Create your premium account"}</p>
          {err && <div className="auth-error">{err}</div>}
          {suc && <div className="auth-success">{suc}</div>}
          <form onSubmit={submit}>
            {tab === "register" && <div className="form-group"><label>Full Name</label><input name="name" placeholder="Your full name" value={form.name} onChange={handle} /></div>}
            <div className="form-group"><label>Email Address</label><input name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handle} /></div>
            <div className="form-group"><label>Password</label><input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle} /></div>
            <button className="btn-primary" style={{ width: "100%", marginTop: 8 }} disabled={loading}>
              {loading ? "Please wait..." : tab === "login" ? "Sign In ✨" : "Create Account ✨"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ page, setPage, user, onLogout, wishCount }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn);
  }, []);
  const links = ["Home", "About Us", "Features", "Contact", "Wishlist", "Tailor Booking"];
  return (
    <nav className={"navbar" + (scrolled ? " scrolled" : "")}>
      <div className="nav-logo" onClick={() => setPage("home")}>Brocele</div>
      <div className={"nav-links" + (open ? " open" : "")}>
        {links.map(l => (
          <button key={l} className={"nav-link" + (page === l.toLowerCase().replace(/ /g, "-") ? " active" : "") + (l === "Wishlist" ? " wishlist-btn" : "")}
            onClick={() => { setPage(l.toLowerCase().replace(/ /g, "-")); setOpen(false); }}>
            {l === "Wishlist" ? "♡ Wishlist" : l}
            {l === "Wishlist" && wishCount > 0 && <span className="nav-badge">{wishCount}</span>}
          </button>
        ))}
        <span className="nav-user">Hi, {user.name.split(" ")[0]}</span>
        <button className="nav-logout" onClick={onLogout}>Logout</button>
      </div>
      <div className="hamburger" onClick={() => setOpen(!open)}><span /><span /><span /></div>
    </nav>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ user, onWish, wishlist, setToast }) {
  const [outfits, setOutfits] = useState([]);
  useEffect(() => { api("/wardrobe").then(setOutfits); }, []);
  const reviews = [
    { name: "Aisha Kapoor", text: "Brocele completely transformed my wardrobe! The AI suggestions are spot on.", rating: 5, role: "Fashion Blogger" },
    { name: "Rahul Mehta", text: "The virtual try-on feature saved me so much time. Absolutely love this platform!", rating: 5, role: "Software Engineer" },
    { name: "Priya Singh", text: "Found my perfect wedding outfit through Brocele. The tailor booking was seamless.", rating: 5, role: "Bride-to-be" },
  ];
  const why = [
    { icon: "🤖", title: "AI-Powered", desc: "Smart algorithms analyze your body type and preferences for perfect outfit matches." },
    { icon: "��", title: "Premium Styles", desc: "Curated collection of luxury and affordable fashion from top designers." },
    { icon: "✂️", title: "Expert Tailors", desc: "Connect with skilled tailors for custom fits and alterations." },
    { icon: "📱", title: "Easy to Use", desc: "Intuitive interface designed for a seamless styling experience." },
  ];
  return (
    <div>
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-overlay"></div>
        <div className="hero-content fade-in">
          <div className="hero-badge">✨ AI-Powered Fashion Styling</div>
          <h1>Find Your Perfect Style with AI ✨</h1>
          <p>Brocele uses cutting-edge artificial intelligence to analyze your unique features and suggest outfits that make you look and feel extraordinary.</p>
          <div className="hero-btns">
            <button className="btn-primary">Get Started 🚀</button>
            <button className="btn-outline">Try Virtual Try-On 📸</button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><h3>50K+</h3><p>Happy Customers</p></div>
            <div className="hero-stat"><h3>10K+</h3><p>Outfit Styles</p></div>
            <div className="hero-stat"><h3>500+</h3><p>Expert Tailors</p></div>
          </div>
        </div>
        <div className="hero-images slide-right">
          {HERO_IMGS.map((src, i) => <img key={i} src={src} alt="fashion" loading="lazy" />)}
        </div>
      </section>
      <section className="section section-alt">
        <div className="section-title fade-in">
          <h2>Why Choose Brocele?</h2>
          <p>Experience fashion like never before with our AI-driven platform</p>
          <div className="gold-line"></div>
        </div>
        <div className="why-grid">
          {why.map((w, i) => <div key={i} className="why-card fade-in"><span className="why-icon">{w.icon}</span><h3>{w.title}</h3><p>{w.desc}</p></div>)}
        </div>
      </section>
      <section className="section section-dark">
        <div className="section-title">
          <h2>Trending Styles</h2>
          <p>Discover the hottest fashion trends curated just for you</p>
          <div className="gold-line"></div>
        </div>
        <div className="trending-grid">
          {outfits.slice(0, 8).map((o, i) => (
            <div key={i} className="outfit-card">
              <img src={getOutfitImage(o)} alt={o.name} loading="lazy" />
              <div className="card-badge">{o.category}</div>
              <div className="outfit-card-body">
                <h4>{o.name}</h4>
                <p>{o.budget}</p>
                <Stars n={o.rating} />
                <div className="outfit-card-actions">
                  <button className={"wish-btn" + (wishlist.some(w => w.outfitName === o.name) ? " liked" : "")} onClick={() => onWish(o)}>
                    {wishlist.some(w => w.outfitName === o.name) ? "♥ Saved" : "♡ Wishlist"}
                  </button>
                  <button className="wish-btn" onClick={() => { navigator.clipboard?.writeText(window.location.href); setToast("Link copied!"); }}>↗ Share</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="section section-alt">
        <div className="section-title">
          <h2>Customer Reviews</h2>
          <p>What our happy customers say about Brocele</p>
          <div className="gold-line"></div>
        </div>
        <div className="reviews-grid">
          {reviews.map((r, i) => (
            <div key={i} className="review-card fade-in">
              <div className="review-avatar">{r.name[0]}</div>
              <Stars n={r.rating} />
              <p>"{r.text}"</p>
              <h4>{r.name}</h4>
              <span>{r.role}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── ABOUT PAGE ───────────────────────────────────────────────────────────────
function AboutPage() {
  const cards = [
    { icon: "🤖", title: "AI Powered", desc: "Our proprietary AI engine analyzes thousands of fashion data points to deliver personalized recommendations." },
    { icon: "👑", title: "Personal Boutique", desc: "Every customer gets a unique boutique experience tailored to their individual style preferences." },
    { icon: "✂️", title: "Tailor Support", desc: "Connect with expert tailors who can bring your dream outfit to life with precision craftsmanship." },
    { icon: "💡", title: "Smart Styling", desc: "Intelligent styling suggestions based on occasion, season, mood, and your personal color palette." },
  ];
  return (
    <div>
      <section className="about-hero">
        <div className="about-hero-bg"></div>
        <div className="about-hero-overlay"></div>
        <div className="about-hero-content fade-in"><h1>About Brocele</h1><p>Brocele combines Artificial Intelligence with Fashion Styling to help every customer look their best.</p></div>
      </section>
      <section className="section section-dark">
        <div className="about-mission fade-in">
          <h2>Our Mission</h2>
          <p>Brocele combines Artificial Intelligence with Fashion Styling to help every customer look their best. We believe that great style should be accessible to everyone, regardless of budget or body type. Our AI-powered platform democratizes fashion by providing personalized styling advice that was once only available to the elite.</p>
        </div>
      </section>
      <section className="section section-alt">
        <div className="section-title"><h2>What Makes Us Special</h2><div className="gold-line"></div></div>
        <div className="about-cards">
          {cards.map((c, i) => <div key={i} className="about-card fade-in"><div className="about-card-icon">{c.icon}</div><h3>{c.title}</h3><p>{c.desc}</p></div>)}
        </div>
      </section>
    </div>
  );
}

// ─── RESULT CARD (with accurate image) ───────────────────────────────────────
function OutfitResultCard({ o, i }) {
  return (
    <div className="result-card">
      <img src={getOutfitImage(o)} alt={o.name} loading="lazy" onError={e => { e.target.src = CATEGORY_IMAGES[o.category] || HERO_IMGS[0]; }} />
      <div className="result-card-body">
        <h4>{o.name}</h4>
        <p>{o.category} · {o.budget}</p>
        <Stars n={o.rating} />
      </div>
    </div>
  );
}

// ─── FEATURE MODALS ───────────────────────────────────────────────────────────
function OutfitSuggestionsModal({ onClose }) {
  const [form, setForm] = useState({ gender: "", height: "", weight: "", bodyType: "", skinTone: "", preferredStyle: "" });
  const [results, setResults] = useState([]); const [loading, setLoading] = useState(false);
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async e => { e.preventDefault(); setLoading(true); const r = await api("/outfit-suggestions", "POST", form); setResults(r); setLoading(false); };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>👗 AI Outfit Suggestions</h2>
        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group"><label>Gender</label>
              <select name="gender" value={form.gender} onChange={handle}><option value="">Select</option><option>Male</option><option>Female</option><option>Non-binary</option></select></div>
            <div className="form-group"><label>Body Type</label>
              <select name="bodyType" value={form.bodyType} onChange={handle}><option value="">Select</option><option>Slim</option><option>Athletic</option><option>Curvy</option><option>Plus Size</option><option>Petite</option></select></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Height (cm)</label><input name="height" placeholder="e.g. 165" value={form.height} onChange={handle} /></div>
            <div className="form-group"><label>Weight (kg)</label><input name="weight" placeholder="e.g. 60" value={form.weight} onChange={handle} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Skin Tone</label>
              <select name="skinTone" value={form.skinTone} onChange={handle}><option value="">Select</option><option>Fair</option><option>Medium</option><option>Olive</option><option>Dark</option></select></div>
            <div className="form-group"><label>Preferred Style</label>
              <select name="preferredStyle" value={form.preferredStyle} onChange={handle}><option value="">Select</option><option>Western</option><option>Ethnic</option><option>Casual</option><option>Formal</option></select></div>
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Analyzing..." : "Get AI Suggestions ✨"}</button>
        </form>
        {loading && <Loader />}
        {results.length > 0 && (<div><h3 style={{color:"#e8c97e",margin:"24px 0 16px",fontFamily:"Playfair Display,serif"}}>Suggested Outfits</h3>
          <div className="result-grid">{results.map((o, i) => <OutfitResultCard key={i} o={o} i={i} />)}</div></div>)}
      </div>
    </div>
  );
}

function StyleAnalysisModal({ onClose }) {
  const [colors, setColors] = useState([]); const [materials, setMaterials] = useState([]); const [results, setResults] = useState(null); const [loading, setLoading] = useState(false);
  const toggleColor = c => setColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  const toggleMat = m => setMaterials(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  const submit = async () => { setLoading(true); const r = await api("/style-analysis", "POST", { colors, materials }); setResults(r); setLoading(false); };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>🎨 Personalized Style Analysis</h2>
        <div className="form-group"><label>Choose Colors</label>
          <div className="tag-group">{["Black","White","Red","Blue","Green","Pink","Beige","Lavender"].map(c => <span key={c} className={"tag"+(colors.includes(c)?" active":"")} onClick={()=>toggleColor(c)}>{c}</span>)}</div></div>
        <div className="form-group"><label>Choose Materials</label>
          <div className="tag-group">{["Cotton","Silk","Linen","Denim","Satin","Wool"].map(m => <span key={m} className={"tag"+(materials.includes(m)?" active":"")} onClick={()=>toggleMat(m)}>{m}</span>)}</div></div>
        <button className="btn-primary" onClick={submit} disabled={loading}>{loading ? "Analyzing..." : "Analyze My Style ✨"}</button>
        {loading && <Loader />}
        {results && (<div>
          <h3 style={{color:"#e8c97e",margin:"24px 0 12px",fontFamily:"Playfair Display,serif"}}>Best Combinations</h3>
          {results.combinations?.map((c,i) => <div key={i} style={{background:"#111",border:"1px solid #2a2a2a",borderRadius:10,padding:"12px 16px",marginBottom:8,color:"#c9a96e",fontSize:14}}>✨ {c}</div>)}
          <h3 style={{color:"#e8c97e",margin:"20px 0 12px",fontFamily:"Playfair Display,serif"}}>Matching Outfits</h3>
          <div className="result-grid">{results.outfits?.slice(0,4).map((o,i) => <OutfitResultCard key={i} o={o} i={i} />)}</div>
          <h3 style={{color:"#e8c97e",margin:"20px 0 12px",fontFamily:"Playfair Display,serif"}}>Tailors Nearby</h3>
          {results.tailors?.map((t,i) => (
            <div key={i} className="tailor-card" style={{marginBottom:12}}>
              <div className="tailor-avatar">{t.name[0]}</div>
              <div className="tailor-info"><h4>{t.name}</h4><p>{t.speciality} · {t.experience}</p><Stars n={t.rating} /><p style={{marginTop:4}}>{t.contact}</p></div>
            </div>))}
        </div>)}
      </div>
    </div>
  );
}

function WardrobeModal({ onClose }) {
  const [category, setCategory] = useState(""); const [mood, setMood] = useState(""); const [event, setEvent] = useState(""); const [results, setResults] = useState([]); const [loading, setLoading] = useState(false);
  const submit = async () => { setLoading(true); const r = await api("/wardrobe", "POST", { category, mood, event }); setResults(r); setLoading(false); };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>🛍 Smart Wardrobe Management</h2>
        <div className="form-group"><label>Category</label>
          <div className="tag-group">{["Traditional","Western","Casual","Formal","Party Wear","Ethnic","Sportswear","Office Wear"].map(c=><span key={c} className={"tag"+(category===c?" active":"")} onClick={()=>setCategory(c)}>{c}</span>)}</div></div>
        <div className="form-group"><label>Mood</label>
          <div className="tag-group">{["Happy","Romantic","Confident","Relaxed","Professional"].map(m=><span key={m} className={"tag"+(mood===m?" active":"")} onClick={()=>setMood(m)}>{m}</span>)}</div></div>
        <div className="form-group"><label>Event</label>
          <div className="tag-group">{["Wedding","Interview","College","Festival","Party","Vacation"].map(ev=><span key={ev} className={"tag"+(event===ev?" active":"")} onClick={()=>setEvent(ev)}>{ev}</span>)}</div></div>
        <button className="btn-primary" onClick={submit} disabled={loading}>{loading?"Loading...":"Find Outfits ✨"}</button>
        {loading && <Loader />}
        {results.length > 0 && (<div><h3 style={{color:"#e8c97e",margin:"24px 0 16px",fontFamily:"Playfair Display,serif"}}>Recommended Outfits</h3>
          <div className="result-grid">{results.map((o,i)=><OutfitResultCard key={i} o={o} i={i} />)}</div></div>)}
      </div>
    </div>
  );
}

function TryOnModal({ onClose }) {
  const [style, setStyle] = useState(""); const [preview, setPreview] = useState(null); const [results, setResults] = useState([]); const [loading, setLoading] = useState(false);
  const fileRef = useRef();
  const handleFile = e => { const f = e.target.files[0]; if (f) setPreview(URL.createObjectURL(f)); };
  const submit = async () => { setLoading(true); const r = await api("/tryon","POST",{style}); setResults(r.outfits||[]); setLoading(false); };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>📸 Virtual Try-On Experience</h2>
        <div className="upload-area" onClick={() => fileRef.current.click()}>
          {preview ? <img src={preview} alt="preview" className="upload-preview" /> : <><span style={{fontSize:48}}>📷</span><p>Click to upload your photo</p></>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile} />
        <div className="form-group"><label>Select Style</label>
          <div className="tag-group">{["Traditional","Casual","Formal","Party"].map(s=><span key={s} className={"tag"+(style===s?" active":"")} onClick={()=>setStyle(s)}>{s}</span>)}</div></div>
        <button className="btn-primary" onClick={submit} disabled={loading||!style}>{loading?"Processing...":"Try On ✨"}</button>
        {loading && <Loader />}
        {results.length > 0 && (<div>
          <div style={{background:"rgba(201,169,110,0.1)",border:"1px solid rgba(201,169,110,0.3)",borderRadius:12,padding:"14px 18px",margin:"20px 0",color:"#c9a96e",fontSize:14}}>✨ How you may look in this outfit — Virtual simulation preview</div>
          <div className="result-grid">{results.map((o,i)=><OutfitResultCard key={i} o={o} i={i} />)}</div>
        </div>)}
      </div>
    </div>
  );
}

function BudgetModal({ onClose }) {
  const [budget, setBudget] = useState(""); const [results, setResults] = useState([]); const [loading, setLoading] = useState(false);
  const submit = async () => { setLoading(true); const r = await api("/budget-suggestions","POST",{budget}); setResults(r); setLoading(false); };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>💰 Budget-Based Suggestions</h2>
        <div className="form-group"><label>Select Your Budget</label></div>
        <div className="budget-options">
          {["Under ₹1000","₹1000–₹3000","₹3000–₹7000","Premium"].map(b=><div key={b} className={"budget-option"+(budget===b?" selected":"")} onClick={()=>setBudget(b)}>{b}</div>)}
        </div>
        <button className="btn-primary" onClick={submit} disabled={loading||!budget}>{loading?"Loading...":"Find Outfits ✨"}</button>
        {loading && <Loader />}
        {results.length > 0 && (<div><h3 style={{color:"#e8c97e",margin:"24px 0 16px",fontFamily:"Playfair Display,serif"}}>Outfits in Your Budget</h3>
          <div className="result-grid">{results.map((o,i)=><OutfitResultCard key={i} o={o} i={i} />)}</div></div>)}
      </div>
    </div>
  );
}

function OccasionModal({ onClose }) {
  const [occasion, setOccasion] = useState(""); const [season, setSeason] = useState(""); const [results, setResults] = useState([]); const [loading, setLoading] = useState(false);
  const submit = async () => { setLoading(true); const r = await api("/occasion-planner","POST",{occasion,season}); setResults(r); setLoading(false); };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>📅 Occasion Planner</h2>
        <div className="form-group"><label>Select Occasion</label>
          <div className="tag-group">{["Wedding","Date","Interview","Birthday","Festival"].map(o=><span key={o} className={"tag"+(occasion===o?" active":"")} onClick={()=>setOccasion(o)}>{o}</span>)}</div></div>
        <div className="form-group"><label>Select Season</label>
          <div className="tag-group">{["Summer","Winter","Rainy"].map(s=><span key={s} className={"tag"+(season===s?" active":"")} onClick={()=>setSeason(s)}>{s}</span>)}</div></div>
        <button className="btn-primary" onClick={submit} disabled={loading||!occasion||!season}>{loading?"Planning...":"Plan My Look ✨"}</button>
        {loading && <Loader />}
        {results.length > 0 && (<div><h3 style={{color:"#e8c97e",margin:"24px 0 16px",fontFamily:"Playfair Display,serif"}}>Complete Look for {occasion}</h3>
          <div className="result-grid">{results.map((o,i)=><OutfitResultCard key={i} o={o} i={i} />)}</div></div>)}
      </div>
    </div>
  );
}

// ─── FEATURES PAGE ────────────────────────────────────────────────────────────
function FeaturesPage({ user, setToast }) {
  const [modal, setModal] = useState(null);
  const features = [
    { id:"outfit", icon:"👗", title:"AI-Powered Outfit Suggestions", desc:"Get personalized outfit recommendations based on your body type, skin tone, and style preferences using advanced AI." },
    { id:"style",  icon:"🎨", title:"Personalized Style Analysis",   desc:"Choose your favourite colors and materials to get a complete style analysis with matching outfit combinations." },
    { id:"wardrobe",icon:"🛍",title:"Smart Wardrobe Management",     desc:"Organize your wardrobe by category, mood, and event. Get smart recommendations for every occasion." },
    { id:"tryon",  icon:"📸", title:"Virtual Try-On Experience",     desc:"Upload your photo and virtually try on different outfits to see how you look before buying." },
    { id:"budget", icon:"💰", title:"Budget-Based Suggestions",      desc:"Find the perfect outfit within your budget. From affordable to premium, we have options for everyone." },
    { id:"occasion",icon:"📅",title:"Occasion Planner",             desc:"Plan your complete look for any occasion and season. Never be underdressed or overdressed again." },
  ];
  return (
    <div>
      <section className="features-hero">
        <div className="section-title">
          <h2>Our Premium Features</h2>
          <p>Discover the powerful AI-driven tools that make Brocele the ultimate fashion companion</p>
          <div className="gold-line"></div>
        </div>
      </section>
      <section className="section section-dark" style={{paddingTop:0}}>
        <div className="features-grid">
          {features.map(f => (
            <div key={f.id} className="feature-card fade-in" onClick={() => setModal(f.id)}>
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <span className="feature-arrow">→</span>
            </div>
          ))}
        </div>
      </section>
      {modal==="outfit"   && <OutfitSuggestionsModal onClose={()=>setModal(null)} setToast={setToast} user={user} />}
      {modal==="style"    && <StyleAnalysisModal onClose={()=>setModal(null)} />}
      {modal==="wardrobe" && <WardrobeModal onClose={()=>setModal(null)} />}
      {modal==="tryon"    && <TryOnModal onClose={()=>setModal(null)} />}
      {modal==="budget"   && <BudgetModal onClose={()=>setModal(null)} />}
      {modal==="occasion" && <OccasionModal onClose={()=>setModal(null)} />}
    </div>
  );
}

// ─── WISHLIST PAGE ────────────────────────────────────────────────────────────
function WishlistPage({ user, wishlist, setWishlist, setToast }) {
  const remove = async item => {
    await api("/wishlist/"+item._id,"DELETE");
    setWishlist(prev => prev.filter(w => w._id !== item._id));
    setToast("Removed from wishlist");
  };
  return (
    <div className="wishlist-page">
      <h1>My Wishlist ♥</h1>
      <p>{wishlist.length} saved items</p>
      {wishlist.length === 0
        ? <div className="empty-state"><span>♡</span><p>Your wishlist is empty. Start exploring and save your favourites!</p></div>
        : <div className="wishlist-grid">
            {wishlist.map((item, i) => (
              <div key={i} className="wishlist-item">
                <img src={item.outfitImage || HERO_IMGS[i%HERO_IMGS.length]} alt={item.outfitName} loading="lazy"
                  onError={e=>{e.target.src=HERO_IMGS[0];}} />
                <div className="wishlist-item-body">
                  <h4>{item.outfitName}</h4>
                  <button className="remove-btn" onClick={()=>remove(item)}>✕ Remove</button>
                </div>
              </div>
            ))}
          </div>}
    </div>
  );
}

// ─── TAILOR BOOKING PAGE ──────────────────────────────────────────────────────
function TailorBookingPage({ setToast }) {
  const [tailors, setTailors] = useState([]); const [form, setForm] = useState({name:"",email:"",phone:"",tailor:"",date:"",notes:""}); const [submitted, setSubmitted] = useState(false);
  useEffect(() => { api("/tailors").then(setTailors); }, []);
  const handle = e => setForm({...form,[e.target.name]:e.target.value});
  const submit = e => { e.preventDefault(); setSubmitted(true); setToast("Booking confirmed! Tailor will contact you soon."); };
  return (
    <div className="booking-page">
      <h1>Tailor Booking</h1>
      <p>Book an appointment with our expert tailors for custom fits and alterations</p>
      <div className="tailors-grid">
        {tailors.map((t,i) => (
          <div key={i} className="tailor-full-card">
            <h3>{t.name}</h3>
            <p>🎯 {t.speciality}</p><p>⏱ {t.experience} experience</p>
            <Stars n={t.rating} />
            <p style={{marginTop:8}}>📍 {t.location}</p><p>📞 {t.contact}</p>
          </div>
        ))}
      </div>
      {submitted
        ? <div className="booking-form"><div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{fontSize:64,marginBottom:16}}>✅</div>
            <h2>Booking Confirmed!</h2>
            <p style={{color:"#888",marginTop:8}}>Your tailor will contact you within 24 hours.</p>
            <button className="btn-primary" style={{marginTop:24}} onClick={()=>setSubmitted(false)}>Book Another</button>
          </div></div>
        : <div className="booking-form">
            <h2>Book an Appointment</h2>
            <form onSubmit={submit}>
              <div className="form-row">
                <div className="form-group"><label>Your Name</label><input name="name" placeholder="Full name" value={form.name} onChange={handle} required /></div>
                <div className="form-group"><label>Email</label><input name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handle} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Phone</label><input name="phone" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={handle} /></div>
                <div className="form-group"><label>Select Tailor</label>
                  <select name="tailor" value={form.tailor} onChange={handle} required>
                    <option value="">Choose a tailor</option>
                    {tailors.map(t=><option key={t._id} value={t.name}>{t.name}</option>)}
                  </select></div>
              </div>
              <div className="form-group"><label>Preferred Date</label><input name="date" type="date" value={form.date} onChange={handle} required /></div>
              <div className="form-group"><label>Notes</label><textarea name="notes" placeholder="Describe what you need..." value={form.notes} onChange={handle} rows={3} style={{resize:"vertical"}} /></div>
              <button className="btn-primary" type="submit">Confirm Booking ✨</button>
            </form>
          </div>}
    </div>
  );
}

// ─── CONTACT PAGE ─────────────────────────────────────────────────────────────
function ContactPage({ setToast }) {
  const [form, setForm] = useState({name:"",email:"",subject:"",message:""}); const [newsletter, setNewsletter] = useState("");
  const handle = e => setForm({...form,[e.target.name]:e.target.value});
  const submit = e => { e.preventDefault(); setToast("Message sent! We will reply within 24 hours."); setForm({name:"",email:"",subject:"",message:""}); };
  const subNewsletter = e => { e.preventDefault(); setToast("Subscribed to Brocele newsletter! ✨"); setNewsletter(""); };
  return (
    <div className="contact-page">
      <div className="contact-grid">
        <div className="contact-info fade-in">
          <h1>Get In Touch</h1>
          <p>Have questions about our AI styling services? We are here to help you look your absolute best.</p>
          {[{icon:"📍",title:"Visit Us",text:"123 Fashion Street, Mumbai, India 400001"},{icon:"📞",title:"Call Us",text:"+91 98765 43210"},{icon:"✉️",title:"Email Us",text:"hello@brocele.com"},{icon:"⏰",title:"Working Hours",text:"Mon–Sat: 9AM – 8PM IST"}].map((c,i)=>(
            <div key={i} className="contact-item">
              <div className="contact-item-icon">{c.icon}</div>
              <div className="contact-item-text"><h4>{c.title}</h4><p>{c.text}</p></div>
            </div>))}
        </div>
        <div className="contact-form-box fade-in">
          <h2 style={{fontFamily:"Playfair Display,serif",color:"#e8c97e",marginBottom:24,fontSize:24}}>Send a Message</h2>
          <form onSubmit={submit}>
            <div className="form-row">
              <div className="form-group"><label>Name</label><input name="name" placeholder="Your name" value={form.name} onChange={handle} required /></div>
              <div className="form-group"><label>Email</label><input name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handle} required /></div>
            </div>
            <div className="form-group"><label>Subject</label><input name="subject" placeholder="How can we help?" value={form.subject} onChange={handle} /></div>
            <div className="form-group"><label>Message</label><textarea name="message" placeholder="Tell us more..." value={form.message} onChange={handle} rows={5} style={{resize:"vertical"}} required /></div>
            <button className="btn-primary" type="submit">Send Message ✨</button>
          </form>
        </div>
      </div>
      <div className="newsletter">
        <h2>Stay Stylish with Brocele</h2>
        <p>Subscribe to our newsletter for the latest fashion trends, AI styling tips, and exclusive offers.</p>
        <form className="newsletter-form" onSubmit={subNewsletter}>
          <input type="email" placeholder="Enter your email address" value={newsletter} onChange={e=>setNewsletter(e.target.value)} required />
          <button className="btn-primary" type="submit">Subscribe ✨</button>
        </form>
      </div>
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer({ setPage }) {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand"><h3>Brocele</h3><p>AI-powered fashion styling boutique. Helping you look your best every single day with the power of artificial intelligence.</p></div>
        <div className="footer-col"><h4>Quick Links</h4><ul>{["Home","About Us","Features","Contact"].map(l=><li key={l}><a onClick={()=>setPage(l.toLowerCase().replace(" ","-"))}>{l}</a></li>)}</ul></div>
        <div className="footer-col"><h4>Features</h4><ul>{["AI Outfit Suggestions","Style Analysis","Virtual Try-On","Occasion Planner"].map(f=><li key={f}><a onClick={()=>setPage("features")}>{f}</a></li>)}</ul></div>
        <div className="footer-col"><h4>Support</h4><ul>{["FAQ","Privacy Policy","Terms of Service","Tailor Booking"].map(s=><li key={s}><a onClick={()=>setPage("tailor-booking")}>{s}</a></li>)}</ul></div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 Brocele – AI Stylist Boutique. All rights reserved.</p>
        <p style={{color:"#c9a96e"}}>Made with ♥ for Fashion Lovers</p>
      </div>
    </footer>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("brocele_user")) || null; } catch { return null; } });
  const [page, setPage] = useState("home");
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState("");

  useEffect(() => { if (user) api("/wishlist?userId="+user.id).then(setWishlist); }, [user]);

  const handleLogin = u => { setUser(u); localStorage.setItem("brocele_user", JSON.stringify(u)); };
  const handleLogout = () => { setUser(null); localStorage.removeItem("brocele_user"); setPage("home"); };
  const handleWish = async outfit => {
    if (!user) return;
    if (wishlist.some(w => w.outfitName === outfit.name)) { setToast("Already in wishlist!"); return; }
    try {
      const r = await api("/wishlist","POST",{ userId:user.id, outfitId:outfit._id||outfit.name, outfitName:outfit.name, outfitImage:getOutfitImage(outfit) });
      if (r.error) { setToast(r.error); return; }
      setWishlist(prev => [...prev, r.item]);
      setToast("Added to wishlist ♥");
    } catch { setToast("Could not add to wishlist"); }
  };

  if (!user) return (<><AuthPage onLogin={handleLogin} />{toast && <Toast msg={toast} onClose={()=>setToast("")} />}</>);

  const renderPage = () => {
    switch(page) {
      case "home":          return <HomePage user={user} onWish={handleWish} wishlist={wishlist} setToast={setToast} />;
      case "about-us":      return <AboutPage />;
      case "features":      return <FeaturesPage user={user} setToast={setToast} />;
      case "contact":       return <ContactPage setToast={setToast} />;
      case "wishlist":      return <WishlistPage user={user} wishlist={wishlist} setWishlist={setWishlist} setToast={setToast} />;
      case "tailor-booking":return <TailorBookingPage setToast={setToast} />;
      default:              return <HomePage user={user} onWish={handleWish} wishlist={wishlist} setToast={setToast} />;
    }
  };

  return (
    <div>
      <Navbar page={page} setPage={setPage} user={user} onLogout={handleLogout} wishCount={wishlist.length} />
      <main>{renderPage()}</main>
      <Footer setPage={setPage} />
      <AIChatbot />
      {toast && <Toast msg={toast} onClose={()=>setToast("")} />}
    </div>
  );
}



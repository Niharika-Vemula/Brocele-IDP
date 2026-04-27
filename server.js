const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "*", methods: ["GET","POST","PUT","DELETE","OPTIONS"], allowedHeaders: ["Content-Type","Authorization"] }));
app.options("*", cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/brocele");
mongoose.connection.on("connected", () => console.log("MongoDB connected"));
mongoose.connection.on("error", err => console.log("MongoDB error:", err));

// ── Schemas ──────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({ name:String, email:{type:String,unique:true}, password:String, createdAt:{type:Date,default:Date.now} });
const outfitSchema = new mongoose.Schema({
  name:String, category:String, style:String,
  budget:String, budgetOrder:Number,
  image:String, tags:[String], rating:Number,
  gender:[String],          // ["male","female","unisex"]
  bodyTypes:[String],       // ["slim","athletic","curvy","plus","petite","all"]
  occasions:[String],       // ["wedding","interview","party","casual","festival","date","college","vacation","birthday"]
  seasons:[String],         // ["summer","winter","rainy","all"]
  moods:[String],           // ["happy","romantic","confident","relaxed","professional"]
  styles:[String],          // ["western","ethnic","traditional","formal","casual"]
  colors:[String],
  materials:[String],
});
const tailorSchema = new mongoose.Schema({ name:String, experience:String, rating:Number, contact:String, location:String, speciality:String });
const wishlistSchema = new mongoose.Schema({ userId:String, outfitId:String, outfitName:String, outfitImage:String, addedAt:{type:Date,default:Date.now} });
const reviewSchema = new mongoose.Schema({ userId:String, userName:String, outfitId:String, rating:Number, comment:String, createdAt:{type:Date,default:Date.now} });

const User    = mongoose.model("User", userSchema);
const Outfit  = mongoose.model("Outfit", outfitSchema);
const Tailor  = mongoose.model("Tailor", tailorSchema);
const Wishlist= mongoose.model("Wishlist", wishlistSchema);
const Review  = mongoose.model("Review", reviewSchema);


// ── Seed Data ─────────────────────────────────────────────────────────────────
async function seedData() {
  const outfitCount = await Outfit.countDocuments();
  if (outfitCount === 0) {
    const { OUTFITS_SEED } = require("./seed_data.js");
    await Outfit.insertMany(OUTFITS_SEED);
    console.log("Outfits seeded:", OUTFITS_SEED.length);
  }
  const tailorCount = await Tailor.countDocuments();
  if (tailorCount === 0) {
    await Tailor.insertMany([
      { name:"Ravi Kumar",   experience:"12 years", rating:4.8, contact:"+91 98765 43210", location:"Mumbai",    speciality:"Bridal & Ethnic Wear" },
      { name:"Priya Sharma", experience:"8 years",  rating:4.6, contact:"+91 87654 32109", location:"Delhi",     speciality:"Western & Formal Wear" },
      { name:"Arjun Mehta",  experience:"15 years", rating:4.9, contact:"+91 76543 21098", location:"Bangalore", speciality:"Designer Suits & Blazers" },
      { name:"Sunita Devi",  experience:"10 years", rating:4.7, contact:"+91 65432 10987", location:"Chennai",   speciality:"Sarees & Kurtis" },
    ]);
    console.log("Tailors seeded");
  }
}
seedData();

// ── Scoring helper ────────────────────────────────────────────────────────────
function scoreOutfit(outfit, filters) {
  let score = 0;
  const { gender, bodyType, preferredStyle, budget, occasion, season, mood, colors, materials, category } = filters;

  if (occasion) {
    const occ = occasion.toLowerCase();
    if (outfit.occasions?.includes(occ)) score += 40;
    else if (outfit.occasions?.includes("all")) score += 5;
    else score -= 20;
  }
  if (season) {
    const sea = season.toLowerCase();
    if (outfit.seasons?.includes(sea)) score += 30;
    else if (outfit.seasons?.includes("all")) score += 10;
    else score -= 15;
  }
  if (mood) {
    const m = mood.toLowerCase();
    if (outfit.moods?.includes(m)) score += 20;
  }
  if (gender) {
    const g = gender.toLowerCase();
    if (outfit.gender?.includes(g) || outfit.gender?.includes("unisex")) score += 15;
    else score -= 30;
  }
  if (bodyType) {
    const bt = bodyType.toLowerCase();
    if (outfit.bodyTypes?.includes(bt) || outfit.bodyTypes?.includes("all")) score += 10;
  }
  if (preferredStyle) {
    const ps = preferredStyle.toLowerCase();
    if (outfit.styles?.includes(ps)) score += 15;
  }
  if (budget) {
    const budgetMap = { "Under 1000":1, "1000-3000":2, "3000-7000":3, "Premium":4 };
    const wanted = budgetMap[budget] || 0;
    if (wanted && outfit.budgetOrder === wanted) score += 20;
    else if (wanted && Math.abs(outfit.budgetOrder - wanted) === 1) score += 5;
  }
  if (category) {
    if (outfit.category?.toLowerCase() === category.toLowerCase()) score += 25;
  }
  if (colors && colors.length) {
    const matched = colors.filter(c => outfit.colors?.some(oc => oc.toLowerCase().includes(c.toLowerCase())));
    score += matched.length * 8;
  }
  if (materials && materials.length) {
    const matched = materials.filter(m => outfit.materials?.some(om => om.toLowerCase().includes(m.toLowerCase())));
    score += matched.length * 8;
  }
  return score;
}

async function getFilteredOutfits(filters, limit = 6) {
  const all = await Outfit.find();
  const scored = all.map(o => ({ outfit: o, score: scoreOutfit(o.toObject(), filters) }));
  scored.sort((a, b) => b.score - a.score);
  // Return top results, minimum score > -10 to avoid totally irrelevant
  const relevant = scored.filter(s => s.score > -10).slice(0, limit);
  return relevant.length >= 3 ? relevant.map(s => s.outfit) : scored.slice(0, limit).map(s => s.outfit);
}

// ── Auth Routes ───────────────────────────────────────────────────────────────
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error:"All fields required" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error:"Email already registered" });
    const user = new User({ name, email, password });
    await user.save();
    res.json({ message:"Registered successfully", user:{ id:user._id, name, email } });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ error:"Invalid credentials" });
    res.json({ message:"Login successful", user:{ id:user._id, name:user.name, email } });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.get("/users", async (req, res) => {
  const users = await User.find({}, "-password");
  res.json(users);
});

// ── Outfit Routes ─────────────────────────────────────────────────────────────
app.post("/outfit-suggestions", async (req, res) => {
  try {
    const { gender, bodyType, preferredStyle, budget, skinTone } = req.body;
    const outfits = await getFilteredOutfits({ gender, bodyType, preferredStyle, budget });
    res.json(outfits);
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.post("/style-analysis", async (req, res) => {
  try {
    const { colors, materials } = req.body;
    const outfits = await getFilteredOutfits({ colors, materials }, 8);
    const tailors = await Tailor.find();
    const combos = [];
    if (colors?.length && materials?.length) combos.push(`${colors[0]} + ${materials[0]} = Classic Elegance`);
    if (colors?.length > 1 && materials?.length > 1) combos.push(`${colors[1]} + ${materials[1]} = Premium Look`);
    if (colors?.length) combos.push(`${colors[0]} tones work best with minimalist accessories`);
    res.json({ outfits, tailors, combinations: combos.length ? combos : ["Black + Cotton = Timeless Style", "White + Silk = Premium Elegance"] });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.get("/tailors", async (req, res) => {
  const tailors = await Tailor.find();
  res.json(tailors);
});

app.get("/wardrobe", async (req, res) => {
  const outfits = await Outfit.find().limit(12);
  res.json(outfits);
});

app.post("/wardrobe", async (req, res) => {
  try {
    const { category, mood, event } = req.body;
    const occasionMap = { Wedding:"wedding", Interview:"interview", College:"college", Festival:"festival", Party:"party", Vacation:"vacation" };
    const occasion = occasionMap[event] || null;
    const outfits = await getFilteredOutfits({ category, mood: mood?.toLowerCase(), occasion });
    res.json(outfits);
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.post("/tryon", async (req, res) => {
  try {
    const { style } = req.body;
    const styleMap = { Traditional:"ethnic", Casual:"casual", Formal:"formal", Party:"western" };
    const outfits = await getFilteredOutfits({ preferredStyle: styleMap[style] || style?.toLowerCase() }, 4);
    res.json({ outfits, message:"Virtual try-on simulation ready!" });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.post("/budget-suggestions", async (req, res) => {
  try {
    const { budget } = req.body;
    const budgetKey = budget?.replace("₹","").replace(/\s/g,"");
    const outfits = await getFilteredOutfits({ budget: budgetKey });
    res.json(outfits);
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.post("/occasion-planner", async (req, res) => {
  try {
    const { occasion, season } = req.body;
    const occasionMap = { Wedding:"wedding", Interview:"interview", Date:"date", Birthday:"party", Festival:"festival" };
    const seasonMap = { Summer:"summer", Winter:"winter", Rainy:"rainy" };
    const occ = occasionMap[occasion] || occasion?.toLowerCase();
    const sea = seasonMap[season] || season?.toLowerCase();
    const outfits = await getFilteredOutfits({ occasion: occ, season: sea });
    res.json(outfits);
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// ── Wishlist ──────────────────────────────────────────────────────────────────
app.post("/wishlist", async (req, res) => {
  try {
    const { userId, outfitId, outfitName, outfitImage } = req.body;
    const exists = await Wishlist.findOne({ userId, outfitId });
    if (exists) return res.status(400).json({ error:"Already in wishlist" });
    const item = new Wishlist({ userId, outfitId, outfitName, outfitImage });
    await item.save();
    res.json({ message:"Added to wishlist", item });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.get("/wishlist", async (req, res) => {
  try {
    const { userId } = req.query;
    const items = await Wishlist.find({ userId });
    res.json(items);
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.delete("/wishlist/:id", async (req, res) => {
  await Wishlist.findByIdAndDelete(req.params.id);
  res.json({ message:"Removed from wishlist" });
});

app.post("/reviews", async (req, res) => {
  try { const r = new Review(req.body); await r.save(); res.json({ message:"Review submitted", review:r }); }
  catch(e) { res.status(500).json({ error:e.message }); }
});

app.get("/reviews", async (req, res) => {
  const reviews = await Review.find().sort({ createdAt:-1 }).limit(20);
  res.json(reviews);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Brocele server running on http://localhost:${PORT}`));



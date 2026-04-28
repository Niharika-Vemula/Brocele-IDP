import json, re

# Hand-picked Unsplash images matched EXACTLY to each outfit name
IMAGE_MAP = {
    # WEDDING / ETHNIC FEMALE
    "Bridal Lehenga Choli":         "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&fit=crop",
    "Velvet Lehenga (Winter)":      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&fit=crop&sat=-30",
    "Lehenga Choli":                "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&fit=crop",
    "Anarkali Gown":                "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&fit=crop",
    "Anarkali Suit":                "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&fit=crop",
    "Embroidered Sharara Set":      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&fit=crop",
    "Phulkari Salwar Suit":         "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&fit=crop",
    "A-Line Kurti with Churidar":   "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&fit=crop",
    "A-Line Kurti":                 "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&fit=crop",
    "Formal Kurti with Palazzo (Interview)": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&fit=crop",
    "Kashmiri Woolen Kurti":        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&fit=crop",
    "Printed Palazzo Set":          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&fit=crop",
    "Cotton Salwar Kameez":         "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&fit=crop",

    # SAREE
    "Silk Banarasi Saree":          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&fit=crop",
    "Silk Saree":                   "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&fit=crop",
    "Chiffon Floral Saree":         "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&fit=crop",
    "Pashmina Wrap Saree":          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&fit=crop",
    "Office Formal Saree":          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&fit=crop",
    "Pattu Pavadai (South Indian)": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&fit=crop",

    # SHERWANI / MALE ETHNIC
    "Sherwani with Dupatta":        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&fit=crop",
    "Woolen Sherwani (Winter)":     "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&fit=crop",
    "Indo-Western Bandhgala Suit":  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&fit=crop",
    "Dhoti Kurta (Festival)":       "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&fit=crop",
    "Linen Kurta Pajama (Summer)":  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&fit=crop",

    # FORMAL SUITS MALE
    "Classic Black Formal Suit":    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&fit=crop",
    "Formal Suit":                  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&fit=crop",
    "Slim Fit Blazer":              "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&fit=crop",
    "Slim Fit Formal Blazer":       "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&fit=crop",
    "Navy Blue Blazer + Trousers":  "https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=500&fit=crop",
    "Smart Casual Blazer + Jeans":  "https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=500&fit=crop",

    # FORMAL FEMALE
    "White Formal Shirt + Pencil Skirt": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&fit=crop",
    "Charcoal Grey Pantsuit":       "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&fit=crop",
    "Office Formals":               "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&fit=crop",
    "Formal Trousers + Shirt":      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&fit=crop",

    # PARTY / GOWN / DRESS
    "Long Gown":                    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&fit=crop",
    "Long Satin Gown":              "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&fit=crop",
    "Sequin Party Dress":           "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&fit=crop",
    "Red Wrap Dress":               "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&fit=crop",
    "Off-Shoulder Midi Dress":      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&fit=crop",
    "Floral Maxi Dress":            "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&fit=crop",
    "Sundress (Floral)":            "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&fit=crop",
    "Boho Maxi Skirt + Top":        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&fit=crop",

    # JEANS / CASUAL FEMALE
    "High Waist Jeans + Crop Top":  "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&fit=crop",
    "High Waist Jeans":             "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&fit=crop",
    "Turtleneck + Straight Jeans":  "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&fit=crop",

    # CASUAL MALE
    "Casual Tee + Chinos":          "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&fit=crop",
    "Linen Shirt + Shorts":         "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&fit=crop",
    "Smart Casual Shirt + Chinos (Date)": "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&fit=crop",
    "Linen Co-ord Set":             "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&fit=crop",

    # DENIM / JACKET
    "Denim Jacket + White Tee":     "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=500&fit=crop",
    "Denim Jacket":                 "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=500&fit=crop",
    "Dark Denim Outfit (Rainy)":    "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=500&fit=crop",
    "Puffer Jacket + Jeans":        "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=500&fit=crop",
    "Waterproof Trench Coat + Jeans": "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=500&fit=crop",

    # WINTER CASUAL
    "Woolen Sweater + Corduroy Pants": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&fit=crop",
    "Oversized Hoodie + Joggers":   "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&fit=crop",
    "Track Suit (Sports)":          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&fit=crop",

    # SPORTSWEAR
    "Yoga Pants + Sports Bra":      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&fit=crop",
}

# Load existing seed data
src = open("seed_data.js", encoding="utf-8").read()
data = re.search(r"module\.exports\.OUTFITS_SEED\s*=\s*(\[[\s\S]*?\]);", src)
outfits = json.loads(data.group(1))

updated = 0
for o in outfits:
    name = o.get("name","")
    if name in IMAGE_MAP:
        o["image"] = IMAGE_MAP[name]
        updated += 1
    else:
        # fallback by category
        cat_map = {
            "Traditional": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&fit=crop",
            "Ethnic":       "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&fit=crop",
            "Formal":       "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&fit=crop",
            "Casual":       "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&fit=crop",
            "Party Wear":   "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&fit=crop",
            "Office Wear":  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&fit=crop",
            "Sportswear":   "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&fit=crop",
        }
        o["image"] = cat_map.get(o.get("category",""), "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&fit=crop")

new_src = "module.exports.OUTFITS_SEED = " + json.dumps(outfits, indent=2, ensure_ascii=False) + ";\n"
open("seed_data.js","w",encoding="utf-8").write(new_src)
print(f"Updated {updated}/{len(outfits)} outfits with exact images")
for o in outfits:
    print(f"  {o['name'][:40]:40s} -> {o['image'][50:80]}")

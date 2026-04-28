src = open('frontend/src/App.jsx', encoding='utf-8').read()
old_fn = 'function getOutfitImage(outfit) {\n  if (outfit.image && !outfit.image.includes("566479179817")) return outfit.image;\n  const key = Object.keys(OUTFIT_IMAGES).find(k => outfit.name?.toLowerCase().includes(k));\n  if (key) return OUTFIT_IMAGES[key];\n  return CATEGORY_IMAGES[outfit.category] || CATEGORY_IMAGES[outfit.style] ||\n    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&fit=crop";\n}'
new_fn = 'function getOutfitImage(outfit) {\n  if (outfit.image && outfit.image.includes("unsplash.com")) return outfit.image;\n  const lower = outfit.name?.toLowerCase() || "";\n  const keys = Object.keys(OUTFIT_IMAGES).sort((a,b) => b.length - a.length);\n  const key = keys.find(k => lower.includes(k));\n  if (key) return OUTFIT_IMAGES[key];\n  return CATEGORY_IMAGES[outfit.category] || CATEGORY_IMAGES[outfit.style] || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&fit=crop";\n}'
if old_fn in src:
    result = src.replace(old_fn, new_fn)
    open('frontend/src/App.jsx','w',encoding='utf-8').write(result)
    print('patched OK')
else:
    print('old_fn not found, skipping - DB images will be used directly')

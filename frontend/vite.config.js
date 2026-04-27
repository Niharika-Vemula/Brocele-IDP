import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/register": "http://localhost:5000",
      "/login": "http://localhost:5000",
      "/users": "http://localhost:5000",
      "/outfit-suggestions": "http://localhost:5000",
      "/style-analysis": "http://localhost:5000",
      "/tailors": "http://localhost:5000",
      "/wardrobe": "http://localhost:5000",
      "/tryon": "http://localhost:5000",
      "/wishlist": "http://localhost:5000",
      "/budget-suggestions": "http://localhost:5000",
      "/occasion-planner": "http://localhost:5000",
      "/reviews": "http://localhost:5000",
    }
  }
})

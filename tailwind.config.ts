import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Киберпанк цветовая палитра
      colors: {
        // Фоновые цвета
        bg: "#0B0D0E",
        subtle: "#0F1214",
        panel: "#0F1214",
        hover: "#1A1F22",
        
        // Текстовые цвета
        base: "#E6F4EF",
        soft: "#B8C5C0",
        
        // Неоновые акценты
        neon: "#00FF99",
        cyan: "#00FFCC",
        
        // Границы и линии
        line: "#1C2A25",
        
        // Дополнительные алиасы для совместимости
        "bg-subtle": "#0F1214",
        "bg-hover": "#1A1F22",
        "text-base": "#E6F4EF",
        "text-subtle": "#B8C5C0",
        "neon-green": "#00FF99",
        "neon-cyan": "#00FFCC",
      },
      
      // Шрифты
      fontFamily: {
        sans: ["Jura", "system-ui", "sans-serif"],
        mono: ["VT323", "Courier New", "monospace"],
      },
      
      // Неоновые тени
      boxShadow: {
        "neon-green": "0 0 5px #00FF99, 0 0 20px #00FF99, 0 0 35px #00FF99",
        "neon-cyan": "0 0 5px #00FFCC, 0 0 20px #00FFCC, 0 0 35px #00FFCC",
        "neon-soft": "0 0 10px rgba(0, 255, 153, 0.3)",
      },
      
      // Анимации
      animation: {
        "pulse-glow": "pulseGlow 2s ease-in-out infinite alternate",
        "scan-line": "scanLine 3s linear infinite",
      },
      
      keyframes: {
        pulseGlow: {
          "0%": { 
            textShadow: "0 0 5px #00FF99, 0 0 10px #00FF99, 0 0 15px #00FF99" 
          },
          "100%": { 
            textShadow: "0 0 10px #00FF99, 0 0 20px #00FF99, 0 0 30px #00FF99" 
          },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#030712",
          dark: "#060D1F",
          panel: "#0B1528",
          card: "#0F1E36",
          border: "#1E3A5F",
          cyan: "#00F0FF",
          neon: "#38BDF8",
          purple: "#A855F7",
          green: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
        },
        rcm: {
          navy: "#0A192F",
          slate: "#1E293B",
          panel: "#0F172A",
          card: "#1E293B",
          accent: "#38BDF8",
          blue: "#2563EB",
          release: "#10B981",
          review: "#F59E0B",
          hold: "#EF4444",
          block: "#991B1B"
        }
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pageEnter: {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.99)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        neonPulse: {
          '0%, 100%': { opacity: '0.7', filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 25px rgba(0, 240, 255, 0.8))' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'page-enter': 'pageEnter 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-right': 'slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'scanline-sweep': 'scanline 6s linear infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'neon-pulse': 'neonPulse 3s infinite ease-in-out',
      }
    },
  },
  plugins: [],
}

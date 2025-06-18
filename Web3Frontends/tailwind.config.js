/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        gray: {
          950: '#030712',
        },
        green: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'gradient': 'gradient 3s ease infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': {
            opacity: '0.3',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '0.5',
            transform: 'scale(1.05)',
          },
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
        'glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(74, 222, 128, 0.5)',
          },
          '50%': {
            boxShadow: '0 0 30px rgba(74, 222, 128, 0.8)',
          },
        },
        'gradient': {
          '0%, 100%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '8px',
        xl: '20px',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(74, 222, 128, 0.5)',
        'glow-md': '0 0 20px rgba(74, 222, 128, 0.5)',
        'glow-lg': '0 0 30px rgba(74, 222, 128, 0.5)',
        'inner-glow': 'inset 0 0 20px rgba(74, 222, 128, 0.1)',
      },
      scale: {
        '102': '1.02',
        '98': '0.98',
      },
    },
  },
  plugins: [],
  safelist: [
    // Gradient combinations
    'bg-gradient-to-r',
    'bg-gradient-to-br',
    'bg-gradient-to-bl',
    'from-green-400',
    'from-green-500',
    'from-emerald-400',
    'from-emerald-500',
    'to-green-400',
    'to-green-500',
    'to-emerald-400',
    'to-emerald-500',
    'via-emerald-400',
    'via-green-400',
    
    // Opacity variations
    'bg-gray-900/30',
    'bg-gray-900/40',
    'bg-gray-900/50',
    'bg-gray-900/60',
    'bg-gray-900/80',
    'bg-gray-950/60',
    'bg-gray-800/40',
    'bg-gray-800/50',
    'bg-gray-800/60',
    'bg-gray-700/40',
    'bg-gray-700/60',
    
    // Border opacity
    'border-green-500/10',
    'border-green-500/20',
    'border-green-500/30',
    'border-green-500/40',
    'border-green-400/30',
    'border-green-400/40',
    'border-green-400/50',
    
    // Background opacity
    'bg-green-500/5',
    'bg-green-500/10',
    'bg-green-500/20',
    'bg-green-500/30',
    'bg-green-400/20',
    
    // Text opacity
    'text-green-500/60',
    'text-green-500/70',
    'text-green-500/80',
    'text-green-600/40',
    'text-green-600/60',
    
    // Shadow opacity
    'shadow-green-500/10',
    'shadow-green-500/20',
    'shadow-green-500/25',
    'shadow-green-500/30',
    'shadow-green-500/40',
    'shadow-green-500/50',
    'shadow-green-400/50',
    'shadow-yellow-500/50',
    
    // Hover states
    'hover:bg-gray-700/40',
    'hover:bg-gray-700/60',
    'hover:bg-gray-800/50',
    'hover:bg-gray-800/80',
    'hover:bg-green-500/5',
    'hover:bg-green-500/10',
    'hover:bg-green-500/20',
    'hover:bg-green-500/30',
    'hover:border-green-400/40',
    'hover:border-green-400/50',
    'hover:border-green-500/40',
    'hover:from-green-400',
    'hover:to-emerald-400',
    'hover:text-green-300',
    'hover:text-green-500',
    'hover:shadow-green-500/40',
    'hover:shadow-green-500/50',
    
    // Focus states
    'focus:border-green-400',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-green-400/20',
    'focus:ring-green-400/30',
    
    // Transform states
    'transform',
    'hover:scale-105',
    'hover:scale-110',
    'hover:scale-[1.02]',
    'active:scale-[0.98]',
    'hover:rotate-180',
    
    // Animation classes
    'animate-pulse',
    'animate-pulse-slow',
    'animate-float',
    'animate-glow',
    'animate-gradient',
    'animate-spin-slow',
    
    // Backdrop blur
    'backdrop-blur-sm',
    'backdrop-blur-xl',
    
    // Transition
    'transition-all',
    'transition-colors',
    'transition-transform',
    'duration-150',
    'duration-200',
    'duration-300',
    
    // Utility classes
    'bg-clip-text',
    'text-transparent',
    'pointer-events-none',
    'cursor-not-allowed',
    'cursor-pointer',
    'group',
    'group-hover:scale-110',
    'group-hover:text-green-300',
  ]
}
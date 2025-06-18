/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // YAFA Brand Colors
        yafa: {
          primary: '#10b981',      // emerald-500
          secondary: '#22c55e',    // green-500
          accent: '#34d399',       // emerald-400
          dark: '#059669',         // emerald-600
          light: '#6ee7b7',        // emerald-300
        },
        // Custom Green Palette for consistency
        green: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',   // yafa-accent
          500: '#10b981',   // yafa-primary
          600: '#059669',   // yafa-dark
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        // Background colors
        bg: {
          primary: '#000000',
          secondary: '#030712',
          tertiary: '#111827',
          card: 'rgba(17, 24, 39, 0.6)',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'yafa-gradient': 'linear-gradient(135deg, #10b981 0%, #22c55e 50%, #34d399 100%)',
        'yafa-gradient-dark': 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
        'grid-pattern': 'linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%) skewX(-12deg)' },
          '100%': { transform: 'translateX(200%) skewX(-12deg)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(16, 185, 129, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'yafa': '0 10px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04)',
        'yafa-lg': '0 20px 25px -5px rgba(16, 185, 129, 0.15), 0 10px 10px -5px rgba(16, 185, 129, 0.08)',
        'yafa-xl': '0 25px 50px -12px rgba(16, 185, 129, 0.25)',
        'glow-sm': '0 0 10px rgba(16, 185, 129, 0.5)',
        'glow': '0 0 20px rgba(16, 185, 129, 0.5)',
        'glow-lg': '0 0 40px rgba(16, 185, 129, 0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      screens: {
        'xs': '475px',
        '3xl': '1920px',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    // Custom plugin for YAFA utilities
    function({ addUtilities, addComponents, theme }) {
      const newUtilities = {
        '.text-gradient': {
          background: 'linear-gradient(to right, #34d399, #10b981)',
          '-webkit-background-clip': 'text',
          'background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
        '.bg-grid': {
          'background-image': 'linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)',
          'background-size': '50px 50px',
        },
        '.bg-dots': {
          'background-image': 'radial-gradient(rgba(16, 185, 129, 0.2) 1px, transparent 1px)',
          'background-size': '20px 20px',
        },
      }

      const newComponents = {
        '.yafa-card': {
          position: 'relative',
          padding: theme('spacing.6'),
          backgroundColor: 'rgba(17, 24, 39, 0.6)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: theme('borderRadius.xl'),
          boxShadow: theme('boxShadow.2xl'),
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'rgba(16, 185, 129, 0.4)',
            boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.15)',
          },
        },
        '.yafa-button': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          fontSize: theme('fontSize.sm'),
          fontWeight: theme('fontWeight.semibold'),
          borderRadius: theme('borderRadius.lg'),
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed',
          },
        },
        '.yafa-button-primary': {
          background: 'linear-gradient(to right, #10b981, #34d399)',
          color: theme('colors.black'),
          boxShadow: theme('boxShadow.lg'),
          '&:hover:not(:disabled)': {
            background: 'linear-gradient(to right, #059669, #10b981)',
            boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.25)',
            transform: 'scale(1.05)',
          },
        },
        '.yafa-button-secondary': {
          backgroundColor: 'rgba(31, 41, 55, 0.6)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: theme('colors.green.400'),
          '&:hover:not(:disabled)': {
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: theme('colors.green.400'),
          },
        },
        '.yafa-input': {
          width: '100%',
          padding: theme('spacing.3'),
          backgroundColor: 'rgba(31, 41, 55, 0.4)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: theme('borderRadius.lg'),
          color: theme('colors.green.400'),
          fontSize: theme('fontSize.sm'),
          transition: 'all 0.3s ease',
          '&::placeholder': {
            color: 'rgba(16, 185, 129, 0.5)',
          },
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.green.400'),
            boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)',
          },
        },
        '.yafa-table': {
          width: '100%',
          backgroundColor: 'rgba(17, 24, 39, 0.6)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: theme('borderRadius.xl'),
          overflow: 'hidden',
          '& th': {
            padding: `${theme('spacing.4')} ${theme('spacing.6')}`,
            textAlign: 'left',
            fontSize: theme('fontSize.xs'),
            fontWeight: theme('fontWeight.medium'),
            color: 'rgba(16, 185, 129, 0.7)',
            textTransform: 'uppercase',
            letterSpacing: theme('letterSpacing.wider'),
            backgroundColor: 'rgba(31, 41, 55, 0.4)',
            borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
          },
          '& td': {
            padding: `${theme('spacing.4')} ${theme('spacing.6')}`,
            whiteSpace: 'nowrap',
            fontSize: theme('fontSize.sm'),
            color: theme('colors.green.400'),
            borderBottom: '1px solid rgba(16, 185, 129, 0.1)',
          },
          '& tr:hover': {
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
          },
        },
        '.status-badge': {
          display: 'inline-flex',
          alignItems: 'center',
          padding: `${theme('spacing.1')} ${theme('spacing.2')}`,
          fontSize: theme('fontSize.xs'),
          fontWeight: theme('fontWeight.medium'),
          borderRadius: theme('borderRadius.full'),
          textTransform: 'capitalize',
        },
        '.status-success': {
          color: theme('colors.emerald.400'),
          backgroundColor: 'rgba(52, 211, 153, 0.2)',
          border: '1px solid rgba(52, 211, 153, 0.3)',
        },
        '.status-failed': {
          color: theme('colors.red.400'),
          backgroundColor: 'rgba(248, 113, 113, 0.2)',
          border: '1px solid rgba(248, 113, 113, 0.3)',
        },
        '.status-pending': {
          color: theme('colors.yellow.400'),
          backgroundColor: 'rgba(251, 191, 36, 0.2)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
        },
      }

      addUtilities(newUtilities)
      addComponents(newComponents)
    },
  ],
}
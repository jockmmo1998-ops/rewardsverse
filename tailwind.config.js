import tailwindAnimate from 'tailwindcss-animate';
import containerQuery from '@tailwindcss/container-queries';
import intersect from 'tailwindcss-intersect';

export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './node_modules/streamdown/dist/**/*.js',
  ],
  safelist: ['border', 'border-border'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        heading: ["'Space Grotesk'", 'system-ui', 'sans-serif'],
        body: ["'Inter'", 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        info: 'hsl(var(--info))',
        // Neon palette — direct hex for static class names
        neon: {
          green: '#22C55E',
          purple: '#A855F7',
          blue: '#3B82F6',
          cyan: '#06B6D4',
          orange: '#F97316',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          background: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-green': 'var(--gradient-green)',
        'gradient-purple': 'var(--gradient-purple)',
        'gradient-blue': 'var(--gradient-blue)',
        'gradient-multi': 'var(--gradient-multi)',
        'gradient-card': 'var(--gradient-card)',
        'mesh-hero': 'var(--gradient-hero)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        hover: 'var(--shadow-hover)',
        'glow-green': 'var(--glow-green)',
        'glow-purple': 'var(--glow-purple)',
        'glow-blue': 'var(--glow-blue)',
        'glow-sm-green': '0 0 12px rgba(34,197,94,.4)',
        'glow-sm-purple': '0 0 12px rgba(168,85,247,.4)',
        'glow-sm-blue': '0 0 12px rgba(59,130,246,.4)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-in': 'slide-in 0.4s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
      },
    },
  },
  plugins: [
    tailwindAnimate,
    containerQuery,
    intersect,
    function ({ addUtilities }) {
      addUtilities({
        '.border-t-solid': { 'border-top-style': 'solid' },
        '.border-r-solid': { 'border-right-style': 'solid' },
        '.border-b-solid': { 'border-bottom-style': 'solid' },
        '.border-l-solid': { 'border-left-style': 'solid' },
      }, ['responsive']);
    },
  ],
};

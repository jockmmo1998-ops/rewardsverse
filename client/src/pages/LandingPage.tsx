import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useMotionValue, useSpring } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import PageMeta from '@/components/common/PageMeta';
import { getLiveActivity, getLeaderboard } from '@/lib/api';
import type { LiveActivity, LeaderboardEntry } from '@/types/types';
import {
  Zap, ArrowRight, Trophy, ShieldCheck, Globe, TrendingUp,
  Clock, Users, Star, CheckCircle2, DollarSign, Wallet,
  BarChart3, Gift, ChevronRight, Sparkles, Flame,
} from 'lucide-react';

// ── Animated number counter ───────────────────────────────
function AnimatedNumber({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 20 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isInView) motionVal.set(target);
  }, [isInView, target, motionVal]);

  useEffect(() => spring.on('change', v => setDisplay(Math.round(v))), [spring]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
}

// ── Section fade-up wrapper ───────────────────────────────
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Premium Live Ticker ───────────────────────────────────
function PremiumTicker() {
  const [items, setItems] = useState<LiveActivity[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getLiveActivity(40).then(setItems);
  }, []);

  if (!items.length) return null;
  const doubled = [...items, ...items];

  return (
    <div className="relative w-full overflow-hidden"
      style={{ background: 'rgba(16,20,31,0.8)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '0.75rem', boxShadow: '0 0 24px rgba(34,197,94,0.06), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, rgba(9,9,11,0.9), transparent)' }} />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, rgba(9,9,11,0.9), transparent)' }} />

      {/* Live badge */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5 px-2 py-1 rounded-md"
        style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-neon-green pulse-glow" />
        <span className="text-xs font-semibold" style={{ color: '#22C55E' }}>LIVE</span>
      </div>

      <div
        ref={trackRef}
        className="ticker-track flex items-center gap-0 py-3 pl-28"
        onMouseEnter={() => { if (trackRef.current) trackRef.current.style.animationPlayState = 'paused'; }}
        onMouseLeave={() => { if (trackRef.current) trackRef.current.style.animationPlayState = 'running'; }}
      >
        {doubled.map((item, i) => (
          <div key={`${item.id}-${i}`} className="flex items-center gap-2.5 shrink-0 px-4">
            <div className="flex items-center justify-center w-6 h-6 rounded-full shrink-0"
              style={{ background: item.type === 'completion' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)' }}>
              {item.type === 'completion'
                ? <CheckCircle2 size={11} style={{ color: '#22C55E' }} />
                : <DollarSign size={11} style={{ color: '#3B82F6' }} />}
            </div>
            <span className="text-xs whitespace-nowrap" style={{ color: 'rgba(244,244,245,0.7)' }}>
              <span className="font-semibold" style={{ color: '#F4F4F5' }}>{item.username}</span>
              {' '}{item.type === 'completion' ? 'earned' : 'withdrew'}{' '}
              <span className="font-bold" style={{ color: item.type === 'completion' ? '#22C55E' : '#3B82F6' }}>
                ${item.amount.toFixed(2)}
              </span>
              {item.type === 'completion' && (
                <span style={{ color: 'rgba(244,244,245,0.5)' }}> · {item.label}</span>
              )}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.12)', margin: '0 4px' }}>|</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Hero Dashboard Preview ────────────────────────────────
function HeroDashboard() {
  return (
    <div className="relative w-full max-w-lg mx-auto animate-float">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ boxShadow: '0 0 80px rgba(34,197,94,0.12), 0 0 40px rgba(168,85,247,0.08)' }} />

      <div className="relative rounded-2xl overflow-hidden"
        style={{ background: 'rgba(16,20,31,0.95)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
        {/* Dashboard header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}>
              <Zap size={10} className="text-black" />
            </div>
            <span className="text-xs font-semibold" style={{ color: '#F4F4F5' }}>RewardsVerse</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Balance + earnings row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3.5" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <p className="text-xs mb-1" style={{ color: 'rgba(244,244,245,0.5)' }}>Total Balance</p>
              <p className="text-xl font-bold font-heading" style={{ color: '#22C55E' }}>$247.85</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(34,197,94,0.7)' }}>↑ +$12.40 today</p>
            </div>
            <div className="rounded-xl p-3.5" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
              <p className="text-xs mb-1" style={{ color: 'rgba(244,244,245,0.5)' }}>Level</p>
              <p className="text-xl font-bold font-heading" style={{ color: '#A855F7' }}>Lv. 12</p>
              <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(168,85,247,0.2)' }}>
                <div className="h-full rounded-full" style={{ width: '68%', background: 'linear-gradient(90deg,#7C3AED,#A855F7)' }} />
              </div>
            </div>
          </div>

          {/* Mini chart */}
          <div className="rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium" style={{ color: 'rgba(244,244,245,0.7)' }}>7-Day Earnings</p>
              <span className="text-xs font-bold" style={{ color: '#22C55E' }}>+23%</span>
            </div>
            <svg viewBox="0 0 200 48" className="w-full h-8" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,40 L28,32 L56,28 L84,22 L112,18 L140,12 L168,8 L200,4 L200,48 L0,48 Z" fill="url(#chartGrad)" />
              <path d="M0,40 L28,32 L56,28 L84,22 L112,18 L140,12 L168,8 L200,4" fill="none" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Recent activity */}
          <div className="space-y-2">
            {[
              { name: 'Survey — TechPanel', amount: '+$2.50', color: '#22C55E', icon: '📋' },
              { name: 'App Install — GameX', amount: '+$4.00', color: '#A855F7', icon: '📱' },
              { name: 'Withdrawal — PayPal', amount: '-$50.00', color: '#3B82F6', icon: '💸' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-xs" style={{ color: 'rgba(244,244,245,0.6)' }}>{item.name}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: item.color }}>{item.amount}</span>
              </div>
            ))}
          </div>

          {/* Offerwall progress */}
          <div className="rounded-xl p-3.5" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium" style={{ color: 'rgba(244,244,245,0.7)' }}>Daily Goal</p>
              <span className="text-xs font-bold" style={{ color: '#3B82F6' }}>3/5 offers</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(59,130,246,0.15)' }}>
              <div className="h-full rounded-full" style={{ width: '60%', background: 'linear-gradient(90deg,#1D4ED8,#3B82F6)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Top Members ────────────────────────────────────────────
function TopMembers() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  useEffect(() => { getLeaderboard().then(d => setEntries(d.slice(0, 5))); }, []);

  const rankColor = ['#F59E0B', '#9CA3AF', '#B45309', '#22C55E', '#A855F7'];
  const rankLabel = ['🥇', '🥈', '🥉', '4th', '5th'];

  return (
    <div className="space-y-2">
      {entries.length === 0
        ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl shimmer" />
          ))
        : entries.map((e, i) => (
            <motion.div key={e.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl card-lift"
              style={{ background: 'rgba(16,20,31,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-base w-6 text-center">{rankLabel[i]}</span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: `${rankColor[i]}22`, border: `1px solid ${rankColor[i]}44`, color: rankColor[i] }}>
                {e.username.charAt(0).toUpperCase()}
              </div>
              <span className="flex-1 text-sm font-medium" style={{ color: '#F4F4F5' }}>{e.username}</span>
              <span className="text-sm font-bold" style={{ color: '#22C55E' }}>${e.total_earned.toFixed(2)}</span>
            </motion.div>
          ))}
    </div>
  );
}

// ── Data ─────────────────────────────────────────────────
const features = [
  { icon: Zap, color: '#22C55E', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)', title: 'Instant Rewards', desc: 'Earn the moment you complete an offer — zero delays, real-time balance updates.' },
  { icon: ShieldCheck, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)', title: 'Bank-Grade Security', desc: 'Fraud detection, IP validation, and postback verification keep every transaction safe.' },
  { icon: Globe, color: '#A855F7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.2)', title: 'Global Offerwalls', desc: 'Hundreds of offers from top providers — surveys, apps, videos and games.' },
  { icon: TrendingUp, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', title: 'Live Leaderboard', desc: 'Climb the ranks and earn bonus multipliers as a top performer.' },
  { icon: Clock, color: '#06B6D4', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.2)', title: 'Fast Withdrawals', desc: 'PayPal, CashApp, Bitcoin, USDT — processed within 24 hours.' },
  { icon: Users, color: '#F97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.2)', title: 'Referral System', desc: 'Share your code, earn a percentage of every friend\'s lifetime earnings.' },
];

const howItWorks = [
  { step: '01', icon: Gift, color: '#22C55E', title: 'Create Your Account', desc: 'Sign up in under 30 seconds. No credit card, no verification — just start earning immediately.' },
  { step: '02', icon: BarChart3, color: '#A855F7', title: 'Complete Offers', desc: 'Browse hundreds of surveys, app installs, videos, and tasks. Each one pays instantly to your balance.' },
  { step: '03', icon: Wallet, color: '#3B82F6', title: 'Withdraw Anytime', desc: 'Cash out to PayPal, CashApp, crypto, or gift cards. Minimum $5, processed within 24 hours.' },
];

const testimonials = [
  { name: 'Alex M.', handle: '@alex_earns', text: 'Made $340 in my first month just doing surveys on my lunch break. Withdrawals are actually fast too.', amount: '$340', avatar: 'A' },
  { name: 'Sarah K.', handle: '@sarahk_crypto', text: 'The referral system is insane. My team of 8 friends earns me passive income every single day.', amount: '$1,200+', avatar: 'S' },
  { name: 'Mike R.', handle: '@mike_rewards', text: 'Been on every GPT site. RewardsVerse has the best offer selection and the dashboard is beautiful.', amount: '$680', avatar: 'M' },
];

const faqs = [
  { q: 'How do I get paid?', a: 'We support PayPal, CashApp, Amazon Gift Cards, Bitcoin, Ethereum, and USDT. Minimum withdrawal is $5 and payments are processed within 24 hours.' },
  { q: 'Are the offers real?', a: 'Yes. Every offer comes from vetted third-party providers. Earnings are credited instantly when a postback is received from the provider.' },
  { q: 'Is RewardsVerse free?', a: 'Completely free — no subscription, no fees, no credit card. We earn a small commission from offer providers, which funds your rewards.' },
  { q: 'How do referrals work?', a: 'Share your unique referral code. When a friend signs up and completes offers, you automatically earn a bonus on their activity.' },
  { q: 'What is the minimum withdrawal?', a: 'The minimum withdrawal is $5.00. There are zero processing fees on our end regardless of the method you choose.' },
];

const offerwallProviders = [
  { name: 'PrimeEarn', color: '#22C55E' },
  { name: 'AdscendMedia', color: '#A855F7' },
  { name: 'Torox', color: '#3B82F6' },
  { name: 'AdToWall', color: '#F59E0B' },
  { name: 'RevU', color: '#06B6D4' },
  { name: 'Lootably', color: '#F97316' },
];

// ── Main Component ────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <PageMeta
        title="RewardsVerse — Earn Real Crypto Rewards"
        description="Complete offers, take surveys, and earn real cash. Join 50,000+ members earning daily on RewardsVerse."
      />

      <div className="min-h-screen flex flex-col" style={{ background: '#09090B' }}>

        {/* ── NAV ── */}
        <header className="sticky top-0 z-50 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(9,9,11,0.85)', backdropFilter: 'blur(20px)' }}>
          <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}>
                <Zap size={13} className="text-black" />
              </div>
              <span className="font-bold tracking-tight font-heading" style={{ color: '#F4F4F5' }}>RewardsVerse</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 flex-1">
              {['Features', 'How it Works', 'Top Members', 'FAQ'].map(item => (
                <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  className="text-sm transition-colors hover:text-white"
                  style={{ color: 'rgba(244,244,245,0.55)' }}>
                  {item}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3 ml-auto shrink-0">
              <Link to="/login">
                <button className="text-sm px-4 py-1.5 rounded-lg transition-all hover:text-white"
                  style={{ color: 'rgba(244,244,245,0.65)', background: 'transparent' }}>
                  Sign in
                </button>
              </Link>
              <Link to="/register">
                <button className="btn-primary text-sm px-4 py-1.5 rounded-lg font-semibold text-black">
                  Get started free
                </button>
              </Link>
            </div>
          </div>
        </header>

        {/* ── HERO ── */}
        <section className="relative overflow-hidden mesh-bg">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* Left */}
            <div className="space-y-7">
              <FadeUp delay={0}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#22C55E' }}>
                  <Sparkles size={11} />
                  #1 Crypto Rewards Platform · 50K+ Members
                </div>
              </FadeUp>

              <FadeUp delay={0.08}>
                <h1 className="text-4xl md:text-6xl font-bold font-heading leading-[1.1] tracking-tight">
                  <span style={{ color: '#F4F4F5' }}>Turn Your Time</span>
                  <br />
                  <span className="gradient-text-multi">Into Real Money</span>
                </h1>
              </FadeUp>

              <FadeUp delay={0.14}>
                <p className="text-base md:text-lg max-w-md" style={{ color: 'rgba(244,244,245,0.6)', lineHeight: '1.7' }}>
                  Complete surveys, install apps, watch videos — earn real cash paid to PayPal, CashApp, or crypto. No limits, no gimmicks.
                </p>
              </FadeUp>

              <FadeUp delay={0.2}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/register">
                    <button className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold">
                      Start Earning Free
                      <ArrowRight size={15} />
                    </button>
                  </Link>
                  <Link to="/login">
                    <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:border-white/20"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F4F4F5' }}>
                      Sign in
                      <ChevronRight size={14} />
                    </button>
                  </Link>
                </div>
              </FadeUp>

              {/* Trust badges */}
              <FadeUp delay={0.26}>
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  {[
                    { icon: ShieldCheck, text: 'Verified Payouts', color: '#22C55E' },
                    { icon: Clock, text: '24h Processing', color: '#3B82F6' },
                    { icon: Star, text: '4.9★ Rating', color: '#F59E0B' },
                  ].map(b => {
                    const Icon = b.icon;
                    return (
                      <div key={b.text} className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(244,244,245,0.55)' }}>
                        <Icon size={12} style={{ color: b.color }} />
                        {b.text}
                      </div>
                    );
                  })}
                </div>
              </FadeUp>
            </div>

            {/* Right — Dashboard preview */}
            <FadeUp delay={0.1} className="relative">
              <HeroDashboard />
            </FadeUp>
          </div>
        </section>

        {/* ── LIVE TICKER ── */}
        <section className="py-6 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <PremiumTicker />
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="py-14 px-4 md:px-8 border-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: 50000, suffix: '+', label: 'Active Members', color: '#22C55E', icon: Users },
                { value: 2000000, prefix: '$', suffix: '+', label: 'Total Paid Out', color: '#A855F7', icon: DollarSign },
                { value: 500, suffix: '+', label: 'Daily Offers', color: '#3B82F6', icon: BarChart3 },
                { value: 24, suffix: 'h', label: 'Max Payout Time', color: '#F59E0B', icon: Clock },
              ].map(stat => {
                const Icon = stat.icon;
                return (
                  <FadeUp key={stat.label}>
                    <div className="rounded-2xl p-5 text-center card-lift"
                      style={{ background: 'rgba(16,20,31,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="w-9 h-9 rounded-xl mx-auto mb-3 flex items-center justify-center"
                        style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}30` }}>
                        <Icon size={16} style={{ color: stat.color }} />
                      </div>
                      <div className="text-2xl md:text-3xl font-bold font-heading" style={{ color: stat.color }}>
                        <AnimatedNumber target={stat.value} prefix={stat.prefix ?? ''} suffix={stat.suffix ?? ''} />
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'rgba(244,244,245,0.45)' }}>{stat.label}</p>
                    </div>
                  </FadeUp>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── OFFERWALLS ── */}
        <section id="features" className="py-16 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <FadeUp className="text-center mb-10">
              <Badge className="mb-4 text-xs px-3 py-1 font-semibold" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#3B82F6' }}>
                Top Offerwalls
              </Badge>
              <h2 className="text-2xl md:text-4xl font-bold font-heading" style={{ color: '#F4F4F5' }}>
                Partnered with the <span className="gradient-text-purple">best providers</span>
              </h2>
              <p className="text-sm md:text-base mt-3 max-w-md mx-auto" style={{ color: 'rgba(244,244,245,0.5)' }}>
                Hundreds of offers from the industry's most trusted networks, updated daily.
              </p>
            </FadeUp>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {offerwallProviders.map((p, i) => (
                <FadeUp key={p.name} delay={i * 0.05}>
                  <div className="rounded-xl p-4 flex flex-col items-center gap-2 card-lift cursor-pointer"
                    style={{ background: 'rgba(16,20,31,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm font-heading"
                      style={{ background: `${p.color}15`, border: `1px solid ${p.color}25`, color: p.color }}>
                      {p.name.charAt(0)}
                    </div>
                    <span className="text-xs font-medium text-center" style={{ color: 'rgba(244,244,245,0.65)' }}>{p.name}</span>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="py-16 px-4 md:px-8" style={{ background: 'rgba(16,20,31,0.3)' }}>
          <div className="max-w-7xl mx-auto">
            <FadeUp className="text-center mb-10">
              <h2 className="text-2xl md:text-4xl font-bold font-heading" style={{ color: '#F4F4F5' }}>
                Everything you need to <span className="gradient-text-green">earn more</span>
              </h2>
              <p className="text-sm md:text-base mt-3" style={{ color: 'rgba(244,244,245,0.5)' }}>
                A complete rewards ecosystem built for maximum earnings.
              </p>
            </FadeUp>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <FadeUp key={f.title} delay={i * 0.06}>
                    <div className="rounded-2xl p-6 h-full card-lift"
                      style={{ background: 'rgba(16,20,31,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                        style={{ background: f.bg, border: `1px solid ${f.border}` }}>
                        <Icon size={18} style={{ color: f.color }} />
                      </div>
                      <h3 className="font-bold font-heading mb-2" style={{ color: '#F4F4F5' }}>{f.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(244,244,245,0.5)' }}>{f.desc}</p>
                    </div>
                  </FadeUp>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="py-16 px-4 md:px-8">
          <div className="max-w-5xl mx-auto">
            <FadeUp className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-bold font-heading" style={{ color: '#F4F4F5' }}>
                Start earning in <span className="gradient-text-multi">3 simple steps</span>
              </h2>
            </FadeUp>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {howItWorks.map((step, i) => {
                const Icon = step.icon;
                return (
                  <FadeUp key={step.step} delay={i * 0.1}>
                    <div className="relative rounded-2xl p-6 text-center card-lift"
                      style={{ background: 'rgba(16,20,31,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-2.5 py-1 rounded-full font-heading"
                        style={{ background: `${step.color}20`, border: `1px solid ${step.color}40`, color: step.color }}>
                        {step.step}
                      </div>
                      <div className="w-14 h-14 rounded-2xl mx-auto mb-4 mt-2 flex items-center justify-center"
                        style={{ background: `${step.color}12`, border: `1px solid ${step.color}25` }}>
                        <Icon size={24} style={{ color: step.color }} />
                      </div>
                      <h3 className="font-bold font-heading mb-2" style={{ color: '#F4F4F5' }}>{step.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(244,244,245,0.5)' }}>{step.desc}</p>
                    </div>
                  </FadeUp>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── TOP MEMBERS ── */}
        <section id="top-members" className="py-16 px-4 md:px-8" style={{ background: 'rgba(16,20,31,0.3)' }}>
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <FadeUp>
                <div className="flex items-center gap-2 mb-4">
                  <Trophy size={16} style={{ color: '#F59E0B' }} />
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(244,244,245,0.4)' }}>Leaderboard</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-bold font-heading mb-3" style={{ color: '#F4F4F5' }}>
                  Our top <span className="gradient-text-green">earners</span>
                </h2>
                <p className="text-sm md:text-base mb-6" style={{ color: 'rgba(244,244,245,0.5)' }}>
                  Real members, real earnings. Every number comes directly from our database — no fabricated numbers.
                </p>
                <Link to="/register">
                  <button className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold">
                    <Flame size={14} />
                    Claim Your Spot
                  </button>
                </Link>
              </FadeUp>
              <FadeUp delay={0.1}>
                <TopMembers />
              </FadeUp>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-16 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <FadeUp className="text-center mb-10">
              <h2 className="text-2xl md:text-4xl font-bold font-heading" style={{ color: '#F4F4F5' }}>
                Trusted by <span className="gradient-text-purple">real earners</span>
              </h2>
            </FadeUp>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testimonials.map((t, i) => (
                <FadeUp key={t.name} delay={i * 0.08}>
                  <div className="rounded-2xl p-6 h-full card-lift"
                    style={{ background: 'rgba(16,20,31,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} fill="#F59E0B" style={{ color: '#F59E0B' }} />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(244,244,245,0.65)' }}>"{t.text}"</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                          style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}>
                          {t.avatar}
                        </div>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: '#F4F4F5' }}>{t.name}</p>
                          <p className="text-xs" style={{ color: 'rgba(244,244,245,0.4)' }}>{t.handle}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold" style={{ color: '#22C55E' }}>{t.amount}</span>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-16 px-4 md:px-8" style={{ background: 'rgba(16,20,31,0.3)' }}>
          <div className="max-w-2xl mx-auto">
            <FadeUp className="text-center mb-10">
              <h2 className="text-2xl md:text-4xl font-bold font-heading" style={{ color: '#F4F4F5' }}>
                Frequently asked <span className="gradient-text-green">questions</span>
              </h2>
            </FadeUp>
            <FadeUp delay={0.1}>
              <Accordion type="single" collapsible className="space-y-2">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}
                    className="rounded-xl overflow-hidden border-0"
                    style={{ background: 'rgba(16,20,31,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <AccordionTrigger className="px-5 py-4 text-sm font-semibold text-left hover:no-underline" style={{ color: '#F4F4F5' }}>
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-4 text-sm leading-relaxed" style={{ color: 'rgba(244,244,245,0.55)' }}>
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </FadeUp>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="py-16 px-4 md:px-8">
          <div className="max-w-3xl mx-auto">
            <FadeUp>
              <div className="relative rounded-3xl p-10 md:p-14 text-center overflow-hidden"
                style={{ background: 'rgba(16,20,31,0.9)', border: '1px solid rgba(34,197,94,0.2)', boxShadow: '0 0 60px rgba(34,197,94,0.08)' }}>
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(34,197,94,0.1) 0%, transparent 70%)' }} />
                <Trophy size={36} className="mx-auto mb-5" style={{ color: '#F59E0B' }} />
                <h2 className="text-2xl md:text-4xl font-bold font-heading mb-3" style={{ color: '#F4F4F5' }}>
                  Ready to start <span className="gradient-text-green">earning?</span>
                </h2>
                <p className="text-sm md:text-base mb-7 max-w-md mx-auto" style={{ color: 'rgba(244,244,245,0.55)' }}>
                  Create your free account in under 30 seconds. No credit card. No limits.
                </p>
                <Link to="/register">
                  <button className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold">
                    Create Free Account
                    <ArrowRight size={15} />
                  </button>
                </Link>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t px-4 md:px-8 py-8" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}>
                <Zap size={11} className="text-black" />
              </div>
              <span className="font-bold font-heading text-sm" style={{ color: '#F4F4F5' }}>RewardsVerse</span>
              <span className="text-xs ml-2" style={{ color: 'rgba(244,244,245,0.3)' }}>© 2026</span>
            </div>
            <div className="flex items-center gap-6 text-xs" style={{ color: 'rgba(244,244,245,0.35)' }}>
              {['Terms', 'Privacy', 'Support', 'Blog'].map(link => (
                <a key={link} href="#" className="hover:text-white transition-colors">{link}</a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

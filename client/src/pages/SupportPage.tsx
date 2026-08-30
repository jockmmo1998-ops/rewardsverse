import { ArrowUpRight, FileQuestion, MessageCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionHeading, Surface } from '@/components/shared/RewardUI';

const telegramUrl = 'https://t.me/wilsonrobertul804';

export default function SupportPage() {
  return (
    <div className="mx-auto w-full max-w-[1000px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <SectionHeading eyebrow="Help when you need it" title="Support" description="Use the official Telegram channel for account, offer and withdrawal questions. Never share your password or provider secrets." />
      <div className="grid gap-4 md:grid-cols-3">
        <a href={telegramUrl} target="_blank" rel="noreferrer" className="rv-surface group p-5 transition hover:-translate-y-0.5 hover:border-primary/40"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><MessageCircle className="h-5 w-5" /></span><div className="mt-5 flex items-center justify-between gap-3"><h2 className="font-display text-base font-semibold text-foreground">Telegram support</h2><ArrowUpRight className="h-4 w-4 text-primary transition group-hover:translate-x-0.5" /></div><p className="mt-2 text-sm leading-6 text-muted-foreground">Contact the official RewardsVerse support channel for a real response.</p></a>
        <Link to="/faq" className="rv-surface group p-5 transition hover:-translate-y-0.5 hover:border-primary/40"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary"><FileQuestion className="h-5 w-5" /></span><div className="mt-5 flex items-center justify-between gap-3"><h2 className="font-display text-base font-semibold text-foreground">Read the FAQ</h2><ArrowUpRight className="h-4 w-4 text-primary transition group-hover:translate-x-0.5" /></div><p className="mt-2 text-sm leading-6 text-muted-foreground">Find clear answers about verified callbacks, balances and payouts.</p></Link>
        <Surface className="p-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300"><ShieldCheck className="h-5 w-5" /></span><h2 className="mt-5 font-display text-base font-semibold text-foreground">Keep your account safe</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Support will never need your password, session token or provider postback secret.</p></Surface>
      </div>
      <Surface className="p-5 sm:p-7"><p className="rv-eyebrow">Before contacting support</p><h2 className="mt-2 font-display text-xl font-semibold text-foreground">Include useful context</h2><div className="mt-4 grid gap-3 text-sm leading-6 text-muted-foreground sm:grid-cols-2"><p className="rounded-xl border border-border/70 bg-secondary/35 p-4">For a missing reward, include the provider name, offer name and approximate completion time.</p><p className="rounded-xl border border-border/70 bg-secondary/35 p-4">For a withdrawal, include the request amount and status shown in your Activity page. Do not send private wallet keys.</p></div><a href={telegramUrl} target="_blank" rel="noreferrer" className="focus-ring mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">Open Telegram support <ArrowUpRight className="h-4 w-4" /></a></Surface>
    </div>
  );
}

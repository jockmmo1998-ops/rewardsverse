import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AvatarPreset = {
  id: string;
  name: string;
  colors: [string, string, string];
};

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'mint-orbit', name: 'Mint Orbit', colors: ['#0b8f6a', '#5eead4', '#d1fae5'] },
  { id: 'golden-spark', name: 'Golden Spark', colors: ['#b7791f', '#f6c453', '#fff1b8'] },
  { id: 'violet-comet', name: 'Violet Comet', colors: ['#6d28d9', '#c4b5fd', '#ede9fe'] },
  { id: 'ocean-wave', name: 'Ocean Wave', colors: ['#0369a1', '#38bdf8', '#bae6fd'] },
  { id: 'coral-flare', name: 'Coral Flare', colors: ['#c2410c', '#fb7185', '#ffe4e6'] },
  { id: 'night-neon', name: 'Night Neon', colors: ['#334155', '#22d3ee', '#a5f3fc'] },
  { id: 'lime-lucky', name: 'Lucky Lime', colors: ['#4d7c0f', '#a3e635', '#ecfccb'] },
  { id: 'rose-pulse', name: 'Rose Pulse', colors: ['#be185d', '#f472b6', '#fce7f3'] },
];

export function avatarDataUri(id: string) {
  const preset = AVATAR_PRESETS.find((item) => item.id === id) || AVATAR_PRESETS[0];
  const [deep, bright, pale] = preset.colors;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${deep}"/><stop offset="1" stop-color="${bright}"/></linearGradient></defs><rect width="160" height="160" rx="44" fill="url(#g)"/><circle cx="126" cy="28" r="34" fill="${pale}" opacity=".28"/><circle cx="34" cy="136" r="46" fill="#061d2b" opacity=".16"/><path d="M44 86c5-30 67-30 72 0v27H44Z" fill="#071c2e" opacity=".82"/><circle cx="80" cy="67" r="27" fill="${pale}"/><path d="M52 62c3-23 54-34 58 3-12-8-31-13-58-3Z" fill="#071c2e"/><circle cx="69" cy="70" r="4" fill="${deep}"/><circle cx="91" cy="70" r="4" fill="${deep}"/><path d="M70 84c7 6 14 6 20 0" fill="none" stroke="${deep}" stroke-width="4" stroke-linecap="round"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function AvatarPicker({ value, onChange }: { value?: string | null; onChange: (avatar: string) => void }) {
  const selected = value || avatarDataUri(AVATAR_PRESETS[0].id);
  return <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
    {AVATAR_PRESETS.map((preset) => {
      const src = avatarDataUri(preset.id);
      const active = selected === src;
      return <button key={preset.id} type="button" aria-label={`Choose ${preset.name} avatar`} onClick={() => onChange(src)} className={cn('group relative aspect-square overflow-hidden rounded-2xl border-2 bg-muted transition hover:-translate-y-0.5 hover:shadow-md', active ? 'border-primary ring-2 ring-primary/20' : 'border-transparent')}>
        <img src={src} alt="" className="h-full w-full object-cover" />
        {active && <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow"><Check className="h-3 w-3" /></span>}
      </button>;
    })}
  </div>;
}

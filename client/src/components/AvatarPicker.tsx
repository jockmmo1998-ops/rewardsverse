import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AvatarPreset = { id: string; name: string; colors: [string, string, string] };

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'neon-droid', name: 'Neon Droid', colors: ['#087f68', '#2dd4bf', '#ccfbf1'] },
  { id: 'cyber-core', name: 'Cyber Core', colors: ['#9a6500', '#facc15', '#fef3c7'] },
  { id: 'quantum-bot', name: 'Quantum Bot', colors: ['#6d28d9', '#a78bfa', '#ede9fe'] },
  { id: 'ocean-mech', name: 'Ocean Mech', colors: ['#075985', '#22d3ee', '#cffafe'] },
  { id: 'plasma-roid', name: 'Plasma Roid', colors: ['#be123c', '#fb7185', '#ffe4e6'] },
  { id: 'zero-unit', name: 'Zero Unit', colors: ['#334155', '#38bdf8', '#e0f2fe'] },
  { id: 'lime-circuit', name: 'Lime Circuit', colors: ['#4d7c0f', '#a3e635', '#ecfccb'] },
  { id: 'rose-android', name: 'Rose Android', colors: ['#9d174d', '#f472b6', '#fce7f3'] },
];

export function avatarDataUri(id: string) {
  const preset = AVATAR_PRESETS.find((item) => item.id === id) || AVATAR_PRESETS[0];
  const [deep, bright, pale] = preset.colors;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${deep}"/><stop offset="1" stop-color="${bright}"/></linearGradient><pattern id="p" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M0 9h7M9 0v7M18 9h-7M9 18v-7" stroke="${pale}" opacity=".18" stroke-width="1.5"/></pattern></defs><rect width="160" height="160" rx="44" fill="url(#g)"/><rect width="160" height="160" rx="44" fill="url(#p)"/><circle cx="128" cy="28" r="32" fill="${pale}" opacity=".18"/><path d="M80 25v12M74 25h12" stroke="${pale}" stroke-width="4" stroke-linecap="round"/><rect x="39" y="43" width="82" height="78" rx="25" fill="#071827" opacity=".94" stroke="${pale}" stroke-opacity=".65" stroke-width="3"/><path d="M39 68H27M121 68h12M39 88H28M121 88h11" stroke="${pale}" stroke-width="4" stroke-linecap="round"/><circle cx="24" cy="68" r="3" fill="${pale}"/><circle cx="136" cy="88" r="3" fill="${pale}"/><rect x="51" y="60" width="58" height="29" rx="12" fill="${deep}" stroke="${bright}" stroke-width="2"/><circle cx="66" cy="74" r="6" fill="${pale}"/><circle cx="94" cy="74" r="6" fill="${pale}"/><circle cx="66" cy="74" r="2.5" fill="${deep}"/><circle cx="94" cy="74" r="2.5" fill="${deep}"/><path d="M59 103h42M70 103v7M80 103v7M90 103v7" stroke="${bright}" stroke-width="3" stroke-linecap="round"/><path d="M48 120v12M112 120v12M42 132h18M100 132h18" stroke="#071827" stroke-width="7" stroke-linecap="round"/></svg>`;
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

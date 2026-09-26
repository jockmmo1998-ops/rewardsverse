import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AvatarDefinition = { id: number; name: string; description: string };

export const AVATAR_DEFINITIONS: AvatarDefinition[] = [
  { id: 1, name: 'Emerald Explorer', description: 'Deep forest hoodie · friendly explorer' },
  { id: 2, name: 'Purple Gamer', description: 'Purple jacket · confident player' },
  { id: 3, name: 'Cyber Teal', description: 'Teal jacket · futuristic edge' },
  { id: 4, name: 'Golden Rewards', description: 'Gold and black · friendly smile' },
  { id: 5, name: 'Blue Tech', description: 'Blue hoodie · focused builder' },
  { id: 6, name: 'Coral Character', description: 'Muted coral · warm personality' },
  { id: 7, name: 'Green Gamer', description: 'Gaming headset · energetic' },
  { id: 8, name: 'Silver Teal', description: 'Silver hair · premium teal' },
  { id: 9, name: 'Orange Explorer', description: 'Muted orange · adventurous' },
  { id: 10, name: 'Dark Forest', description: 'Forest green · premium member' },
];

export function avatarUrl(avatarId: unknown) {
  const id = Number(avatarId);
  const safeId = Number.isInteger(id) && id >= 1 && id <= 10 ? id : 1;
  return `/assets/avatars/avatar-${String(safeId).padStart(2, '0')}.png`;
}

export function stableAvatarId(userId: unknown, avatarId?: unknown) {
  const stored = Number(avatarId);
  if (Number.isInteger(stored) && stored >= 1 && stored <= 10) return stored;
  const stable = Math.abs(Number(userId || 0));
  return (stable % 10) + 1;
}

export function avatarDefinition(avatarId: unknown) {
  return AVATAR_DEFINITIONS.find((item) => item.id === Number(avatarId)) || AVATAR_DEFINITIONS[0];
}

export function UserAvatar({ userId, avatarId, alt = '', className }: { userId?: unknown; avatarId?: unknown; alt?: string; className?: string }) {
  const id = stableAvatarId(userId, avatarId);
  return <img src={avatarUrl(id)} alt={alt} className={cn('rv-avatar', `rv-avatar-tone-${id}`, 'object-cover', className)} loading="lazy" decoding="async" />;
}

export function AvatarPicker({ value, onChange }: { value?: number | null; onChange: (avatarId: number) => void }) {
  const selected = stableAvatarId('default', value);
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
    {AVATAR_DEFINITIONS.map((avatar) => {
      const active = selected === avatar.id;
      return <button key={avatar.id} type="button" aria-label={`Choose ${avatar.name} avatar`} aria-pressed={active} onClick={() => onChange(avatar.id)} className={cn('group relative overflow-hidden rounded-2xl border-2 bg-muted transition hover:-translate-y-0.5 hover:shadow-md', active ? 'border-primary ring-2 ring-primary/20' : 'border-border/60')}>
        <span className={cn('avatar-tile-image block aspect-square overflow-hidden', `rv-avatar-tone-${avatar.id}`)}><img src={avatarUrl(avatar.id)} alt={avatar.name} className="h-full w-full object-cover" loading="lazy" /></span>
        <span className="block truncate px-2 py-2 text-left text-[10px] font-semibold text-foreground">{avatar.name}</span>
        {active && <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow"><Check className="h-3 w-3" /></span>}
      </button>;
    })}
  </div>;
}

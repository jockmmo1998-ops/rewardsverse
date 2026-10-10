import { Bell, Check, Moon, Smartphone, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { SectionHeading, Surface } from '@/components/shared/RewardUI';
import { PasswordSecurityCard } from '@/components/PasswordSecurityCard';
import { playBellSound } from '@/utils/bellSound';

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-label={label} aria-checked={checked} onClick={() => onChange(!checked)} className={`focus-ring relative h-6 w-11 rounded-md transition ${checked ? 'bg-primary' : 'bg-secondary'}`}>
      <span className={`absolute top-1 h-4 w-4 rounded-md bg-white shadow transition ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  );
}

function PreferenceRow({ icon, title, description, children }: { icon?: React.ReactNode; title: string; description: string; children?: React.ReactNode }) {
  return (
    <div className="settings-preference-row">
      <div className="flex min-w-0 items-center gap-3">{icon && <span className="settings-preference-icon">{icon}</span>}<div><p className="text-sm font-semibold text-foreground">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p></div></div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [sound, setSound] = useState(() => localStorage.getItem('rewardsverse-reward-sound') !== 'off');
  const updateSound = async (value: boolean) => {
    setSound(value);
    localStorage.setItem('rewardsverse-reward-sound', value ? 'on' : 'off');
    if (value) { await playBellSound().catch(() => undefined); toast.success('Reward sound enabled'); }
    else toast.success('Reward sound disabled');
  };

  return (
    <div className="unified-page settings-page mx-auto w-full max-w-[900px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <SectionHeading eyebrow="Workspace preferences" title="Settings" description="Manage account security and the preferences currently supported by this workspace." />
      <div className="space-y-6">
        <Surface className="unified-surface p-5 sm:p-7">
          <div className="flex items-center gap-3"><div className="unified-icon"><Bell className="h-4 w-4" /></div><div><p className="rv-eyebrow">Notifications</p><h2 className="mt-1 font-display text-lg font-semibold">Notification availability</h2></div></div>
          <div className="mt-6 space-y-3">
            <PreferenceRow title="Email notifications" description="Notification delivery is not connected in this deployment."><span className="settings-unavailable">Not connected</span></PreferenceRow>
            <PreferenceRow title="Push notifications" description="Browser push delivery is not configured for this workspace."><span className="settings-unavailable">Not connected</span></PreferenceRow>
            <PreferenceRow icon={sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />} title="Reward sound" description="A short chime on this browser when you enable it. This preference is stored locally."><Toggle checked={sound} onChange={(value) => void updateSound(value)} label="Toggle reward sound" /></PreferenceRow>
          </div>
        </Surface>

        <PasswordSecurityCard />

        <Surface className="unified-surface p-5 sm:p-7">
          <div className="flex items-center gap-3"><div className="unified-icon"><Check className="h-4 w-4" /></div><div><p className="rv-eyebrow">Preferences</p><h2 className="mt-1 font-display text-lg font-semibold">Appearance</h2></div></div>
          <div className="mt-6 space-y-3">
            <PreferenceRow icon={<Moon className="h-4 w-4" />} title="Dark workspace" description="The current graphite theme is active across the member workspace."><span className="settings-active"><Check className="h-3.5 w-3.5" /> Active</span></PreferenceRow>
            <PreferenceRow icon={<Smartphone className="h-4 w-4" />} title="Responsive layout" description="Navigation and content adapt to narrow screens." />
          </div>
        </Surface>
      </div>
    </div>
  );
}

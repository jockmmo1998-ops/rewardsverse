import { Bell, Globe, Moon, Shield, Smartphone } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Settings" subtitle="Customize your application experience." />

      <div className="space-y-6">
        <GlassCard className="p-6">
          <h3 className="font-heading font-bold text-lg mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Notification Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/20">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-xs text-muted-foreground mt-1">Receive updates about new offers and withdrawals</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/20">
              <div>
                <p className="font-medium text-foreground">Push Notifications</p>
                <p className="text-xs text-muted-foreground mt-1">Browser notifications for live activity</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="font-heading font-bold text-lg mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" /> Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-black/20">
              <div>
                <p className="font-medium text-foreground">Language</p>
                <p className="text-xs text-muted-foreground mt-1">Select your preferred language</p>
              </div>
              <select className="bg-white/10 border border-white/20 text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 outline-none">
                <option value="en">English</option>
                <option value="vi">Vietnamese</option>
              </select>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

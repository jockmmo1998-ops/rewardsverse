import { useState } from 'react';
import { User, Mail, Shield, Camera, Key, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [username, setUsername] = useState(profile?.username || '');
  const [saving, setSaving] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({ username }).eq('id', user.id);
      if (error) throw error;
      toast.success('Profile updated successfully!');
      refreshProfile();
    } catch (err: any) {
      toast.error(err.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Personal Profile" subtitle="Manage your account information and security settings." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col - Avatar & Summary */}
        <div className="space-y-6">
          <GlassCard className="p-6 text-center">
            <div className="relative w-24 h-24 mx-auto mb-4 group cursor-pointer">
              <img src={profile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} alt="Avatar" className="w-full h-full rounded-full object-cover bg-white/5 border-2 border-border group-hover:border-primary transition-colors" />
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-heading font-bold text-xl mb-1">{profile?.username || 'User'}</h3>
            <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" /> Lv.{profile?.level || 1} Member
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h4 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Statistics</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Joined</span>
                <span className="text-sm font-medium">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Offers Completed</span>
                <span className="text-sm font-medium">{profile?.completed_offers || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Referral Code</span>
                <span className="text-sm font-medium text-primary">{profile?.referral_code || 'N/A'}</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Col - Forms */}
        <div className="md:col-span-2 space-y-6">
          <GlassCard className="p-6">
            <h3 className="font-heading font-bold text-lg mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Basic Information
            </h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" value={user?.email || ''} disabled className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-border text-muted-foreground text-sm cursor-not-allowed" />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-success" /> Email verified</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-border text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-heading font-bold text-lg mb-6 flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" /> Change Password
            </h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full h-11 px-4 rounded-xl bg-white/5 border border-border text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full h-11 px-4 rounded-xl bg-white/5 border border-border text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Confirm New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full h-11 px-4 rounded-xl bg-white/5 border border-border text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                </div>
              </div>
              <div className="pt-2">
                <button type="button" className="px-6 py-2.5 rounded-xl bg-white/10 border border-white/10 text-foreground font-semibold text-sm hover:bg-white/20 transition-all">
                  Update Password
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

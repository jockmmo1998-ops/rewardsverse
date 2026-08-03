import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from '@/lib/api';
import { supabase } from '@/db/supabase';
import { motion } from 'motion/react';
import AppLayout from '@/components/layouts/AppLayout';
import PageMeta from '@/components/common/PageMeta';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { User, Moon, Shield, Zap, Eye, EyeOff } from 'lucide-react';
import { useTheme } from 'next-themes';

const profileSchema = z.object({
  username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

function Section({ icon: Icon, color, title, children }: { icon: React.ElementType; color: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6 space-y-5"
      style={{ background: 'rgba(16,20,31,0.95)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}33` }}>
          <Icon size={14} style={{ color }} />
        </div>
        <h2 className="font-semibold font-heading" style={{ color: '#F4F4F5' }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { profile, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: profile?.username ?? '' },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSaveProfile = async (values: ProfileValues) => {
    if (!profile) return;
    setSavingProfile(true);
    const { error } = await updateProfile(profile.id, { username: values.username });
    setSavingProfile(false);
    if (error) { toast.error(error); return; }
    await refreshProfile();
    toast.success('Profile updated.');
  };

  const onChangePassword = async (values: PasswordValues) => {
    setSavingPassword(true);
    const email = `${profile?.username}@rewardsverse.app`;
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: values.currentPassword });
    if (signInError) { setSavingPassword(false); toast.error('Current password is incorrect.'); return; }
    const { error } = await supabase.auth.updateUser({ password: values.newPassword });
    setSavingPassword(false);
    if (error) { toast.error(error.message); return; }
    passwordForm.reset();
    toast.success('Password changed successfully.');
  };

  const inputStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#F4F4F5' };
  const labelStyle = { color: 'rgba(244,244,245,0.5)' };

  return (
    <>
      <PageMeta title="Settings — RewardsVerse" description="Manage your account settings" />
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-5">
          <div>
            <h1 className="text-xl font-bold font-heading" style={{ color: '#F4F4F5' }}>Settings</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(244,244,245,0.4)' }}>Manage your account preferences and security.</p>
          </div>

          {/* Profile */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <Section icon={User} color="#3B82F6" title="Profile">
              {/* Avatar row */}
              <div className="flex items-center gap-4 p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
                  style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)', color: '#000' }}>
                  {profile?.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold font-heading" style={{ color: '#F4F4F5' }}>{profile?.username}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22C55E' }}>Member</span>
                    {profile?.is_admin && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#A855F7' }}>Admin</span>
                    )}
                  </div>
                </div>
              </div>

              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-3">
                  <FormField control={profileForm.control} name="username" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider" style={labelStyle}>Username</FormLabel>
                      <FormControl>
                        <input {...field} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <button type="submit" disabled={savingProfile}
                    className="btn-primary h-9 px-5 rounded-lg text-sm font-bold disabled:opacity-50">
                    {savingProfile ? 'Saving…' : 'Save Changes'}
                  </button>
                </form>
              </Form>
            </Section>
          </motion.div>

          {/* Appearance */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
            <Section icon={Moon} color="#A855F7" title="Appearance">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#F4F4F5' }}>Dark Mode</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(244,244,245,0.4)' }}>Switch between light and dark theme</p>
                </div>
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="w-12 h-6 rounded-full relative transition-all"
                  style={{ background: theme === 'dark' ? '#22C55E' : 'rgba(255,255,255,0.15)' }}>
                  <div className="w-4 h-4 rounded-full bg-white absolute top-1 transition-all"
                    style={{ left: theme === 'dark' ? '1.75rem' : '0.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                </button>
              </div>
            </Section>
          </motion.div>

          {/* Security */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
            <Section icon={Shield} color="#F59E0B" title="Security">
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-3">
                  {[
                    { name: 'currentPassword' as const, label: 'Current Password', show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
                    { name: 'newPassword' as const, label: 'New Password', show: showNew, toggle: () => setShowNew(!showNew) },
                    { name: 'confirmPassword' as const, label: 'Confirm New Password', show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
                  ].map(f => (
                    <FormField key={f.name} control={passwordForm.control} name={f.name} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider" style={labelStyle}>{f.label}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <input {...field} type={f.show ? 'text' : 'password'}
                              className="w-full px-3 pr-9 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
                            <button type="button" onClick={f.toggle}
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                              style={{ color: 'rgba(244,244,245,0.3)' }}>
                              {f.show ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  ))}
                  <button type="submit" disabled={savingPassword}
                    className="h-9 px-5 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                    style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B' }}>
                    {savingPassword ? 'Updating…' : 'Update Password'}
                  </button>
                </form>
              </Form>
            </Section>
          </motion.div>

          {/* Account info */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21 }}>
            <Section icon={Zap} color="#22C55E" title="Account Info">
              <div className="space-y-0">
                {[
                  { label: 'Member Since', value: profile ? new Date(profile.created_at).toLocaleDateString() : '—' },
                  { label: 'Total Earned', value: profile ? `$${profile.total_earned.toFixed(2)}` : '—' },
                  { label: 'Current Balance', value: profile ? `$${profile.balance.toFixed(2)}` : '—' },
                  { label: 'Referral Code', value: profile?.referral_code ?? '—' },
                ].map((item, i, arr) => (
                  <div key={item.label} className="flex items-center justify-between py-3"
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : undefined }}>
                    <span className="text-xs" style={{ color: 'rgba(244,244,245,0.4)' }}>{item.label}</span>
                    <span className="text-sm font-semibold" style={{ color: '#F4F4F5' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </Section>
          </motion.div>
        </div>
      </AppLayout>
    </>
  );
}


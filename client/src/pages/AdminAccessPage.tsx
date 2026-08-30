import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { SectionHeading, Surface } from '@/components/shared/RewardUI';

export default function AdminAccessPage() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [secret, setSecret] = useState('');
  const promote = trpc.admin.promoteByPassword.useMutation({
    onSuccess: () => { toast.success('Admin access enabled.'); navigate('/admin', { replace: true }); },
    onError: (error) => toast.error(error.message || 'Admin access could not be enabled.'),
  });

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true, state: { from: '/admin/login' } });
    if (!loading && isAdmin) navigate('/admin', { replace: true });
  }, [isAdmin, loading, navigate, user]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!secret.trim() || promote.isPending) return;
    promote.mutate({ secret: secret.trim() });
  };

  if (loading || !user || isAdmin) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  return <div className="mx-auto flex min-h-[60vh] w-full max-w-[560px] items-center px-4 py-10 sm:px-6"><Surface className="w-full p-6 sm:p-8"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><ShieldCheck className="h-5 w-5" /></div><div className="mt-5"><SectionHeading eyebrow="Restricted setup" title="Enable admin access" description="Use the deployment ADMIN_SECRET for the currently authenticated account. The secret is sent only to the server and is never stored in the browser." /></div><form onSubmit={submit} className="mt-7 space-y-4"><label className="block text-sm font-semibold text-foreground" htmlFor="admin-secret">ADMIN_SECRET<input id="admin-secret" type="password" autoComplete="off" value={secret} onChange={(event) => setSecret(event.target.value)} placeholder="Enter deployment secret" className="focus-ring mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground" /></label><button type="submit" disabled={!secret.trim() || promote.isPending} className="focus-ring inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"><KeyRound className="h-4 w-4" />{promote.isPending ? 'Verifying…' : 'Enable admin access'}</button></form><p className="mt-5 text-xs leading-5 text-muted-foreground">Admin APIs also verify the account role on the server. Hiding a button is not the security boundary.</p></Surface></div>;
}

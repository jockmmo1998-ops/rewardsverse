import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, X } from 'lucide-react';
import { toast } from 'sonner';
import { BrandGlyph } from '@/components/shared/RewardUI';
import { useAuth } from '@/contexts/AuthContext';

type RegisterDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function RegisterDialog({ open, onClose }: RegisterDialogProps) {
  const { register } = useAuth();
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [refCode, setRefCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = window.requestAnimationFrame(() => emailRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Use a password with at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    if (!termsAccepted) {
      setError('Please accept the Terms of Service to continue.');
      return;
    }

    setSubmitting(true);
    const result = await register(password, normalizedEmail, refCode.trim() || undefined, termsAccepted);
    setSubmitting(false);
    if (result.error) {
      const message = result.error.message || 'We could not create your account. Please try again.';
      const lower = message.toLowerCase();
      setError(lower.includes('already') || lower.includes('exists')
        ? 'An account may already exist for this email. Try logging in instead.'
        : message);
      return;
    }

    toast.success('Account created. Finish setting up your profile next.');
    setPassword('');
    setConfirmPassword('');
    onClose();
    navigate('/onboarding', { replace: true });
  };

  return createPortal(
    <div className="register-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) onClose(); }}>
      <section ref={dialogRef} className="register-dialog" role="dialog" aria-modal="true" aria-labelledby="register-dialog-title" aria-describedby="register-dialog-description">
        <button type="button" className="register-dialog-close" onClick={onClose} disabled={submitting} aria-label="Close sign-up form"><X className="h-5 w-5" /></button>
        <div className="register-dialog-brand"><span className="register-dialog-logo"><BrandGlyph className="h-full w-full" /></span><span>REWARDSVERSE</span></div>
        <p className="register-dialog-kicker">A clearer way to earn</p>
        <h2 id="register-dialog-title">Create your account</h2>
        <p id="register-dialog-description" className="register-dialog-description">Sign up to open your rewards dashboard and keep your activity in one place.</p>

        <form onSubmit={handleSubmit} className="register-dialog-form" noValidate>
          <label className="register-field-label" htmlFor="register-email">Email address</label>
          <span className="register-input-wrap"><Mail className="register-input-icon" aria-hidden="true" /><input ref={emailRef} id="register-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></span>

          <label className="register-field-label" htmlFor="register-password">Password</label>
          <span className="register-input-wrap"><LockKeyhole className="register-input-icon" aria-hidden="true" /><input id="register-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" /><button type="button" className="register-password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span>

          <label className="register-field-label" htmlFor="register-confirm-password">Confirm password</label>
          <span className="register-input-wrap"><LockKeyhole className="register-input-icon" aria-hidden="true" /><input id="register-confirm-password" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" minLength={6} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Re-enter your password" /><button type="button" className="register-password-toggle" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? 'Hide confirmation' : 'Show confirmation'}>{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span>

          <label className="register-field-label" htmlFor="register-referral">Referral code <span>(optional)</span></label>
          <input className="register-referral-input" id="register-referral" type="text" autoComplete="off" value={refCode} onChange={(event) => setRefCode(event.target.value)} placeholder="Enter a referral code" />

          <label className="register-terms"><input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} /><span>I agree to the <Link to="/terms" onClick={onClose}>Terms of Service</Link> and understand the RewardsVerse policies.</span></label>
          {error && <p className="register-form-error" role="alert">{error}</p>}
          <button className="register-submit" type="submit" disabled={submitting || !termsAccepted}>{submitting ? 'Creating account…' : <>Create account <ArrowRight className="h-4 w-4" /></>}</button>
        </form>
        <p className="register-dialog-login">Already have an account? <Link to="/login" onClick={onClose}>Log in</Link></p>
      </section>
    </div>,
    document.body,
  );
}

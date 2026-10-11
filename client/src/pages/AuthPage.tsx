import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Check, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AvatarPicker } from '@/components/AvatarSystem';
import { AppLayout } from '@/components/layouts/AppLayout';
import HomePage from './HomePage';

const getFriendlyAuthError = (error: Error | null, isRegister: boolean): string => {
  const message = error?.message ?? '';
  const normalized = message.toLowerCase();
  if (/failed query|sql|mysql|database|drizzle|er_[a-z0-9_]+|select `|insert `|unknown column|table .* doesn't exist/.test(normalized)) {
    return isRegister
      ? 'The registration system is temporarily experiencing a data error. Please try again in a few minutes or contact support.'
      : 'The login system is temporarily experiencing a data error. Please try again in a few minutes or contact support.';
  }
  if (normalized.includes('email already registered')) return 'This email is already registered. Try logging in instead.';
  if (normalized.includes('user not found')) return 'Account not found.';
  if (normalized.includes('incorrect password')) return 'Incorrect password.';
  return isRegister
    ? 'Unable to register right now. Please check your information and try again.'
    : 'Unable to log in right now. Please check your information and try again.';
};

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, login, register } = useAuth();
  const isRegister = location.pathname === '/register';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [refCode, setRefCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [avatarId, setAvatarId] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (user && !loading) {
      navigate(!user.username || !user.avatarId ? '/onboarding' : '/dashboard', { replace: true });
    }
  }, [loading, navigate, user]);

  const switchMode = (registerMode: boolean) => {
    setError('');
    setNotice('');
    navigate(registerMode ? '/register' : '/login');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (isRegister && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (!isRegister && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Enter the email address you used to register.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (isRegister && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (isRegister && !termsAccepted) {
      setError('You must agree to the Terms of Service before creating an account.');
      return;
    }
    setSubmitting(true);
    try {
      const result = isRegister
        ? await register(password, email.trim().toLowerCase(), refCode.trim() || undefined, termsAccepted, avatarId)
        : await login(email.trim().toLowerCase(), password);
      if (result.error) {
        setError(getFriendlyAuthError(result.error, isRegister));
        return;
      }
      setNotice(isRegister ? 'Account created. Your workspace is ready.' : 'Login successful.');
      navigate('/dashboard', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="rewards-auth-page rv-auth-page">
      {isRegister && <div className="rv-auth-backdrop" aria-hidden="true"><AppLayout><HomePage /></AppLayout></div>}
      {isRegister && <div className="rv-auth-backdrop-scrim" aria-hidden="true" />}
      <div className="rv-auth-card">
        <aside className="rv-auth-aside">
          <Link to="/home" className="rv-auth-brand" aria-label="RewardsVerse home">
            <img src="/rewardsverse-icon.png" alt="" />
            <span>REWARDSVERSE</span>
          </Link>
          {isRegister && <img className="rv-auth-community-art" src="/rewardsverse-community-cutout-green.png" alt="RewardsVerse community holding branded reward devices" width="1672" height="941" decoding="async" />}
          <p className="rv-auth-kicker"><span /> YOUR REWARDS, CLEARLY</p>
          <h1>{isRegister ? <>Create your<br /><em>rewards space.</em></> : <>Your rewards<br /><em>start here.</em></>}</h1>
          <p className="rv-auth-description">Explore configured partners, track verified activity and keep your account details in one place.</p>
          <ul className="rv-auth-points">
            <li><Check aria-hidden="true" /> Browse partner offers as they become available</li>
            <li><Check aria-hidden="true" /> Follow your account activity and rewards</li>
            <li><ShieldCheck aria-hidden="true" /> Sign in securely with your RewardsVerse account</li>
          </ul>
          <div className="rv-auth-aside-footer"><span>REWARDSVERSE</span><span>ACCOUNT ACCESS</span></div>
        </aside>

        <section className="rv-auth-form-panel" aria-labelledby="rv-auth-title">
          <div className="rv-auth-topline"><span><Sparkles aria-hidden="true" /> MEMBER ACCESS</span><Link to="/home">Back to RewardsVerse <ArrowUpRight aria-hidden="true" /></Link></div>
          <div className="rv-auth-mode" role="tablist" aria-label="Choose account access">
            <button type="button" role="tab" aria-selected={!isRegister} onClick={() => switchMode(false)} className={!isRegister ? 'is-active' : ''}>Log in</button>
            <button type="button" role="tab" aria-selected={isRegister} onClick={() => switchMode(true)} className={isRegister ? 'is-active' : ''}>Sign up</button>
          </div>
          <div className="rv-auth-heading">
            <p className="rv-eyebrow"><span className="section-dot" /> {isRegister ? 'CREATE YOUR ACCOUNT' : 'WELCOME BACK'}</p>
            <h2 id="rv-auth-title">{isRegister ? 'Join RewardsVerse.' : 'Good to see you.'}</h2>
            <p>{isRegister ? 'Choose your avatar. We’ll create a username and take you straight to your workspace.' : 'Log in to pick up where your rewards left off.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="rv-auth-form">
            <label className="rv-auth-field" htmlFor={isRegister ? 'email' : 'login-email'}>
              <span>Email address</span>
              <span className="rv-auth-input-wrap">
                <Mail aria-hidden="true" />
                <input
                  id={isRegister ? 'email' : 'login-email'}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </span>
              <small>{isRegister ? 'We’ll send a verification link here.' : 'Use the email address associated with your account.'}</small>
            </label>

            <label className="rv-auth-field" htmlFor="password">
              <span>Password</span>
              <span className="rv-auth-input-wrap">
                <LockKeyhole aria-hidden="true" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  required
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Show or hide password">{showPassword ? <EyeOff /> : <Eye />}</button>
              </span>
            </label>

            {isRegister && (
              <>
                <label className="rv-auth-field" htmlFor="confirmPassword">
                  <span>Re-enter password</span>
                  <span className="rv-auth-input-wrap">
                    <LockKeyhole aria-hidden="true" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      required
                    />
                    <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} aria-label="Show or hide password confirmation">{showConfirmPassword ? <EyeOff /> : <Eye />}</button>
                  </span>
                </label>
                <label className="rv-auth-field" htmlFor="refCode">
                  <span>Referral code <i>(optional)</i></span>
                  <input id="refCode" value={refCode} onChange={(event) => setRefCode(event.target.value)} placeholder="Enter your code if you have one" />
                </label>
                <fieldset className="rv-auth-avatar-field">
                  <legend>Choose your avatar <span>· change it anytime</span></legend>
                  <AvatarPicker value={avatarId} onChange={setAvatarId} compact />
                </fieldset>
                <label className="rv-auth-terms">
                  <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
                  <span>I agree to the <Link to="/terms" target="_blank">Terms of Service</Link> and understand the RewardsVerse policies.</span>
                </label>
              </>
            )}

            {error && <p role="alert" className="rv-auth-message is-error">{error}</p>}
            {notice && <p role="status" className="rv-auth-message is-notice">{notice}</p>}

            <button type="submit" disabled={submitting || loading || (isRegister && !termsAccepted)} className="rv-auth-submit">
              {submitting ? 'Processing…' : isRegister ? 'Create account' : 'Log in'}
              <ArrowUpRight aria-hidden="true" />
            </button>
            {!isRegister && <div className="rv-auth-forgot"><Link to="/forgot-password">Forgot password?</Link></div>}
          </form>

          <p className="rv-auth-switch">{isRegister ? 'Already have an account?' : 'New to RewardsVerse?'} <button type="button" onClick={() => switchMode(!isRegister)}>{isRegister ? 'Log in' : 'Sign up free'}</button></p>
          <p className="rv-auth-privacy"><ShieldCheck aria-hidden="true" /> Your account details stay within the RewardsVerse sign-in flow.</p>
        </section>
      </div>
    </main>
  );
}

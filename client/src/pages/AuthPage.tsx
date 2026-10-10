import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, WalletCards } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { BrandMark } from "@/components/shared/RewardUI";

const getFriendlyAuthError = (error: Error | null, isRegister: boolean): string => {
  const message = error?.message ?? "";
  const normalized = message.toLowerCase();
  if (/failed query|sql|mysql|database|drizzle|er_[a-z0-9_]+|select `|insert `|unknown column|table .* doesn't exist/.test(normalized)) {
    return isRegister
      ? "The registration system is temporarily experiencing a data error. Please try again in a few minutes or contact support."
      : "The login system is temporarily experiencing a data error. Please try again in a few minutes or contact support.";
  }
  if (normalized.includes("email already registered")) return "This email is already registered. Try logging in instead.";
  if (normalized.includes("user not found")) return "Account not found.";
  if (normalized.includes("incorrect password")) return "Incorrect password.";
  return isRegister
    ? "Unable to register right now. Please check your information and try again."
    : "Unable to log in right now. Please check your information and try again.";
};

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, login, register } = useAuth();
  const isRegister = location.pathname === "/register";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [refCode, setRefCode] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (user && !loading) {
      navigate(!user.username || !user.avatarId ? "/onboarding" : "/dashboard", { replace: true });
    }
  }, [loading, navigate, user]);

  const switchMode = (registerMode: boolean) => {
    setError("");
    setNotice("");
    navigate(registerMode ? "/register" : "/login");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (isRegister && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (!isRegister && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter the email address you used to register.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (isRegister && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (isRegister && !termsAccepted) {
      setError("You must agree to the Terms of Service before creating an account.");
      return;
    }
    setSubmitting(true);
    try {
      const result = isRegister
        ? await register(password, email.trim().toLowerCase(), refCode.trim() || undefined, termsAccepted)
        : await login(email.trim().toLowerCase(), password);
      if (result.error) {
        setError(getFriendlyAuthError(result.error, isRegister));
        return;
      }
      setNotice(isRegister ? "Account created. Complete your profile to continue." : "Login successful.");
      navigate(isRegister ? "/onboarding" : "/dashboard", { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={`rewards-auth-page rewards-auth-layout ${isRegister ? "rewards-auth-register" : "rewards-auth-login"}`}>
      <div className="auth-shell">
        <aside className="auth-story">
          <Link to="/home" className="auth-brand" aria-label="RewardsVerse home"><BrandMark /></Link>
          <div className="auth-story-copy">
            <p className="auth-kicker"><span aria-hidden="true" /> MEMBER ACCESS · REWARDSVERSE</p>
            <h1>{isRegister ? <>Make room for<br /><em>what’s next.</em></> : <>Your rewards space.<br /><em>Ready when you are.</em></>}</h1>
            <p className="auth-story-description">
              {isRegister
                ? "Create your account for a clear, focused start. After registration, set your username and choose your 3D avatar."
                : "Sign in to follow verified rewards, account activity, and payout details in one place."}
            </p>
            <ul className="auth-story-points">
              <li><CheckCircle2 aria-hidden="true" /><span><strong>Real offer activity</strong><small>Browse surveys, apps, games, and tasks when available.</small></span></li>
              <li><CheckCircle2 aria-hidden="true" /><span><strong>Clear reward history</strong><small>See credits after provider verification.</small></span></li>
              <li><CheckCircle2 aria-hidden="true" /><span><strong>Transparent withdrawals</strong><small>Review supported payout methods in one place.</small></span></li>
            </ul>
          </div>
          <div className="auth-story-footer">
            <span><ShieldCheck aria-hidden="true" /> VERIFIED PROVIDER CALLBACKS</span>
            <span><WalletCards aria-hidden="true" /> SERVER-VALIDATED PAYOUTS</span>
          </div>
        </aside>

        <section className="auth-form-panel" aria-labelledby="auth-page-title">
          <div className="auth-form-heading">
            <p className="auth-form-eyebrow"><span aria-hidden="true" /> {isRegister ? "CREATE ACCOUNT" : "WELCOME BACK"}</p>
            <h2 id="auth-page-title">{isRegister ? "Your next step starts here." : "Log in to continue."}</h2>
            <p>{isRegister ? "Use your email to create a RewardsVerse account." : "Log in to continue earning rewards."}</p>
          </div>

          <div className="auth-tabs" role="tablist" aria-label="Account access">
            <button type="button" role="tab" aria-selected={!isRegister} className={!isRegister ? "is-active" : ""} onClick={() => switchMode(false)}>Log in</button>
            <button type="button" role="tab" aria-selected={isRegister} className={isRegister ? "is-active" : ""} onClick={() => switchMode(true)}>Sign up</button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {isRegister ? (
              <div className="auth-field-grid">
                <div className="auth-field">
                  <label htmlFor="email">Email address</label>
                  <div className="auth-input-wrap"><Mail aria-hidden="true" /><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /><span /></div>
                  <p className="auth-field-help">We’ll send a verification link here.</p>
                </div>
                <div className="auth-field">
                  <label htmlFor="password">Password</label>
                  <div className="auth-input-wrap"><LockKeyhole aria-hidden="true" /><input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" autoComplete="new-password" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Show or hide password">{showPassword ? <EyeOff /> : <Eye />}</button></div>
                </div>
                <div className="auth-field">
                  <label htmlFor="confirmPassword">Re-enter password</label>
                  <div className="auth-input-wrap"><LockKeyhole aria-hidden="true" /><input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter it again" autoComplete="new-password" /><button type="button" onClick={() => setShowConfirmPassword((value) => !value)} aria-label="Show or hide password confirmation">{showConfirmPassword ? <EyeOff /> : <Eye />}</button></div>
                </div>
                <div className="auth-field">
                  <label htmlFor="refCode">Referral code <span>(optional)</span></label>
                  <div className="auth-input-wrap auth-input-no-icon"><input id="refCode" value={refCode} onChange={(event) => setRefCode(event.target.value)} placeholder="Enter your code if you have one" /></div>
                </div>
              </div>
            ) : (
              <div className="auth-field-stack">
                <div className="auth-field">
                  <label htmlFor="login-email">Email address</label>
                  <div className="auth-input-wrap"><Mail aria-hidden="true" /><input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@gmail.com" autoComplete="email" /></div>
                  <p className="auth-field-help">Use the email address you used when creating your account.</p>
                </div>
                <div className="auth-field">
                  <label htmlFor="password">Password</label>
                  <div className="auth-input-wrap"><LockKeyhole aria-hidden="true" /><input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" autoComplete="current-password" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Show or hide password">{showPassword ? <EyeOff /> : <Eye />}</button></div>
                </div>
              </div>
            )}

            {isRegister && <label className="auth-terms"><input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} /><span>I agree to the <Link to="/terms" target="_blank">Terms of Service</Link> and understand the RewardsVerse policies.</span></label>}
            {error && <p role="alert" className="auth-message auth-error">{error}</p>}
            {notice && <p role="status" className="auth-message auth-notice">{notice}</p>}
            <button type="submit" disabled={submitting || loading || (isRegister && !termsAccepted)} className="auth-submit"><span>{submitting ? "Processing…" : isRegister ? "Create account" : "Log in"}</span><ArrowRight aria-hidden="true" /></button>
            {!isRegister && <div className="auth-forgot"><Link to="/forgot-password">Forgot password?</Link></div>}
          </form>

          <p className="auth-mode-switch">{isRegister ? "Already have an account?" : "Don’t have an account?"} <button type="button" onClick={() => switchMode(!isRegister)}>{isRegister ? "Log in" : "Sign up free"}</button></p>
          {isRegister && <p className="auth-onboarding-note"><ShieldCheck aria-hidden="true" /> Your username and avatar are set in the next profile step.</p>}
        </section>
      </div>
    </main>
  );
}

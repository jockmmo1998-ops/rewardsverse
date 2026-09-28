import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Gift, LockKeyhole, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
  const [username, setUsername] = useState("");
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
    if (!isRegister && (!username.trim() || !/^[a-zA-Z0-9_]+$/.test(username.trim()))) {
      setError("Username may only contain letters, numbers, and underscores.");
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
        : await login(username.trim(), password);
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
    <main className="rewards-auth-page relative flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/home" className="inline-flex items-center gap-2 text-2xl font-black tracking-tight">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"><Gift className="h-5 w-5" /></span>
            <span className="tracking-[0.08em]">REWARDSVERSE</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">{isRegister ? "Create a free account to start earning rewards." : "Log in to continue earning rewards."}</p>
        </div>
        <section className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
          <div className="mb-6 grid grid-cols-2 rounded-xl border border-border/60 bg-background/50 p-1">
            <button type="button" onClick={() => switchMode(false)} className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${!isRegister ? "bg-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700"}`}>Log in</button>
            <button type="button" onClick={() => switchMode(true)} className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${isRegister ? "bg-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700"}`}>Sign up</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && <div className="space-y-2"><label htmlFor="email" className="text-sm font-medium">Email address</label><div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20" /></div><p className="text-[11px] text-muted-foreground">We’ll send a verification link here.</p></div>}
            {!isRegister && <div className="space-y-2"><label htmlFor="username" className="text-sm font-medium">Username</label><input id="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Enter username" autoComplete="username" className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20" /></div>}
            <div className="space-y-2"><label htmlFor="password" className="text-sm font-medium">Password</label><div className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" autoComplete={isRegister ? "new-password" : "current-password"} className="h-11 w-full rounded-lg border border-border bg-background px-10 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Show or hide password">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
            {isRegister && <><div className="space-y-2"><label htmlFor="confirmPassword" className="text-sm font-medium">Re-enter password</label><div className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Re-enter password" autoComplete="new-password" className="h-11 w-full rounded-lg border border-border bg-background px-10 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20" /><button type="button" onClick={() => setShowConfirmPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Show or hide password confirmation">{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div><div className="space-y-2"><label htmlFor="refCode" className="text-sm font-medium">Referral code <span className="text-muted-foreground">(optional)</span></label><input id="refCode" value={refCode} onChange={(event) => setRefCode(event.target.value)} placeholder="Enter your code if you have one" className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20" /></div><label className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/40 p-3 text-xs leading-5 text-muted-foreground"><input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-emerald-600" /> <span>I agree to the <Link to="/terms" target="_blank" className="font-semibold text-emerald-400 hover:underline">Terms of Service</Link> and understand the RewardsVerse policies.</span></label></>}
            {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
            {notice && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{notice}</p>}
            <button type="submit" disabled={submitting || loading || (isRegister && !termsAccepted)} className="h-11 w-full rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Processing…" : isRegister ? "Create account" : "Log in"}</button>
            {!isRegister && <div className="text-center"><Link to="/forgot-password" className="text-xs font-semibold text-emerald-400 hover:underline">Forgot password?</Link></div>}
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">{isRegister ? "Already have an account?" : "Don't have an account?"}{" "}<button type="button" onClick={() => switchMode(!isRegister)} className="font-semibold text-emerald-400 hover:text-emerald-300">{isRegister ? "Log in" : "Sign up free"}</button></p>
        </section>
        <p className="mt-5 text-center text-xs text-muted-foreground">Your rewards journey starts here</p>
      </div>
    </main>
  );
}

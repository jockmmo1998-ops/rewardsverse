import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Gift, LockKeyhole, Shuffle, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const getFriendlyAuthError = (error: Error | null, isRegister: boolean): string => {
  const message = error?.message ?? "";
  const normalized = message.toLowerCase();

  if (/failed query|sql|mysql|database|drizzle|er_[a-z0-9_]+|select `|insert `|unknown column|table .* doesn't exist/.test(normalized)) {
    return isRegister
      ? "The registration system is temporarily experiencing a data error. Please try again in a few minutes or contact support."
      : "The login system is temporarily experiencing a data error. Please try again in a few minutes or contact support.";
  }

  if (normalized.includes("username already taken")) {
    return "This username is already taken. Please choose a different username.";
  }
  if (normalized.includes("user not found")) {
    return "Account not found.";
  }
  if (normalized.includes("incorrect password")) {
    return "Incorrect password.";
  }

  return isRegister
    ? "Unable to register right now. Please check your information and try again."
    : "Unable to log in right now. Please check your information and try again.";
};

const randomUserNames = [
  "Liam", "Noah", "Oliver", "James", "Mason", "Ethan", "Daniel", "Lucas", "Henry", "William",
  "Emma", "Olivia", "Ava", "Sophia", "Mia", "Amelia", "Isabella", "Harper", "Luna", "Grace",
  "Alexander", "Benjamin", "Charles", "Gabriel", "Mateo", "Santiago", "Diego", "Marco", "Rafael", "Carlos",
  "Sofia", "Valentina", "Lucia", "Elena", "Camila", "Gabriela", "Arjun", "Rohan", "Kabir", "Aditya",
  "Priya", "Aisha", "Mira", "Zara", "Hiro", "Kenji", "Ren", "Haruto", "Yuki", "Mei",
  "Aiko", "Hana", "Omar", "Amir", "Karim", "Zayn", "Amina", "Fatima", "Leila", "Nour",
];

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, login, register } = useAuth();
  const isRegister = location.pathname === "/register";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [refCode, setRefCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const generateRandomUser = () => {
    const name = randomUserNames[Math.floor(Math.random() * randomUserNames.length)];
    const number = Math.floor(1000 + Math.random() * 9000);
    setUsername(`${name}${number}`);
    setError("");
  };

  useEffect(() => {
    if (user && !loading) navigate("/dashboard", { replace: true });
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

    const cleanUsername = username.trim();
    if (cleanUsername.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (isRegister && !/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]+$/.test(cleanUsername)) {
      setError("Click Random User to create a username with letters and numbers.");
      return;
    }
    if (!isRegister && !/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
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

    setSubmitting(true);
    try {
      const result = isRegister
        ? await register(cleanUsername, password, refCode.trim() || undefined)
        : await login(cleanUsername, password);

      if (result.error) {
        setError(getFriendlyAuthError(result.error, isRegister));
        return;
      }

      setNotice(isRegister ? "Registration successful. Opening your account…" : "Login successful.");
      navigate("/dashboard", { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/home" className="inline-flex items-center gap-2 text-2xl font-black tracking-tight">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25">
              <Gift className="h-5 w-5" />
            </span>
            <span className="tracking-[0.08em]">REWARDSVERSE</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            {isRegister ? "Create a free account to start earning rewards." : "Log in to continue earning rewards."}
          </p>
        </div>

        <section className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
          <div className="mb-6 grid grid-cols-2 rounded-xl border border-border/60 bg-background/50 p-1">
            <button
              type="button"
              onClick={() => switchMode(false)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${!isRegister ? "bg-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700"}`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => switchMode(true)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${isRegister ? "bg-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700"}`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">Username</label>
              <div className={isRegister ? "flex flex-col gap-2 sm:flex-row" : "relative"}>
                <div className="relative min-w-0 flex-1">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  readOnly={isRegister}
                  placeholder={isRegister ? "Click Random User" : "Enter username"}
                  autoComplete="username"
                  className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                />
                </div>
                {isRegister && (
                  <button type="button" onClick={generateRandomUser} className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-50 px-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 sm:w-auto" aria-label="Generate random user">
                    <Shuffle className="h-4 w-4" /> Random User
                  </button>
                )}
              </div>
              {isRegister && <p className="text-[11px] text-muted-foreground">Required: choose a generated name with letters and numbers.</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  className="h-11 w-full rounded-lg border border-border bg-background px-10 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Show or hide password">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">Re-enter password</label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      className="h-11 w-full rounded-lg border border-border bg-background px-10 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Show or hide password confirmation">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="refCode" className="text-sm font-medium">Referral code <span className="text-muted-foreground">(optional)</span></label>
                  <input
                    id="refCode"
                    value={refCode}
                    onChange={(event) => setRefCode(event.target.value)}
                    placeholder="Enter your code if you have one"
                    className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                  />
                </div>
              </>
            )}

            {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
            {notice && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{notice}</p>}

            <button
              type="submit"
              disabled={submitting || loading}
              className="h-11 w-full rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Processing…" : isRegister ? "Create account" : "Log in"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button type="button" onClick={() => switchMode(!isRegister)} className="font-semibold text-emerald-400 hover:text-emerald-300">
              {isRegister ? "Log in" : "Sign up free"}
            </button>
          </p>
        </section>

        <p className="mt-5 text-center text-xs text-muted-foreground">Your rewards journey starts here</p>
      </div>
    </main>
  );
}

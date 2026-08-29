import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Gift, LockKeyhole, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
      setError("Username phải có ít nhất 3 ký tự.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      setError("Username chỉ được dùng chữ cái, số và dấu gạch dưới.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (isRegister && password !== confirmPassword) {
      setError("Mật khẩu xác nhận chưa khớp.");
      return;
    }

    setSubmitting(true);
    try {
      const result = isRegister
        ? await register(cleanUsername, password, refCode.trim() || undefined)
        : await login(cleanUsername, password);

      if (result.error) {
        setError(result.error.message || (isRegister ? "Không thể đăng ký." : "Không thể đăng nhập."));
        return;
      }

      setNotice(isRegister ? "Đăng ký thành công. Đang mở tài khoản của bạn…" : "Đăng nhập thành công.");
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
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-black shadow-lg shadow-emerald-500/20">
              <Gift className="h-5 w-5" />
            </span>
            <span>Rewards<span className="text-emerald-400">Verse</span></span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            {isRegister ? "Tạo tài khoản miễn phí để bắt đầu kiếm thưởng." : "Đăng nhập để tiếp tục kiếm thưởng."}
          </p>
        </div>

        <section className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
          <div className="mb-6 grid grid-cols-2 rounded-xl border border-border/60 bg-background/50 p-1">
            <button
              type="button"
              onClick={() => switchMode(false)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${!isRegister ? "bg-emerald-500 text-black" : "text-muted-foreground hover:text-foreground"}`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => switchMode(true)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${isRegister ? "bg-emerald-500 text-black" : "text-muted-foreground hover:text-foreground"}`}
            >
              Đăng ký
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">Username</label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Nhập username"
                  autoComplete="username"
                  className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Mật khẩu</label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Ít nhất 6 ký tự"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  className="h-11 w-full rounded-lg border border-border bg-background px-10 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Hiện hoặc ẩn mật khẩu">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">Nhập lại mật khẩu</label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      autoComplete="new-password"
                      className="h-11 w-full rounded-lg border border-border bg-background px-10 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Hiện hoặc ẩn mật khẩu xác nhận">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="refCode" className="text-sm font-medium">Mã giới thiệu <span className="text-muted-foreground">(không bắt buộc)</span></label>
                  <input
                    id="refCode"
                    value={refCode}
                    onChange={(event) => setRefCode(event.target.value)}
                    placeholder="Nhập mã nếu bạn có"
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
              className="h-11 w-full rounded-lg bg-emerald-500 px-4 text-sm font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Đang xử lý…" : isRegister ? "Tạo tài khoản" : "Đăng nhập"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
            <button type="button" onClick={() => switchMode(!isRegister)} className="font-semibold text-emerald-400 hover:text-emerald-300">
              {isRegister ? "Đăng nhập ngay" : "Đăng ký miễn phí"}
            </button>
          </p>
        </section>

        <p className="mt-5 text-center text-xs text-muted-foreground">Không cần email xác thực hoặc mã OTP.</p>
      </div>
    </main>
  );
}

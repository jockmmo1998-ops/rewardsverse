import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Gift, Loader2, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ThemeToggle } from "@/components/ThemeToggle";

type VerificationState = "loading" | "success" | "error";
const VERIFIED_TOKEN_PREFIX = "rewardsverse:verified-email:";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token")?.trim() || "";
  const verify = trpc.user.verifyEmail.useMutation();
  const startedToken = useRef<string | null>(null);
  const [state, setState] = useState<VerificationState>("loading");
  const [message, setMessage] = useState("Confirming your email address…");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("This verification link is missing its token.");
      return;
    }

    // A verification token is single-use. Remember a completed token so a
    // remount/StrictMode pass cannot turn a successful result into a false fail.
    try {
      if (sessionStorage.getItem(`${VERIFIED_TOKEN_PREFIX}${token}`) === "success") {
        setState("success");
        setMessage("Your email is verified. You can now withdraw your rewards.");
        return;
      }
    } catch {
      // Storage can be unavailable in privacy mode; the in-memory guard still applies.
    }

    if (startedToken.current === token) return;
    startedToken.current = token;
    void verify.mutateAsync({ token })
      .then(() => {
        try { sessionStorage.setItem(`${VERIFIED_TOKEN_PREFIX}${token}`, "success"); } catch {}
        setState("success");
        setMessage("Your email is verified. You can now withdraw your rewards.");
      })
      .catch((error: any) => {
        setState("error");
        setMessage(error?.message || "This verification link is invalid or expired.");
      });
    // The token is intentionally the only dependency: mutation objects are unstable
    // and including one here can submit a single-use token more than once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const isSuccess = state === "success";
  const isError = state === "error";

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6"><ThemeToggle /></div>
      <section className={`w-full max-w-md rounded-2xl border border-border/60 bg-card/90 p-8 text-center shadow-2xl ${isSuccess ? "verify-success-card" : ""}`}>
        <Link to="/home" className="inline-flex items-center gap-2 text-xl font-black tracking-[0.08em]">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white"><Gift className="h-5 w-5" /></span>
          REWARDSVERSE
        </Link>
        <div className={`mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-2xl ${isError ? "bg-red-500/10" : "bg-emerald-500/10"} ${isSuccess ? "verify-success-icon" : ""}`}>
          {state === "loading" && <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />}
          {isSuccess && <CheckCircle2 className="h-8 w-8 text-emerald-500" />}
          {isError && <XCircle className="h-8 w-8 text-red-400" />}
        </div>
        <h1 className="mt-5 text-2xl font-bold">{isSuccess ? "Email verified" : isError ? "Verification failed" : "Verifying email"}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{message}</p>
        <Link to={isSuccess ? "/dashboard" : "/profile"} className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700">
          {isSuccess ? "Go to dashboard" : isError ? "Try again from profile" : "Go to profile"}
        </Link>
      </section>
    </main>
  );
}

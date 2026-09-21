import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Gift, Loader2, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const verify = trpc.user.verifyEmail.useMutation();
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Confirming your email address…");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setState("error");
      setMessage("This verification link is missing its token.");
      return;
    }
    verify.mutateAsync({ token })
      .then(() => {
        setState("success");
        setMessage("Your email is verified. You can now withdraw your rewards.");
      })
      .catch((error: any) => {
        setState("error");
        setMessage(error?.message || "This verification link is invalid or expired.");
      });
  }, [params, verify]);

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6"><ThemeToggle /></div>
      <section className="w-full max-w-md rounded-2xl border border-border/60 bg-card/90 p-8 text-center shadow-2xl">
        <Link to="/home" className="inline-flex items-center gap-2 text-xl font-black tracking-[0.08em]">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white"><Gift className="h-5 w-5" /></span>
          REWARDSVERSE
        </Link>
        <div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
          {state === "loading" && <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />}
          {state === "success" && <CheckCircle2 className="h-8 w-8 text-emerald-500" />}
          {state === "error" && <XCircle className="h-8 w-8 text-red-400" />}
        </div>
        <h1 className="mt-5 text-2xl font-bold">{state === "success" ? "Email verified" : state === "error" ? "Verification failed" : "Verifying email"}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{message}</p>
        <Link to={state === "success" ? "/dashboard" : "/profile"} className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700">
          {state === "success" ? "Go to dashboard" : "Go to profile"}
        </Link>
      </section>
    </main>
  );
}

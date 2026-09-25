import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Info, ShieldCheck, TriangleAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SectionHeading, Surface } from "@/components/shared/RewardUI";

const SCRIPT_ID = "adexium-admin-preview-13554";
const WIDGET_ID = "cb68bc8c-4adc-4225-b98d-7342eff70d28";
const AD_TAG = `<script async src="https://cdn.okiksdelivery.com/assets/js/axm.min.js" data-wid="${WIDGET_ID}" data-format="pops"></script>`;

export default function AdexiumPreviewPage() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [previewLoaded, setPreviewLoaded] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
    else if (!loading && user && !isAdmin) navigate("/dashboard", { replace: true });
  }, [loading, user, isAdmin, navigate]);

  useEffect(() => () => {
    // Remove the tag element when leaving; a full refresh/close ends any code already initialized.
    document.getElementById(SCRIPT_ID)?.remove();
  }, []);

  if (loading || !user || !isAdmin) {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  const loadPreview = () => {
    if (!window.confirm("Load the Adexium pop-under script in this admin-only page? It does not credit RewardsVerse points. Refresh this tab to fully end the preview.")) return;
    if (document.getElementById(SCRIPT_ID)) {
      setPreviewLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = "https://cdn.okiksdelivery.com/assets/js/axm.min.js";
    script.dataset.wid = WIDGET_ID;
    script.dataset.format = "pops";
    document.body.appendChild(script);
    setPreviewLoaded(true);
  };

  const copyTag = async () => {
    await navigator.clipboard.writeText(AD_TAG);
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <SectionHeading
        eyebrow="Restricted · administrator only"
        title="Adexium reference preview"
        description="A private reference page for placement #13554. The ad is not listed in Earn Center and is not available to regular members."
        action={<Link to="/admin" className="focus-ring inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-semibold"><ArrowLeft className="h-3.5 w-3.5" />Admin dashboard</Link>}
      />

      <Surface className="relative overflow-hidden p-5 sm:p-7">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-40 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-white p-3">
              <img src="/assets/provider-logos/adexium.svg" alt="Adexium" className="max-h-full max-w-full object-contain" />
            </div>
            <div>
              <p className="rv-eyebrow">Official publisher placement</p>
              <h2 className="mt-1 font-display text-xl font-semibold">RewardsVerse Main</h2>
              <p className="mt-1 text-sm text-muted-foreground">Web Popunder · placement #13554</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="https://publisher.adexium.io/dashboard/widget/13554/edit/" target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-semibold"><ExternalLink className="h-3.5 w-3.5" />Publisher settings</a>
            <a href="https://docs.adexium.io/publisher/create-widget.html" target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-semibold">Official integration docs <ExternalLink className="h-3.5 w-3.5" /></a>
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border/70 bg-background/70 p-4"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">Format</p><p className="mt-1 text-sm font-semibold">Popunder (pops)</p></div>
          <div className="rounded-xl border border-border/70 bg-background/70 p-4"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">Access</p><p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-emerald-500" />Admins only</p></div>
          <div className="rounded-xl border border-border/70 bg-background/70 p-4"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">Rewards / postback</p><p className="mt-1 text-sm font-semibold">Disabled · no points credited</p></div>
        </div>
      </Surface>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
        <Surface className="p-5 sm:p-6">
          <p className="rv-eyebrow">Manual preview</p>
          <h2 className="mt-1 font-display text-lg font-semibold">Load Adexium for this admin session</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">The official tag is inserted only after you press the button. Adexium controls when a pop-under appears. This page does not attach a user ID, award points, or create a postback.</p>
          <button type="button" onClick={loadPreview} disabled={previewLoaded} className="focus-ring mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:cursor-default disabled:opacity-60">
            {previewLoaded ? "Preview tag loaded" : "Load preview in this tab"}
          </button>
          {previewLoaded && <p className="mt-3 text-xs text-muted-foreground">To fully end the preview, close this tab or refresh it. Leaving the page removes the tag element, but refresh/close is needed to unload code already initialized by the ad script.</p>}
        </Surface>

        <Surface className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 rounded-lg bg-amber-500/10 p-2 text-amber-500"><TriangleAlert className="h-4 w-4" /></span>
            <div>
              <p className="font-semibold">Important policy note</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Adexium warns that incentivized or motivated traffic may lead to a ban or withheld earnings. RewardsVerse is a rewards site, so confirm placement eligibility with Adexium before enabling ads for general visitors.</p>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-border/70 bg-muted/20 p-3 text-xs leading-5 text-muted-foreground"><Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />This provider is intentionally not connected to the offer catalog or postback/reward ledger. The site's existing reward-share defaults are unchanged.</div>
        </Surface>
      </div>

      <Surface className="overflow-hidden">
        <div className="border-b border-border/70 p-5">
          <p className="rv-eyebrow">Publisher tag · reference</p>
          <h2 className="mt-1 font-display text-lg font-semibold">Placement code from Adexium</h2>
        </div>
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <code className="min-w-0 break-all rounded-lg border border-border bg-muted/30 p-3 text-xs leading-6">{AD_TAG}</code>
          <button type="button" onClick={copyTag} className="focus-ring inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-semibold">Copy tag</button>
        </div>
      </Surface>
    </div>
  );
}

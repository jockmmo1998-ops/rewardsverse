import type { MutableRefObject } from 'react';
import { ArrowUpRight, X, Zap } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/RewardUI';

interface EmbeddedOfferDialogProps {
  open: boolean;
  title: string;
  subtitle?: string;
  logoUrl?: string;
  url?: string;
  loading: boolean;
  loadingLabel: string;
  openPageHref?: string;
  emptyTitle: string;
  emptyDescription: string;
  sandbox: string;
  onClose: () => void;
  returnFocusRef: MutableRefObject<HTMLElement | null>;
}

export function EmbeddedOfferDialog({
  open,
  title,
  subtitle,
  logoUrl,
  url,
  loading,
  loadingLabel,
  openPageHref,
  emptyTitle,
  emptyDescription,
  sandbox,
  onClose,
  returnFocusRef,
}: EmbeddedOfferDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent
        showDefaultCloseButton={false}
        className="rv-responsive-iframe-dialog flex min-h-0 flex-col overflow-hidden border border-primary/20 bg-background p-0 shadow-2xl"
        onCloseAutoFocus={(event) => {
          const trigger = returnFocusRef.current;
          if (trigger?.isConnected) {
            event.preventDefault();
            trigger.focus();
          }
          returnFocusRef.current = null;
        }}
      >
        <header className="rv-iframe-dialog-header flex min-h-16 shrink-0 items-center gap-3 border-b border-primary/15 bg-background/95 px-3 py-3 backdrop-blur-md sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-primary/20 bg-primary/10 p-1.5 text-sm font-bold text-primary">
              {logoUrl ? <img src={logoUrl} alt="" className="h-full w-full object-contain" /> : title.slice(0, 1)}
            </span>
            <div className="min-w-0">
              <DialogTitle className="block truncate text-sm font-bold text-foreground sm:text-base">{title}</DialogTitle>
              {subtitle && <p className="mt-1 truncate text-[10px] text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            {openPageHref && (
              <a
                href={openPageHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${title} in a new tab`}
                className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 text-xs font-semibold text-primary transition hover:bg-primary/20"
              >
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">OPEN IN NEW TAB</span>
              </a>
            )}
            <DialogClose asChild>
              <button
                type="button"
                aria-label={`Close ${title}`}
                className="focus-ring grid h-11 w-11 place-items-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </DialogClose>
          </div>
          <DialogDescription className="sr-only">
            Use the close button to return to the offer list. The provider content is embedded below.
          </DialogDescription>
        </header>
        <div className="rv-iframe-dialog-body min-h-0 flex-1 overflow-auto bg-white">
          {loading ? (
            <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-3 text-sm text-muted-foreground" role="status" aria-live="polite">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
              {loadingLabel}
            </div>
          ) : url ? (
            <iframe
              src={url}
              className="block h-full min-h-0 w-full border-0 bg-white"
              title={`${title} provider content`}
              sandbox={sandbox}
            />
          ) : (
            <div className="flex min-h-[240px] h-full items-center justify-center bg-background p-5">
              <EmptyState title={emptyTitle} description={emptyDescription} icon={Zap} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

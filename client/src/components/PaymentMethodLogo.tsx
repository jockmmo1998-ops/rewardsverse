export type PaymentMethod = 'litecoin' | 'binance';
export type PaymentMethodLogoSize = 'small' | 'medium' | 'large';

const paymentMethodDetails: Record<PaymentMethod, { label: string; src: string }> = {
  litecoin: { label: 'Litecoin', src: '/assets/crypto/litecoin.svg' },
  binance: { label: 'Binance', src: '/assets/crypto/binance.svg' },
};

export function resolvePaymentMethod(value: unknown): PaymentMethod | null {
  const normalized = String(value ?? '').toLowerCase();
  if (normalized.includes('litecoin') || /\bltc\b/.test(normalized)) return 'litecoin';
  if (normalized.includes('binance') || /\bbnb\b/.test(normalized)) return 'binance';
  return null;
}

export function PaymentMethodLogo({
  method,
  size = 'medium',
  decorative = false,
  className = '',
}: {
  method: PaymentMethod;
  size?: PaymentMethodLogoSize;
  decorative?: boolean;
  className?: string;
}) {
  const details = paymentMethodDetails[method];
  return (
    <span
      className={`payment-method-logo payment-method-logo--${size} ${className}`.trim()}
      aria-hidden={decorative || undefined}
      title={decorative ? undefined : details.label}
    >
      <img src={details.src} alt={decorative ? '' : `${details.label} logo`} loading="lazy" decoding="async" />
    </span>
  );
}

import { useEffect, useRef, useState } from 'react';

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

export function AnimatedCurrency({ value, className = '' }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value);
  const previous = useRef(value);

  useEffect(() => {
    const from = previous.current;
    const to = Number.isFinite(value) ? value : 0;
    previous.current = to;
    if (Math.abs(to - from) < 0.005) {
      setDisplay(to);
      return;
    }
    const start = performance.now();
    const duration = 520;
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span className={className}>{formatCurrency(display)}</span>;
}

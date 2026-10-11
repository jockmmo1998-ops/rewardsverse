import { Activity } from 'lucide-react';

interface WeeklyProgressPanelProps {
  unavailable: boolean;
  percent: number;
  percentLabel: string;
  totalLabel: string;
  goalLabel: string;
  streak: number;
}

export function WeeklyProgressPanel({
  unavailable,
  percent,
  percentLabel,
  totalLabel,
  goalLabel,
  streak,
}: WeeklyProgressPanelProps) {
  const radius = 37;
  const circumference = 2 * Math.PI * radius;
  const safePercent = Math.max(0, Math.min(100, percent));
  const dash = (circumference * safePercent) / 100;

  return (
    <section className="rv-weekly-panel" aria-label="Your weekly progress">
      <div className="rv-weekly-kicker"><span className="rv-eyebrow"><span className="section-dot" /> YOUR WEEK, VISUALIZED</span><Activity aria-hidden="true" /></div>
      <h2>Small steps<br />still count.</h2>
      <p className="rv-weekly-subtitle">Your current weekly goal, at a glance.</p>
      <div className="rv-weekly-goal-row">
        <div className="rv-weekly-ring" role="img" aria-label={unavailable ? 'Weekly goal data unavailable' : `${percentLabel} of weekly goal`}>
          <svg viewBox="0 0 92 92" aria-hidden="true">
            <circle className="rv-weekly-ring-track" cx="46" cy="46" r={radius} />
            <circle className="rv-weekly-ring-progress" cx="46" cy="46" r={radius} strokeDasharray={`${dash} ${circumference}`} transform="rotate(-90 46 46)" />
          </svg>
          <span className="rv-weekly-ring-copy"><strong>{percentLabel}</strong><small>this week</small></span>
        </div>
        <div className="rv-weekly-goal-amount">
          <span>WEEKLY TARGET</span>
          <strong>{totalLabel} <i>/ {goalLabel}</i></strong>
          <small>{unavailable ? 'Live streak —' : `${streak}-day activity streak`}</small>
        </div>
      </div>
      <footer className="rv-weekly-bottom"><span>Rewards this week</span><strong>{totalLabel}</strong></footer>
    </section>
  );
}

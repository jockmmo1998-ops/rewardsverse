// Bell notification sound using Web Audio API

let audioContext: AudioContext | null = null;

type BrowserWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (audioContext) return audioContext;

  const AudioContextClass = window.AudioContext || (window as BrowserWindow).webkitAudioContext;
  if (!AudioContextClass) return null;

  audioContext = new AudioContextClass();
  return audioContext;
}

/**
 * Unlock/resume audio after a user gesture. Browsers block Web Audio until
 * the page receives a pointer or keyboard interaction.
 */
export const unlockBellSound = async (): Promise<boolean> => {
  try {
    const context = getAudioContext();
    if (!context) return false;
    if (context.state === 'suspended') await context.resume();
    return context.state === 'running';
  } catch (error) {
    console.warn('Failed to unlock bell sound:', error);
    return false;
  }
};

export const playBellSound = async (): Promise<boolean> => {
  try {
    const context = getAudioContext();
    if (!context) return false;

    if (context.state === 'suspended') {
      await context.resume();
    }
    if (context.state !== 'running') return false;

    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(context.destination);

    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.12);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

    osc.start(now);
    osc.stop(now + 0.55);
    return true;
  } catch (error) {
    console.warn('Failed to play bell sound:', error);
    return false;
  }
};

export default playBellSound;

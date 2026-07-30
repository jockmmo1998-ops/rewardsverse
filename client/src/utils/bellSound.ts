// Bell notification sound using Web Audio API
let audioContext: AudioContext | null = null;

export const playBellSound = async () => {
  try {
    // Initialize audio context on first call or reuse existing one
    if (!audioContext) {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      audioContext = new AudioContextClass();
    }
    
    if (!audioContext) {
      throw new Error("Failed to create AudioContext");
    }
    
    // Resume audio context if suspended (required by modern browsers)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    const now = audioContext.currentTime;
    
    // Create oscillator for bell sound
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    // Bell sound parameters - creates a pleasant bell tone
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    osc.start(now);
    osc.stop(now + 0.5);
  } catch (error) {
    console.error("Failed to play bell sound:", error);
  }
};

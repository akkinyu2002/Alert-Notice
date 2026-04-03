let audioContext;

const SOUND_PATTERNS = {
  alert: [
    { freq: 880, duration: 0.08, gap: 0.05, type: 'triangle' },
    { freq: 660, duration: 0.09, gap: 0.05, type: 'triangle' },
    { freq: 990, duration: 0.12, gap: 0.02, type: 'sawtooth' },
  ],
  notification: [
    { freq: 740, duration: 0.07, gap: 0.03, type: 'sine' },
    { freq: 1040, duration: 0.09, gap: 0.02, type: 'sine' },
  ],
};

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioContext) audioContext = new Ctx();
  return audioContext;
}

function scheduleTone(ctx, start, tone, volume) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = tone.type || 'sine';
  osc.frequency.setValueAtTime(tone.freq, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(start);
  osc.stop(start + tone.duration + 0.03);
}

export async function playAlertSound(kind = 'alert') {
  try {
    const ctx = getAudioContext();
    const pattern = SOUND_PATTERNS[kind] || SOUND_PATTERNS.alert;
    if (!ctx || pattern.length === 0) return false;

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    let cursor = ctx.currentTime + 0.01;
    const volume = kind === 'notification' ? 0.05 : 0.07;

    for (const tone of pattern) {
      scheduleTone(ctx, cursor, tone, volume);
      cursor += tone.duration + (tone.gap ?? 0.04);
    }

    return true;
  } catch {
    return false;
  }
}

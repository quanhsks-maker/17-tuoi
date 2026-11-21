class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    // Giữ lại để tương thích với các chỗ gọi sound.init()
  }

  getContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    return this.ctx;
  }

  beep(freq, duration, type = 'sine', volume = 0.28, delay = 0) {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const play = () => {
      const now = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(play).catch(() => {});
    } else {
      play();
    }
  }

  playClick() {
    this.beep(520, 0.07, 'triangle', 0.25);
  }

  playCoin() {
    this.beep(880, 0.1, 'sine', 0.3, 0);
    this.beep(1320, 0.18, 'sine', 0.3, 0.08);
  }

  playAlert() {
    this.beep(260, 0.14, 'sawtooth', 0.22, 0);
    this.beep(190, 0.2, 'sawtooth', 0.22, 0.12);
  }

  playSuccess() {
    this.beep(523, 0.1, 'sine', 0.3, 0);
    this.beep(659, 0.1, 'sine', 0.3, 0.09);
    this.beep(784, 0.2, 'sine', 0.32, 0.18);
  }
}

export const sound = new SoundManager();
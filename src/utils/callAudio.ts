// Synthesized sound effects using Web Audio API (Zero external assets needed, works reliably offline)

class CallAudioManager {
  private audioCtx: AudioContext | null = null;
  private ringbackInterval: any = null;
  private incomingInterval: any = null;

  private getAudioContext(): AudioContext | null {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  // Caller side: Standard telephone ringback tone (440Hz + 480Hz beep for 1.8s every 3.5s)
  public startRingbackTone() {
    this.stopAll();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const playOneRing = () => {
      try {
        if (!this.audioCtx || this.audioCtx.state === 'closed') return;
        const now = this.audioCtx.currentTime;

        const osc1 = this.audioCtx.createOscillator();
        const osc2 = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(440, now);
        osc2.frequency.setValueAtTime(480, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.setValueAtTime(0.08, now + 1.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 2.0);
        osc2.stop(now + 2.0);
      } catch {}
    };

    playOneRing();
    this.ringbackInterval = setInterval(playOneRing, 3500);
  }

  // Callee side: Cheerful melodic incoming call chime
  public startIncomingRingtone() {
    this.stopAll();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const notes = [
      { freq: 523.25, time: 0, dur: 0.15 },    // C5
      { freq: 659.25, time: 0.16, dur: 0.15 }, // E5
      { freq: 783.99, time: 0.32, dur: 0.2 },  // G5
      { freq: 1046.50, time: 0.54, dur: 0.3 }, // C6
      { freq: 783.99, time: 0.9, dur: 0.15 },  // G5
      { freq: 1046.50, time: 1.08, dur: 0.4 }, // C6
    ];

    const playMelody = () => {
      try {
        if (!this.audioCtx || this.audioCtx.state === 'closed') return;
        const base = this.audioCtx.currentTime;

        notes.forEach((n) => {
          if (!this.audioCtx) return;
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(n.freq, base + n.time);

          gain.gain.setValueAtTime(0.12, base + n.time);
          gain.gain.exponentialRampToValueAtTime(0.001, base + n.time + n.dur);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start(base + n.time);
          osc.stop(base + n.time + n.dur);
        });
      } catch {}
    };

    playMelody();
    this.incomingInterval = setInterval(playMelody, 2200);
  }

  // Call ended / rejected: 3 rapid busy beeps
  public playCallEndedTone() {
    this.stopAll();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [0, 0.2, 0.4].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(425, now + offset);

        gain.gain.setValueAtTime(0.12, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.13);
      });
    } catch {}
  }

  public stopAll() {
    if (this.ringbackInterval) {
      clearInterval(this.ringbackInterval);
      this.ringbackInterval = null;
    }
    if (this.incomingInterval) {
      clearInterval(this.incomingInterval);
      this.incomingInterval = null;
    }
  }
}

export const callAudio = new CallAudioManager();

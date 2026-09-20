// Wedding Audio Player - Reliable HTML5 Audio Management

const AUDIO_SRC = '/assets/wedding_song.mp3';

class WeddingAudioPlayer {
  private audioEl: HTMLAudioElement | null = null;
  private isPlayingState: boolean = false;
  private listeners: Array<() => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.getOrCreateAudioElement();
    }
  }

  public getOrCreateAudioElement(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;

    if (!this.audioEl) {
      let el = document.getElementById('wedding-audio-element') as (HTMLAudioElement & { _weddingListenersAttached?: boolean }) | null;
      if (!el) {
        el = document.createElement('audio') as HTMLAudioElement & { _weddingListenersAttached?: boolean };
        el.id = 'wedding-audio-element';
        el.src = AUDIO_SRC;
        el.preload = 'auto';
        el.loop = true;
        (el as any).playsInline = true;
        el.style.display = 'none';
        document.body.appendChild(el);
      }
      this.audioEl = el;

      // Prevent event listener accumulation during React re-renders or Fast Refresh
      if (!el._weddingListenersAttached) {
        el._weddingListenersAttached = true;

        el.addEventListener('play', () => {
          this.isPlayingState = true;
          this.notify();
        });

        el.addEventListener('pause', () => {
          this.isPlayingState = false;
          this.notify();
        });

        el.addEventListener('ended', () => {
          this.isPlayingState = false;
          this.notify();
        });

        el.addEventListener('canplay', () => {
          this.notify();
        });

        el.addEventListener('error', (e) => {
          console.warn('Wedding audio encountered error:', e);
          this.isPlayingState = false;
          this.notify();
        });
      }
    }

    return this.audioEl;
  }

  public cleanup() {
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.remove();
      this.audioEl = null;
    }
    this.listeners = [];
    this.isPlayingState = false;
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error('Audio listener error:', e);
      }
    });
  }

  /**
   * CRITICAL AUTOPLAY COMPLIANCE:
   * audio.play() is initiated SYNCHRONOUSLY within the user gesture handler (before any await/setTimeout).
   */
  public play(): Promise<boolean> {
    const audio = this.getOrCreateAudioElement();
    if (!audio) return Promise.resolve(false);

    audio.muted = false;
    audio.volume = 1.0;

    // Call play() synchronously directly inside the user gesture
    const promise = audio.play();

    if (promise !== undefined) {
      return promise
        .then(() => {
          this.isPlayingState = true;
          this.notify();
          return true;
        })
        .catch((err) => {
          console.warn('Audio play was deferred or blocked by browser:', err?.name || err);
          this.isPlayingState = false;
          this.notify();
          return false;
        });
    } else {
      this.isPlayingState = !audio.paused;
      this.notify();
      return Promise.resolve(this.isPlayingState);
    }
  }

  public pause() {
    if (this.audioEl) {
      this.audioEl.pause();
    }
    this.isPlayingState = false;
    this.notify();
  }

  public togglePlay(): Promise<boolean> {
    if (this.isPlayingState) {
      this.pause();
      return Promise.resolve(false);
    } else {
      return this.play();
    }
  }

  public isPlaying(): boolean {
    return this.isPlayingState;
  }

  public getMuted(): boolean {
    return !this.isPlayingState;
  }

  public setMuted(muted: boolean) {
    if (muted) {
      this.pause();
    } else {
      this.play();
    }
  }
}

export const weddingAudio = new WeddingAudioPlayer();

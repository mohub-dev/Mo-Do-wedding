// Wedding Audio Player - Plays automatically on envelope opening

const DB_NAME = 'wedding_invitation_audio_db';
const STORE_NAME = 'audio_files';
const AUDIO_KEY = 'wedding_song';

// Candidate paths where user's audio file may be located
const AUDIO_CANDIDATES = [
  '/wedding_song.mp3',
  '/assets/wedding_song.mp3',
  '/wedding_song.wav',
  '/assets/wedding_song.wav',
  '/wedding_song.m4a',
  '/assets/wedding_song.m4a',
  '/wedding_song.aac',
  '/assets/wedding_song.aac',
  '/wedding_song.ogg',
  '/assets/wedding_song.ogg',
  '/wedding_audio.mp3',
  '/assets/wedding_audio.mp3',
  '/song.mp3',
  '/assets/song.mp3',
  '/audio.mp3',
  '/assets/audio.mp3',
];

class WeddingAudioPlayer {
  private audioEl: HTMLAudioElement | null = null;
  private isMutedState: boolean = false;
  private isPlayingState: boolean = true; // Enabled and active by default
  private listeners: Array<() => void> = [];
  private activeSource: string = '/assets/wedding_song.mp3';
  private autoStartTriggered: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioEl = new Audio();
      this.audioEl.loop = true;
      this.audioEl.preload = 'auto';
      this.audioEl.src = this.activeSource;

      this.audioEl.addEventListener('play', () => {
        this.isPlayingState = true;
        this.isMutedState = false;
        this.notify();
      });
      this.audioEl.addEventListener('pause', () => {
        // If it was paused manually
        if (this.isMutedState) {
          this.isPlayingState = false;
        }
        this.notify();
      });
      this.audioEl.addEventListener('ended', () => {
        this.isPlayingState = false;
        this.notify();
      });

      this.initAudioSource();
      this.setupAutoStart();
    }
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public setupAutoStart() {
    if (typeof window === 'undefined' || this.autoStartTriggered) return;
    this.autoStartTriggered = true;

    // 1. Attempt immediate play (will succeed if browser allows unprompted audio)
    this.play();

    // 2. Add universal listeners so if the browser blocked autoplay, the first click/tap plays it
    const handleFirstGesture = () => {
      if (!this.isMutedState) {
        this.play();
      }
      removeListeners();
    };

    const removeListeners = () => {
      ['click', 'touchstart', 'touchend', 'mousedown', 'keydown', 'scroll'].forEach((event) => {
        window.removeEventListener(event, handleFirstGesture, { capture: true });
      });
    };

    ['click', 'touchstart', 'touchend', 'mousedown', 'keydown', 'scroll'].forEach((event) => {
      window.addEventListener(event, handleFirstGesture, { capture: true, once: true });
    });
  }

  private async openDB(): Promise<IDBDatabase | null> {
    if (typeof indexedDB === 'undefined') return null;
    return new Promise((resolve) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
  }

  private async initAudioSource() {
    // 1. Check IndexedDB first
    try {
      const db = await this.openDB();
      if (db) {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const getReq = store.get(AUDIO_KEY);
        getReq.onsuccess = () => {
          const file = getReq.result;
          if (file instanceof Blob && this.audioEl) {
            this.activeSource = URL.createObjectURL(file);
            this.audioEl.src = this.activeSource;
            this.notify();
            return;
          }
          this.checkCandidateFiles();
        };
        getReq.onerror = () => this.checkCandidateFiles();
      } else {
        this.checkCandidateFiles();
      }
    } catch {
      this.checkCandidateFiles();
    }
  }

  private async checkCandidateFiles() {
    for (const url of AUDIO_CANDIDATES) {
      try {
        const res = await fetch(url, { method: 'HEAD' });
        if (res.ok && this.audioEl) {
          this.activeSource = url;
          this.audioEl.src = url;
          this.notify();
          return;
        }
      } catch {
        // continue checking next candidate
      }
    }

    // Default target path where the user places the file
    if (this.audioEl && !this.activeSource) {
      this.activeSource = '/assets/wedding_song.mp3';
      this.audioEl.src = this.activeSource;
    }
  }

  // Play immediately upon envelope opening user gesture
  public play() {
    this.isMutedState = false;
    if (this.audioEl) {
      this.audioEl.muted = false;
      const playPromise = this.audioEl.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isPlayingState = true;
            this.notify();
          })
          .catch((err) => {
            console.warn('Audio playback attempt:', err);
          });
      }
    }
  }

  public pause() {
    if (this.audioEl) {
      this.audioEl.pause();
    }
    this.isPlayingState = false;
    this.notify();
  }

  public togglePlay() {
    if (this.isPlayingState) {
      this.pause();
    } else {
      this.play();
    }
  }

  public setMuted(muted: boolean) {
    this.isMutedState = muted;
    if (this.audioEl) {
      this.audioEl.muted = muted;
    }
    if (muted) {
      this.pause();
    } else {
      this.play();
    }
    this.notify();
  }

  public getMuted(): boolean {
    return this.isMutedState;
  }

  public isPlaying(): boolean {
    return this.isPlayingState;
  }
}

export const weddingAudio = new WeddingAudioPlayer();

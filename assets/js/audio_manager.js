export default class AudioManager {
    constructor() {
        this.enabled = true;
        this.audioCtx = null;
    }

    init() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    playTone(freq, type, duration, vol = 0.1) {
        if (!this.enabled) return;
        this.init();

        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

        gainNode.gain.setValueAtTime(vol, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        oscillator.start();
        oscillator.stop(this.audioCtx.currentTime + duration);
    }

    playSlide() {
        // A low, short swoosh for moving
        if (!this.enabled) return;
        this.init();
        
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(150, this.audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioCtx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(this.audioCtx.currentTime + 0.1);
    }

    playMerge() {
        // A pleasant pop for merging (mid frequency)
        this.playTone(400, 'sine', 0.15, 0.1);
        setTimeout(() => this.playTone(600, 'sine', 0.15, 0.1), 50);
    }

    playBonus() {
        // A higher, celebratory sound for reaching 512, 1024, etc.
        this.playTone(523.25, 'triangle', 0.2, 0.15); // C5
        setTimeout(() => this.playTone(659.25, 'triangle', 0.2, 0.15), 100); // E5
        setTimeout(() => this.playTone(783.99, 'triangle', 0.4, 0.15), 200); // G5
    }

    playWin() {
        // Arpeggio for 2048!
        this.playTone(523.25, 'square', 0.2, 0.1); // C5
        setTimeout(() => this.playTone(659.25, 'square', 0.2, 0.1), 150); // E5
        setTimeout(() => this.playTone(783.99, 'square', 0.2, 0.1), 300); // G5
        setTimeout(() => this.playTone(1046.50, 'square', 0.6, 0.1), 450); // C6
    }
}

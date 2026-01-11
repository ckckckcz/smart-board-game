'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useGameStore } from './useGameStore';

// Sound frequencies for different events
const SOUND_CONFIG = {
    click: {
        frequency: 800,
        duration: 0.1,
        type: 'sine' as OscillatorType,
        volume: 0.3,
    },
    correct: {
        frequencies: [523.25, 659.25, 783.99], // C5, E5, G5 - happy chord
        duration: 1.5, // Extended duration for longer sound
        type: 'sine' as OscillatorType,
        volume: 0.3,
    },
    wrong: {
        frequencies: [200, 150], // Low descending tones
        duration: 1.5, // Extended duration for longer sound
        type: 'square' as OscillatorType,
        volume: 0.25,
    },
    finish: {
        frequencies: [523.25, 659.25, 783.99, 1046.50], // C5, E5, G5, C6 - victory fanfare
        duration: 0.18,
        type: 'sine' as OscillatorType,
        volume: 0.35,
    },
    applause: {
        duration: 3, // 3 seconds of applause
        clapCount: 40, // Number of clap sounds
        volume: 0.4,
    },
};

// Note: BGM is handled by HTML audio element in game/page.tsx

export function useSoundEffects() {
    const { isSoundEnabled } = useGameStore();
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioUnlockedRef = useRef(false);

    // Initialize AudioContext with iOS unlock
    const initAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }

        // iOS unlock: play a silent buffer to unlock audio
        if (!audioUnlockedRef.current && audioContextRef.current) {
            const buffer = audioContextRef.current.createBuffer(1, 1, 22050);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);
            source.start(0);
            audioUnlockedRef.current = true;
        }

        return audioContextRef.current;
    }, []);

    // Play a single tone
    const playTone = useCallback((frequency: number, duration: number, type: OscillatorType, volume: number, startTime: number = 0) => {
        const ctx = initAudioContext();
        if (!ctx) return;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);

        // Envelope for smoother sound
        gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
        gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + startTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + startTime + duration);

        oscillator.start(ctx.currentTime + startTime);
        oscillator.stop(ctx.currentTime + startTime + duration + 0.1);
    }, [initAudioContext]);

    // Play click sound when starting a question
    const playClickSound = useCallback(() => {
        if (!isSoundEnabled) return;
        const config = SOUND_CONFIG.click;
        playTone(config.frequency, config.duration, config.type, config.volume);
    }, [isSoundEnabled, playTone]);

    // Play correct answer sound (happy chord)
    const playCorrectSound = useCallback(() => {
        if (!isSoundEnabled) return;

        // Play happy tones
        const config = SOUND_CONFIG.correct;
        config.frequencies.forEach((freq: number, index: number) => {
            playTone(freq, config.duration, config.type, config.volume, index * 0.06);
        });
    }, [isSoundEnabled, playTone]);

    // Play wrong answer sound (sad tones)
    const playWrongSound = useCallback(() => {
        if (!isSoundEnabled) return;

        // Play sad tones
        const config = SOUND_CONFIG.wrong;
        config.frequencies.forEach((freq: number, index: number) => {
            playTone(freq, config.duration, config.type, config.volume, index * 0.12);
        });
    }, [isSoundEnabled, playTone]);

    // Play finish/victory sound
    const playFinishSound = useCallback(() => {
        if (!isSoundEnabled) return;

        // Play victory fanfare
        const config = SOUND_CONFIG.finish;
        config.frequencies.forEach((freq: number, index: number) => {
            playTone(freq, config.duration, config.type, config.volume, index * 0.1);
        });
    }, [isSoundEnabled, playTone]);

    // Play applause sound - simulated clapping sounds
    const playApplauseSound = useCallback(() => {
        if (!isSoundEnabled) return;

        const ctx = initAudioContext();
        if (!ctx) return;

        const config = SOUND_CONFIG.applause;

        // Create multiple clap sounds with random timing
        for (let i = 0; i < config.clapCount; i++) {
            const startTime = Math.random() * config.duration * 0.8; // Random start within duration
            const clapDuration = 0.03 + Math.random() * 0.02; // Short clap sound

            // Create noise-based clap sound using oscillator with high frequency
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            const filterNode = ctx.createBiquadFilter();

            // Use white noise simulation with square wave
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime + startTime);

            // High-pass filter for clap-like sound
            filterNode.type = 'highpass';
            filterNode.frequency.setValueAtTime(1000, ctx.currentTime);

            oscillator.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(ctx.destination);

            // Quick attack and decay for clap sound
            const volume = config.volume * (0.3 + Math.random() * 0.7); // Random volume variation
            gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
            gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + startTime + 0.005);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + clapDuration);

            oscillator.start(ctx.currentTime + startTime);
            oscillator.stop(ctx.currentTime + startTime + clapDuration + 0.1);
        }

        // Also play some victory chord notes scattered throughout
        const chordNotes = [523.25, 659.25, 783.99, 1046.50];
        chordNotes.forEach((freq, index) => {
            playTone(freq, 2, 'sine', 0.15, index * 0.2);
        });
    }, [isSoundEnabled, initAudioContext, playTone]);

    const { toggleSound } = useGameStore();

    return {
        isSoundEnabled,
        toggleSound,
        playClickSound,
        playCorrectSound,
        playWrongSound,
        playFinishSound,
        playApplauseSound
    };
}

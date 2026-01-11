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
        duration: 0.12,
        type: 'sine' as OscillatorType,
        volume: 0.3,
    },
    wrong: {
        frequencies: [200, 150], // Low descending tones
        duration: 0.15,
        type: 'square' as OscillatorType,
        volume: 0.25,
    },
    finish: {
        frequencies: [523.25, 659.25, 783.99, 1046.50], // C5, E5, G5, C6 - victory fanfare
        duration: 0.18,
        type: 'sine' as OscillatorType,
        volume: 0.35,
    },
};

// Singleton BGM instance to avoid multiple instances and recreation issues
let globalBgm: HTMLAudioElement | null = null;

export function useSoundEffects() {
    const { isSoundEnabled } = useGameStore();
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initialize AudioContext
    const initAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
        return audioContextRef.current;
    }, []);

    // Initialize BGM as a singleton
    useEffect(() => {
        if (typeof window !== 'undefined' && !globalBgm) {
            globalBgm = new Audio('/song/0111.MP3');
            globalBgm.loop = true;
            globalBgm.volume = isSoundEnabled ? 0.4 : 0;
        }
    }, [isSoundEnabled]);

    // Update global BGM volume when sound toggle changes
    useEffect(() => {
        if (globalBgm) {
            globalBgm.volume = isSoundEnabled ? 0.4 : 0;
            globalBgm.loop = true; // Reinforce loop

            // If sound is enabled and it was paused (e.g. by autoplay block), try to play it
            if (isSoundEnabled && globalBgm.paused) {
                globalBgm.play().catch(() => { });
            }
        }
    }, [isSoundEnabled]);

    const playBgm = useCallback(() => {
        initAudioContext();
        if (globalBgm) {
            globalBgm.play().catch(err => {
                console.log('BGM playback failed:', err);
                // Fallback: try to play on next user interaction if failed
                const playOnState = () => {
                    globalBgm?.play().catch(() => { });
                    window.removeEventListener('click', playOnState);
                    window.removeEventListener('touchstart', playOnState);
                };
                window.addEventListener('click', playOnState);
                window.addEventListener('touchstart', playOnState);
            });
        }
    }, [initAudioContext]);

    const stopBgm = useCallback(() => {
        if (globalBgm) {
            globalBgm.pause();
            globalBgm.currentTime = 0;
        }
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

    const { toggleSound } = useGameStore();

    return {
        isSoundEnabled,
        toggleSound,
        playClickSound,
        playCorrectSound,
        playWrongSound,
        playFinishSound,
        playBgm,
        stopBgm
    };
}

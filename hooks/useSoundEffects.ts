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

export function useSoundEffects() {
    const { isSoundEnabled, toggleSound } = useGameStore();
    const audioContextRef = useRef<AudioContext | null>(null);
    const speechSynthRef = useRef<SpeechSynthesis | null>(null);

    // Initialize AudioContext and SpeechSynthesis
    const initAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return audioContextRef.current;
    }, []);

    const initSpeechSynth = useCallback(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            speechSynthRef.current = window.speechSynthesis;
        }
        return speechSynthRef.current;
    }, []);

    // Initialize speech synthesis on mount
    useEffect(() => {
        initSpeechSynth();
    }, [initSpeechSynth]);

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

    // Speak text using Speech Synthesis
    const speak = useCallback((text: string, pitch: number = 1, rate: number = 1) => {
        const synth = speechSynthRef.current || initSpeechSynth();
        if (!synth) return;

        // Cancel any ongoing speech
        synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID'; // Indonesian
        utterance.pitch = pitch; // 0-2, default 1
        utterance.rate = rate; // 0.1-10, default 1
        utterance.volume = 1;

        // Try to find Indonesian voice, fallback to default
        const voices = synth.getVoices();
        const indonesianVoice = voices.find(v => v.lang.includes('id')) ||
            voices.find(v => v.lang.includes('en')) ||
            voices[0];
        if (indonesianVoice) {
            utterance.voice = indonesianVoice;
        }

        synth.speak(utterance);
    }, [initSpeechSynth]);

    // Play click sound when starting a question
    const playClickSound = useCallback(() => {
        if (!isSoundEnabled) return;
        const config = SOUND_CONFIG.click;
        playTone(config.frequency, config.duration, config.type, config.volume);
    }, [isSoundEnabled, playTone]);

    // Play correct answer sound (happy chord + speech)
    const playCorrectSound = useCallback(() => {
        if (!isSoundEnabled) return;

        // Play happy tones
        const config = SOUND_CONFIG.correct;
        config.frequencies.forEach((freq: number, index: number) => {
            playTone(freq, config.duration, config.type, config.volume, index * 0.06);
        });

        // Speak "Benar!" with high pitch (happy tone)
        setTimeout(() => {
            speak('Benar!', 1.3, 1.1);
        }, 150);
    }, [isSoundEnabled, playTone, speak]);

    // Play wrong answer sound (sad tones + speech)
    const playWrongSound = useCallback(() => {
        if (!isSoundEnabled) return;

        // Play sad tones
        const config = SOUND_CONFIG.wrong;
        config.frequencies.forEach((freq: number, index: number) => {
            playTone(freq, config.duration, config.type, config.volume, index * 0.12);
        });

        // Speak \"Salah!\" with lower pitch (sad tone)
        setTimeout(() => {
            speak('Salah', 0.8, 0.9);
        }, 200);
    }, [isSoundEnabled, playTone, speak]);

    // Play finish/victory sound with speech
    const playFinishSound = useCallback(() => {
        if (!isSoundEnabled) return;

        // Play victory fanfare
        const config = SOUND_CONFIG.finish;
        config.frequencies.forEach((freq: number, index: number) => {
            playTone(freq, config.duration, config.type, config.volume, index * 0.1);
        });

        // Speak congratulations
        setTimeout(() => {
            speak('Selamat! Kamu sudah selesai!', 1.2, 1.0);
        }, 400);
    }, [isSoundEnabled, playTone, speak]);

    return {
        isSoundEnabled,
        toggleSound,
        playClickSound,
        playCorrectSound,
        playWrongSound,
        playFinishSound,
    };
}

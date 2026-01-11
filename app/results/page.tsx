'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trophy, Medal, RotateCcw, Home, CheckCircle, XCircle, Target } from 'lucide-react';
import { useGameStore } from '@/hooks/useGameStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import ConfettiAnimation from '@/components/ui/confentti';
import styles from '../common.module.css';

export default function ResultsPage() {
    const router = useRouter();
    const { player, currentRound, leaderboard, resetGame } = useGameStore();
    const [mounted, setMounted] = useState(false);
    const { playApplauseSound, isSoundEnabled } = useSoundEffects();
    const hasPlayedApplause = useRef(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Play applause sound when results page loads
    useEffect(() => {
        if (mounted && player && !hasPlayedApplause.current) {
            // Small delay to ensure audio context is ready
            const timer = setTimeout(() => {
                playApplauseSound();
                hasPlayedApplause.current = true;
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [mounted, player, playApplauseSound]);

    useEffect(() => {
        if (!player) {
            router.replace('/');
        }
    }, [player, router]);

    const handlePlayAgain = () => {
        resetGame();
        router.replace('/');
    };

    if (!player) return null;

    // Use a Map to deduplicate by id just in case there are duplicates in the data
    const uniqueLeaderboard = Array.from(
        new Map(leaderboard.map(p => [p.id, p])).values()
    );

    const topPlayers = uniqueLeaderboard
        .filter(p => p.roundId === currentRound?.id)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Show more players if needed, or keep at 5

    const getMedalIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Medal className="w-8 h-8 text-yellow-500" />;
            case 2: return <Medal className="w-7 h-7 text-slate-400" />;
            case 3: return <Medal className="w-7 h-7 text-orange-600" />;
            default: return <span style={{ fontWeight: 900, fontSize: '1.2rem' }}>{rank}</span>;
        }
    };

    return (
        <div className={styles.container}>
            <ConfettiAnimation />
            <img src="/assets/background-city-removebg-preview.png" alt="" className={styles.bgCity} />

            <main className={`${styles.glassCard} mt-8 sm:mt-16 mx-auto text-center px-4 sm:px-8`}>
                <div className="relative inline-block mb-4 sm:mb-6">
                    <Trophy className="w-16 h-16 sm:w-24 sm:h-24 text-amber-500" />
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-slate-800 mb-1 leading-tight">HASIL SKOR</h1>
                <p className="text-base sm:text-xl font-extrabold text-blue-600 mb-6 sm:mb-8 uppercase tracking-wide">
                    BABAK: {currentRound?.name}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
                    <div className="bg-emerald-50 border-2 sm:border-[3px] border-emerald-500 rounded-2xl p-2 sm:p-6 flex flex-col items-center">
                        <CheckCircle className="w-5 h-5 sm:w-8 sm:h-8 text-emerald-600 mb-1 sm:mb-2" />
                        <div className="text-xl sm:text-3xl font-black">{player.correctAnswers}</div>
                        <div className="text-[10px] sm:text-xs font-black uppercase text-emerald-700">Benar</div>
                    </div>
                    <div className="bg-rose-50 border-2 sm:border-[3px] border-rose-500 rounded-2xl p-2 sm:p-6 flex flex-col items-center">
                        <XCircle className="w-5 h-5 sm:w-8 sm:h-8 text-rose-600 mb-1 sm:mb-2" />
                        <div className="text-xl sm:text-3xl font-black">{player.wrongAnswers}</div>
                        <div className="text-[10px] sm:text-xs font-black uppercase text-rose-700">Salah</div>
                    </div>
                    <div className="bg-amber-50 border-2 sm:border-[3px] border-amber-500 rounded-2xl p-2 sm:p-6 flex flex-col items-center">
                        <Target className="w-5 h-5 sm:w-8 sm:h-8 text-amber-600 mb-1 sm:mb-2" />
                        <div className="text-xl sm:text-3xl font-black">{player.score}</div>
                        <div className="text-[10px] sm:text-xs font-black uppercase text-amber-700">Skor</div>
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="bg-white rounded-3xl border-2 sm:border-[3px] border-slate-200 p-4 sm:p-6 mb-6 sm:mb-8 shadow-inner">
                    <h2 className="text-lg sm:text-xl font-black mb-4 uppercase tracking-wider text-slate-700">Papan Peringkat</h2>
                    <div className="flex flex-col gap-2">
                        {topPlayers.map((p, index) => (
                            <div
                                key={p.id}
                                className={`
                                    flex items-center gap-3 p-2 sm:p-3 rounded-xl transition-all
                                    ${p.id === player.id ? 'bg-blue-100 border-2 border-blue-500 ring-2 ring-blue-200' : 'bg-slate-50 border border-slate-100'}
                                `}
                            >
                                <div className="w-8 sm:w-10 flex-shrink-0 flex justify-center">
                                    {getMedalIcon(index + 1)}
                                </div>
                                <div className="flex-1 text-left font-black text-sm sm:text-lg truncate text-slate-800">
                                    {p.name} {p.id === player.id && <span className="text-blue-600 text-[10px] sm:text-xs ml-1">(KAMU)</span>}
                                </div>
                                <div className="font-black text-base sm:text-xl text-blue-600 mr-1">
                                    {p.score}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                    <button
                        onClick={handlePlayAgain}
                        className={`${styles.btn} w-full py-4 sm:py-0 h-14 sm:h-16 text-sm sm:text-base`}
                    >
                        <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 mr-2" /> MAIN LAGI
                    </button>
                    <Link href="/" className="w-full">
                        <button
                            className={`${styles.btn} ${styles.btnSecondary} w-full py-4 sm:py-0 h-14 sm:h-16 text-sm sm:text-base`}
                        >
                            <Home className="w-5 h-5 sm:w-6 sm:h-6 mr-2" /> MENU UTAMA
                        </button>
                    </Link>
                </div>
            </main>

            <img src="/assets/streets-removebg-preview.png" alt="" className={styles.street} />
            <div className={styles.bottomStrip} />
        </div>
    );
}

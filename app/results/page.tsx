'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trophy, Medal, RotateCcw, Home, CheckCircle, XCircle, Target, Sparkles, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/hooks/useGameStore';
import DecorativeElements from '@/components/react-bits/background';
import { Badge } from '@/components/ui/badge';
import ConfettiAnimation from '@/components/ui/confentti';

export default function ResultsPage() {
    const router = useRouter();
    const { player, currentRound, leaderboard, resetGame } = useGameStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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

    // Get top 5 players for leaderboard
    const topPlayers = leaderboard
        .filter(p => p.roundId === currentRound?.id)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    // Find current player rank
    const playerRank = leaderboard
        .filter(p => p.roundId === currentRound?.id)
        .sort((a, b) => b.score - a.score)
        .findIndex(p => p.id === player.id) + 1;

    const getMedalIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Medal className="w-6 h-6 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />;
            case 2:
                return <Medal className="w-5 h-5 text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]" />;
            case 3:
                return <Medal className="w-5 h-5 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" />;
            default:
                return <span className="w-6 h-6 flex items-center justify-center text-slate-500 font-bold">{rank}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden font-sans text-slate-200 flex items-center justify-center p-4">
            <ConfettiAnimation />

            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0 opacity-40">
                <DecorativeElements />
            </div>
            {/* Radial Gradient Overlay */}
            <div className="absolute inset-0 z-0 bg-radial-[circle_at_center,_var(--tw-gradient-stops)] from-transparent via-slate-950/60 to-slate-950 pointer-events-none" />

            <div className={`relative z-10 w-full max-w-3xl transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

                {/* Main Glass Card */}
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">

                    {/* Header: Trophy & Title */}
                    <div className="relative pt-10 pb-6 text-center bg-gradient-to-b from-indigo-500/10 to-transparent">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

                        <div className="relative inline-block mb-4">
                            <div className="absolute inset-0 bg-amber-400 blur-3xl opacity-20 rounded-full" />
                            <Trophy className="relative z-10 w-20 h-20 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] animate-bounce-soft" />
                            <Sparkles className="absolute -top-2 -right-4 w-8 h-8 text-yellow-200 animate-pulse" />
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                            Hasil Permainan
                        </h1>
                        <p className="text-slate-400 font-medium">
                            Round: <span className="text-indigo-400 font-bold">{currentRound?.name}</span>
                        </p>
                    </div>

                    <div className="px-6 md:px-10 pb-10">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8">
                            {/* Correct */}
                            <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-2xl p-4 text-center hover:bg-emerald-900/30 transition-colors group">
                                <div className="w-10 h-10 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                </div>
                                <p className="text-3xl font-black text-white">{player.correctAnswers}</p>
                                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Benar</p>
                            </div>

                            {/* Wrong */}
                            <div className="bg-rose-900/20 border border-rose-500/20 rounded-2xl p-4 text-center hover:bg-rose-900/30 transition-colors group">
                                <div className="w-10 h-10 mx-auto bg-rose-500/10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <XCircle className="w-5 h-5 text-rose-400" />
                                </div>
                                <p className="text-3xl font-black text-white">{player.wrongAnswers}</p>
                                <p className="text-xs font-bold text-rose-400 uppercase tracking-wider">Salah</p>
                            </div>

                            {/* Score */}
                            <div className="bg-amber-900/20 border border-amber-500/20 rounded-2xl p-4 text-center hover:bg-amber-900/30 transition-colors group relative overflow-hidden">
                                <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-10 h-10 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform relative z-10">
                                    <Target className="w-5 h-5 text-amber-400" />
                                </div>
                                <p className="text-3xl font-black text-white relative z-10">{player.score}</p>
                                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider relative z-10">Total Skor</p>
                            </div>
                        </div>

                        {/* Leaderboard Section */}
                        <div className="bg-black/20 rounded-2xl overflow-hidden border border-white/5 mb-8">
                            <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                                    <Trophy className="w-4 h-4 text-indigo-400" />
                                    Papan Peringkat
                                </h2>
                                {playerRank > 0 && playerRank <= 5 && (
                                    <Badge className="bg-indigo-500 text-white hover:bg-indigo-600 border-0">
                                        Rank #{playerRank}
                                    </Badge>
                                )}
                            </div>

                            <div className="divide-y divide-white/5">
                                {topPlayers.length > 0 ? (
                                    topPlayers.map((p, index) => {
                                        const isCurrentPlayer = p.id === player.id;
                                        return (
                                            <div
                                                key={p.id}
                                                className={`flex items-center gap-4 px-6 py-4 transition-colors ${isCurrentPlayer ? 'bg-indigo-500/10' : 'hover:bg-white/5'}`}
                                            >
                                                <div className="flex-shrink-0 w-8 text-center">
                                                    {getMedalIcon(index + 1)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-bold truncate text-sm md:text-base ${isCurrentPlayer ? 'text-indigo-300' : 'text-slate-200'}`}>
                                                        {p.name}
                                                        {isCurrentPlayer && <span className="ml-2 text-xs font-normal text-indigo-400/70">(Kamu)</span>}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-white text-sm md:text-base">{p.score}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase font-semibold">poin</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="px-6 py-8 text-center text-slate-500">
                                        <p>Belum ada data pemain lain.</p>
                                        <p className="text-sm mt-1">Kamu pemain pertama!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <Button
                                onClick={handlePlayAgain}
                                className="flex-1 h-14 text-base font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg cursor-pointer transition-all hover:scale-[1.02]"
                            >
                                <RotateCcw className="w-5 h-5 mr-2" />
                                Main Lagi
                            </Button>

                            <Link href="/" className="flex-1">
                                <Button
                                    variant="outline"
                                    className="w-full h-14 text-base font-bold rounded-xl bg-transparent border-2 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600 cursor-pointer transition-all"
                                >
                                    <Home className="w-5 h-5 mr-2" />
                                    Menu Utama
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
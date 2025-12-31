'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trophy, Medal, RotateCcw, Home, CheckCircle, XCircle, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/hooks/useGameStore';

export default function ResultsPage() {
    const router = useRouter();
    const { player, currentRound, leaderboard, resetGame } = useGameStore();

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

    const getMedalIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Medal className="w-6 h-6 text-yellow-500" />;
            case 2:
                return <Medal className="w-5 h-5 text-slate-400" />;
            case 3:
                return <Medal className="w-5 h-5 text-orange-500" />;
            default:
                return <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">{rank}</span>;
        }
    };

    return (
        <div className="min-h-screen gradient-primary relative flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-accent/20 blur-3xl" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-success/20 blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-2xl animate-slide-up">
                {/* Title */}
                <div className="text-center mb-6">
                    <Trophy className="w-16 h-16 text-accent mx-auto mb-3 animate-bounce-soft" />
                    <h1 className="text-3xl md:text-4xl font-black text-primary-foreground">
                        Hasil Permainan
                    </h1>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-card rounded-2xl p-4 text-center shadow-medium">
                        <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                        <p className="text-3xl font-black text-success">{player.correctAnswers}</p>
                        <p className="text-sm font-medium text-muted-foreground">Benar</p>
                    </div>
                    <div className="bg-card rounded-2xl p-4 text-center shadow-medium">
                        <XCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                        <p className="text-3xl font-black text-destructive">{player.wrongAnswers}</p>
                        <p className="text-sm font-medium text-muted-foreground">Salah</p>
                    </div>
                    <div className="bg-card rounded-2xl p-4 text-center shadow-medium">
                        <Target className="w-8 h-8 text-secondary mx-auto mb-2" />
                        <p className="text-3xl font-black text-secondary">{player.score}</p>
                        <p className="text-sm font-medium text-muted-foreground">Skor</p>
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="bg-card rounded-2xl shadow-medium overflow-hidden mb-6">
                    <div className="bg-secondary/10 px-6 py-4 border-b border-border">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-accent" />
                            Papan Peringkat
                        </h2>
                    </div>

                    <div className="divide-y divide-border">
                        {topPlayers.length > 0 ? (
                            topPlayers.map((p, index) => {
                                const isCurrentPlayer = p.id === player.id;
                                return (
                                    <div
                                        key={p.id}
                                        className={`flex items-center gap-4 px-6 py-4 ${isCurrentPlayer ? 'bg-secondary/10' : ''}`}
                                    >
                                        <div className="flex-shrink-0">
                                            {getMedalIcon(index + 1)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-bold truncate ${isCurrentPlayer ? 'text-secondary' : 'text-foreground'}`}>
                                                {p.name} {isCurrentPlayer && '(Kamu)'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-foreground">{p.score}</p>
                                            <p className="text-xs text-muted-foreground">poin</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="px-6 py-8 text-center text-muted-foreground">
                                <p>Belum ada data pemain lain.</p>
                                <p className="text-sm mt-1">Kamu pemain pertama!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <Button
                        onClick={handlePlayAgain}
                        className="flex-1 h-14 text-lg font-bold rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-lg cursor-pointer"
                    >
                        <RotateCcw className="w-5 h-5 mr-2" />
                        Main Lagi
                    </Button>
                    <Link href="/" className="flex-1">
                        <Button
                            variant="outline"
                            className="w-full h-14 text-lg font-bold rounded-xl bg-card border-2 border-border text-foreground hover:bg-muted"
                        >
                            <Home className="w-5 h-5 mr-2" />
                            Menu Utama
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trophy, Medal, RotateCcw, Home, CheckCircle, XCircle, Target } from 'lucide-react';
import { useGameStore } from '@/hooks/useGameStore';
import ConfettiAnimation from '@/components/ui/confentti';
import styles from '../common.module.css';

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

    const topPlayers = leaderboard
        .filter(p => p.roundId === currentRound?.id)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

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

            <main className={styles.glassCard} style={{ marginTop: '4rem', textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
                    <Trophy className="w-24 h-24 text-amber-500" />
                </div>

                <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem' }}>HASIL SKOR</h1>
                <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0288d1', marginBottom: '2rem' }}>BABAK: {currentRound?.name}</p>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ background: '#e8f5e9', border: '3px solid #4caf50', borderRadius: '20px', padding: '1.5rem' }}>
                        <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                        <div style={{ fontSize: '2rem', fontWeight: 900 }}>{player.correctAnswers}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase' }}>Benar</div>
                    </div>
                    <div style={{ background: '#ffebee', border: '3px solid #f44336', borderRadius: '20px', padding: '1.5rem' }}>
                        <XCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
                        <div style={{ fontSize: '2rem', fontWeight: 900 }}>{player.wrongAnswers}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase' }}>Salah</div>
                    </div>
                    <div style={{ background: '#fff8e1', border: '3px solid #ff9800', borderRadius: '20px', padding: '1.5rem' }}>
                        <Target className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                        <div style={{ fontSize: '2rem', fontWeight: 900 }}>{player.score}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase' }}>Skor</div>
                    </div>
                </div>

                {/* Leaderboard */}
                <div style={{ background: '#fff', borderRadius: '30px', border: '3px solid var(--border)', padding: '1.5rem', marginBottom: '2rem' }} className="border-border">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem', textTransform: 'uppercase' }}>Papan Peringkat</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {topPlayers.map((p, index) => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', background: p.id === player.id ? '#bbdefb' : 'transparent', padding: '0.8rem 1.5rem', borderRadius: '15px', border: p.id === player.id ? '2px solid #0288d1' : 'none' }}>
                                <div style={{ width: '40px' }}>{getMedalIcon(index + 1)}</div>
                                <div style={{ flex: 1, textAlign: 'left', fontWeight: 900, fontSize: '1.2rem' }}>{p.name} {p.id === player.id && "(KAMU)"}</div>
                                <div style={{ fontWeight: 900, fontSize: '1.4rem', color: '#0288d1' }}>{p.score}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={handlePlayAgain} className={styles.btn} style={{ flex: 1, height: '60px' }}>
                        <RotateCcw className="w-6 h-6 mr-2" /> MAIN LAGI
                    </button>
                    <Link href="/" style={{ flex: 1 }}>
                        <button className={`${styles.btn} ${styles.btnSecondary}`} style={{ width: '100%', height: '60px' }}>
                            <Home className="w-6 h-6 mr-2" /> MENU UTAMA
                        </button>
                    </Link>
                </div>
            </main>

            <img src="/assets/streets-removebg-preview.png" alt="" className={styles.street} />
            <div className={styles.bottomStrip} />
        </div>
    );
}

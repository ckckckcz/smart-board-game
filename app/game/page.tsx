'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, X, CheckCircle, Trophy, BarChart3 } from 'lucide-react';
import { useGameStore } from '@/hooks/useGameStore';
import QuestionPopup from '@/components/game/QuestionPopup';
import FeedbackBanner from '@/components/game/FeedbackBanner';
import { Progress } from '@/components/ui/progress';
import styles from '../common.module.css';

export default function GameBoard() {
    const router = useRouter();
    const {
        player,
        currentRound,
        questions,
        currentQuestion,
        currentQuestionIndex,
        answeredQuestions,
        showFeedback,
        gameComplete,
        selectQuestion,
    } = useGameStore();

    const [showCoinPrompt, setShowCoinPrompt] = useState(true);
    const [isSpinning, setIsSpinning] = useState(false);
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!player || !currentRound) {
            router.replace('/');
        }
    }, [player, currentRound, router]);

    useEffect(() => {
        if (gameComplete) {
            router.push('/results');
        }
    }, [gameComplete, router]);

    const handleCoinClick = useCallback(() => {
        if (currentQuestion || showFeedback || isSpinning) return;

        const unansweredIndices = questions
            .map((q, idx) => ({ q, idx }))
            .filter(({ q }) => !answeredQuestions[q.id])
            .map(({ idx }) => idx);

        if (unansweredIndices.length === 0) return;

        setIsSpinning(true);
        setShowCoinPrompt(false);

        let spinCount = 0;
        const maxSpins = 15 + Math.floor(Math.random() * 10);

        const spinInterval = setInterval(() => {
            const randomIdx = unansweredIndices[Math.floor(Math.random() * unansweredIndices.length)];
            setSelectedQuestionIndex(randomIdx);
            spinCount++;

            if (spinCount >= maxSpins) {
                clearInterval(spinInterval);
                const finalIdx = unansweredIndices[Math.floor(Math.random() * unansweredIndices.length)];
                setSelectedQuestionIndex(finalIdx);

                setTimeout(() => {
                    setIsSpinning(false);
                    const question = questions[finalIdx];
                    if (question) {
                        selectQuestion(question.id);
                    }
                }, 500);
            }
        }, 100);
    }, [currentQuestion, showFeedback, isSpinning, questions, answeredQuestions, selectQuestion]);

    if (!player || !currentRound) return null;

    const answeredCount = Object.keys(answeredQuestions).length;
    const progress = (answeredCount / questions.length) * 100;

    return (
        <div className={styles.container}>
            {/* Background Assets */}
            <img src="/assets/background-city-removebg-preview.png" alt="" className={styles.bgCity} />
            <img src="/assets/bird-removebg-preview.png" alt="" className={styles.birds} />
            <img src="/assets/bird-removebg-preview.png" alt="" className={styles.birdsRight} />

            {/* Header / StatusBar */}
            <header className={styles.header} style={{ marginTop: '1rem', width: '95%', maxWidth: '1000px' }}>
                <div className={styles.playerBadge}>
                    <div style={{ background: '#0288d1', padding: '0.8rem', borderRadius: '15px', border: '3px solid var(--border)' }} className="border-border">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <div className={styles.playerName}>{player.name}</div>
                        <div className={styles.roundName}>{currentRound.name}</div>
                    </div>
                </div>

                <div className={styles.statsRow}>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel} style={{ color: '#4caf50' }}>Benar</div>
                        <div className={styles.statValue}>{player.correctAnswers}</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel} style={{ color: '#f44336' }}>Salah</div>
                        <div className={styles.statValue}>{player.wrongAnswers}</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel} style={{ color: '#ff9800' }}>Skor</div>
                        <div className={styles.statValue}>{player.score}</div>
                    </div>
                </div>
            </header>

            {/* Main Content Card */}
            <main className={styles.glassCard} style={{ marginTop: '0.5rem' }}>
                {/* Progress Bar Area */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 900 }}>
                        <span>Progress Soal</span>
                        <span>{answeredCount} / {questions.length}</span>
                    </div>
                    <Progress value={progress} className="h-4 rounded-full bg-white border-2 border-border overflow-hidden [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-cyan-400" />
                </div>

                {/* Tiles Grid */}
                <div className={styles.tileGrid}>
                    {questions.map((q, index) => {
                        const answerResult = answeredQuestions[q.id];
                        const isHighlighted = selectedQuestionIndex === index && isSpinning;

                        // Variasi warna berani (Menghindari Biru & Kuning)
                        const colorVariants = [
                            { class: styles.tilePink, color: '#db2777' },
                            { class: styles.tileGreen, color: '#000080' },
                            { class: styles.tileTeal, color: '#0000FF' },
                            { class: styles.tileRed, color: '#dc2626' },
                            { class: styles.tilePurple, color: '#9333ea' }
                        ];
                        const variant = colorVariants[index % colorVariants.length];

                        return (
                            <div
                                key={q.id}
                                className={`
                                    ${styles.tile}
                                    ${!answerResult && !isHighlighted ? variant.class : ''}
                                    ${answerResult === 'correct' ? styles.tileCorrect : ''}
                                    ${answerResult === 'wrong' ? styles.tileWrong : ''}
                                    ${isHighlighted ? styles.tileActive : ''}
                                `}
                                style={{
                                    backgroundColor: (!answerResult && !isHighlighted) ? variant.color : undefined,
                                    color: (!answerResult && !isHighlighted) ? 'white' : undefined,
                                    borderColor: (!answerResult && !isHighlighted) ? 'rgba(255,255,255,0.2)' : undefined,
                                    opacity: answerResult ? 0.5 : 1,
                                    pointerEvents: answerResult ? 'none' : 'auto',
                                    cursor: answerResult ? 'default' : 'pointer'
                                }}
                            >
                                <div style={{ fontSize: '0.7rem', opacity: 0.8, textTransform: 'uppercase' }}>{q.category}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>#{index + 1}</div>
                                {answerResult === 'correct' && <CheckCircle className="absolute w-20 h-20 opacity-40 text-white" />}
                                {answerResult === 'wrong' && <X className="absolute w-20 h-20 opacity-40 text-white" />}
                            </div>
                        );
                    })}
                </div>

                {/* Action Area */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', minHeight: '180px' }}>
                    {!currentQuestion && !showFeedback && (
                        <>
                            <button
                                onClick={handleCoinClick}
                                disabled={isSpinning}
                                className={styles.btn}
                                style={{ width: '120px', height: '120px', borderRadius: '50%', fontSize: '1.5rem' }}
                            >
                                <Trophy className="w-12 h-12" />
                            </button>
                            {showCoinPrompt && !isSpinning && (
                                <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#01579b', animation: 'bounce 1s infinite' }}>
                                    KLIK UNTUK ACAK SOAL!
                                </div>
                            )}
                            {isSpinning && (
                                <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#0288d1' }}>
                                    MENGUNDI...
                                </div>
                            )}
                        </>
                    )}

                    {showFeedback && (
                        <div style={{ width: '100%' }}>
                            <FeedbackBanner />
                        </div>
                    )}
                </div>
            </main>

            {/* Fixed Assets */}
            <img src="/assets/streets-removebg-preview.png" alt="" className={styles.street} />
            <div className={styles.bottomStrip} />

            {/* Question Popup */}
            {currentQuestion && !showFeedback && <QuestionPopup />}

            <style jsx>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </div>
    );
}

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, X, CheckCircle, Lock, Flag, Volume2, VolumeX } from 'lucide-react';
import { useGameStore } from '@/hooks/useGameStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';
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
        answeredQuestions,
        showFeedback,
        lastAnswerCorrect,
        gameComplete,
        selectQuestion,
        endGame,
    } = useGameStore();

    // Get the set function to clear feedback on mount
    const clearFeedbackOnMount = useCallback(() => {
        useGameStore.setState({ showFeedback: false, lastAnswerCorrect: null });
    }, []);

    const {
        isSoundEnabled,
        toggleSound,
        playClickSound,
        playCorrectSound,
        playWrongSound,
        playFinishSound
    } = useSoundEffects();

    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [prevAnsweredCount, setPrevAnsweredCount] = useState(0);
    const bgmRef = useRef<HTMLAudioElement>(null);

    // Control BGM based on sound toggle
    useEffect(() => {
        if (bgmRef.current) {
            bgmRef.current.volume = isSoundEnabled ? 0.4 : 0;
        }
    }, [isSoundEnabled]);

    // Try to play BGM on mount (after user clicked START, so should work)
    useEffect(() => {
        const playBgmOnMount = () => {
            if (bgmRef.current) {
                bgmRef.current.play().catch(() => {
                    // If autoplay blocked, try on first interaction
                    const tryPlayOnInteraction = () => {
                        bgmRef.current?.play().catch(() => { });
                        document.removeEventListener('click', tryPlayOnInteraction);
                        document.removeEventListener('touchstart', tryPlayOnInteraction);
                    };
                    document.addEventListener('click', tryPlayOnInteraction);
                    document.addEventListener('touchstart', tryPlayOnInteraction);
                });
            }
        };

        // Small delay to ensure DOM is ready
        const timer = setTimeout(playBgmOnMount, 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        setMounted(true);
        // Clear any leftover feedback from previous session
        clearFeedbackOnMount();
        // Initialize prevAnsweredCount to current state to prevent sound on mount
        setPrevAnsweredCount(Object.keys(answeredQuestions).length);

        // Cleanup: stop BGM when leaving game page
        return () => {
            if (bgmRef.current) {
                bgmRef.current.pause();
                bgmRef.current.currentTime = 0;
            }
        };
    }, [clearFeedbackOnMount]);

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

    // Play sound when answer changes (correct/wrong)
    useEffect(() => {
        const currentAnsweredCount = Object.keys(answeredQuestions).length;

        // Only play if answers increased (new answer submitted)
        if (currentAnsweredCount > prevAnsweredCount && showFeedback) {
            if (lastAnswerCorrect === true) {
                playCorrectSound();
            } else if (lastAnswerCorrect === false) {
                playWrongSound();
            }
        }

        setPrevAnsweredCount(currentAnsweredCount);
    }, [answeredQuestions, showFeedback, lastAnswerCorrect, prevAnsweredCount, playCorrectSound, playWrongSound]);

    // Handle tile click - siswa harus mengerjakan secara urut
    const handleTileClick = useCallback((index: number) => {
        if (currentQuestion || showFeedback) return;

        const question = questions[index];
        if (!question) return;

        // Cek apakah soal ini sudah dijawab
        if (answeredQuestions[question.id]) return;

        // Play click sound
        playClickSound();
        selectQuestion(question.id);
    }, [currentQuestion, showFeedback, questions, answeredQuestions, selectQuestion, playClickSound]);

    // Handle selesai - simpan ke Supabase dan navigasi ke results
    const handleFinish = useCallback(async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        // Play finish sound
        playFinishSound();

        try {
            // Stop BGM
            if (bgmRef.current) {
                bgmRef.current.pause();
                bgmRef.current.currentTime = 0;
            }
            await endGame();
            // Navigasi akan dilakukan otomatis melalui useEffect ketika gameComplete = true
        } catch (error) {
            console.error('Error finishing game:', error);
            setIsSubmitting(false);
        }
    }, [isSubmitting, endGame, playFinishSound]);

    if (!player || !currentRound) return null;

    const answeredCount = Object.keys(answeredQuestions).length;
    const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
    const allAnswered = answeredCount === questions.length && questions.length > 0;

    return (
        <div className={styles.container}>
            {/* Background Music - HTML Audio Element */}
            <audio
                ref={bgmRef}
                src="/song/0111.MP3"
                loop
                autoPlay
                style={{ display: 'none' }}
            />

            {/* Background Assets */}
            <img src="/assets/background-city-removebg-preview.png" alt="" className={styles.bgCity} />
            <img src="/assets/bird-removebg-preview.png" alt="" className={styles.birds} />
            <img src="/assets/bird-removebg-preview.png" alt="" className={styles.birdsRight} />

            {/* Sound Icon Global Toggle (Same as landing) */}
            <img
                src="/assets/sound.png"
                alt="Sound"
                onClick={toggleSound}
                className={styles.soundIcon}
                style={{
                    filter: isSoundEnabled ? 'none' : 'grayscale(100%) brightness(0.8)',
                    transition: 'all 0.3s ease'
                }}
            />

            {/* Header / StatusBar */}
            <header className={styles.header} style={{ marginTop: '1rem', width: '95%', maxWidth: '800px' }}>
                <div className={styles.playerBadge}>
                    <div style={{ background: '#0288d1', padding: '0.8rem', borderRadius: '15px', border: '3px solid var(--border)' }} className="border-border">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <div className={styles.playerName}>{player.name}</div>
                        <div className={styles.roundName}>{currentRound.name}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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

                {/* Instruction */}
                {!currentQuestion && !showFeedback && !allAnswered && (
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                        borderRadius: '15px',
                        border: '2px solid #90caf9'
                    }}>
                        <p style={{ fontWeight: 900, fontSize: '1.1rem', color: '#01579b', margin: 0 }}>
                            📝 Pilih nomor soal untuk dikerjakan!
                        </p>
                    </div>
                )}

                {/* Tiles Grid */}
                <div className={styles.tileGrid}>
                    {questions.map((q, index) => {
                        const answerResult = answeredQuestions[q.id];
                        const isAnswered = !!answerResult;

                        // Determine if this tile is clickable (not answered yet)
                        const isClickable = !isAnswered && !currentQuestion && !showFeedback;
                        const isNext = !isAnswered && (index === 0 || !!answeredQuestions[questions[index - 1]?.id]);

                        // Colors
                        let tileColor = '#8FD9FB'; // default blue
                        let tileShadow = '0 8px 0 #78c1e0';

                        if (isNext) {
                            tileColor = '#4fc3f7';
                            tileShadow = '0 8px 0 #29b6f6';
                        }

                        return (
                            <div
                                key={q.id}
                                onClick={() => isClickable && handleTileClick(index)}
                                className={`
                                    ${styles.tile}
                                    ${answerResult === 'correct' ? styles.tileCorrect : ''}
                                    ${answerResult === 'wrong' ? styles.tileWrong : ''}
                                    ${isClickable ? styles.tileActive : ''}
                                `}
                                style={{
                                    backgroundColor: (!isAnswered) ? tileColor : undefined,
                                    color: (!isAnswered) ? '#1e293b' : undefined,
                                    borderColor: (!isAnswered) ? 'rgba(0,0,0,0.1)' : undefined,
                                    opacity: isAnswered ? 0.6 : 1,
                                    pointerEvents: isClickable ? 'auto' : 'none',
                                    cursor: isClickable ? 'pointer' : 'default',
                                    boxShadow: (!isAnswered) ? tileShadow : undefined,
                                    transform: isClickable ? 'scale(1.05)' : undefined,
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{ fontSize: '0.7rem', opacity: 0.8, textTransform: 'uppercase' }}>{q.category}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{index + 1}</div>
                                {isAnswered && answerResult === 'correct' && <CheckCircle className="absolute w-12 h-12 opacity-40 text-white" />}
                                {isAnswered && answerResult === 'wrong' && <X className="absolute w-12 h-12 opacity-40 text-white" />}
                            </div>
                        );
                    })}
                </div>

                {/* Action Area */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', minHeight: '100px', marginTop: '1.5rem' }}>
                    {/* Show Finish Button when all answered */}
                    {allAnswered && !currentQuestion && !showFeedback && (
                        <div style={{ textAlign: 'center', width: '100%' }}>
                            <div style={{
                                marginBottom: '1rem',
                                padding: '1rem',
                                background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                                borderRadius: '15px',
                                border: '2px solid #81c784'
                            }}>
                                <p style={{ fontWeight: 900, fontSize: '1.2rem', color: '#2e7d32', margin: 0 }}>
                                    🎉 Semua soal sudah dijawab!
                                </p>
                            </div>
                            <button
                                onClick={handleFinish}
                                disabled={isSubmitting}
                                className={styles.btn}
                                style={{
                                    width: '100%',
                                    maxWidth: '400px',
                                    height: '70px',
                                    fontSize: '1.5rem',
                                    background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                                    boxShadow: '0 8px 0 #388e3c'
                                }}
                            >
                                <Flag className="w-8 h-8 mr-3" />
                                {isSubmitting ? 'MENYIMPAN...' : 'Selesaikan Game'}
                            </button>
                        </div>
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
        </div>
    );
}


'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Coins, User, X, CheckCircle, Trophy } from 'lucide-react';
import { useGameStore } from '@/hooks/useGameStore';
import QuestionPopup from '@/components/game/QuestionPopup';
import FeedbackBanner from '@/components/game/FeedbackBanner';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/data/mockData';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

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

        // Find unanswered questions
        const unansweredIndices = questions
            .map((q, idx) => ({ q, idx }))
            .filter(({ q }) => !answeredQuestions[q.id])
            .map(({ idx }) => idx);

        if (unansweredIndices.length === 0) return;

        setIsSpinning(true);
        setShowCoinPrompt(false);

        // Animate through random questions
        let spinCount = 0;
        const maxSpins = 15 + Math.floor(Math.random() * 10);

        const spinInterval = setInterval(() => {
            const randomIdx = unansweredIndices[Math.floor(Math.random() * unansweredIndices.length)];
            setSelectedQuestionIndex(randomIdx);
            spinCount++;

            if (spinCount >= maxSpins) {
                clearInterval(spinInterval);

                // Final random selection
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
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* Player Info */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                                <User className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div>
                                <p className="font-bold text-foreground">{player.name}</p>
                                <p className="text-xs text-muted-foreground">{currentRound.name}</p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-success/10 px-3 py-1. 5 rounded-md">
                                <CheckCircle className="w-4 h-4 text-success" />
                                <span className="font-bold text-success">{player.correctAnswers}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-destructive/10 px-3 py-1.5 rounded-md">
                                <X className="w-4 h-4 text-destructive" />
                                <span className="font-bold text-destructive">{player.wrongAnswers}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-accent/20 px-3 py-1.5 rounded-md">
                                <Trophy className="w-4 h-4 text-accent-foreground" />
                                <span className="font-bold text-accent-foreground">{player.score}</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1 text-center">
                            {answeredCount} dari {questions.length} soal dijawab
                        </p>
                    </div>
                </div>
            </header>

            {/* Game Board Area */}
            <main className="container mx-auto px-4 py-6">
                <div className="max-w-4xl mx-auto">
                    {/* Board Panel */}
                    <Card className="p-6 relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-5">
                            <div className="absolute inset-0" style={{
                                backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                                backgroundSize: '24px 24px'
                            }} />
                        </div>

                        <div className="relative z-10">
                            {/* Question Tiles Grid */}
                            <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mb-6">
                                {questions.map((q, index) => {
                                    const answerResult = answeredQuestions[q.id];
                                    const isHighlighted = selectedQuestionIndex === index && isSpinning;
                                    const colorClass = CATEGORY_COLORS[q.category];

                                    return (
                                        <div
                                            key={q.id}
                                            className={`
                        aspect-square rounded-md flex flex-col items-center justify-center text-xs font-bold transition-all duration-150
                        ${answerResult === 'correct' ? 'bg-green-600 text-white ring-2 ring-green-500' : ''}
                        ${answerResult === 'wrong' ? 'bg-red-600 text-white ring-2 ring-red-500' : ''}
                        ${!answerResult && isHighlighted ? `${colorClass} text-white ring-2 ring-offset-2 ring-white scale-110` : ''}
                        ${!answerResult && !isHighlighted ? 'bg-slate-700 text-slate-300' : ''}
                      `}
                                        >
                                            <span>{q.category}</span>
                                            <span className="text-[10px] opacity-75">#{index + 1}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Center Coin / Token */}
                            <div className="flex flex-col items-center justify-center py-6">
                                {!currentQuestion && !showFeedback && (
                                    <>
                                        <button
                                            onClick={handleCoinClick}
                                            disabled={isSpinning}
                                            className={`
                        w-28 h-28 rounded-full gradient-gold flex items-center justify-center shadow-lg
                        transition-transform duration-300 cursor-pointer disabled:cursor-not-allowed
                        ${isSpinning ? 'animate-spin' : 'hover:scale-110'}
                      `}
                                            style={{
                                                animation: isSpinning ? 'spin 0.3s linear infinite' : undefined,
                                            }}
                                        >
                                            <Coins className="w-14 h-14 text-accent-foreground" />
                                        </button>
                                        {showCoinPrompt && !isSpinning && (
                                            <p className="mt-4 text-sm font-medium text-muted-foreground">
                                                Klik koin untuk mendapat soal
                                            </p>
                                        )}
                                        {isSpinning && (
                                            <p className="mt-4 text-sm font-medium text-foreground animate-pulse">
                                                Memilih soal...
                                            </p>
                                        )}
                                    </>
                                )}

                                {showFeedback && <FeedbackBanner />}
                            </div>
                        </div>
                    </Card>

                    {/* Category Legend */}
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                            <div
                                key={key}
                                className={`px-2 py-1 rounded text-xs font-medium ${CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS]} text-primary-foreground`}
                            >
                                {key}:  {label}
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Question Popup */}
            {currentQuestion && !showFeedback && <QuestionPopup />}
        </div>
    );
}
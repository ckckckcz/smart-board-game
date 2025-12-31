'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, X, CheckCircle, Trophy, BarChart3, Clock } from 'lucide-react';
import { useGameStore } from '@/hooks/useGameStore';
import QuestionPopup from '@/components/game/QuestionPopup';
import FeedbackBanner from '@/components/game/FeedbackBanner';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/data/mockData';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import DecorativeElements from '@/components/react-bits/background';

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
        <div className="min-h-screen bg-slate-950 relative overflow-hidden font-sans text-slate-200">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0 opacity-40">
                <DecorativeElements />
            </div>
            {/* Radial Gradient Overlay */}
            <div className="absolute inset-0 z-0 bg-radial-[circle_at_center,_var(--tw-gradient-stops)] from-transparent via-slate-950/60 to-slate-950 pointer-events-none" />


            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-40">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xl border-b border-white/5 shadow-2xl" />
                <div className="container mx-auto px-4 py-3 relative">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Player Info */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-white/10">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white tracking-tight">{player.name}</h1>
                                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 uppercase tracking-widest">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                    {currentRound.name}
                                </div>
                            </div>
                        </div>

                        {/* Stats - Desktop */}
                        <div className="hidden md:flex items-center gap-3">
                            <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-2 rounded-xl backdrop-blur-sm shadow-inner transition-all hover:bg-white/10">
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-wider">Benar</span>
                                    <span className="text-lg font-black text-white leading-none">{player.correctAnswers}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-2 rounded-xl backdrop-blur-sm shadow-inner transition-all hover:bg-white/10">
                                <X className="w-5 h-5 text-rose-400" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-rose-400/80 font-bold uppercase tracking-wider">Salah</span>
                                    <span className="text-lg font-black text-white leading-none">{player.wrongAnswers}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500/20 to-orange-600/20 border border-amber-500/30 px-5 py-2 rounded-xl backdrop-blur-sm shadow-[0_0_15px_rgba(245,158,11,0.1)] transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                                <Trophy className="w-6 h-6 text-amber-400 drop-shadow-md" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider">Total Skor</span>
                                    <span className="text-xl font-black text-white leading-none">{player.score}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar & Mobile Stats */}
                    <div className="mt-4 md:mt-0 md:absolute md:bottom-0 md:left-0 md:right-0 md:h-1">
                        {/* Mobile Stats (only visible on small screens) */}
                        <div className="flex md:hidden items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="font-bold text-emerald-400 text-sm">{player.correctAnswers}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 rounded-lg border border-rose-500/20">
                                <X className="w-3.5 h-3.5 text-rose-400" />
                                <span className="font-bold text-rose-400 text-sm">{player.wrongAnswers}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20 ml-auto">
                                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                                <span className="font-bold text-amber-400 text-sm">{player.score}</span>
                            </div>
                        </div>

                        <Progress value={progress} className="h-1.5 md:h-[2px] rounded-none bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    </div>
                </div>
            </header>

            {/* Game Board Area */}
            <main className="container mx-auto px-4 pt-32 pb-12 md:pt-28 min-h-screen flex flex-col items-center justify-center">
                <div className={`w-full max-w-5xl mx-auto transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

                    {/* Board Panel */}
                    <Card className="relative overflow-hidden bg-slate-900/60 backdrop-blur-2xl border-white/10 shadow-2xl rounded-3xl group">

                        {/* Decorative glowing border */}
                        <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                        <div className="relative z-10 p-6 md:p-10">

                            {/* Header inside card */}
                            <div className="flex items-center justify-between mb-8 opacity-70">
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                                    <BarChart3 className="w-4 h-4" />
                                    <span>Papan Permainan</span>
                                </div>
                                <div className="text-sm font-medium text-slate-400">
                                    {answeredCount} / {questions.length} Soal Selesai
                                </div>
                            </div>


                            {/* Question Tires Grid */}
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 mb-10">
                                {questions.map((q, index) => {
                                    const answerResult = answeredQuestions[q.id];
                                    const isHighlighted = selectedQuestionIndex === index && isSpinning;
                                    return (
                                        <div
                                            key={q.id}
                                            className={`
                                                relative aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all duration-300
                                                shadow-lg overflow-hidden group/tile
                                                ${answerResult === 'correct'
                                                    ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-emerald-900/50 ring-2 ring-emerald-500/50'
                                                    : ''}
                                                ${answerResult === 'wrong'
                                                    ? 'bg-gradient-to-br from-rose-600 to-rose-800 text-white shadow-rose-900/50 ring-2 ring-rose-500/50'
                                                    : ''}
                                                ${!answerResult && isHighlighted
                                                    ? 'scale-110 z-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)] ring-2 ring-white animate-pulse'
                                                    : ''}
                                                ${!answerResult && !isHighlighted
                                                    ? 'bg-slate-800/50 border border-white/5 text-slate-500 hover:bg-slate-700 hover:text-slate-200 hover:border-white/10 hover:shadow-xl hover:-translate-y-1'
                                                    : ''}
                                            `}
                                        >
                                            {/* Tile Glare Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover/tile:opacity-100 transition-opacity duration-500" />

                                            <span className="relative z-10 text-[10px] md:text-xs uppercase tracking-wider opacity-90">{q.category}</span>
                                            <span className="relative z-10 text-[10px] md:text-sm font-black mt-1 opacity-50 group-hover/tile:opacity-100 transition-opacity">#{index + 1}</span>

                                            {answerResult === 'correct' && <CheckCircle className="absolute w-8 h-8 md:w-10 md:h-10 text-white/20" />}
                                            {answerResult === 'wrong' && <X className="absolute w-8 h-8 md:w-10 md:h-10 text-white/20" />}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Center Action Area */}
                            <div className="flex flex-col items-center justify-center min-h-[200px] relative">

                                {/* Background glow for center area */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                                {!currentQuestion && !showFeedback && (
                                    <>
                                        <button
                                            onClick={handleCoinClick}
                                            disabled={isSpinning}
                                            className={`
                                                relative group w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center
                                                transition-all duration-500 cursor-pointer disabled:cursor-not-allowed
                                                ${isSpinning ? 'scale-110' : 'hover:scale-105 hover:shadow-[0_0_50px_rgba(234,179,8,0.4)]'}
                                            `}
                                        >
                                            {/* Coin Body */}
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-xl border-4 border-amber-400/50 flex items-center justify-center overflow-hidden">
                                                <div className={`absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] opacity-40 mix-blend-overlay ${isSpinning ? 'animate-spin [animation-duration:1s]' : ''}`} />
                                                <div className="absolute inset-2 rounded-full border border-amber-200/30 dashed opacity-50" />
                                            </div>

                                            <div className="relative z-10 p-6 rounded-full bg-amber-600/20 backdrop-blur-sm border border-amber-300/30 shadow-inner">
                                                <Trophy className={`w-12 h-12 md:w-16 md:h-16 text-amber-100 drop-shadow-md`} />
                                            </div>
                                        </button>

                                        {showCoinPrompt && !isSpinning && (
                                            <div className="mt-8 animate-bounce">
                                                <p className="px-6 py-2 rounded-full bg-indigo-600 text-white text-sm font-bold shadow-lg border border-indigo-400/30">
                                                    Klik Koin Untuk Putar!
                                                </p>
                                            </div>
                                        )}
                                        {isSpinning && (
                                            <p className="mt-8 text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 animate-pulse tracking-widest uppercase">
                                                Menguji Keberuntungan...
                                            </p>
                                        )}
                                    </>
                                )}

                                {showFeedback && (
                                    <div className="animate-scale-in w-full max-w-lg">
                                        <FeedbackBanner />
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Category Legend */}
                    <div className="mt-8 flex flex-wrap justify-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300">
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                            <div
                                key={key}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                <span className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS].replace('bg-', 'bg-')}`} />
                                <span className="uppercase">{key}:</span>
                                <span>{label}</span>
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
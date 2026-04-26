'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useGameStore } from '@/hooks/useGameStore';
import { Question } from '@/types/game';

const AUTO_CONTINUE_DELAY = 4; // seconds

function getCorrectAnswerText(q: Question): string {
  switch (q.type) {
    case 'true_false':
      return q.correctAnswer === true ? 'Benar' : q.correctAnswer === false ? 'Salah' : '-';
    case 'multiple_choice': {
      const letter = String(q.correctAnswer || '').toUpperCase();
      const idx = letter ? letter.charCodeAt(0) - 65 : -1;
      const opt = q.options && idx >= 0 && idx < q.options.length ? q.options[idx] : '';
      return opt ? `${letter}. ${opt}` : (letter || '-');
    }
    case 'matching':
      return q.matchingAnswer || '-';
    case 'short_answer':
      return String(q.correctAnswer || '-');
    default:
      return '-';
  }
}

const FeedbackBanner = () => {
  const { lastAnswerStatus, lastAnswerSimilarity, currentQuestion, nextQuestion } = useGameStore();
  const [countdown, setCountdown] = useState(AUTO_CONTINUE_DELAY);

  // Auto-continue timer
  useEffect(() => {
    if (lastAnswerStatus === null) return;

    // Reset countdown when feedback appears (async to satisfy lint rule)
    const resetTimer = setTimeout(() => setCountdown(AUTO_CONTINUE_DELAY), 0);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          nextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(resetTimer);
      clearInterval(interval);
    };
  }, [lastAnswerStatus, nextQuestion]);

  if (lastAnswerStatus === null) return null;

  const isCorrect = lastAnswerStatus === 'correct';
  const isAlmost = lastAnswerStatus === 'almost';

  const gradientClass = isCorrect
    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/20'
    : isAlmost
      ? 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/20'
      : 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-500/20';

  const titleText = isCorrect ? 'LUAR BIASA!' : isAlmost ? 'HAMPIR BENAR!' : 'OOPS!';
  const subtitleText = isCorrect
    ? `+${currentQuestion?.points || 100} Poin Ditambahkan`
    : isAlmost
      ? 'Jawaban kamu mirip, cek yang benar ya'
      : 'Jangan menyerah, coba lagi!';

  return (
    <div
      onClick={nextQuestion}
      className={`
        relative w-full max-w-sm mx-auto p-1 rounded-3xl shadow-2xl overflow-hidden cursor-pointer
        ${gradientClass}
        animate-scale-in hover:scale-[1.02] transition-transform active:scale-95
      `}
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-[22px] p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">

          {/* Animated Icon Container */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-4 shadow-lg bg-white/20 text-white">
            {isCorrect ? (
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md" />
            ) : (
              <XCircle className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md animate-shake" />
            )}
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight drop-shadow-sm">
            {titleText}
          </h3>

          <div className="px-4 py-1.5 rounded-full bg-black/10 text-white/90 font-bold text-xs sm:text-sm mb-6 border border-white/10">
            {subtitleText}
          </div>

          {!isCorrect && currentQuestion && (
            <div className="w-full text-left bg-black/10 border border-white/10 rounded-2xl p-4 mb-5">
              <div className="text-white font-black text-xs uppercase tracking-wider mb-2">
                Jawaban Benar
              </div>
              <div className="text-white text-sm font-bold leading-snug">
                {getCorrectAnswerText(currentQuestion)}
              </div>

              {currentQuestion.type === 'short_answer' && lastAnswerSimilarity !== null && (
                <div className="mt-2 text-white/90 text-xs font-semibold">
                  Kemiripan: {Math.round(lastAnswerSimilarity * 100)}%
                </div>
              )}

              {currentQuestion.explanation && (
                <div className="mt-3 text-white/90 text-xs leading-relaxed font-medium">
                  <span className="font-black">Karena: </span>
                  {currentQuestion.explanation}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            <span>Lanjut dalam {countdown} detik...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackBanner;
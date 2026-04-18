'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useGameStore } from '@/hooks/useGameStore';

const AUTO_CONTINUE_DELAY = 1; // seconds

const FeedbackBanner = () => {
  const { lastAnswerCorrect, currentQuestion, nextQuestion } = useGameStore();
  const [countdown, setCountdown] = useState(AUTO_CONTINUE_DELAY);

  // Auto-continue timer
  useEffect(() => {
    if (lastAnswerCorrect === null) return;

    // Reset countdown when feedback appears
    setCountdown(AUTO_CONTINUE_DELAY);

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

    return () => clearInterval(interval);
  }, [lastAnswerCorrect, nextQuestion]);

  if (lastAnswerCorrect === null) return null;

  return (
    <div
      onClick={nextQuestion}
      className={`
        relative w-full max-w-sm mx-auto p-1 rounded-3xl shadow-2xl overflow-hidden cursor-pointer
        ${lastAnswerCorrect
          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/20'
          : 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-500/20'}
        animate-scale-in hover:scale-[1.02] transition-transform active:scale-95
      `}
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-[22px] p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">

          {/* Animated Icon Container */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-4 shadow-lg bg-white/20 text-white">
            {lastAnswerCorrect ? (
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md" />
            ) : (
              <XCircle className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md animate-shake" />
            )}
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight drop-shadow-sm">
            {lastAnswerCorrect ? 'LUAR BIASA!' : 'OOPS!'}
          </h3>

          <div className="px-4 py-1.5 rounded-full bg-black/10 text-white/90 font-bold text-xs sm:text-sm mb-6 border border-white/10">
            {lastAnswerCorrect
              ? `+${currentQuestion?.points || 100} Poin Ditambahkan`
              : 'Jangan menyerah, coba lagi!'}
          </div>

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
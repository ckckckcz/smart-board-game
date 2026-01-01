'use client';

import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/hooks/useGameStore';

const FeedbackBanner = () => {
  const { lastAnswerCorrect, currentQuestion, nextQuestion } = useGameStore();

  if (lastAnswerCorrect === null) return null;

  return (
    <div className={`
      relative w-full max-w-md mx-auto p-1 rounded-3xl shadow-2xl overflow-hidden
      ${lastAnswerCorrect
        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/20'
        : 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-500/20'}
      animate-scale-in
    `}>
      <div className="bg-white/10 backdrop-blur-sm rounded-[22px] p-8">
        <div className="flex flex-col items-center text-center">

          {/* Animated Icon Container */}
          <div className={`
            w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg
            ${lastAnswerCorrect ? 'bg-white/20 text-white' : 'bg-white/20 text-white'}
          `}>
            {lastAnswerCorrect ? (
              <CheckCircle className="w-10 h-10 drop-shadow-md animate-bounce" />
            ) : (
              <XCircle className="w-10 h-10 drop-shadow-md animate-shake" />
            )}
          </div>

          <h3 className="text-3xl font-black text-white mb-2 tracking-tight drop-shadow-sm">
            {lastAnswerCorrect ? 'LUAR BIASA!' : 'OOPS!'}
          </h3>

          <div className="px-4 py-1.5 rounded-full bg-black/10 text-white/90 font-bold text-sm mb-6 border border-white/10">
            {lastAnswerCorrect
              ? `+${currentQuestion?.points || 100} Poin Ditambahkan`
              : 'Jangan menyerah, coba lagi!'}
          </div>

          <Button
            onClick={nextQuestion}
            className="w-full h-14 font-bold rounded-2xl cursor-pointer bg-white text-slate-900 hover:bg-slate-50 hover:scale-[1.02] shadow-xl transition-all group"
          >
            LANJUT KE SOAL BERIKUTNYA
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackBanner;
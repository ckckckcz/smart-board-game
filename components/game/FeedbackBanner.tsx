'use client';

import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/hooks/useGameStore';

const FeedbackBanner = () => {
  const { lastAnswerCorrect, currentQuestion, nextQuestion } = useGameStore();

  if (lastAnswerCorrect === null) return null;

  return (
    <div className={`
      w-full max-w-md mx-auto p-6 rounded-2xl shadow-xl
      ${lastAnswerCorrect ? 'bg-green-600 shadow-green-500/50 animate-success' : 'bg-red-600 shadow-red-500/50 animate-error'}
    `}>
      <div className="flex flex-col items-center text-center">
        {lastAnswerCorrect ? (
          <>
            <CheckCircle className="w-16 h-16 text-white mb-3" />
            <h3 className="text-2xl font-black text-white mb-1">BENAR!</h3>
            <p className="text-white/90 font-semibold">
              +{currentQuestion?.points || 100} poin
            </p>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-white mb-3" />
            <h3 className="text-2xl font-black text-white mb-1">SALAH!</h3>
            <p className="text-white/90 font-semibold">
              0 poin
            </p>
          </>
        )}

        <Button
          onClick={nextQuestion}
          className={`
            mt-4 h-12 px-8 font-bold rounded-xl cursor-pointer
            ${lastAnswerCorrect
              ? 'bg-white/20 hover:bg-white/30 text-white'
              : 'bg-white/20 hover:bg-white/30 text-white'
            }
          `}
        >
          LANJUT
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default FeedbackBanner;
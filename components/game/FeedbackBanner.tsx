import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/hooks/useGameStore';

const FeedbackBanner = () => {
  const { lastAnswerCorrect, currentQuestion, nextQuestion } = useGameStore();

  if (lastAnswerCorrect === null) return null;

  return (
    <div className={`
      w-full max-w-md mx-auto p-6 rounded-2xl shadow-xl
      ${lastAnswerCorrect ? 'bg-success shadow-glow-success animate-success' : 'bg-destructive shadow-glow-error animate-error'}
    `}>
      <div className="flex flex-col items-center text-center">
        {lastAnswerCorrect ? (
          <>
            <CheckCircle className="w-16 h-16 text-success-foreground mb-3" />
            <h3 className="text-2xl font-black text-success-foreground mb-1">BENAR!</h3>
            <p className="text-success-foreground/90 font-semibold">
              +{currentQuestion?.points || 100} poin
            </p>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-destructive-foreground mb-3" />
            <h3 className="text-2xl font-black text-destructive-foreground mb-1">SALAH!</h3>
            <p className="text-destructive-foreground/90 font-semibold">
              0 poin
            </p>
          </>
        )}
        
        <Button
          onClick={nextQuestion}
          className={`
            mt-4 h-12 px-8 font-bold rounded-xl
            ${lastAnswerCorrect 
              ? 'bg-success-foreground/20 hover:bg-success-foreground/30 text-success-foreground' 
              : 'bg-destructive-foreground/20 hover:bg-destructive-foreground/30 text-destructive-foreground'
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

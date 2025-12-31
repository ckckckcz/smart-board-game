'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGameStore } from '@/hooks/useGameStore';

const QuestionPopup = () => {
  const { currentQuestion, answerQuestion, skipQuestion } = useGameStore();
  const [timeLeft, setTimeLeft] = useState(currentQuestion?.timeLimit || 30);

  // For different question types
  const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | null>(null);
  const [essayAnswer, setEssayAnswer] = useState('');
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, string>>({
    '1': '', '2': '', '3': ''
  });

  useEffect(() => {
    if (!currentQuestion) return;
    setTimeLeft(currentQuestion.timeLimit);
    setSelectedAnswer(null);
    setEssayAnswer('');
    setMatchingAnswers({ '1': '', '2': '', '3': '' });
  }, [currentQuestion]);

  useEffect(() => {
    if (timeLeft <= 0) {
      skipQuestion();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, skipQuestion]);

  const handleAnswer = useCallback(() => {
    if (!currentQuestion) return;

    switch (currentQuestion.type) {
      case 'true_false':
        if (selectedAnswer === null) return;
        answerQuestion(selectedAnswer as boolean);
        break;
      case 'multiple_choice':
        if (!selectedAnswer) return;
        answerQuestion(selectedAnswer as string);
        break;
      case 'essay':
        if (!essayAnswer.trim()) return;
        answerQuestion(essayAnswer.trim());
        break;
      case 'matching':
        const answer = `1${matchingAnswers['1']}-2${matchingAnswers['2']}-3${matchingAnswers['3']}`;
        if (!matchingAnswers['1'] || !matchingAnswers['2'] || !matchingAnswers['3']) return;
        answerQuestion(answer);
        break;
    }
  }, [currentQuestion, selectedAnswer, essayAnswer, matchingAnswers, answerQuestion]);

  const handleSkip = useCallback(() => {
    skipQuestion();
  }, [skipQuestion]);

  if (!currentQuestion) return null;

  const timerPercentage = (timeLeft / currentQuestion.timeLimit) * 100;
  const timerColor = timeLeft <= 10 ? 'text-red-500' : timeLeft <= 20 ? 'text-yellow-500' : 'text-green-500';
  const timerBgColor = timeLeft <= 10 ? 'bg-red-500' : timeLeft <= 20 ? 'bg-yellow-500' : 'bg-green-500';

  const canAnswer = () => {
    switch (currentQuestion.type) {
      case 'true_false':
        return selectedAnswer !== null;
      case 'multiple_choice':
        return !!selectedAnswer;
      case 'essay':
        return !!essayAnswer.trim();
      case 'matching':
        return !!matchingAnswers['1'] && !!matchingAnswers['2'] && !!matchingAnswers['3'];
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" />

      {/* Modal */}
      <Card className="relative w-full max-w-lg animate-scale-in overflow-hidden">
        {/* Header with Timer */}
        <div className="bg-secondary/10 px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="font-bold">
                {currentQuestion.category}
              </Badge>
              <span className="text-sm text-muted-foreground font-medium">
                +{currentQuestion.points} poin
              </span>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${timerColor}`} />
              <span className={`text-2xl font-black tabular-nums ${timerColor}`}>
                {timeLeft}
              </span>
            </div>
          </div>

          {/* Timer Bar */}
          <div className="mt-3 h-2 bg-muted rounded overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${timerBgColor}`}
              style={{ width: `${timerPercentage}%` }}
            />
          </div>
        </div>

        {/* Question Content */}
        <div className="p-6">
          <p className="text-lg font-semibold text-foreground leading-relaxed mb-6">
            {currentQuestion.question}
          </p>

          {/* Answer Options based on type */}
          {currentQuestion.type === 'true_false' && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setSelectedAnswer(true)}
                className={`
                  p-4 rounded-xl border-2 font-bold text-lg transition-all duration-200 cursor-pointer
                  ${selectedAnswer === true
                    ? 'border-green-500 bg-green-500/20 text-green-400'
                    : 'border-slate-600 bg-slate-800 hover:border-green-500/50 text-white'
                  }
                `}
              >
                ✓ BENAR
              </button>
              <button
                onClick={() => setSelectedAnswer(false)}
                className={`
                  p-4 rounded-xl border-2 font-bold text-lg transition-all duration-200 cursor-pointer
                  ${selectedAnswer === false
                    ? 'border-red-500 bg-red-500/20 text-red-400'
                    : 'border-slate-600 bg-slate-800 hover:border-red-500/50 text-white'
                  }
                `}
              >
                ✗ SALAH
              </button>
            </div>
          )}

          {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
            <div className="grid grid-cols-1 gap-3 mb-6">
              {['A', 'B', 'C', 'D'].map((option, index) => (
                <button
                  key={option}
                  onClick={() => setSelectedAnswer(option)}
                  className={`
                    p-3 rounded-xl border-2 font-medium text-left transition-all duration-200 cursor-pointer
                    ${selectedAnswer === option
                      ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                      : 'border-slate-600 bg-slate-800 hover:border-blue-500/50 text-white'
                    }
                  `}
                >
                  <span className="font-bold mr-2">{option}. </span>
                  {currentQuestion.options?.[index]}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'essay' && (
            <div className="mb-6">
              <Input
                value={essayAnswer}
                onChange={(e) => setEssayAnswer(e.target.value)}
                placeholder="Tulis jawaban..."
                className="text-base"
              />
            </div>
          )}

          {currentQuestion.type === 'matching' && currentQuestion.matchingPairs && (
            <div className="space-y-3 mb-6">
              {currentQuestion.matchingPairs.map((pair, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-1 p-3 bg-muted rounded-md text-sm">
                    <span className="font-bold mr-2">{index + 1}.</span>
                    {pair.left}
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <Select
                    value={matchingAnswers[String(index + 1)]}
                    onValueChange={(v) => setMatchingAnswers(prev => ({ ...prev, [String(index + 1)]: v }))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <div className="text-xs text-muted-foreground mt-2">
                Pilihan:
                {currentQuestion.matchingPairs.map((pair, index) => (
                  <span key={index} className="ml-2">
                    <strong>{['A', 'B', 'C'][index]}. </strong> {pair.right}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleAnswer}
              disabled={!canAnswer()}
              className="flex-1 h-11 font-bold bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              JAWAB
            </Button>
            <Button
              onClick={handleSkip}
              variant="outline"
              className="h-11 px-6 font-bold border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-white cursor-pointer"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              LEWATI
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuestionPopup;
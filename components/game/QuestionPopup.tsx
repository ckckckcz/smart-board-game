'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, SkipForward, Check, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGameStore } from '@/hooks/useGameStore';

const QuestionPopup = () => {
  const { currentQuestion, answerQuestion, skipQuestion } = useGameStore();
  const [timeLeft, setTimeLeft] = useState(currentQuestion?.timeLimit || 30);
  const [isExiting, setIsExiting] = useState(false);

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
    setIsExiting(false);
  }, [currentQuestion]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSkip();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswer = useCallback(() => {
    if (!currentQuestion) return;
    setIsExiting(true);

    // Add small delay for exit animation
    setTimeout(() => {
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
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const answer = `1${matchingAnswers['1']}-2${matchingAnswers['2']}-3${matchingAnswers['3']}`;
          if (!matchingAnswers['1'] || !matchingAnswers['2'] || !matchingAnswers['3']) return;
          answerQuestion(answer);
          break;
      }
    }, 300);
  }, [currentQuestion, selectedAnswer, essayAnswer, matchingAnswers, answerQuestion]);

  const handleSkip = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      skipQuestion();
    }, 300);
  }, [skipQuestion]);

  if (!currentQuestion) return null;

  const timerPercentage = (timeLeft / currentQuestion.timeLimit) * 100;
  const isUrgent = timeLeft <= 10;
  const timerColor = isUrgent ? 'text-rose-500' : timeLeft <= 20 ? 'text-amber-500' : 'text-emerald-500';
  const timerBgColor = isUrgent ? 'bg-rose-500' : timeLeft <= 20 ? 'bg-amber-500' : 'bg-emerald-500';

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
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      {/* Dynamic Backdrop */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-md transition-opacity duration-300" />

      {/* Modal Card */}
      <div
        className={`
            relative w-full max-w-2xl bg-white border border-border rounded-3xl shadow-2xl overflow-hidden
            transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
            ${isExiting ? 'scale-95 translate-y-4' : 'scale-100 translate-y-0'}
            animate-scale-in
        `}
      >
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 opacity-70" />

        {/* Header with Timer */}
        <div className="bg-slate-50 px-6 py-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-0 px-3 py-1 text-sm font-bold uppercase tracking-wider">
              {currentQuestion.category}
            </Badge>
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Points: <span className="text-slate-900 ml-1">{currentQuestion.points}</span></span>
            </div>
          </div>

          {/* Timer Display */}
          <div className="flex items-center gap-3 bg-white px-4 py-1.5 rounded-full border border-border shadow-sm">
            <Clock className={`w-4 h-4 ${timerColor} ${isUrgent ? 'animate-pulse' : ''}`} />
            <span className={`text-xl font-black tabular-nums tracking-wide ${timerColor}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Timer Progress Bar (Slim) */}
        <div className="h-1 w-full bg-slate-100">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${timerBgColor} shadow-[0_0_10px_currentColor]`}
            style={{ width: `${timerPercentage}%` }}
          />
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Question Image (if available) */}
          {currentQuestion.imageUrl && (
            <div className="mb-6 flex justify-center">
              <div className="relative max-w-md w-full">
                <img
                  src={currentQuestion.imageUrl}
                  alt="Question"
                  className="w-full max-h-64 object-contain rounded-2xl border border-border bg-slate-50"
                />
              </div>
            </div>
          )}

          {/* Question Text */}
          <div className="mb-8 p-6 rounded-2xl bg-slate-50 border border-border shadow-inner min-h-[80px] flex items-center justify-center text-center">
            <p className="text-xl md:text-2xl font-bold text-slate-900 leading-relaxed">
              {currentQuestion.question}
            </p>
          </div>

          {/* Answer Area */}
          <div className="mb-8">
            {currentQuestion.type === 'true_false' && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedAnswer(true)}
                  className={`
                      group relative p-6 rounded-2xl border-2 font-black text-xl transition-all duration-200 cursor-pointer overflow-hidden
                      ${selectedAnswer === true
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                      : 'border-slate-200 bg-white hover:border-emerald-500 text-slate-400 hover:text-emerald-600'
                    }
                    `}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {selectedAnswer === true && <Check className="w-6 h-6" />}
                    BENAR
                  </span>
                </button>
                <button
                  onClick={() => setSelectedAnswer(false)}
                  className={`
                      group relative p-6 rounded-2xl border-2 font-black text-xl transition-all duration-200 cursor-pointer overflow-hidden
                      ${selectedAnswer === false
                      ? 'border-rose-500 bg-rose-50 text-rose-600'
                      : 'border-slate-200 bg-white hover:border-rose-500 text-slate-400 hover:text-rose-600'
                    }
                    `}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {selectedAnswer === false && <Check className="w-6 h-6" />}
                    SALAH
                  </span>
                </button>
              </div>
            )}

            {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
              <div className={`grid gap-3 ${currentQuestion.options.length > 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                {currentQuestion.options.map((optionText, index) => {
                  const optionLabel = ['A', 'B', 'C', 'D', 'E'][index];
                  return (
                    <button
                      key={optionLabel}
                      onClick={() => setSelectedAnswer(optionLabel)}
                      className={`
                          relative p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer flex items-start gap-4 hover:-translate-y-1
                          ${selectedAnswer === optionLabel
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-blue-400 text-slate-600 hover:text-blue-600'
                        }
                        `}
                    >
                      <div className={`
                          w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg shrink-0 transition-colors
                          ${selectedAnswer === optionLabel ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}
                        `}>
                        {optionLabel}
                      </div>
                      <span className="mt-1 font-medium leading-snug">{optionText}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === 'essay' && (
              <div className="relative group">
                <Input
                  value={essayAnswer}
                  onChange={(e) => setEssayAnswer(e.target.value)}
                  placeholder="Ketik jawaban Anda di sini..."
                  className="relative h-16 text-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-5"
                />
              </div>
            )}

            {currentQuestion.type === 'matching' && currentQuestion.matchingPairs && (
              <div className="space-y-4">
                {currentQuestion.matchingPairs.map((pair, index) => (
                  <div key={index} className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-border">
                    <div className="flex-1 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center font-bold text-slate-600 text-sm">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-700">{pair.left}</span>
                    </div>
                    <span className="text-slate-400">
                      <HelpCircle className="w-4 h-4" />
                    </span>
                    <div className="w-32">
                      <Select
                        value={matchingAnswers[String(index + 1)]}
                        onValueChange={(v) => setMatchingAnswers(prev => ({ ...prev, [String(index + 1)]: v }))}
                      >
                        <SelectTrigger className="bg-white border-slate-200 text-slate-900 h-10">
                          <SelectValue placeholder="Pilih..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-slate-900">
                          <SelectItem value="A">Pasangan A</SelectItem>
                          <SelectItem value="B">Pasangan B</SelectItem>
                          <SelectItem value="C">Pasangan C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-border">
            <Button
              onClick={handleSkip}
              variant="ghost"
              className="h-12 px-6 font-bold text-slate-400 hover:text-rose-500 hover:bg-rose-50 cursor-pointer rounded-xl transition-colors"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              LEWATI
            </Button>
            <Button
              onClick={handleAnswer}
              disabled={!canAnswer()}
              className={`
                flex-1 h-12 font-bold rounded-xl text-white shadow-lg cursor-pointer transition-all
                ${!canAnswer() ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 hover:shadow-blue-500/25 hover:scale-[1.02]'}
              `}
            >
              JAWAB SEKARANG
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPopup;
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
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300" />

      {/* Modal Card */}
      <div
        className={`
            relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden
            transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
            ${isExiting ? 'scale-95 translate-y-4' : 'scale-100 translate-y-0'}
            animate-scale-in
        `}
      >
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-70" />

        {/* Header with Timer */}
        <div className="bg-white/5 px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border-0 px-3 py-1 text-sm font-bold uppercase tracking-wider">
              {currentQuestion.category}
            </Badge>
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Points: <span className="text-white ml-1">{currentQuestion.points}</span></span>
            </div>
          </div>

          {/* Timer Display */}
          <div className="flex items-center gap-3 bg-black/40 px-4 py-1.5 rounded-full border border-white/5">
            <Clock className={`w-4 h-4 ${timerColor} ${isUrgent ? 'animate-pulse' : ''}`} />
            <span className={`text-xl font-black tabular-nums tracking-wide ${timerColor}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Timer Progress Bar (Slim) */}
        <div className="h-1 w-full bg-slate-800">
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
                  className="w-full max-h-64 object-contain rounded-2xl border border-white/10 bg-black/20"
                />
              </div>
            </div>
          )}

          {/* Question Text */}
          <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/5 shadow-inner min-h-[80px] flex items-center justify-center text-center">
            <p className="text-xl md:text-2xl font-bold text-white leading-relaxed">
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
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                      : 'border-slate-700 bg-slate-800/50 hover:border-emerald-500/50 text-slate-400 hover:text-white hover:bg-slate-800'
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
                      ? 'border-rose-500 bg-rose-500/20 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                      : 'border-slate-700 bg-slate-800/50 hover:border-rose-500/50 text-slate-400 hover:text-white hover:bg-slate-800'
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
                          ? 'border-indigo-500 bg-indigo-500/20 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                          : 'border-slate-700 bg-slate-800/50 hover:border-indigo-400/50 text-slate-300 hover:text-white hover:bg-slate-800'
                        }
                        `}
                    >
                      <div className={`
                          w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg shrink-0 transition-colors
                          ${selectedAnswer === optionLabel ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600'}
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
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur duration-500" />
                <Input
                  value={essayAnswer}
                  onChange={(e) => setEssayAnswer(e.target.value)}
                  placeholder="Ketik jawaban Anda di sini..."
                  className="relative h-16 text-lg bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:ring-0 rounded-xl px-5"
                />
              </div>
            )}

            {currentQuestion.type === 'matching' && currentQuestion.matchingPairs && (
              <div className="space-y-4">
                {currentQuestion.matchingPairs.map((pair, index) => (
                  <div key={index} className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-xl border border-white/5">
                    <div className="flex-1 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center font-bold text-slate-300 text-sm">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-200">{pair.left}</span>
                    </div>
                    <span className="text-slate-600">
                      <HelpCircle className="w-4 h-4" />
                    </span>
                    <div className="w-32">
                      <Select
                        value={matchingAnswers[String(index + 1)]}
                        onValueChange={(v) => setMatchingAnswers(prev => ({ ...prev, [String(index + 1)]: v }))}
                      >
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-white h-10">
                          <SelectValue placeholder="Pilih..." />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          <SelectItem value="A">Pasangan A</SelectItem>
                          <SelectItem value="B">Pasangan B</SelectItem>
                          <SelectItem value="C">Pasangan C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
                <div className="mt-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Pilihan Jawaban</p>
                  <div className="space-y-1">
                    {currentQuestion.matchingPairs.map((pair, index) => (
                      <div key={index} className="text-sm text-slate-300 flex gap-2">
                        <span className="font-bold text-white min-w-[20px]">{['A', 'B', 'C'][index]}.</span>
                        {pair.right}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-white/5">
            <Button
              onClick={handleSkip}
              variant="ghost"
              className="h-12 px-6 font-bold text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer rounded-xl transition-colors"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              LEWATI
            </Button>
            <Button
              onClick={handleAnswer}
              disabled={!canAnswer()}
              className={`
                flex-1 h-12 font-bold rounded-xl text-white shadow-lg cursor-pointer transition-all
                ${!canAnswer() ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/25 hover:scale-[1.02]'}
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
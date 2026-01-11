'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, Check, HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGameStore } from '@/hooks/useGameStore';

const QuestionPopup = () => {
  const { currentQuestion, answerQuestion, skipQuestion } = useGameStore();
  const [timeLeft, setTimeLeft] = useState(currentQuestion?.timeLimit || 30);
  const [isExiting, setIsExiting] = useState(false);

  // For different question types
  const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | null>(null);
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, string>>({
    '1': '', '2': '', '3': '', '4': '', '5': '', '6': ''
  });

  useEffect(() => {
    if (!currentQuestion) return;
    setTimeLeft(currentQuestion.timeLimit);
    setSelectedAnswer(null);
    setMatchingAnswers({
      '1': '', '2': '', '3': '', '4': '', '5': '', '6': ''
    });
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
        case 'matching':
          if (!currentQuestion.matchingLeft) return;
          const answers = currentQuestion.matchingLeft.map((_, i) => {
            const num = i + 1;
            return `${num}${matchingAnswers[String(num)] || ''}`;
          }).join('-');

          if (currentQuestion.matchingLeft.some((_, i) => !matchingAnswers[String(i + 1)])) return;
          answerQuestion(answers);
          break;
      }
    }, 300);
  }, [currentQuestion, selectedAnswer, matchingAnswers, answerQuestion]);

  const handleSkip = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      skipQuestion();
    }, 300);
  }, [skipQuestion]);

  // Close without answering (user can try again later)
  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      // Just clear the current question without marking as wrong
      useGameStore.setState({ currentQuestion: null });
    }, 300);
  }, []);

  if (!currentQuestion) return null;

  const timerPercentage = (timeLeft / currentQuestion.timeLimit) * 100;
  const isUrgent = timeLeft <= 10;
  const timerBgColor = isUrgent ? 'bg-rose-500' : timeLeft <= 20 ? 'bg-amber-500' : 'bg-emerald-500';

  const canAnswer = () => {
    switch (currentQuestion.type) {
      case 'true_false':
        return selectedAnswer !== null;
      case 'multiple_choice':
        return !!selectedAnswer;
      case 'matching':
        if (!currentQuestion.matchingLeft) return false;
        return currentQuestion.matchingLeft.every((_, i) => !!matchingAnswers[String(i + 1)]);
      default:
        return false;
    }
  };

  const hasImage = (currentQuestion.imageUrls && currentQuestion.imageUrls.length > 0) || currentQuestion.imageUrl;

  return (
    <div className={`fixed inset-0 z-50 flex items-start justify-center p-0 transition-all duration-300 ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      {/* Dynamic Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300" />

      {/* Modal Card - Full screen on all devices */}
      <div
        className={`
            relative w-full h-full bg-white border-0 shadow-2xl overflow-hidden flex flex-col
            transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
            ${isExiting ? 'scale-95 translate-y-4' : 'scale-100 translate-y-0'}
            animate-scale-in
        `}
      >
        {/* Header with Timer - Compact */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 px-2 py-0.5 text-xs font-bold uppercase">
              {currentQuestion.category}
            </Badge>
            <span className="text-white/80 text-xs font-medium">
              • {currentQuestion.points} pts
            </span>
          </div>

          {/* Timer Display */}
          <div className={`flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-full ${isUrgent ? 'animate-pulse bg-rose-500/80' : ''}`}>
            <Clock className="w-3.5 h-3.5 text-white" />
            <span className="text-white font-black text-sm tabular-nums">
              {timeLeft}s
            </span>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors cursor-pointer"
            title="Tutup soal"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Timer Progress Bar */}
        <div className="h-1 w-full bg-slate-200 shrink-0">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${timerBgColor}`}
            style={{ width: `${timerPercentage}%` }}
          />
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Question Image - LARGER & PROMINENT */}
          {hasImage && (
            <div className="bg-slate-100 p-2">
              {(currentQuestion.imageUrls && currentQuestion.imageUrls.length > 0) ? (
                <div className="space-y-2">
                  {currentQuestion.imageUrls.map((url, i) => (
                    <div key={i} className="relative w-full bg-white rounded-lg overflow-hidden shadow-sm">
                      <img
                        src={url}
                        alt={`Question ${i + 1}`}
                        className="w-full h-auto max-h-[45vh] object-contain mx-auto"
                      />
                    </div>
                  ))}
                </div>
              ) : currentQuestion.imageUrl ? (
                <div className="relative w-full bg-white rounded-lg overflow-hidden shadow-sm">
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Question"
                    className="w-full h-auto max-h-[45vh] object-contain mx-auto"
                  />
                </div>
              ) : null}
            </div>
          )}

          {/* Question Text */}
          <div className="p-3 sm:p-4">
            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200">
              <p className="text-sm sm:text-base md:text-lg font-bold text-slate-800 leading-relaxed text-center">
                {currentQuestion.question}
              </p>
            </div>
          </div>

          {/* Answer Area */}
          <div className="px-3 sm:px-4 pb-3">
            {currentQuestion.type === 'true_false' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedAnswer(true)}
                  className={`
                      py-3 px-4 rounded-xl border-2 font-bold text-base transition-all duration-200 cursor-pointer
                      ${selectedAnswer === true
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'border-slate-200 bg-white hover:border-emerald-400 text-slate-600 hover:text-emerald-600'
                    }
                    `}
                >
                  <span className="flex items-center justify-center gap-2">
                    {selectedAnswer === true && <Check className="w-5 h-5" />}
                    BENAR
                  </span>
                </button>
                <button
                  onClick={() => setSelectedAnswer(false)}
                  className={`
                      py-3 px-4 rounded-xl border-2 font-bold text-base transition-all duration-200 cursor-pointer
                      ${selectedAnswer === false
                      ? 'border-rose-500 bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                      : 'border-slate-200 bg-white hover:border-rose-400 text-slate-600 hover:text-rose-600'
                    }
                    `}
                >
                  <span className="flex items-center justify-center gap-2">
                    {selectedAnswer === false && <Check className="w-5 h-5" />}
                    SALAH
                  </span>
                </button>
              </div>
            )}

            {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
              <div className="space-y-2">
                {currentQuestion.options.map((optionText, index) => {
                  const optionLabel = ['A', 'B', 'C', 'D', 'E'][index];
                  return (
                    <button
                      key={optionLabel}
                      onClick={() => setSelectedAnswer(optionLabel)}
                      className={`
                          w-full p-2.5 sm:p-3 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer flex items-center gap-3 active:scale-[0.98]
                          ${selectedAnswer === optionLabel
                          ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                          : 'border-slate-200 bg-white hover:border-blue-300 text-slate-700'
                        }
                        `}
                    >
                      <div className={`
                          w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0
                          ${selectedAnswer === optionLabel ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}
                        `}>
                        {optionLabel}
                      </div>
                      <span className="text-sm sm:text-base font-semibold leading-snug flex-1">{optionText}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === 'matching' && currentQuestion.matchingLeft && (
              <div className="space-y-2">
                {currentQuestion.matchingLeft.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm">
                    {/* LEFT SIDE */}
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {index + 1}
                      </div>

                      {item.image ? (
                        <div className="w-20 h-14 sm:w-28 sm:h-20 rounded-lg overflow-hidden border-2 border-slate-200 bg-white shrink-0 shadow-sm">
                          <img src={item.image} alt={`Item ${index + 1}`} className="w-full h-full object-contain p-0.5" />
                        </div>
                      ) : (
                        <span className="text-sm sm:text-base font-bold text-slate-700 truncate ml-1">{item.text}</span>
                      )}
                    </div>

                    {/* CONNECTING ICON */}
                    <HelpCircle className="w-4 h-4 text-slate-300 shrink-0" />

                    {/* RIGHT SIDE: Select */}
                    <div className="w-24 shrink-0">
                      <Select
                        value={matchingAnswers[String(index + 1)] || ''}
                        onValueChange={(v) => setMatchingAnswers(prev => ({ ...prev, [String(index + 1)]: v }))}
                      >
                        <SelectTrigger className="bg-white border-2 border-slate-200 text-slate-900 h-9 rounded-lg font-bold text-sm focus:ring-blue-500 focus:border-blue-500">
                          <SelectValue placeholder="Pilih" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-slate-200 text-slate-900 rounded-xl shadow-xl">
                          {(currentQuestion.matchingRight || []).map((choice, i) => {
                            const label = String.fromCharCode(65 + i);
                            return (
                              <SelectItem key={label} value={label} className="font-semibold py-2 rounded-lg text-sm">
                                <span className="text-blue-600 mr-1 font-bold">{label}.</span>
                                <span className="truncate">{choice}</span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions - Fixed at bottom */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 shrink-0">
          <Button
            onClick={handleAnswer}
            disabled={!canAnswer()}
            className={`
              w-full h-12 text-base font-bold rounded-xl text-white shadow-lg cursor-pointer transition-all
              ${!canAnswer()
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/30 active:scale-[0.98]'
              }
            `}
          >
            SIMPAN JAWABAN
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionPopup;

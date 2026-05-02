'use client';

import { useState, useEffect, useCallback, useRef, type ChangeEvent } from 'react';
import { Clock, Check, HelpCircle, X, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGameStore } from '@/hooks/useGameStore';
import { Question } from '@/types/game';

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

const QuestionPopup = () => {
  const {
    currentQuestion,
    answerQuestion,
    submitManualImageAnswer,
    skipQuestion,
    nextQuestion,
    showFeedback,
    lastAnswerStatus,
    lastAnswerSimilarity,
    lastStudentAnswer,
  } = useGameStore();
  const [timeLeft, setTimeLeft] = useState(currentQuestion?.timeLimit || 30);
  const [isExiting, setIsExiting] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const submitLockRef = useRef(false);

  // For different question types
  const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | null>(null);
  const [shortAnswerText, setShortAnswerText] = useState('');
  const [essayImages, setEssayImages] = useState<Array<{ file: File; previewUrl: string }>>([]);

  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, string>>({
    '1': '', '2': '', '3': '', '4': '', '5': '', '6': ''
  });

  useEffect(() => {
    if (!currentQuestion) return;
    setTimeLeft(currentQuestion.timeLimit);
    setSelectedAnswer(null);
    setShortAnswerText('');
    setEssayImages([]);
    setMatchingAnswers({
      '1': '', '2': '', '3': '', '4': '', '5': '', '6': ''
    });
    setIsExiting(false);
    setIsSubmittingAnswer(false);
    submitLockRef.current = false;
  }, [currentQuestion]);

  const handleSkip = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      skipQuestion();
    }, 300);
  }, [skipQuestion]);

  const maxEssayImages = currentQuestion?.essayImageMaxCount ?? currentQuestion?.shortAnswerImageMaxCount ?? 3;

  const handleEssayImageChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxEssayImages - essayImages.length;
    const filesToAdd = files.slice(0, remainingSlots);

    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEssayImages((prev) => [...prev, { file, previewUrl: String(reader.result || '') }]);
      };
      reader.readAsDataURL(file);
    });

    event.target.value = '';
  }, [essayImages.length, maxEssayImages]);

  const removeEssayImage = useCallback((index: number) => {
    setEssayImages((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  }, []);

  useEffect(() => {
    if (showFeedback) return;
    if (timeLeft <= 0) {
      handleSkip();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleSkip, showFeedback]);

  const handleAnswer = useCallback(async () => {
    if (!currentQuestion || submitLockRef.current) return;
    let answers = '';

    switch (currentQuestion.type) {
      case 'true_false':
        if (selectedAnswer === null) return;
        break;
      case 'multiple_choice':
        if (!selectedAnswer) return;
        break;
      case 'short_answer':
        if (!shortAnswerText.trim()) return;
        break;
      case 'essay':
        if (essayImages.length === 0) return;
        break;
      case 'matching':
        if (!currentQuestion.matchingLeft) return;
        if (currentQuestion.matchingLeft.some((_, i) => !matchingAnswers[String(i + 1)])) return;
        answers = currentQuestion.matchingLeft.map((_, i) => {
          const num = i + 1;
          return `${num}${matchingAnswers[String(num)] || ''}`;
        }).join('-');
        break;
    }

    submitLockRef.current = true;
    setIsSubmittingAnswer(true);

    try {
      switch (currentQuestion.type) {
        case 'true_false':
          answerQuestion(selectedAnswer as boolean);
          break;
        case 'multiple_choice':
          answerQuestion(selectedAnswer as string);
          break;
        case 'short_answer':
          answerQuestion(shortAnswerText.trim());
          break;
        case 'essay':
          await submitManualImageAnswer(essayImages.map((item) => item.file), 'essay');
          break;
        case 'matching':
          answerQuestion(answers);
          break;
      }
    } finally {
      setIsSubmittingAnswer(false);
      submitLockRef.current = false;
    }
  }, [currentQuestion, selectedAnswer, shortAnswerText, essayImages, matchingAnswers, answerQuestion, submitManualImageAnswer]);

  const handleContinue = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      nextQuestion();
    }, 200);
  }, [nextQuestion]);

  // Close without answering (user can try again later)
  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      // Just clear the current question without marking as wrong
      useGameStore.setState({ currentQuestion: null });
    }, 300);
  }, []);

  if (!currentQuestion) return null;

  const feedbackTitle = lastAnswerStatus === 'correct'
    ? 'LUAR BIASA!'
    : lastAnswerStatus === 'almost'
      ? 'HAMPIR BENAR!'
      : lastAnswerStatus === 'pending'
        ? 'TERKIRIM!'
      : 'OOPS!';

  const feedbackSubtitle = lastAnswerStatus === 'correct'
    ? `+${currentQuestion.points} poin`
    : lastAnswerStatus === 'pending'
      ? 'Jawaban gambar terkirim. Menunggu penilaian guru.'
    : currentQuestion.type === 'short_answer'
      ? (lastAnswerStatus === 'almost' ? 'Makna jawaban kamu mirip' : 'Makna jawaban kamu berbeda')
      : 'Jawaban kamu belum tepat';

  const isUrgent = timeLeft <= 10;

  const canAnswer = () => {
    if (showFeedback || isSubmittingAnswer) return false;
    switch (currentQuestion.type) {
      case 'true_false':
        return selectedAnswer !== null;
      case 'multiple_choice':
        return !!selectedAnswer;
      case 'short_answer':
        return shortAnswerText.trim().length > 0;
      case 'essay':
        return essayImages.length > 0;
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

        {/* Timer Progress Bar removed */}

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {showFeedback && (
            <div className="p-4">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {lastAnswerStatus === 'correct' ? (
                  <div className="px-4 py-3 font-black text-white text-center bg-emerald-600">
                    <div className="text-xl tracking-tight">{feedbackTitle}</div>
                    <div className="text-xs font-bold text-white/90 mt-0.5">{feedbackSubtitle}</div>
                    {/* {currentQuestion.type === 'short_answer' && lastAnswerSimilarity !== null && (
                      <div className="text-[11px] font-bold text-white/90 mt-1">
                        Skor makna: {Math.round(lastAnswerSimilarity * 100)}%
                      </div>
                    )} */}
                  </div>
                ) : lastAnswerStatus === 'almost' ? (
                  <div className="px-4 py-3 font-black text-white text-center bg-amber-600">
                    <div className="text-xl tracking-tight">{feedbackTitle}</div>
                    <div className="text-xs font-bold text-white/90 mt-0.5">{feedbackSubtitle}</div>
                    {/* {currentQuestion.type === 'short_answer' && lastAnswerSimilarity !== null && (
                      <div className="text-[11px] font-bold text-white/90 mt-1">
                        Skor makna: {Math.round(lastAnswerSimilarity * 100)}%
                      </div>
                    )} */}
                  </div>
                ) : (
                  <div className="px-4 py-3 font-black text-white text-center bg-rose-600">
                    <div className="text-xl tracking-tight">{feedbackTitle}</div>
                    <div className="text-xs font-bold text-white/90 mt-0.5">{feedbackSubtitle}</div>
                    {/* {currentQuestion.type === 'short_answer' && lastAnswerSimilarity !== null && (
                      <div className="text-[11px] font-bold text-white/90 mt-1">
                        Skor makna: {Math.round(lastAnswerSimilarity * 100)}%
                      </div>
                    )} */}
                  </div>
                )}

                <div className="p-4 space-y-3">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Jawaban Kamu
                    </div>
                    <div className="text-sm font-bold text-slate-800 whitespace-pre-wrap break-words">
                      {lastStudentAnswer || '-'}
                    </div>
                  </div>

                  {lastAnswerStatus !== 'pending' && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                      <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700 mb-1">
                        Jawaban Benar
                      </div>
                      <div className="text-sm font-bold text-emerald-900 whitespace-pre-wrap break-words">
                        {getCorrectAnswerText(currentQuestion)}
                      </div>
                    </div>
                  )}

                  {/* Explanation panel — shown for ALL types when wrong/almost */}
                  {lastAnswerStatus !== 'correct' && (
                    (currentQuestion.explanation || currentQuestion.matchingExplanation) && (
                      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                        <div className="text-[10px] font-black uppercase tracking-wider text-amber-700 mb-1.5 flex items-center gap-1">
                          💡 Penjelasan
                        </div>
                        <div className="text-sm font-semibold text-amber-900 leading-relaxed whitespace-pre-wrap break-words">
                          {currentQuestion.matchingExplanation || currentQuestion.explanation}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Question Image - LARGER & PROMINENT */}
          {!showFeedback && hasImage && (
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
          {!showFeedback && (
            <div className="p-3 sm:p-4">
              <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200">
                <p className="text-sm sm:text-base md:text-lg font-bold text-slate-800 leading-relaxed text-center">
                  {currentQuestion.question}
                </p>
              </div>
            </div>
          )}

          {/* Answer Area */}
          {!showFeedback && (
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

              {currentQuestion.type === 'short_answer' && (
                <div className="space-y-2">
                  <Textarea
                    value={shortAnswerText}
                    onChange={(e) => setShortAnswerText(e.target.value)}
                    placeholder="Ketik jawaban singkat kamu di sini..."
                    className="min-h-[110px] resize-none bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 text-base font-bold rounded-xl"
                  />
                  <p className="text-[11px] text-slate-500 font-semibold text-center">
                    Sistem akan menilai kemiripan jawaban.
                  </p>
                </div>
              )}

              {currentQuestion.type === 'essay' && (
                <div className="space-y-2">
                  <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50 p-3 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-blue-700 font-black text-xs uppercase tracking-wider">
                        <ImageIcon className="w-4 h-4" />
                        Upload Gambar Jawaban
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 rounded-full bg-white text-blue-700 hover:bg-blue-100 border border-blue-200"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={essayImages.length >= maxEssayImages}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Tambah
                      </Button>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleEssayImageChange}
                        aria-label="Upload gambar jawaban esai"
                        title="Upload gambar jawaban esai"
                        className="hidden"
                      />
                    </div>

                    {essayImages.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {essayImages.map((item, index) => (
                          <div key={`${item.file.name}-${index}`} className="relative rounded-xl overflow-hidden border border-blue-200 bg-white shadow-sm">
                            <img src={item.previewUrl} alt={`Essay upload ${index + 1}`} className="h-28 w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeEssayImage(index)}
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                              aria-label={`Hapus gambar ${index + 1}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-blue-100 bg-white p-3 text-center text-xs font-semibold text-slate-500">
                        Belum ada gambar diunggah.
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 font-semibold text-center">
                    Jawaban esai dikirim sebagai gambar dan akan dinilai manual oleh guru.
                  </p>
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
                          <div className="w-32 h-24 sm:w-40 sm:h-28 rounded-lg overflow-hidden border-2 border-slate-200 bg-white shrink-0 shadow-sm">
                            <img src={item.image} alt={`Item ${index + 1}`} className="w-full h-full object-contain p-0.5" />
                          </div>
                        ) : (
                          <span className="text-sm sm:text-base font-bold text-slate-700 ml-1 break-words leading-tight">
                            {item.text}
                          </span>
                        )}
                      </div>

                      {/* CONNECTING ICON */}
                      <HelpCircle className="w-4 h-4 text-slate-300 shrink-0" />

                      {/* RIGHT SIDE: Select */}
                      <div className="w-32 sm:w-48 shrink-0">
                        <Select
                          value={matchingAnswers[String(index + 1)] || ''}
                          onValueChange={(v) => setMatchingAnswers(prev => ({ ...prev, [String(index + 1)]: v }))}
                        >
                          <SelectTrigger className="bg-white border-2 border-slate-200 text-slate-900 min-h-[2.25rem] h-auto py-2 rounded-lg font-bold text-sm focus:ring-blue-500 focus:border-blue-500 text-left">
                            <SelectValue placeholder="Pilih" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-slate-200 text-slate-900 rounded-xl shadow-xl">
                            {(currentQuestion.matchingRight || []).map((choice, i) => {
                              const label = String.fromCharCode(65 + i);
                              return (
                                <SelectItem key={label} value={label} className="font-semibold py-2 rounded-lg text-sm">
                                  <span className="text-blue-600 mr-1 font-bold shrink-0">{label}.</span>
                                  <span className="whitespace-normal break-words">{choice}</span>
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
          )}
        </div>

        {/* Footer Actions - Fixed at bottom */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 shrink-0">
          {showFeedback ? (
            <Button
              onClick={handleContinue}
              className="w-full h-12 text-base font-bold rounded-xl text-white shadow-lg cursor-pointer transition-all bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/30 active:scale-[0.98]"
            >
              LANJUT
            </Button>
          ) : (
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
              {isSubmittingAnswer ? 'MENGIRIM...' : 'SIMPAN JAWABAN'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionPopup;

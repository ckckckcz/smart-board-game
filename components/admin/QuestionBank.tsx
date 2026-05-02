'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { Plus, Trash2, BookOpen, Clock, AlertCircle, Image, X, Check, ArrowRight, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGameStore } from '@/hooks/useGameStore';
import { Question, QuestionCategory, QuestionType, MatchingPair, MatchingLeftItem } from '@/types/game';
import { CATEGORY_COLORS } from '@/data/mockData';

const TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'Pilihan Ganda',
  true_false: 'Benar/Salah',
  matching: 'Menjodohkan',
  short_answer: 'Singkat',
  essay: 'Esai',
};

// Simple category labels (C1-C6 only)
const SIMPLE_CATEGORY_LABELS: Record<QuestionCategory, string> = {
  C1: 'C1',
  C2: 'C2',
  C3: 'C3',
  C4: 'C4',
  C5: 'C5',
  C6: 'C6',
};

const QuestionBank = () => {
  const { allQuestions, addQuestion, deleteQuestion, updateQuestion } = useGameStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTimeValue, setEditTimeValue] = useState<string>('');
  const [editPointsValue, setEditPointsValue] = useState<string>('');
  // Separate popup state for editing penjelasan
  const [explanationModalId, setExplanationModalId] = useState<string | null>(null);
  const [explanationModalType, setExplanationModalType] = useState<string>('');
  const [explanationModalValue, setExplanationModalValue] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  // Mount flag for portal
  useEffect(() => setIsMounted(true), []);

  // Lock body scroll when explanation modal is open
  useEffect(() => {
    if (explanationModalId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [explanationModalId]);
  const [category, setCategory] = useState<QuestionCategory>('C1');
  const [type, setType] = useState<QuestionType>('multiple_choice');
  const [questionText, setQuestionText] = useState('');
  const [timeLimit, setTimeLimit] = useState(3);
  const [points, setPoints] = useState(100);

  // Optional explanation shown during feedback
  const [explanation, setExplanation] = useState('');

  // Image upload
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Multiple Choice (A-E) - moved comment below

  // Multiple Choice (A-E)
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [optionE, setOptionE] = useState('');
  const [correctOption, setCorrectOption] = useState<string>('');

  // True/False
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<string>('');

  // Short Answer (Singkat)
  const [shortAnswerKey, setShortAnswerKey] = useState('');
  const [essayInstructions, setEssayInstructions] = useState('');

  // Matching (Simplified Logic for Flex Counts)
  const [matchingLeftInput, setMatchingLeftInput] = useState<MatchingLeftItem[]>([
    { text: '' }, { text: '' }, { text: '' }
  ]);
  const [matchingRightInput, setMatchingRightInput] = useState<string[]>([
    '', '', '', ''
  ]);
  const [matchingAnswer, setMatchingAnswer] = useState('');
  const [matchingExplanation, setMatchingExplanation] = useState('');

  const updateLeftCount = (count: number) => {
    const newLeft = [...matchingLeftInput];
    if (count > newLeft.length) {
      for (let i = newLeft.length; i < count; i++) newLeft.push({ text: '' });
    } else {
      newLeft.length = count;
    }
    setMatchingLeftInput(newLeft);
  };

  const updateRightCount = (count: number) => {
    const newRight = [...matchingRightInput];
    if (count > newRight.length) {
      for (let i = newRight.length; i < count; i++) newRight.push('');
    } else {
      newRight.length = count;
    }
    setMatchingRightInput(newRight);
  };

  const updateLeftItem = (index: number, updates: Partial<MatchingLeftItem>) => {
    setMatchingLeftInput(matchingLeftInput.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    ));
  };

  const updateRightItem = (index: number, value: string) => {
    setMatchingRightInput(matchingRightInput.map((item, i) =>
      i === index ? value : item
    ));
  };

  const handleLeftImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateLeftItem(index, { image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLeftImage = (index: number) => {
    updateLeftItem(index, { image: undefined });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const remainingSlots = 3 - imageUrls.length;
      const filesToUpload = Array.from(files).slice(0, remainingSlots);

      filesToUpload.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setImageUrls(prev => [...prev, result].slice(0, 3));
        };
        reader.readAsDataURL(file);
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeSpecificImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const clearImages = () => {
    setImageUrls([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setQuestionText('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setOptionE('');
    setCorrectOption('');
    setTrueFalseAnswer('');
    setShortAnswerKey('');
    setEssayInstructions('');
    setExplanation('');
    setMatchingLeftInput([
      { text: '' }, { text: '' }, { text: '' }
    ]);
    setMatchingRightInput(['', '', '', '']);
    setMatchingAnswer('');
    setMatchingExplanation('');
    clearImages();
  };

  const handleAddQuestion = () => {
    // Validation
    const trimmedQuestion = questionText.trim();

    // For types other than matching, question text is strictly required
    if (type !== 'matching' && !trimmedQuestion) {
      toast.error('Teks pertanyaan wajib diisi!');
      return;
    }

    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      category,
      type,
      question: trimmedQuestion || (type === 'matching' ? 'Pasangkan item-item berikut dengan benar:' : ''),
      timeLimit: timeLimit * 60, // Convert minutes to seconds
      points,
    };

    if (explanation.trim()) {
      newQuestion.explanation = explanation.trim();
    }

    if (type === 'essay') {
      newQuestion.requiresImageAnswer = true;
    }

    // Add images if provided
    if (imageUrls.length > 0) {
      newQuestion.imageUrls = imageUrls;
      newQuestion.imageUrl = imageUrls[0]; // Provide first image as main imageUrl for backward compatibility
    }

    // Add type-specific fields
    switch (type) {

      case 'multiple_choice':
        if (!optionA || !optionB || !correctOption) {
          toast.error('Lengkapi pilihan A & B serta tentukan jawaban benar!');
          return;
        }
        const options = [optionA, optionB];
        if (optionC) options.push(optionC);
        if (optionD) options.push(optionD);
        if (optionE) options.push(optionE);
        newQuestion.options = options;
        newQuestion.correctAnswer = correctOption;
        break;
      case 'true_false':
        if (!trueFalseAnswer) {
          toast.error('Pilih jawaban Benar atau Salah!');
          return;
        }
        newQuestion.correctAnswer = trueFalseAnswer === 'true';
        break;

      case 'short_answer':
        if (!shortAnswerKey.trim()) {
          toast.error('Kunci jawaban singkat wajib diisi!');
          return;
        }
        newQuestion.correctAnswer = shortAnswerKey.trim();
        break;

      case 'essay':
        if (!trimmedQuestion) {
          toast.error('Pertanyaan esai wajib diisi!');
          return;
        }
        newQuestion.requiresImageAnswer = true;
        break;

      case 'matching':
        const validLeft = matchingLeftInput.filter(item => item.text || item.image);
        const validRight = matchingRightInput.filter(item => item !== '');

        if (validLeft.length < 1 || validRight.length < 1) {
          toast.error('Minimal harus ada 1 item di kiri dan 1 item di kanan!');
          return;
        }

        if (!matchingAnswer.trim()) {
          toast.error('Kunci jawaban matching (format 1A-2B) wajib diisi!');
          return;
        }

        newQuestion.matchingLeft = validLeft;
        newQuestion.matchingRight = validRight;
        newQuestion.matchingAnswer = matchingAnswer.trim().toUpperCase();
        if (matchingExplanation.trim()) {
          newQuestion.matchingExplanation = matchingExplanation.trim();
        }
        break;
    }

    try {
      addQuestion(newQuestion);
      toast.success('Soal berhasil disimpan!');
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error('Gagal menyimpan soal. Silakan coba lagi.');
    }
  };

  const renderAnswerDisplay = (q: Question) => {
    switch (q.type) {
      case 'multiple_choice':
        return <span className="text-base text-slate-900 font-bold">{String(q.correctAnswer) || '-'}</span>;
      case 'true_false':
        return q.correctAnswer
          ? <span className="text-sm font-bold text-emerald-600">Benar</span>
          : <span className="text-sm font-bold text-rose-600">Salah</span>;
      case 'short_answer':
        return <span className="text-sm font-bold text-slate-700">{String(q.correctAnswer || '-')}</span>;
      case 'essay':
        return <span className="text-sm font-bold text-blue-600">Gambar</span>;
      case 'matching':
        return (
          <div className="flex flex-col items-center">
            <span className="text-sm text-slate-600 font-bold">{q.matchingAnswer || '-'}</span>
            <span className="text-[10px] text-slate-400 font-bold">
              ({q.matchingLeft?.length || 0}L : {q.matchingRight?.length || 0}R)
            </span>
          </div>
        );
      default:
        return <span className="text-sm text-slate-500">-</span>;
    }
  };

  return (
    <div className="space-y-8 animate-scale-in">
      {/* Add Question Form */}
      <div className="bg-white border border-border rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8 bg-slate-50 border-b border-border">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </span>
            Tambah Soal Baru
          </h3>
        </div>

        <div className="p-4 sm:p-6 md:p-8 space-y-6">
          {/* Row 1: Category, Type, Time, Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as QuestionCategory)}>
                <SelectTrigger className="bg-white border border-slate-200 text-slate-900 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200 text-slate-900">
                  {(Object.keys(SIMPLE_CATEGORY_LABELS) as QuestionCategory[]).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {SIMPLE_CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Tipe Soal</Label>
              <Select value={type} onValueChange={(v) => { setType(v as QuestionType); resetForm(); }}>
                <SelectTrigger className="bg-white border border-slate-200 text-slate-900 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200 text-slate-900">
                  {(Object.keys(TYPE_LABELS) as QuestionType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Waktu (menit)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  min={1}
                  max={30}
                  className="pl-9 bg-white border border-slate-200 text-slate-900 h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Poin</Label>
              <div className="relative">
                <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  min={10}
                  step={10}
                  className="pl-9 bg-white border border-slate-200 text-slate-900 h-11"
                />
              </div>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <Label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Pertanyaan</Label>
            <Textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Tulis pertanyaan di sini..."
              className="min-h-[100px] sm:min-h-[120px] resize-none bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 text-base sm:text-xl font-bold"
            />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Image className="w-4 h-4" />
              Gambar Soal (Maksimal 3)
            </Label>

            {/* Image List / Dropzone */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-white group/thumb">
                  <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSpecificImage(idx)}
                      className="text-white hover:bg-rose-500 rounded-full w-10 h-10 p-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                  <Badge className="absolute top-2 left-2 bg-blue-600/80 backdrop-blur-sm text-white text-[10px] border-0">
                    Gambar {idx + 1}
                  </Badge>
                </div>
              ))}

              {imageUrls.length < 3 && (
                <div
                  className="aspect-video border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-blue-400 transition-all cursor-pointer flex flex-col items-center justify-center p-4 text-center group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-tighter">Tambah Gambar {imageUrls.length + 1}/3</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    aria-label="Upload gambar soal"
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-slate-100 my-4" />

          {/* Dynamic form based on type */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-border">


            {type === 'multiple_choice' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {['A', 'B', 'C', 'D', 'E'].map((opt, idx) => (
                    <div key={opt} className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Pilihan {opt} {idx < 5 ? <span className="text-rose-500">*</span> : <span className="text-slate-400">(opsional)</span>}
                      </Label>
                      <Input
                        value={idx === 0 ? optionA : idx === 1 ? optionB : idx === 2 ? optionC : idx === 3 ? optionD : optionE}
                        onChange={(e) => {
                          if (idx === 0) setOptionA(e.target.value);
                          if (idx === 1) setOptionB(e.target.value);
                          if (idx === 2) setOptionC(e.target.value);
                          if (idx === 3) setOptionD(e.target.value);
                          if (idx === 4) setOptionE(e.target.value);
                        }}
                        placeholder={`Pilihan ${opt}`}
                        className="bg-white border border-slate-200 text-slate-900 h-11"
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Jawaban Benar</Label>
                  <Select value={correctOption} onValueChange={setCorrectOption}>
                    <SelectTrigger className="bg-emerald-50 border border-emerald-200 text-emerald-700 h-11 font-bold">
                      <SelectValue placeholder="-- Pilih Jawaban Benar --" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 text-slate-900">
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                      <SelectItem value="E">E</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {type === 'true_false' && (
              <div className="space-y-2">
                <Label className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Jawaban Benar</Label>
                <Select value={trueFalseAnswer} onValueChange={setTrueFalseAnswer}>
                  <SelectTrigger className="bg-emerald-50 border border-emerald-200 text-emerald-700 h-11 font-bold">
                    <SelectValue placeholder="-- Pilih Benar/Salah --" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 text-slate-900">
                    <SelectItem value="true">Benar</SelectItem>
                    <SelectItem value="false">Salah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {type === 'short_answer' && (
              <div className="space-y-2">
                <Label className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Kunci Jawaban Singkat</Label>
                <Input
                  value={shortAnswerKey}
                  onChange={(e) => setShortAnswerKey(e.target.value)}
                  placeholder="Contoh: Menjaga kestabilan nilai rupiah"
                  className="bg-white border border-slate-200 text-slate-900 h-11"
                />
                <p className="text-[11px] text-slate-500 font-semibold">
                  Penilaian pakai kemiripan teks: ≥85% benar, 60–84% hampir benar, &lt;60% salah.
                </p>
              </div>
            )}

            {type === 'essay' && (
              <div className="space-y-2">
                <Label className="text-xs font-bold text-blue-600 uppercase tracking-wider">Petunjuk Esai</Label>
                <Textarea
                  value={essayInstructions}
                  onChange={(e) => setEssayInstructions(e.target.value)}
                  placeholder="Tulis pertanyaan esai. Siswa akan menjawab dengan foto saja."
                  className="min-h-[90px] resize-none bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400"
                />
                <p className="text-[11px] text-blue-700 font-semibold">
                  Esai tidak pakai jawaban kunci. Siswa upload gambar, lalu guru memberi poin manual.
                </p>
              </div>
            )}

            {type === 'matching' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <div className="flex items-center gap-3">
                    <Label className="text-xs font-black text-blue-700 uppercase">JUMLAH KIRI</Label>
                    <Select value={String(matchingLeftInput.length)} onValueChange={(v) => updateLeftCount(Number(v))}>
                      <SelectTrigger className="w-20 bg-white border-blue-200 h-10 font-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {[1, 2, 3, 4, 5, 6].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="hidden sm:block w-px h-8 bg-blue-200" />
                  <div className="flex items-center gap-3">
                    <Label className="text-xs font-black text-emerald-700 uppercase">JUMLAH KANAN</Label>
                    <Select value={String(matchingRightInput.length)} onValueChange={(v) => updateRightCount(Number(v))}>
                      <SelectTrigger className="w-20 bg-white border-emerald-200 h-10 font-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {[1, 2, 3, 4, 5, 6].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
                  {/* LEFT COLUMN */}
                  <div className="space-y-4">
                    <Label className="text-xs font-black text-blue-600 uppercase tracking-widest pl-2">Kolom Kiri ({matchingLeftInput.length})</Label>
                    {matchingLeftInput.map((item, index) => (
                      <div key={index} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="w-6 h-6 rounded bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">{index + 1}</span>
                          {item.image && <Badge className="bg-blue-50 text-blue-600 text-[9px] border-0">Ada Gambar</Badge>}
                        </div>
                        <Input
                          value={item.text}
                          onChange={(e) => updateLeftItem(index, { text: e.target.value })}
                          placeholder="Teks item kiri..."
                          className="bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 h-10 text-sm"
                        />
                        <div className="flex items-center gap-2">
                          <input type="file" accept="image/*" onChange={(e) => handleLeftImageUpload(index, e)} className="hidden" id={`l-img-${index}`} />
                          <label htmlFor={`l-img-${index}`} className="flex-1 h-9 flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 text-[10px] font-bold text-slate-500 cursor-pointer hover:bg-blue-50 transition-all">
                            <Image className="w-3 h-3" /> {item.image ? 'Ganti' : 'Gambar'}
                          </label>
                          {item.image && (
                            <div className="relative w-12 h-9 rounded border border-slate-200 overflow-hidden shrink-0 group">
                              <img src={item.image} alt="" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeLeftImage(index)}
                                aria-label="Hapus gambar"
                                title="Hapus gambar"
                                className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="space-y-4">
                    <Label className="text-xs font-black text-emerald-600 uppercase tracking-widest pl-2">Kolom Kanan ({matchingRightInput.length})</Label>
                    {matchingRightInput.map((item, index) => (
                      <div key={index} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center">{String.fromCharCode(65 + index)}</span>
                          <Input
                            value={item}
                            onChange={(e) => updateRightItem(index, e.target.value)}
                            placeholder="Teks item kanan (pilihan)..."
                            className="bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 h-10 text-sm flex-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                      <Label className="text-sm font-bold uppercase tracking-tight">Kunci Jawaban Matching</Label>
                    </div>
                    <Badge className="bg-emerald-500 text-white border-0 hover:bg-emerald-600">
                      Terbaca: {matchingAnswer.split('-').filter(Boolean).length}/{matchingLeftInput.length}
                    </Badge>
                  </div>

                  <div className="relative">
                    <Input
                      value={matchingAnswer}
                      onChange={(e) => setMatchingAnswer(e.target.value.toUpperCase())}
                      placeholder={`Contoh: 1A-2B-3C`}
                      className="bg-white border-emerald-200 text-emerald-900 font-black h-14 text-xl text-center tracking-widest focus:ring-emerald-500 focus:border-emerald-500 rounded-2xl shadow-inner shadow-emerald-100/50"
                    />
                  </div>

                  <div className="flex items-start gap-3 bg-white/60 p-4 rounded-2xl border border-emerald-100/50">
                    <AlertCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-emerald-700 leading-relaxed font-medium">
                      Gunakan format angka dan huruf kapital dipisahkan tanda strip. <span className="font-bold underline text-emerald-800">Wajib ada {matchingLeftInput.length} pasangan</span> agar sistem penilaian bekerja dengan benar.
                    </p>
                  </div>
                </div>

                {/* Matching Explanation */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Penjelasan Menjodohkan (Ditampilkan saat jawaban salah)
                  </Label>
                  <Textarea
                    value={matchingExplanation}
                    onChange={(e) => setMatchingExplanation(e.target.value)}
                    placeholder="Contoh: Pasangan yang benar adalah 1-A (Aset = Sumber Daya), 2-B (Liabilitas = Kewajiban)..."
                    className="min-h-[90px] resize-none bg-white border border-amber-200 text-slate-900 placeholder:text-slate-400 focus:border-amber-400"
                  />
                  <p className="text-[11px] text-amber-700 font-semibold">
                    💡 Penjelasan ini akan muncul di popup di bawah kotak menjodohkan saat siswa menjawab salah.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pembahasan (Opsional)</Label>
              <Textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Contoh: Jawaban benar karena Bank Indonesia bertugas menjaga kestabilan nilai rupiah..."
                className="min-h-[90px] resize-none bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <Button
            onClick={handleAddQuestion}
            className="w-full h-12 font-bold rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-md cursor-pointer transition-all hover:scale-[1.01]"
          >
            <Plus className="w-5 h-5 mr-2" />
            Simpan Soal ke Bank Data
          </Button>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white border border-border rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold text-slate-900">Daftar Soal ({allQuestions.length})</h3>
          </div>
        </div>

        <div className="p-0">
          {allQuestions.length === 0 ? (
            <p className="text-center text-slate-400 py-12">
              Belum ada soal. Tambahkan soal pertama!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Kategori</TableHead>
                    <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Tipe</TableHead>
                    <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Gambar</TableHead>
                    <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider max-w-[200px]">Pertanyaan</TableHead>
                    <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Jawaban</TableHead>
                    <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider max-w-[220px]">Penjelasan</TableHead>
                    <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider text-center">Waktu</TableHead>
                    <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider text-center">Poin</TableHead>
                    <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allQuestions
                    .slice()
                    .sort((a, b) => {
                      const catA = a.category.replace('C', '');
                      const catB = b.category.replace('C', '');
                      return parseInt(catA) - parseInt(catB);
                    })
                    .map((q) => (
                      <TableRow key={q.id} className="border-border hover:bg-slate-50 transition-colors">
                        <TableCell>
                          <Badge className={`${CATEGORY_COLORS[q.category]} text-white border-0`}>
                            {q.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-slate-50 text-slate-600 border border-border">
                            {TYPE_LABELS[q.type]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex -space-x-4">
                            {q.imageUrls && q.imageUrls.length > 0 ? (
                              q.imageUrls.map((url, i) => (
                                <div key={i} className="relative w-10 h-10 rounded-lg border-2 border-white overflow-hidden shadow-sm shrink-0">
                                  <img src={url} alt="" className="w-full h-full object-cover" />
                                </div>
                              ))
                            ) : q.imageUrl ? (
                              <div className="relative w-10 h-10 rounded-lg border-2 border-white overflow-hidden shadow-sm shrink-0">
                                <img src={q.imageUrl} alt="" className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <div className="group relative">
                            <p className="truncate text-slate-900 font-bold text-base cursor-help">{q.question}</p>
                            {/* Tooltip - appears on hover */}
                            <div className="absolute left-0 top-full mt-2 z-50 hidden group-hover:block w-[400px] max-w-[90vw]">
                              <div className="bg-slate-900 text-white text-sm p-4 rounded-xl shadow-2xl border border-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                                <div className="absolute -top-2 left-4 w-4 h-4 bg-slate-900 border-l border-t border-slate-700 transform rotate-45"></div>
                                {q.question}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {renderAnswerDisplay(q)}
                        </TableCell>

                        {/* Penjelasan column - full cell clickable, mobile-friendly */}
                        <TableCell className="max-w-[200px] p-2">
                          <button
                            onClick={() => {
                              setExplanationModalId(q.id);
                              setExplanationModalType(q.type);
                              setExplanationModalValue(q.matchingExplanation || q.explanation || '');
                            }}
                            title="Edit Penjelasan"
                            className="w-full text-left group/fb cursor-pointer"
                          >
                            {(() => {
                              const fb = q.matchingExplanation || q.explanation;
                              return fb ? (
                                <div className="flex items-start gap-1.5 rounded-lg px-2 py-1.5 bg-amber-50 border border-amber-100 hover:border-amber-300 hover:bg-amber-100 transition-colors">
                                  <p className="text-xs text-amber-900 line-clamp-2 leading-relaxed flex-1">{fb}</p>
                                  <Pencil className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 border border-dashed border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-colors">
                                  <Pencil className="w-3 h-3 text-slate-300 group-hover/fb:text-amber-400 transition-colors" />
                                  <span className="text-xs text-slate-300 group-hover/fb:text-amber-500 transition-colors">Tambah penjelasan</span>
                                </div>
                              );
                            })()}
                          </button>
                        </TableCell>
                        <TableCell className="text-center">
                          {editingId === q.id ? (
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={editTimeValue}
                              onChange={(e) => setEditTimeValue(e.target.value.replace(/[^0-9]/g, ''))}
                              className="w-14 h-8 text-center text-sm font-bold border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="menit"
                            />
                          ) : (
                            <span className="text-slate-500">{Math.round(q.timeLimit / 60)}m</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {editingId === q.id ? (
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={editPointsValue}
                              onChange={(e) => setEditPointsValue(e.target.value.replace(/[^0-9]/g, ''))}
                              className="w-16 h-8 text-center text-sm font-bold border border-amber-400 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                              placeholder="poin"
                            />
                          ) : (
                            <span className="font-bold text-amber-600">{q.points}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {editingId === q.id ? (
                              <>
                                <Button
                                  onClick={() => {
                                    const newTime = parseInt(editTimeValue) || Math.round(q.timeLimit / 60);
                                    const newPoints = parseInt(editPointsValue) || q.points;
                                    updateQuestion(q.id, {
                                      timeLimit: newTime * 60,
                                      points: newPoints,
                                    });
                                    setEditingId(null);
                                    toast.success('Soal berhasil diperbarui!');
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50 cursor-pointer"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => setEditingId(null)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  onClick={() => {
                                    setEditingId(q.id);
                                    setEditTimeValue(String(Math.round(q.timeLimit / 60)));
                                    setEditPointsValue(String(q.points));
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                                  title="Edit Waktu & Poin"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => deleteQuestion(q.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 cursor-pointer"
                                  title="Hapus Soal"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* ====== Explanation Edit Modal — rendered via portal to document.body ====== */}
      {isMounted && explanationModalId && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setExplanationModalId(null)}
          />

          {/* Modal Card */}
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-border overflow-hidden animate-[fadeSlideUp_0.2s_ease-out]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 bg-amber-50 border-b border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Edit Penjelasan Soal</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    💡 Ditampilkan ke siswa saat jawaban salah
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExplanationModalId(null)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-amber-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                title="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-7 space-y-4">
              <Textarea
                value={explanationModalValue}
                onChange={(e) => setExplanationModalValue(e.target.value)}
                placeholder="Tulis penjelasan jawaban yang benar di sini. Contoh: Jawaban benar adalah A karena Bank Indonesia adalah bank sentral yang bertugas menjaga kestabilan rupiah..."
                className="min-h-[240px] resize-y bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-amber-400 rounded-2xl text-sm leading-relaxed p-4"
                autoFocus
              />
              <p className="text-xs text-amber-600 font-semibold">
                Penjelasan ini akan muncul di popup permainan saat siswa menjawab salah.
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 px-7 py-5 bg-slate-50 border-t border-border">
              <Button
                variant="ghost"
                onClick={() => setExplanationModalId(null)}
                className="flex-1 h-11 rounded-xl cursor-pointer font-bold"
              >
                Batal
              </Button>
              <Button
                onClick={() => {
                  const updates = explanationModalType === 'matching'
                    ? { matchingExplanation: explanationModalValue }
                    : { explanation: explanationModalValue };
                  updateQuestion(explanationModalId, updates);
                  setExplanationModalId(null);
                  toast.success('Penjelasan berhasil disimpan!');
                }}
                className="flex-1 h-11 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl cursor-pointer shadow-md shadow-amber-500/30"
              >
                <Check className="w-4 h-4 mr-2" />
                Simpan Penjelasan
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default QuestionBank;
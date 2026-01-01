'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, BookOpen, Clock, AlertCircle, Image, X, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGameStore } from '@/hooks/useGameStore';
import { Question, QuestionCategory, QuestionType, MatchingPair } from '@/types/game';
import { CATEGORY_COLORS } from '@/data/mockData';

const TYPE_LABELS: Record<QuestionType, string> = {
  essay: 'Essay',
  multiple_choice: 'Pilihan Ganda',
  true_false: 'Benar/Salah',
  matching: 'Menjodohkan',
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
  const { allQuestions, addQuestion, deleteQuestion } = useGameStore();
  const [category, setCategory] = useState<QuestionCategory>('C1');
  const [type, setType] = useState<QuestionType>('essay');
  const [questionText, setQuestionText] = useState('');
  const [timeLimit, setTimeLimit] = useState(3);
  const [points, setPoints] = useState(100);

  // Image upload
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Essay
  const [essayAnswer, setEssayAnswer] = useState('');

  // Multiple Choice (A-E)
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [optionE, setOptionE] = useState('');
  const [correctOption, setCorrectOption] = useState<string>('');

  // True/False
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<string>('');

  // Matching
  // Matching
  const [matchingPairsInput, setMatchingPairsInput] = useState<MatchingPair[]>([
    { left: '', right: '' },
    { left: '', right: '' },
    { left: '', right: '' }
  ]);
  const [matchingAnswer, setMatchingAnswer] = useState('');

  const addMatchingPair = () => {
    if (matchingPairsInput.length < 10) {
      setMatchingPairsInput([...matchingPairsInput, { left: '', right: '' }]);
    }
  };

  const removeMatchingPair = (index: number) => {
    if (matchingPairsInput.length > 1) {
      setMatchingPairsInput(matchingPairsInput.filter((_, i) => i !== index));
    }
  };

  const updateMatchingPair = (index: number, updates: Partial<MatchingPair>) => {
    setMatchingPairsInput(matchingPairsInput.map((pair, i) =>
      i === index ? { ...pair, ...updates } : pair
    ));
  };

  const handlePairImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateMatchingPair(index, { leftImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removePairImage = (index: number) => {
    updateMatchingPair(index, { leftImage: undefined });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageUrl('');
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setQuestionText('');
    setEssayAnswer('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setOptionE('');
    setCorrectOption('');
    setTrueFalseAnswer('');
    setMatchingPairsInput([
      { left: '', right: '' },
      { left: '', right: '' },
      { left: '', right: '' }
    ]);
    setMatchingAnswer('');
    clearImage();
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

    // Add image if provided
    if (imageUrl) {
      newQuestion.imageUrl = imageUrl;
    }

    // Add type-specific fields
    switch (type) {
      case 'essay':
        if (!essayAnswer.trim()) {
          toast.error('Kunci jawaban essay wajib diisi!');
          return;
        }
        newQuestion.essayAnswer = essayAnswer.trim();
        break;
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
      case 'matching':
        // Filter out completely empty pairs
        const validPairs = matchingPairsInput.filter(p => p.left || p.leftImage || p.right);

        if (validPairs.length < 1) {
          toast.error('Minimal harus ada 1 pasangan!');
          return;
        }

        // Check for incomplete pairs
        if (validPairs.some(p => (!p.left && !p.leftImage) || !p.right)) {
          toast.error('Pastikan semua pasangan memiliki bagian kiri (teks/gambar) dan kanan!');
          return;
        }

        if (!matchingAnswer.trim()) {
          toast.error('Kunci jawaban matching (format 1A-2B) wajib diisi!');
          return;
        }

        newQuestion.matchingPairs = validPairs;
        newQuestion.matchingAnswer = matchingAnswer.trim().toUpperCase();
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
      case 'essay':
        return <span className="text-sm text-slate-600 font-medium">{q.essayAnswer || '-'}</span>;
      case 'multiple_choice':
        return <span className="text-sm text-slate-600 font-medium">{String(q.correctAnswer) || '-'}</span>;
      case 'true_false':
        return q.correctAnswer
          ? <span className="text-sm font-bold text-emerald-600">Benar</span>
          : <span className="text-sm font-bold text-rose-600">Salah</span>;
      case 'matching':
        return <span className="text-sm text-slate-600 font-bold">{q.matchingAnswer || '-'}</span>;
      default:
        return <span className="text-sm text-slate-500">-</span>;
    }
  };

  return (
    <div className="space-y-8 animate-scale-in">
      {/* Add Question Form */}
      <div className="bg-white border border-border rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 bg-slate-50 border-b border-border">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Plus className="w-5 h-5 text-blue-600" />
            </span>
            Tambah Soal Baru
          </h3>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* Row 1: Category, Type, Time, Points */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori</Label>
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
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipe Soal</Label>
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
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Waktu (menit)</Label>
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
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Poin</Label>
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
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pertanyaan</Label>
            <Textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Tulis pertanyaan di sini..."
              className="min-h-[100px] resize-none bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 text-lg"
            />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Image className="w-4 h-4" />
              Gambar Soal
            </Label>

            {!imagePreview ? (
              /* Dropzone Style Upload */
              <div
                className="w-full border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-slate-400 transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="question-image"
                />
                <div className="flex flex-col items-center justify-center py-10 px-6">
                  {/* Upload Icon */}
                  <div className="mb-4">
                    <svg
                      className="w-10 h-10 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                  </div>

                  {/* Text */}
                  <p className="text-slate-500 text-sm mb-1">Klik untuk unggah gambar</p>
                  <p className="text-slate-400 text-xs mb-4">Maks. Ukuran: 30MB</p>

                  {/* Browse Button */}
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2 rounded-full cursor-pointer"
                  >
                    Pilih File
                  </Button>
                </div>
              </div>
            ) : (
              /* Image Preview */
              <div className="w-full border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 p-4">
                <div className="relative w-full flex flex-col items-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-64 object-contain rounded-xl border border-border bg-white"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={clearImage}
                    className="mt-4 text-rose-500 hover:bg-rose-50 cursor-pointer"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Hapus Gambar
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-slate-100 my-4" />

          {/* Dynamic form based on type */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-border">
            {type === 'essay' && (
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kunci Jawaban</Label>
                <Input
                  value={essayAnswer}
                  onChange={(e) => setEssayAnswer(e.target.value)}
                  placeholder="Jawaban essay..."
                  className="bg-white border border-slate-200 text-slate-900 h-11"
                />
              </div>
            )}

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

            {type === 'matching' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2 px-2">
                  <Label className="text-sm font-bold text-slate-600 uppercase tracking-tighter flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Daftar Pasangan (Matching)
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMatchingPair}
                    className="h-9 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-600 hover:text-white font-bold rounded-xl transition-all"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Tambah Pasangan
                  </Button>
                </div>

                <div className="space-y-4">
                  {matchingPairsInput.map((pair, index) => (
                    <div key={index} className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm relative group animate-slide-in hover:border-blue-200 transition-all">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                        {/* KIRI: Text atau Gambar */}
                        <div className="flex-1 w-full space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{index + 1}. BAGIAN KIRI (SOAL)</Label>
                            {pair.leftImage && (
                              <Badge variant="outline" className="text-[9px] bg-blue-50 text-blue-600 border-blue-100">Ada Gambar</Badge>
                            )}
                          </div>

                          <div className="flex gap-4">
                            <div className="flex-1 space-y-3">
                              <Input
                                value={pair.left}
                                onChange={(e) => updateMatchingPair(index, { left: e.target.value })}
                                placeholder="Masukkan teks soal..."
                                className="bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 h-11 text-slate-900"
                              />
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handlePairImageUpload(index, e)}
                                  className="hidden"
                                  id={`pair-image-${index}`}
                                />
                                <label
                                  htmlFor={`pair-image-${index}`}
                                  className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all text-xs text-slate-500 font-bold"
                                >
                                  <Image className="w-3.5 h-3.5" />
                                  {pair.leftImage ? 'Ganti Gambar' : 'Lampirkan Gambar'}
                                </label>
                              </div>
                            </div>

                            {pair.leftImage && (
                              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 bg-white shrink-0 group/img">
                                <img src={pair.leftImage} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                  onClick={() => removePairImage(index)}
                                  className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* CONNECTOR */}
                        <div className="hidden lg:flex items-center justify-center pt-6">
                          <div className="w-8 h-px bg-slate-200 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1">
                              <ArrowRight className="w-4 h-4 text-slate-300" />
                            </div>
                          </div>
                        </div>

                        {/* KANAN: Text Jawaban */}
                        <div className="flex-1 w-full space-y-3">
                          <Label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{String.fromCharCode(65 + index)}. BAGIAN KANAN (JAWABAN)</Label>
                          <Input
                            value={pair.right}
                            onChange={(e) => updateMatchingPair(index, { right: e.target.value })}
                            placeholder="Masukkan teks jawaban..."
                            className="bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 h-11 text-slate-900"
                          />
                        </div>
                      </div>

                      {matchingPairsInput.length > 1 && (
                        <button
                          onClick={() => removeMatchingPair(index)}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 transition-all hover:scale-110 opacity-0 group-hover:opacity-100 z-10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                      <Label className="text-sm font-bold uppercase tracking-tight">Kunci Jawaban Matching</Label>
                    </div>
                    <Badge className="bg-emerald-500 text-white border-0 hover:bg-emerald-600">
                      Terbaca: {matchingAnswer.split('-').filter(Boolean).length}/{matchingPairsInput.length}
                    </Badge>
                  </div>

                  <div className="relative">
                    <Input
                      value={matchingAnswer}
                      onChange={(e) => setMatchingAnswer(e.target.value.toUpperCase())}
                      placeholder={`Contoh: 1A-2B-3C${matchingPairsInput.length > 3 ? `-4D` : ''}`}
                      className="bg-white border-emerald-200 text-emerald-900 font-black h-14 text-xl text-center tracking-widest focus:ring-emerald-500 focus:border-emerald-500 rounded-2xl shadow-inner shadow-emerald-100/50"
                    />
                  </div>

                  <div className="flex items-start gap-3 bg-white/60 p-4 rounded-2xl border border-emerald-100/50">
                    <AlertCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-emerald-700 leading-relaxed font-medium">
                      Gunakan format angka dan huruf kapital dipisahkan tanda strip. <span className="font-bold underline text-emerald-800">Wajib ada {matchingPairsInput.length} pasangan</span> agar sistem penilaian bekerja dengan benar.
                    </p>
                  </div>
                </div>
              </div>
            )}
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
        <div className="p-6 border-b border-border flex items-center gap-2 bg-slate-50">
          <BookOpen className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-bold text-slate-900">Daftar Soal ({allQuestions.length})</h3>
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
                    <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider text-center">Waktu</TableHead>
                    <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider text-center">Poin</TableHead>
                    <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allQuestions.map((q) => (
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
                        {q.imageUrl ? (
                          <img
                            src={q.imageUrl}
                            alt="Question"
                            className="w-12 h-12 rounded-lg object-cover border border-border"
                          />
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="truncate text-slate-600 font-medium">{q.question}</p>
                      </TableCell>
                      <TableCell>
                        {renderAnswerDisplay(q)}
                      </TableCell>
                      <TableCell className="text-center text-slate-500">
                        {Math.round(q.timeLimit / 60)}m
                      </TableCell>
                      <TableCell className="text-center font-bold text-amber-600">
                        {q.points}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          onClick={() => deleteQuestion(q.id)}
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionBank;
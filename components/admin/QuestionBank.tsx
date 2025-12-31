'use client';

import { useState } from 'react';
import { Plus, Trash2, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGameStore } from '@/hooks/useGameStore';
import { Question, QuestionCategory, QuestionType } from '@/types/game';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/data/mockData';

const TYPE_LABELS: Record<QuestionType, string> = {
  essay: 'Essay',
  multiple_choice: 'Pilihan Ganda',
  true_false: 'Benar/Salah',
  matching: 'Menjodohkan',
};

const QuestionBank = () => {
  const { allQuestions, addQuestion, deleteQuestion } = useGameStore();
  const [category, setCategory] = useState<QuestionCategory>('C1');
  const [type, setType] = useState<QuestionType>('essay');
  const [questionText, setQuestionText] = useState('');
  const [timeLimit, setTimeLimit] = useState(3);
  const [points, setPoints] = useState(100);

  // Essay
  const [essayAnswer, setEssayAnswer] = useState('');

  // Multiple Choice
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState<string>('');

  // True/False
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<string>('');

  // Matching
  const [leftItem1, setLeftItem1] = useState('');
  const [leftItem2, setLeftItem2] = useState('');
  const [leftItem3, setLeftItem3] = useState('');
  const [rightItemA, setRightItemA] = useState('');
  const [rightItemB, setRightItemB] = useState('');
  const [rightItemC, setRightItemC] = useState('');
  const [matchingAnswer, setMatchingAnswer] = useState('');

  const resetForm = () => {
    setQuestionText('');
    setEssayAnswer('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectOption('');
    setTrueFalseAnswer('');
    setLeftItem1('');
    setLeftItem2('');
    setLeftItem3('');
    setRightItemA('');
    setRightItemB('');
    setRightItemC('');
    setMatchingAnswer('');
  };

  const handleAddQuestion = () => {
    if (!questionText.trim()) return;

    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      category,
      type,
      question: questionText.trim(),
      timeLimit: timeLimit * 60, // Convert minutes to seconds
      points,
    };

    // Add type-specific fields
    switch (type) {
      case 'essay':
        if (!essayAnswer.trim()) return;
        newQuestion.essayAnswer = essayAnswer.trim();
        break;
      case 'multiple_choice':
        if (!optionA || !optionB || !optionC || !optionD || !correctOption) return;
        newQuestion.options = [optionA, optionB, optionC, optionD];
        newQuestion.correctAnswer = correctOption;
        break;
      case 'true_false':
        if (!trueFalseAnswer) return;
        newQuestion.correctAnswer = trueFalseAnswer === 'true';
        break;
      case 'matching':
        if (!leftItem1 || !leftItem2 || !leftItem3 || !rightItemA || !rightItemB || !rightItemC || !matchingAnswer) return;
        newQuestion.matchingPairs = [
          { left: leftItem1, right: rightItemA },
          { left: leftItem2, right: rightItemB },
          { left: leftItem3, right: rightItemC },
        ];
        newQuestion.matchingAnswer = matchingAnswer.trim();
        break;
    }

    addQuestion(newQuestion);
    resetForm();
  };

  const renderAnswerDisplay = (q: Question) => {
    switch (q.type) {
      case 'essay':
        return <span className="text-sm text-slate-300">{q.essayAnswer || '-'}</span>;
      case 'multiple_choice':
        return <span className="text-sm text-slate-300">{String(q.correctAnswer) || '-'}</span>;
      case 'true_false':
        return q.correctAnswer
          ? <span className="text-sm font-bold text-emerald-400">Benar</span>
          : <span className="text-sm font-bold text-rose-400">Salah</span>;
      case 'matching':
        return <span className="text-sm text-slate-300">{q.matchingAnswer || '-'}</span>;
      default:
        return <span className="text-sm text-slate-500">-</span>;
    }
  };

  return (
    <div className="space-y-8 animate-scale-in">
      {/* Add Question Form */}
      <div className="bg-slate-900/50 border border-white/10 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 md:p-8 bg-white/5 border-b border-white/5">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-indigo-400" />
            </span>
            Tambah Soal Baru
          </h3>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* Row 1: Category, Type, Time, Points */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Kategori</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as QuestionCategory)}>
                <SelectTrigger className="bg-slate-800 border-white/10 text-white h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10 text-white">
                  {(Object.keys(CATEGORY_LABELS) as QuestionCategory[]).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat} - {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Tipe Soal</Label>
              <Select value={type} onValueChange={(v) => { setType(v as QuestionType); resetForm(); }}>
                <SelectTrigger className="bg-slate-800 border-white/10 text-white h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10 text-white">
                  {(Object.keys(TYPE_LABELS) as QuestionType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Waktu (menit)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  min={1}
                  max={30}
                  className="pl-9 bg-slate-800 border-white/10 text-white h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Poin</Label>
              <div className="relative">
                <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  min={10}
                  step={10}
                  className="pl-9 bg-slate-800 border-white/10 text-white h-11"
                />
              </div>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Pertanyaan</Label>
            <Textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Tulis pertanyaan di sini..."
              className="min-h-[100px] resize-none bg-slate-800 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 text-lg"
            />
          </div>

          <div className="h-px bg-white/5 my-4" />

          {/* Dynamic form based on type */}
          <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
            {type === 'essay' && (
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Kunci Jawaban</Label>
                <Input
                  value={essayAnswer}
                  onChange={(e) => setEssayAnswer(e.target.value)}
                  placeholder="Jawaban essay..."
                  className="bg-slate-800 border-white/10 text-white h-11"
                />
              </div>
            )}

            {type === 'multiple_choice' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {['A', 'B', 'C', 'D'].map((opt, idx) => (
                    <div key={opt} className="space-y-2">
                      <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Pilihan {opt}</Label>
                      <Input
                        value={idx === 0 ? optionA : idx === 1 ? optionB : idx === 2 ? optionC : optionD}
                        onChange={(e) => {
                          if (idx === 0) setOptionA(e.target.value);
                          if (idx === 1) setOptionB(e.target.value);
                          if (idx === 2) setOptionC(e.target.value);
                          if (idx === 3) setOptionD(e.target.value);
                        }}
                        placeholder={`Pilihan ${opt}`}
                        className="bg-slate-800 border-white/10 text-white h-11"
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Jawaban Benar</Label>
                  <Select value={correctOption} onValueChange={setCorrectOption}>
                    <SelectTrigger className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 h-11 font-bold">
                      <SelectValue placeholder="-- Pilih Jawaban Benar --" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/10 text-white">
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {type === 'true_false' && (
              <div className="space-y-2">
                <Label className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Jawaban Benar</Label>
                <Select value={trueFalseAnswer} onValueChange={setTrueFalseAnswer}>
                  <SelectTrigger className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 h-11 font-bold">
                    <SelectValue placeholder="-- Pilih Benar/Salah --" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10 text-white">
                    <SelectItem value="true">Benar</SelectItem>
                    <SelectItem value="false">Salah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {type === 'matching' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {/* Pair 1 */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-300">1. Kiri</Label>
                    <Input value={leftItem1} onChange={(e) => setLeftItem1(e.target.value)} placeholder="Item 1" className="bg-slate-800 border-white/10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-300">A. Kanan</Label>
                    <Input value={rightItemA} onChange={(e) => setRightItemA(e.target.value)} placeholder="Pasangan A" className="bg-slate-800 border-white/10 text-white" />
                  </div>

                  {/* Pair 2 */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-300">2. Kiri</Label>
                    <Input value={leftItem2} onChange={(e) => setLeftItem2(e.target.value)} placeholder="Item 2" className="bg-slate-800 border-white/10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-300">B. Kanan</Label>
                    <Input value={rightItemB} onChange={(e) => setRightItemB(e.target.value)} placeholder="Pasangan B" className="bg-slate-800 border-white/10 text-white" />
                  </div>

                  {/* Pair 3 */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-300">3. Kiri</Label>
                    <Input value={leftItem3} onChange={(e) => setLeftItem3(e.target.value)} placeholder="Item 3" className="bg-slate-800 border-white/10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-300">C. Kanan</Label>
                    <Input value={rightItemC} onChange={(e) => setRightItemC(e.target.value)} placeholder="Pasangan C" className="bg-slate-800 border-white/10 text-white" />
                  </div>
                </div>
                <div className="space-y-2 bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20">
                  <Label className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Kunci Jawaban (Format: 1A-2B-3C)</Label>
                  <Input
                    value={matchingAnswer}
                    onChange={(e) => setMatchingAnswer(e.target.value)}
                    placeholder="1A-2B-3C"
                    className="bg-slate-800 border-white/10 text-white font-mono h-11"
                  />
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleAddQuestion}
            className="w-full h-12 font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg cursor-pointer transition-all hover:scale-[1.01]"
          >
            <Plus className="w-5 h-5 mr-2" />
            Simpan Soal ke Bank Data
          </Button>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-slate-900/50 border border-white/10 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center gap-2 bg-white/5">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">Daftar Soal ({allQuestions.length})</h3>
        </div>

        <div className="p-0">
          {allQuestions.length === 0 ? (
            <p className="text-center text-slate-500 py-12">
              Belum ada soal. Tambahkan soal pertama!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-black/20 border-white/10">
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Kategori</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Tipe</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider max-w-[200px]">Pertanyaan</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Jawaban</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider text-center">Waktu</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider text-center">Poin</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allQuestions.map((q) => (
                    <TableRow key={q.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell>
                        <Badge className={`${CATEGORY_COLORS[q.category]} text-white border-0`}>
                          {q.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-white/5 text-slate-300 border-white/10">
                          {TYPE_LABELS[q.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="truncate text-slate-300 font-medium">{q.question}</p>
                      </TableCell>
                      <TableCell>
                        {renderAnswerDisplay(q)}
                      </TableCell>
                      <TableCell className="text-center text-slate-400">
                        {Math.round(q.timeLimit / 60)}m
                      </TableCell>
                      <TableCell className="text-center font-bold text-amber-500">
                        {q.points}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          onClick={() => deleteQuestion(q.id)}
                          variant="ghost"
                          size="sm"
                          className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
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
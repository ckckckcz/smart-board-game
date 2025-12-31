'use client'

import { useState } from 'react';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  const getAnswerDisplay = (q: Question): string => {
    switch (q.type) {
      case 'essay':
        return q.essayAnswer || '-';
      case 'multiple_choice':
        return String(q.correctAnswer) || '-';
      case 'true_false':
        return q.correctAnswer ? 'Benar' : 'Salah';
      case 'matching':
        return q.matchingAnswer || '-';
      default:
        return '-';
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Question Form */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Bank Soal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Row 1: Category, Type, Time, Points */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-blue-400 font-semibold">Kategori:</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as QuestionCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORY_LABELS) as QuestionCategory[]).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-blue-400 font-semibold">Tipe Soal:</Label>
              <Select value={type} onValueChange={(v) => { setType(v as QuestionType); resetForm(); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TYPE_LABELS) as QuestionType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-blue-400 font-semibold">Waktu (menit):</Label>
              <Input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                min={1}
                max={30}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-blue-400 font-semibold">Poin:</Label>
              <Input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                min={10}
                step={10}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <Label className="text-amber-500 font-semibold">Pertanyaan:</Label>
            <Textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Tulis pertanyaan di sini..."
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Dynamic form based on type */}
          {type === 'essay' && (
            <div className="space-y-2">
              <Label className="text-blue-400 font-semibold">Jawaban:</Label>
              <Input
                value={essayAnswer}
                onChange={(e) => setEssayAnswer(e.target.value)}
                placeholder="Jawaban essay..."
              />
            </div>
          )}

          {type === 'multiple_choice' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-blue-400 font-semibold">Pilihan A:</Label>
                  <Input
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                    placeholder="Pilihan A"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-400 font-semibold">Pilihan B:</Label>
                  <Input
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
                    placeholder="Pilihan B"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-400 font-semibold">Pilihan C:</Label>
                  <Input
                    value={optionC}
                    onChange={(e) => setOptionC(e.target.value)}
                    placeholder="Pilihan C"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-400 font-semibold">Pilihan D:</Label>
                  <Input
                    value={optionD}
                    onChange={(e) => setOptionD(e.target.value)}
                    placeholder="Pilihan D"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-blue-400 font-semibold">Jawaban Benar:</Label>
                <Select value={correctOption} onValueChange={setCorrectOption}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Pilih --" />
                  </SelectTrigger>
                  <SelectContent>
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
              <Label className="text-blue-400 font-semibold">Jawaban Benar:</Label>
              <Select value={trueFalseAnswer} onValueChange={setTrueFalseAnswer}>
                <SelectTrigger>
                  <SelectValue placeholder="-- Pilih --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Benar</SelectItem>
                  <SelectItem value="false">Salah</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {type === 'matching' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-blue-400 font-semibold">1. Kolom Kiri:</Label>
                  <Input
                    value={leftItem1}
                    onChange={(e) => setLeftItem1(e.target.value)}
                    placeholder="Item 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-400 font-semibold">A. Kolom Kanan:</Label>
                  <Input
                    value={rightItemA}
                    onChange={(e) => setRightItemA(e.target.value)}
                    placeholder="Pasangan A"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-400 font-semibold">2. Kolom Kiri:</Label>
                  <Input
                    value={leftItem2}
                    onChange={(e) => setLeftItem2(e.target.value)}
                    placeholder="Item 2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-400 font-semibold">B. Kolom Kanan:</Label>
                  <Input
                    value={rightItemB}
                    onChange={(e) => setRightItemB(e.target.value)}
                    placeholder="Pasangan B"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-400 font-semibold">3. Kolom Kiri:</Label>
                  <Input
                    value={leftItem3}
                    onChange={(e) => setLeftItem3(e.target.value)}
                    placeholder="Item 3"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-400 font-semibold">C. Kolom Kanan:</Label>
                  <Input
                    value={rightItemC}
                    onChange={(e) => setRightItemC(e.target.value)}
                    placeholder="Pasangan C"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-blue-400 font-semibold">Jawaban (format: 1A-2B-3C):</Label>
                <Input
                  value={matchingAnswer}
                  onChange={(e) => setMatchingAnswer(e.target.value)}
                  placeholder="1A-2B-3C"
                />
              </div>
            </>
          )}

          <Button
            onClick={handleAddQuestion}
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            TAMBAH SOAL
          </Button>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Daftar Soal ({allQuestions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allQuestions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Belum ada soal. Tambahkan soal pertama!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead className="max-w-[200px]">Pertanyaan</TableHead>
                    <TableHead>Jawaban</TableHead>
                    <TableHead className="text-center">Waktu</TableHead>
                    <TableHead className="text-center">Poin</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allQuestions.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell>
                        <Badge className={`${CATEGORY_COLORS[q.category]} text-primary-foreground`}>
                          {q.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {TYPE_LABELS[q.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="truncate">{q.question}</p>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{getAnswerDisplay(q)}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {Math.round(q.timeLimit / 60)}m
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {q.points}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          onClick={() => deleteQuestion(q.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:bg-red-500/10 cursor-pointer"
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
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionBank;

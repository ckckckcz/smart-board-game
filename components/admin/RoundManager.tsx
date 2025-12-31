'use client'

import { useState } from 'react';
import { Plus, Trash2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/hooks/useGameStore';
import { Round, QuestionCategory } from '@/types/game';
import { CATEGORY_LABELS } from '@/data/mockData';

const RoundManager = () => {
  const { rounds, addRound, deleteRound } = useGameStore();
  const [roundName, setRoundName] = useState('');
  const [questionCounts, setQuestionCounts] = useState<Record<QuestionCategory, number>>({
    C1: 0, C2: 0, C3: 0, C4: 0, C5: 0, C6: 0,
  });

  const handleAddRound = () => {
    if (!roundName.trim()) return;

    const totalQuestions = Object.values(questionCounts).reduce((a, b) => a + b, 0);
    if (totalQuestions === 0) return;

    const newRound: Round = {
      id: `round_${Date.now()}`,
      name: roundName.trim(),
      questionCounts,
      totalQuestions,
    };

    addRound(newRound);
    setRoundName('');
    setQuestionCounts({ C1: 0, C2: 0, C3: 0, C4: 0, C5: 0, C6: 0 });
  };

  const updateCount = (category: QuestionCategory, value: number) => {
    setQuestionCounts(prev => ({
      ...prev,
      [category]: Math.max(0, value),
    }));
  };

  const totalQuestions = Object.values(questionCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Add Round Form */}
      <div className="bg-card rounded-md shadow-soft p-6">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Tambah Babak Baru
        </h3>

        {/* Round Name */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-foreground mb-2 block">
            Nama Babak
          </label>
          <Input
            value={roundName}
            onChange={(e) => setRoundName(e.target.value)}
            placeholder="Contoh: Babak 1 - Dasar Akuntansi"
            className="h-11 rounded-xl"
          />
        </div>

        {/* Question Counts per Category */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-foreground mb-3 block">
            Jumlah Soal per Kategori
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(Object.keys(CATEGORY_LABELS) as QuestionCategory[]).map((category) => (
              <div
                key={category}
                className="bg-muted/50 rounded-xl p-3"
              >
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  {category}: {CATEGORY_LABELS[category]}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateCount(category, questionCounts[category] - 1)}
                    className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center font-bold text-muted-foreground hover:bg-muted transition-colors"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-foreground">
                    {questionCounts[category]}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateCount(category, questionCounts[category] + 1)}
                    className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center font-bold text-muted-foreground hover:bg-muted transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total & Add Button */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Total: <span className="font-bold text-foreground">{totalQuestions} soal</span>
          </p>
          <Button
            onClick={handleAddRound}
            disabled={!roundName.trim() || totalQuestions === 0}
            className="h-11 px-6 font-bold rounded-xl gradient-success text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Babak
          </Button>
        </div>
      </div>

      {/* Rounds List */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Layers className="w-5 h-5 text-secondary" />
          Daftar Babak ({rounds.length})
        </h3>

        {rounds.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center text-muted-foreground">
            Belum ada babak. Tambahkan babak pertama!
          </div>
        ) : (
          <div className="grid gap-3">
            {rounds.map((round) => (
              <div
                key={round.id}
                className="bg-card rounded-2xl shadow-soft p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <h4 className="font-bold text-foreground mb-1">{round.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Total: {round.totalQuestions} soal
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(Object.keys(round.questionCounts) as QuestionCategory[]).map((cat) => (
                      round.questionCounts[cat] > 0 && (
                        <span
                          key={cat}
                          className="text-xs px-2 py-0.5 bg-secondary/10 text-secondary rounded-full font-medium"
                        >
                          {cat}: {round.questionCounts[cat]}
                        </span>
                      )
                    ))}
                  </div>
                </div>
                <Button
                  onClick={() => deleteRound(round.id)}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoundManager;

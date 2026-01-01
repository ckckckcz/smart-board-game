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
    <div className="space-y-8 animate-scale-in">
      {/* Add Round Form */}
      <div className="bg-white border border-border rounded-3xl shadow-sm p-6 md:p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
          Buat Babak Baru
        </h3>

        {/* Round Name */}
        <div className="mb-6">
          <label className="text-sm font-bold text-slate-600 mb-2 block tracking-wide">
            Nama Babak
          </label>
          <Input
            value={roundName}
            onChange={(e) => setRoundName(e.target.value)}
            placeholder="Contoh: Babak 1 - Dasar Akuntansi"
            className="h-12 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Question Counts per Category */}
        <div className="mb-8 bg-white border border-border rounded-3xl shadow-sm p-6 md:p-8">
          <label className="text-sm font-bold text-slate-600 mb-3 block tracking-wide">
            Konfigurasi Soal
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(Object.keys(CATEGORY_LABELS) as QuestionCategory[]).map((category) => (
              <div
                key={category}
                className="bg-slate-50 border border-border rounded-xl p-3 hover:border-slate-300 transition-colors"
              >
                <label className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-2 block text-start truncate">
                  {category}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateCount(category, questionCounts[category] - 1)}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-900 transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-xl text-slate-900 font-mono">
                    {questionCounts[category]}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateCount(category, questionCounts[category] + 1)}
                    className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 flex items-center justify-center font-bold text-white transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total & Add Button */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Total Soal</span>
            <span className="text-2xl font-black text-slate-900">{totalQuestions}</span>
          </div>
          <Button
            onClick={handleAddRound}
            disabled={!roundName.trim() || totalQuestions === 0}
            className="h-12 px-6 font-bold rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5 mr-2" />
            Simpan Babak
          </Button>
        </div>
      </div>

      {/* Rounds List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 px-1">
          <Layers className="w-5 h-5 text-blue-500" />
          Daftar Babak ({rounds.length})
        </h3>

        {rounds.length === 0 ? (
          <div className="bg-white border border-border border-dashed rounded-2xl p-12 text-center text-slate-400">
            Belum ada babak yang dibuat.
          </div>
        ) : (
          <div className="grid gap-3">
            {rounds.map((round) => (
              <div
                key={round.id}
                className="bg-white border border-border rounded-2xl p-5 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors group shadow-sm"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">{round.name}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-border">
                      {round.totalQuestions} Soal
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(round.questionCounts) as QuestionCategory[]).map((cat) => (
                      round.questionCounts[cat] > 0 && (
                        <div
                          key={cat}
                          className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-md border border-border"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span className="text-xs text-slate-500">{cat}</span>
                          <span className="text-xs font-bold text-slate-900 ml-0.5">{round.questionCounts[cat]}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
                <Button
                  onClick={() => deleteRound(round.id)}
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
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

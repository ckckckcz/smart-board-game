'use client'

import { useMemo, useState } from 'react';
import { Plus, Trash2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/hooks/useGameStore';
import { Round, QuestionCategory } from '@/types/game';
import { CATEGORY_LABELS } from '@/data/mockData';
import { sortRoundsForDisplay } from '@/lib/rounds';

const RoundManager = () => {
  const { rounds, addRound, deleteRound } = useGameStore();
  const [roundName, setRoundName] = useState('');
  const [questionCounts, setQuestionCounts] = useState<Record<QuestionCategory, number>>({
    C1: 0, C2: 0, C3: 0, C4: 0, C5: 0, C6: 0,
  });

  const sortedRounds = useMemo(() => sortRoundsForDisplay(rounds), [rounds]);

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
    <div className="space-y-4 sm:space-y-6 animate-scale-in">
      {/* Add Round Form */}
      <div className="bg-white border border-border rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
          <span className="w-1 h-4 sm:h-5 bg-blue-500 rounded-full" />
          Buat Babak Baru
        </h3>

        {/* Round Name */}
        <div className="mb-3 sm:mb-4">
          <label className="text-xs sm:text-sm font-bold text-slate-600 mb-1.5 block">
            Nama Babak
          </label>
          <Input
            value={roundName}
            onChange={(e) => setRoundName(e.target.value)}
            placeholder="Contoh: Babak 1 - Dasar Akuntansi"
            className="h-9 sm:h-10 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 transition-all text-sm"
          />
        </div>

        {/* Question Counts per Category */}
        <div className="mb-3 sm:mb-4 bg-slate-50 border border-slate-200 rounded-lg p-2.5 sm:p-3">
          <label className="text-xs font-bold text-slate-600 mb-2 block">
            Konfigurasi Soal
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
            {(Object.keys(CATEGORY_LABELS) as QuestionCategory[]).map((category) => (
              <div
                key={category}
                className="bg-white border border-slate-200 rounded-lg p-2"
              >
                <label className="text-[10px] text-blue-600 font-bold uppercase mb-1 block text-center">
                  {category}
                </label>
                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateCount(category, questionCounts[category] - 1)}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={questionCounts[category]}
                    onChange={(e) => updateCount(category, parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0)}
                    className="w-8 sm:w-10 h-6 sm:h-7 text-center font-bold text-base sm:text-lg text-slate-900 bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => updateCount(category, questionCounts[category] + 1)}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-blue-600 hover:bg-blue-500 flex items-center justify-center font-bold text-white text-sm transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total & Add Button */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase">Total Soal</span>
            <span className="text-lg sm:text-xl font-black text-slate-900">{totalQuestions}</span>
          </div>
          <Button
            onClick={handleAddRound}
            disabled={!roundName.trim() || totalQuestions === 0}
            className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-bold rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Plus className="w-4 h-4 mr-1" />
            Simpan Babak
          </Button>
        </div>
      </div>

      {/* Rounds List */}
      <div className="space-y-2 sm:space-y-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 px-1">
          <Layers className="w-4 h-4 text-blue-500" />
          Daftar Babak ({rounds.length})
        </h3>

        {rounds.length === 0 ? (
          <div className="bg-white border border-border border-dashed rounded-lg p-6 sm:p-8 text-center text-slate-400 text-xs sm:text-sm">
            Belum ada babak yang dibuat.
          </div>
        ) : (
          <div className="space-y-1.5 sm:space-y-2">
            {sortedRounds.map((round) => (
              <div
                key={round.id}
                className="bg-white border border-border rounded-lg p-2.5 sm:p-3 flex items-start justify-between gap-2 hover:bg-slate-50 transition-colors group shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">{round.name}</h4>
                    <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-blue-100 text-blue-700 shrink-0">
                      {round.totalQuestions} Soal
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {(Object.keys(round.questionCounts) as QuestionCategory[]).map((cat) => (
                      round.questionCounts[cat] > 0 && (
                        <span
                          key={cat}
                          className="text-[9px] sm:text-[10px] px-1 py-0.5 bg-slate-100 rounded text-slate-600 font-medium"
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
                  size="icon"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 cursor-pointer transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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

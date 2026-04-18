'use client'
import { useMemo, useState } from 'react';
import { Trash2, Trophy, Users, Target, Award, Medal, Filter, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGameStore } from '@/hooks/useGameStore';
import { sortRoundsForDisplay } from '@/lib/rounds';

const AnalyticsPanel = () => {
  const { leaderboard, clearLeaderboard, rounds, renamePlayer } = useGameStore();
  const [selectedRound, setSelectedRound] = useState<string>('all');
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState<string>('');
  const [isSavingName, setIsSavingName] = useState<boolean>(false);

  const sortedRounds = useMemo(() => sortRoundsForDisplay(rounds), [rounds]);

  // Filter leaderboard by round
  const filteredLeaderboard = selectedRound === 'all'
    ? leaderboard
    : leaderboard.filter(p => p.roundId === selectedRound);

  // Calculate stats based on filtered data
  const totalGames = filteredLeaderboard.length;
  const averageScore = totalGames > 0
    ? Math.round(filteredLeaderboard.reduce((sum, p) => sum + p.score, 0) / totalGames)
    : 0;
  const highestScore = totalGames > 0
    ? Math.max(...filteredLeaderboard.map(p => p.score))
    : 0;
  const topPlayer = totalGames > 0
    ? filteredLeaderboard.reduce((best, p) => p.score > best.score ? p : best, filteredLeaderboard[0])
    : null;

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Medal className="w-5 h-5 text-yellow-500 drop-shadow-md" />;
      case 2:
        return <Medal className="w-4 h-4 text-slate-300 drop-shadow-md" />;
      case 3:
        return <Medal className="w-4 h-4 text-orange-500 drop-shadow-md" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-slate-500">{rank}</span>;
    }
  };

  const getRoundName = (roundId: string) => {
    const round = rounds.find(r => r.id === roundId);
    return round?.name || roundId;
  };

  const startEditName = (playerId: string, currentName: string) => {
    setEditingPlayerId(playerId);
    setDraftName(currentName);
  };

  const cancelEditName = () => {
    setEditingPlayerId(null);
    setDraftName('');
    setIsSavingName(false);
  };

  const saveEditName = async (playerId: string) => {
    const nextName = draftName.trim();
    if (!nextName) return;

    setIsSavingName(true);
    const ok = await renamePlayer(playerId, nextName);
    setIsSavingName(false);

    if (ok) {
      setEditingPlayerId(null);
      setDraftName('');
    }
  };

  // Sort all players by score (show all, not limited to 20)
  const sortedLeaderboard = [...filteredLeaderboard].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-border rounded-2xl p-5 hover:bg-slate-50 transition-colors group shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalGames}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Permainan</p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5 hover:bg-slate-50 transition-colors group shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{averageScore}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Rata-rata Skor</p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5 hover:bg-slate-50 transition-colors group shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{highestScore}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Skor Tertinggi</p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5 hover:bg-slate-50 transition-colors group shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 truncate">{topPlayer?.name || '-'}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Pemain Terbaik</p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Papan Peringkat
            {selectedRound !== 'all' && (
              <span className="text-sm font-normal text-slate-500">
                ({sortedLeaderboard.length} pemain)
              </span>
            )}
          </h3>

          <div className="flex items-center gap-3">
            {/* Round Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <Select value={selectedRound} onValueChange={setSelectedRound}>
                <SelectTrigger className="w-[200px] bg-white border border-border text-slate-900 h-9">
                  <SelectValue placeholder="Filter Babak" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-border text-slate-900">
                  <SelectItem value="all">Semua Babak</SelectItem>
                  {sortedRounds.map((round) => (
                    <SelectItem key={round.id} value={round.id}>
                      {round.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {leaderboard.length > 0 && (
              <Button
                onClick={() => {
                  if (confirm('Yakin ingin menghapus semua data?')) {
                    clearLeaderboard();
                  }
                }}
                variant="ghost"
                size="sm"
                className="text-rose-500 hover:bg-rose-50 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus Semua
              </Button>
            )}
          </div>
        </div>

        {sortedLeaderboard.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400">
            {selectedRound === 'all'
              ? 'Belum ada data permainan.'
              : 'Belum ada data permainan untuk babak ini.'}
          </div>
        ) : (
          <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
            {sortedLeaderboard.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-shrink-0 w-8 flex justify-center">
                  {getMedalIcon(index + 1)}
                </div>
                <div className="flex-1 min-w-0">
                  {editingPlayerId === player.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        className="h-9 max-w-[260px]"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditName(player.id);
                          if (e.key === 'Escape') cancelEditName();
                        }}
                        aria-label="Ubah nama pemain"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => saveEditName(player.id)}
                        disabled={isSavingName || !draftName.trim()}
                        aria-label="Simpan nama"
                      >
                        <Check className="w-4 h-4 text-emerald-600" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={cancelEditName}
                        disabled={isSavingName}
                        aria-label="Batal"
                      >
                        <X className="w-4 h-4 text-slate-500" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{player.name}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => startEditName(player.id, player.name)}
                        aria-label="Ubah nama pemain"
                      >
                        <Pencil className="w-4 h-4 text-slate-400" />
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-slate-500 truncate">{getRoundName(player.roundId)}</p>
                </div>
                <div className="flex items-center gap-4 text-sm hidden sm:flex">
                  <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">✓ {player.correctAnswers}</span>
                  <span className="text-rose-600 font-medium bg-rose-50 px-2 py-0.5 rounded border border-rose-100">✗ {player.wrongAnswers}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{player.score}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">poin</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer showing total count */}
        {sortedLeaderboard.length > 0 && (
          <div className="px-6 py-3 bg-slate-50 border-t border-border text-center">
            <p className="text-xs text-slate-500">
              Menampilkan <span className="text-slate-900 font-bold">{sortedLeaderboard.length}</span> pemain
              {selectedRound !== 'all' && ` di ${getRoundName(selectedRound)}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPanel;

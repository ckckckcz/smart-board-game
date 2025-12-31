'use client'
import { Trash2, Trophy, Users, Target, Award, Medal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/hooks/useGameStore';

const AnalyticsPanel = () => {
  const { leaderboard, clearLeaderboard, rounds } = useGameStore();

  // Calculate stats
  const totalGames = leaderboard.length;
  const averageScore = totalGames > 0
    ? Math.round(leaderboard.reduce((sum, p) => sum + p.score, 0) / totalGames)
    : 0;
  const highestScore = totalGames > 0
    ? Math.max(...leaderboard.map(p => p.score))
    : 0;
  const topPlayer = totalGames > 0
    ? leaderboard.reduce((best, p) => p.score > best.score ? p : best, leaderboard[0])
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

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-5 hover:bg-slate-800/50 transition-colors group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{totalGames}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Permainan</p>
        </div>

        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-5 hover:bg-slate-800/50 transition-colors group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{averageScore}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Rata-rata Skor</p>
        </div>

        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-5 hover:bg-slate-800/50 transition-colors group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{highestScore}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Skor Tertinggi</p>
        </div>

        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-5 hover:bg-slate-800/50 transition-colors group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-black text-white truncate">{topPlayer?.name || '-'}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Pemain Terbaik</p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-slate-900/50 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Papan Peringkat
          </h3>
          {leaderboard.length > 0 && (
            <Button
              onClick={() => {
                if (confirm('Yakin ingin menghapus semua data?')) {
                  clearLeaderboard();
                }
              }}
              variant="ghost"
              size="sm"
              className="text-rose-400 hover:text-white hover:bg-rose-500/20 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus Semua
            </Button>
          )}
        </div>

        {leaderboard.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">
            Belum ada data permainan.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {leaderboard
              .sort((a, b) => b.score - a.score)
              .slice(0, 20)
              .map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 flex justify-center">
                    {getMedalIcon(index + 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-200 truncate">{player.name}</p>
                    <p className="text-xs text-slate-500 truncate">{getRoundName(player.roundId)}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm hidden sm:flex">
                    <span className="text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded">✓ {player.correctAnswers}</span>
                    <span className="text-rose-400 font-medium bg-rose-500/10 px-2 py-0.5 rounded">✗ {player.wrongAnswers}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{player.score}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">poin</p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPanel;

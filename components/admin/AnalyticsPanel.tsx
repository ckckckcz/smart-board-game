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
        return <Medal className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-4 h-4 text-slate-400" />;
      case 3:
        return <Medal className="w-4 h-4 text-orange-500" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRoundName = (roundId: string) => {
    const round = rounds.find(r => r.id === roundId);
    return round?.name || roundId;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl shadow-soft p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{totalGames}</p>
          <p className="text-sm text-slate-400">Total Permainan</p>
        </div>

        <div className="bg-slate-800 rounded-xl shadow-soft p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{averageScore}</p>
          <p className="text-sm text-slate-400">Rata-rata Skor</p>
        </div>

        <div className="bg-slate-800 rounded-xl shadow-soft p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-yellow-600/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{highestScore}</p>
          <p className="text-sm text-slate-400">Skor Tertinggi</p>
        </div>

        <div className="bg-slate-800 rounded-xl shadow-soft p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
              <Award className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-black text-white truncate">{topPlayer?.name || '-'}</p>
          <p className="text-sm text-slate-400">Pemain Terbaik</p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent" />
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
              className="text-red-400 hover:bg-red-500/10 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus Semua
            </Button>
          )}
        </div>

        {leaderboard.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground">
            Belum ada data permainan.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {leaderboard
              .sort((a, b) => b.score - a.score)
              .slice(0, 20)
              .map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 flex justify-center">
                    {getMedalIcon(index + 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">{player.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{getRoundName(player.roundId)}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-success font-medium">✓ {player.correctAnswers}</span>
                    <span className="text-destructive font-medium">✗ {player.wrongAnswers}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{player.score}</p>
                    <p className="text-xs text-muted-foreground">poin</p>
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

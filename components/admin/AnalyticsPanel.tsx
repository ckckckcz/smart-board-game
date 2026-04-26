'use client'
import { useMemo, useState } from 'react';
import { Trash2, Trophy, Users, Target, Award, Medal, Filter, Pencil, Check, X, Download } from 'lucide-react';
import type { WorkBook, WorkSheet, CellObject, Range } from 'xlsx';
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
  const [isExporting, setIsExporting] = useState<boolean>(false);

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

  const sanitizeSheetName = (name: string) => {
    // Excel sheet name constraints: max 31 chars, cannot contain : \/ ? * [ ]
    const cleaned = name.replace(/[\\/\?\*\[\]:]/g, ' ').replace(/\s+/g, ' ').trim();
    return (cleaned || 'Babak').slice(0, 31);
  };

  const exportToExcel = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const XLSX: typeof import('xlsx') = await import('xlsx');
      const templateUrl = '/Template%20Laporan%20Siswa.xlsx';
      const templateRes = await fetch(templateUrl);
      if (!templateRes.ok) throw new Error('Gagal mengambil template Excel.');

      const templateBuf = await templateRes.arrayBuffer();
      const templateWb = XLSX.read(new Uint8Array(templateBuf), { type: 'array' });
      const templateSheetName = templateWb.SheetNames[0] || 'Lembar1';
      const templateWs = templateWb.Sheets[templateSheetName];

      const cloneWorksheet = (ws: WorkSheet): WorkSheet => {
        const out: WorkSheet = {};
        for (const key of Object.keys(ws)) {
          const value = (ws as Record<string, unknown>)[key];
          if (key.startsWith('!')) {
            if (Array.isArray(value)) out[key] = value.slice();
            else if (value && typeof value === 'object') out[key] = { ...value };
            else out[key] = value;
            continue;
          }

          // cell object
          out[key] = value && typeof value === 'object' ? { ...value } : value;
        }
        return out;
      };

      const writeTableToWorksheet = (ws: WorkSheet, rows: Array<[string, number, number, number]>) => {
        // Template header is in B2:E2 (0-based: c=1..4, r=1). Data starts at B3.
        const headerRow = 1;
        const startRow = 2;
        const startCol = 1;

        const headers: Array<[string, 's' | 'n']> = [
          ['Nama', 's'],
          ['Benar', 's'],
          ['Salah', 's'],
          ['Poin', 's'],
        ];

        headers.forEach(([value, t], idx) => {
          const addr = XLSX.utils.encode_cell({ c: startCol + idx, r: headerRow });
          const existing = (ws[addr] || {}) as CellObject;
          ws[addr] = { ...existing, t, v: value } as CellObject;
        });

        rows.forEach((row, rowIndex) => {
          const excelRow = startRow + rowIndex;
          row.forEach((value, colIndex) => {
            const addr = XLSX.utils.encode_cell({ c: startCol + colIndex, r: excelRow });
            const existing = (ws[addr] || {}) as CellObject;
            const isNumber = typeof value === 'number' && Number.isFinite(value);
            ws[addr] = { ...existing, t: isNumber ? 'n' : 's', v: value } as CellObject;
          });
        });

        // Ensure worksheet ref includes written rows (do not shrink the template range)
        const currentRef = ws['!ref'] || 'B2:E26';
        const range = XLSX.utils.decode_range(currentRef) as Range;
        const lastNeededRow = startRow + Math.max(rows.length - 1, 0);
        if (lastNeededRow > range.e.r) range.e.r = lastNeededRow;
        ws['!ref'] = XLSX.utils.encode_range(range);
      };

      const playersForRound = (roundId: string) => {
        return leaderboard
          .filter((p) => p.roundId === roundId)
          .slice()
          .sort((a, b) => b.score - a.score);
      };

      const createWorkbookForRound = (roundId: string, roundName: string) => {
        const wb = XLSX.utils.book_new() as WorkBook;
        const ws = cloneWorksheet(templateWs);

        const rows = playersForRound(roundId).map((p) => [
          p.name,
          p.correctAnswers,
          p.wrongAnswers,
          p.score,
        ] as [string, number, number, number]);

        writeTableToWorksheet(ws, rows);
        XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(roundName));
        return wb;
      };

      const downloadWorkbook = (wb: WorkBook, filename: string) => {
        const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([out], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      };

      if (selectedRound !== 'all') {
        const roundName = getRoundName(selectedRound);
        const wb = createWorkbookForRound(selectedRound, roundName);
        downloadWorkbook(wb, `Laporan - ${roundName}.xlsx`);
        return;
      }

      // Export all rounds into one workbook (one sheet per round)
      const wbAll = XLSX.utils.book_new() as WorkBook;
      const usedNames = new Set<string>();

      sortedRounds.forEach((round) => {
        const ws = cloneWorksheet(templateWs);
        const rows = playersForRound(round.id).map((p) => [
          p.name,
          p.correctAnswers,
          p.wrongAnswers,
          p.score,
        ] as [string, number, number, number]);

        writeTableToWorksheet(ws, rows);
        let sheetName = sanitizeSheetName(round.name);
        if (!sheetName) sheetName = 'Babak';
        if (usedNames.has(sheetName)) {
          let i = 2;
          while (usedNames.has(`${sheetName} (${i})`)) i++;
          sheetName = `${sheetName} (${i})`;
        }
        usedNames.add(sheetName);
        XLSX.utils.book_append_sheet(wbAll, ws, sheetName);
      });

      downloadWorkbook(wbAll, 'Laporan - Semua Babak.xlsx');
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'Gagal export Excel.');
    } finally {
      setIsExporting(false);
    }
  };

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

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Round Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <Select value={selectedRound} onValueChange={setSelectedRound}>
                <SelectTrigger className="w-full sm:w-[200px] bg-white border border-border text-slate-900 h-9">
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

            <Button
              onClick={exportToExcel}
              variant="outline"
              size="sm"
              className="bg-white w-full sm:w-auto"
              disabled={isExporting || rounds.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Mengekspor...' : 'Export Excel'}
            </Button>

            {leaderboard.length > 0 && (
              <Button
                onClick={() => {
                  if (confirm('Yakin ingin menghapus semua data?')) {
                    clearLeaderboard();
                  }
                }}
                variant="ghost"
                size="sm"
                className="text-rose-500 hover:bg-rose-50 cursor-pointer w-full sm:w-auto justify-center sm:justify-start"
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

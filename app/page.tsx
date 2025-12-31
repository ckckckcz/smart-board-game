'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, User, Layers, ShieldCheck, Trophy, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGameStore } from '@/hooks/useGameStore';
import DecorativeElements from '@/components/react-bits/background';
import Link from 'next/link';

export default function StartScreen() {
  const router = useRouter();
  const { rounds, setPlayer, selectRound, startGame } = useGameStore();
  const [playerName, setPlayerName] = useState('');
  const [selectedRoundId, setSelectedRoundId] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStart = () => {
    if (!playerName.trim() || !selectedRoundId) return;

    setPlayer(playerName.trim());
    selectRound(selectedRoundId);
    startGame();
    router.push('/game');
  };

  const isFormValid = playerName.trim() && selectedRoundId;

  return (
    <div className="min-h-screen bg-slate-950 relative flex items-center justify-center p-4 overflow-hidden selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 opacity-40">
        <DecorativeElements />
      </div>

      {/* Radial Gradient Overlay for focus */}
      <div className="absolute inset-0 z-0 bg-radial-[circle_at_center,_var(--tw-gradient-stops)] from-transparent via-slate-950/50 to-slate-950 pointer-events-none" />

      <div className={`relative z-10 w-full max-w-lg transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

        {/* Header Section */}
        <div className="text-center mb-8 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -z-10" />

          <h1 className="text-5xl md:text-7xl font-black mb-2 tracking-tighter">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">
              SMART SHOOT
            </span>
          </h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="h-px w-8 bg-indigo-500/50" />
            <h2 className="text-xl md:text-2xl font-bold text-white/80 tracking-widest uppercase">
              Board Game
            </h2>
            <span className="h-px w-8 bg-indigo-500/50" />
          </div>
          <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm md:text-base bg-slate-900/50 py-1 px-3 rounded-full border border-white/5 backdrop-blur-sm">
            Game Edukasi Akuntansi Interaktif
          </p>
        </div>

        {/* Main Card */}
        <div className="group relative bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-[1px]">
          {/* Animated border gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative bg-black/40 rounded-[23px] p-6 md:p-8 space-y-6">

            {/* Feature Pills */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center border border-white/5 hover:bg-white/10 transition-colors">
                <Trophy className="w-5 h-5 text-yellow-400 mb-1" />
                <span className="text-xs font-semibold text-slate-300">Leaderboard</span>
              </div>
              <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center border border-white/5 hover:bg-white/10 transition-colors">
                <Target className="w-5 h-5 text-emerald-400 mb-1" />
                <span className="text-xs font-semibold text-slate-300">Tantangan</span>
              </div>
            </div>

            {/* Player Name Input */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-300 flex items-center gap-2 ml-1">
                <User className="w-4 h-4 text-indigo-400" />
                Identitas Pemain
              </label>
              <div className="relative group/input">
                <Input
                  placeholder="Masukkan nama panggilan..."
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="h-14 text-lg bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:bg-slate-900/80 focus:ring-1 focus:ring-indigo-500/50 rounded-xl transition-all pl-4"
                />
                <div className="absolute inset-0 rounded-xl bg-indigo-500/5 opacity-0 group-focus-within/input:opacity-100 pointer-events-none transition-opacity" />
              </div>
            </div>

            {/* Round Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-300 flex items-center gap-2 ml-1">
                <Layers className="w-4 h-4 text-purple-400" />
                Pilih Babak
              </label>
              <Select value={selectedRoundId} onValueChange={setSelectedRoundId}>
                <SelectTrigger className="h-14 text-lg bg-slate-900/50 border-white/10 text-white focus:ring-indigo-500/50 rounded-xl">
                  <SelectValue placeholder="Pilih tantangan..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  {rounds.map((round) => (
                    <SelectItem key={round.id} value={round.id} className="text-base focus:bg-white/10 focus:text-white cursor-pointer py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-indigo-300">{round.name}</span>
                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-slate-400">{round.totalQuestions} Soal</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Button */}
            <div className="pt-2">
              <Button
                onClick={handleStart}
                disabled={!isFormValid}
                className="group relative w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 transform skew-y-12" />
                <span className="relative flex items-center justify-center gap-2">
                  <Play className="w-5 h-5 fill-current" />
                  START GAME
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer / Admin Link */}
        <div className="text-center mt-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-xs font-semibold py-2 px-4 rounded-full hover:bg-white/5 transition-all duration-300 group"
          >
            <ShieldCheck className="w-3.5 h-3.5 group-hover:text-indigo-400 transition-colors" />
            <span>Akses Panel Guru</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
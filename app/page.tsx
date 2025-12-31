'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Play, User, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGameStore } from '@/hooks/useGameStore';
import DecorativeElements from '@/components/react-bits/background';

export default function StartScreen() {
  const router = useRouter();
  const { rounds, setPlayer, selectRound, startGame } = useGameStore();
  const [playerName, setPlayerName] = useState('');
  const [selectedRoundId, setSelectedRoundId] = useState('');

  const handleStart = () => {
    if (!playerName.trim() || !selectedRoundId) return;

    setPlayer(playerName.trim());
    selectRound(selectedRoundId);
    startGame();
    router.push('/game');
  };

  const isFormValid = playerName.trim() && selectedRoundId;

  return (
    <div className="min-h-screen gradient-primary relative flex items-center justify-center p-4">
      <DecorativeElements />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-primary-foreground mb-3 drop-shadow-lg">
            SMART SHOOT
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground/90 mb-2">
            BOARD GAME
          </h2>
          <p className="text-primary-foreground/80 text-lg font-medium">
            Game Edukasi Akuntansi Interaktif
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-card rounded-md shadow-medium p-8 space-y-6">
          {/* Player Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-secondary" />
              Nama Pemain
            </label>
            <Input
              placeholder="Masukkan nama kamu..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="h-11 text-base"
            />
          </div>

          {/* Round Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-secondary" />
              Pilih Babak
            </label>
            <Select value={selectedRoundId} onValueChange={setSelectedRoundId}>
              <SelectTrigger className="h-11 text-base">
                <SelectValue placeholder="Pilih babak permainan..." />
              </SelectTrigger>
              <SelectContent>
                {rounds.map((round) => (
                  <SelectItem key={round.id} value={round.id}>
                    {round.name} ({round.totalQuestions} soal)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Button */}
          <Button
            onClick={handleStart}
            disabled={!isFormValid}
            className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90"
          >
            <Play className="w-5 h-5 mr-2" />
            MULAI BERMAIN
          </Button>
        </div>

        {/* Admin Link */}
        <div className="text-center mt-6">
          <Link
            href="/admin"
            className="text-primary-foreground/70 hover:text-primary-foreground text-sm font-medium underline-offset-4 hover:underline transition-colors"
          >
            Panel Admin Guru
          </Link>
        </div>
      </div>
    </div>
  );
}
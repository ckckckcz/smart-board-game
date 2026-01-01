'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGameStore } from '@/hooks/useGameStore';
import { useInitializeGame } from '@/hooks/useInitializeGame';
import styles from './landing.module.css';

export default function StartScreen() {
  const router = useRouter();
  const { rounds, setPlayer, selectRound, startGame } = useGameStore();
  const { isInitialized, isLoading } = useInitializeGame();

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

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0284c7' }}>
          Memuat data...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Background Layers */}
      <img
        src="/assets/background-city-removebg-preview.png"
        alt=""
        className={styles.bgCity}
      />
      <img
        src="/assets/bird-removebg-preview.png"
        alt=""
        className={styles.birds}
      />
      <img
        src="/assets/bird-removebg-preview.png"
        alt=""
        className={styles.birdsRight}
      />

      {/* Main Content */}
      <div className={styles.logoContainer}>
        <img
          src="/assets/logo-removebg-preview(1).png"
          alt="SMART SHOOT BOARD GAME"
          className={styles.logoImage}
        />
      </div>

      <div className={styles.formWrapper}>
        {/* Player Name */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Nama Pemain</label>
          <input
            type="text"
            className={styles.input}
            placeholder=""
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
        </div>

        {/* Round Selection */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Pilih Babak</label>
          <select
            className={styles.input}
            value={selectedRoundId}
            onChange={(e) => setSelectedRoundId(e.target.value)}
          >
            <option value="" disabled>Pilih Babak...</option>
            {rounds.map((round) => (
              <option key={round.id} value={round.id}>
                {round.name} ({round.totalQuestions} Soal)
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className={styles.actionsContainer}>
          <Link href="/admin" className={styles.adminLink}>
            Akses Admin Guru
          </Link>
          <button
            className={styles.startButton}
            onClick={handleStart}
            disabled={!isFormValid}
          >
            START
          </button>
        </div>
      </div>

      {/* Decoration Assets */}
      <img
        src="/assets/man-woman-removebg-preview.png"
        alt="Characters"
        className={styles.peopleLeft}
      />

      <img
        src="/assets/building-removebg-preview.png"
        alt="Building"
        className={styles.building}
      />

      <img
        src="/assets/streets-removebg-preview.png"
        alt=""
        className={styles.street}
      />
      <div className={styles.bottomStrip} />
    </div>
  );
}

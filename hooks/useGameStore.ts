import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, Player, Round, Question, QuestionCategory } from '@/types/game';
import { roundsService, questionsService, playersService, adminService } from '@/lib/db-service';
import { gradeShortAnswer } from '@/lib/answer-similarity';

function hashStringToSeed(input: string): number {
  // xfnv1a 32-bit hash
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface GameStore extends GameState {
  // Data stores
  rounds: Round[];
  allQuestions: Question[];
  leaderboard: Player[];
  adminPin: string;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initializeData: () => Promise<void>;
  setPlayer: (name: string) => void;
  selectRound: (roundId: string) => void;
  startGame: () => void;
  selectQuestion: (questionId: string) => void;
  answerQuestion: (answer: string | boolean) => void;
  skipQuestion: () => void;
  nextQuestion: () => void;
  endGame: () => Promise<void>;
  resetGame: () => void;

  // Admin actions
  verifyAdminPin: (pin: string) => Promise<boolean>;
  updateAdminPin: (oldPin: string, newPin: string) => Promise<boolean>;
  addRound: (round: Round) => Promise<void>;
  deleteRound: (roundId: string) => Promise<void>;
  addQuestion: (question: Question) => Promise<void>;
  deleteQuestion: (questionId: string) => Promise<void>;
  updateQuestion: (questionId: string, updates: Partial<Pick<Question, 'timeLimit' | 'points' | 'explanation' | 'matchingExplanation'>>) => Promise<void>;
  clearLeaderboard: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  renamePlayer: (playerId: string, newName: string) => Promise<boolean>;
  toggleSound: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial game state
      player: null,
      currentRound: null,
      currentQuestion: null,
      currentQuestionIndex: 0,
      questions: [],
      answeredQuestions: {},
      isPlaying: false,
      showFeedback: false,
      lastAnswerCorrect: null,
      lastAnswerStatus: null,
      lastAnswerSimilarity: null,
      lastStudentAnswer: null,
      gameComplete: false,
      isSoundEnabled: true,

      // Data stores
      rounds: [],
      allQuestions: [],
      leaderboard: [],
      adminPin: '1234',
      isLoading: false,
      isInitialized: false,

      // Initialize data from Supabase
      initializeData: async () => {
        const { isInitialized, isLoading } = get();
        if (isInitialized || isLoading) return;

        set({ isLoading: true });

        try {
          // Fetch all data from Supabase
          const [rounds, questions, players, adminPin] = await Promise.all([
            roundsService.getAll(),
            questionsService.getAll(),
            playersService.getAll(),
            adminService.getPin(),
          ]);

          set({
            rounds,
            allQuestions: questions,
            leaderboard: players,
            adminPin,
            isInitialized: true,
            isLoading: false,
          });

          console.log('✅ Data loaded from Supabase:', {
            rounds: rounds.length,
            questions: questions.length,
            players: players.length,
          });
        } catch (error) {
          console.error('❌ Failed to load data from Supabase:', error);
          set({ isLoading: false });
        }
      },

      setPlayer: (name: string) => {
        set({
          player: {
            id: `player_${Date.now()}`,
            name,
            score: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            roundId: '',
          },
        });
      },

      selectRound: (roundId: string) => {
        const { rounds, player } = get();
        const round = rounds.find(r => r.id === roundId);
        if (round && player) {
          set({
            currentRound: round,
            player: { ...player, roundId: roundId },
          });
        }
      },

      startGame: () => {
        const { currentRound, allQuestions } = get();
        if (!currentRound) return;

        // Select questions deterministically per round (same set for all players),
        // then shuffle final order per game start (random order for each player).
        const selectedQuestions: Question[] = [];
        const categories: QuestionCategory[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];

        categories.forEach((category) => {
          const count = currentRound.questionCounts[category];
          if (!count) return;

          // Stabilize ordering so all clients pick the same questions
          const categoryQuestions = allQuestions
            .filter((q) => q.category === category)
            .slice()
            .sort((a, b) => a.id.localeCompare(b.id));

          const seed = hashStringToSeed(`${currentRound.id}:${category}`);
          const picked = seededShuffle(categoryQuestions, seed).slice(0, count);
          selectedQuestions.push(...picked);
        });

        const questionsForGame = shuffle(selectedQuestions);

        set({
          questions: questionsForGame,
          answeredQuestions: {},
          isPlaying: true,
          currentQuestionIndex: 0,
          gameComplete: false,
          showFeedback: false,
          lastAnswerCorrect: null,
          lastAnswerStatus: null,
          lastAnswerSimilarity: null,
          lastStudentAnswer: null,
          currentQuestion: null,
        });
      },


      selectQuestion: (questionId: string) => {
        const { questions } = get();
        const question = questions.find(q => q.id === questionId);
        if (question) {
          set({ currentQuestion: question });
        }
      },

      answerQuestion: (answer: string | boolean) => {
        const { currentQuestion, player, answeredQuestions } = get();
        if (!currentQuestion || !player) return;

        let isCorrect = false;
        let status: 'correct' | 'almost' | 'wrong' = 'wrong';
        let similarity: number | null = null;

        // Check answer based on question type
        switch (currentQuestion.type) {
          case 'true_false':
            isCorrect = answer === currentQuestion.correctAnswer;
            status = isCorrect ? 'correct' : 'wrong';
            break;
          case 'multiple_choice':
            isCorrect = answer === currentQuestion.correctAnswer;
            status = isCorrect ? 'correct' : 'wrong';
            break;
          case 'matching':
            // For matching, compare the pairs regardless of order
            // e.g., "1A-2C-3B" should match "2C-1A-3B"
            const studentAnswer = String(answer).toUpperCase().replace(/\s/g, '');
            const correctAnswer = String(currentQuestion.matchingAnswer || '').toUpperCase().replace(/\s/g, '');

            // Parse pairs from answer strings (e.g., "1A-2C-3B" -> ["1A", "2C", "3B"])
            const studentPairs = studentAnswer.split('-').filter(Boolean).sort();
            const correctPairs = correctAnswer.split('-').filter(Boolean).sort();

            // Compare sorted pairs - order doesn't matter, only the pairs themselves
            isCorrect = studentPairs.length === correctPairs.length &&
              studentPairs.every((pair, index) => pair === correctPairs[index]);

            status = isCorrect ? 'correct' : 'wrong';
            break;

          case 'short_answer': {
            const studentText = String(answer ?? '');
            const correctText = String(currentQuestion.correctAnswer ?? '');
            const graded = gradeShortAnswer(studentText, correctText);
            similarity = graded.similarity;
            status = graded.grade;
            isCorrect = status === 'correct';
            break;
          }
        }

        const pointsEarned = isCorrect ? currentQuestion.points : 0;

        const studentAnswerText = (() => {
          switch (currentQuestion.type) {
            case 'true_false':
              return answer === true ? 'Benar' : answer === false ? 'Salah' : String(answer);
            case 'multiple_choice':
              return String(answer).toUpperCase();
            case 'matching':
              return String(answer).toUpperCase();
            case 'short_answer':
              return String(answer);
            default:
              return String(answer);
          }
        })();

        set({
          showFeedback: true,
          lastAnswerCorrect: isCorrect,
          lastAnswerStatus: status,
          lastAnswerSimilarity: similarity,
          lastStudentAnswer: studentAnswerText,
          answeredQuestions: {
            ...answeredQuestions,
            [currentQuestion.id]: isCorrect ? 'correct' : 'wrong',
          },
          player: {
            ...player,
            score: player.score + pointsEarned,
            correctAnswers: player.correctAnswers + (isCorrect ? 1 : 0),
            wrongAnswers: player.wrongAnswers + (isCorrect ? 0 : 1),
          },
        });
      },

      skipQuestion: () => {
        const { player, currentQuestion, answeredQuestions, questions } = get();
        if (!player) return;

        const newAnsweredQuestions = currentQuestion
          ? { ...answeredQuestions, [currentQuestion.id]: 'wrong' as const }
          : answeredQuestions;

        set({
          player: {
            ...player,
            wrongAnswers: player.wrongAnswers + 1,
          },
          currentQuestion: null,
          showFeedback: false,
          lastAnswerCorrect: null,
          lastAnswerStatus: null,
          lastAnswerSimilarity: null,
          lastStudentAnswer: null,
          answeredQuestions: newAnsweredQuestions,
        });

        // Check if game is complete
        const updatedAnsweredQuestions = get().answeredQuestions;
        if (Object.keys(updatedAnsweredQuestions).length >= questions.length) {
          get().endGame();
        }
      },

      nextQuestion: () => {
        const { questions, answeredQuestions } = get();

        if (Object.keys(answeredQuestions).length >= questions.length) {
          get().endGame();
        } else {
          set((state) => ({
            currentQuestionIndex: state.currentQuestionIndex + 1,
            currentQuestion: null,
            showFeedback: false,
            lastAnswerCorrect: null,
            lastAnswerStatus: null,
            lastAnswerSimilarity: null,
            lastStudentAnswer: null,
          }));
        }
      },

      endGame: async () => {
        const { player, leaderboard, gameComplete } = get();
        if (!player || gameComplete) return;

        // Mark as complete immediately to prevent multiple calls
        set({
          gameComplete: true,
          isPlaying: false
        });

        const completedPlayer: Player = {
          ...player,
          completedAt: new Date(),
        };

        // Save to Supabase
        try {
          const savedPlayer = await playersService.create(completedPlayer);
          if (savedPlayer) {
            console.log('✅ Player saved to Supabase:', savedPlayer.name);
          }
        } catch (error) {
          console.error('❌ Failed to save player to Supabase:', error);
        }

        const currentLeaderboard = get().leaderboard;
        set({
          leaderboard: [...currentLeaderboard, completedPlayer].sort((a, b) => b.score - a.score),
        });
      },

      resetGame: () => {
        set({
          player: null,
          currentRound: null,
          currentQuestion: null,
          currentQuestionIndex: 0,
          questions: [],
          answeredQuestions: {},
          isPlaying: false,
          showFeedback: false,
          lastAnswerCorrect: null,
          lastAnswerStatus: null,
          lastAnswerSimilarity: null,
          lastStudentAnswer: null,
          gameComplete: false,
        });
      },

      verifyAdminPin: async (pin: string) => {
        try {
          return await adminService.verifyPin(pin);
        } catch {
          // Fallback to local check
          return get().adminPin === pin;
        }
      },

      updateAdminPin: async (oldPin: string, newPin: string) => {
        try {
          const success = await adminService.updatePin(oldPin, newPin);
          if (success) {
            set({ adminPin: newPin });
          }
          return success;
        } catch {
          // Fallback to local update
          if (get().adminPin === oldPin) {
            set({ adminPin: newPin });
            return true;
          }
          return false;
        }
      },

      addRound: async (round: Round) => {
        // Optimistic update
        set({ rounds: [...get().rounds, round] });

        try {
          const savedRound = await roundsService.create(round);
          if (savedRound) {
            console.log('✅ Round saved to Supabase:', savedRound.name);
            // Update with the server-generated ID
            set({
              rounds: get().rounds.map(r =>
                r.id === round.id ? savedRound : r
              ),
            });
          }
        } catch (error) {
          console.error('❌ Failed to save round to Supabase:', error);
        }
      },

      deleteRound: async (roundId: string) => {
        // Optimistic update
        set({ rounds: get().rounds.filter(r => r.id !== roundId) });

        try {
          await roundsService.delete(roundId);
          console.log('✅ Round deleted from Supabase');
        } catch (error) {
          console.error('❌ Failed to delete round from Supabase:', error);
        }
      },

      addQuestion: async (question: Question) => {
        // Optimistic update
        set({ allQuestions: [...get().allQuestions, question] });

        try {
          const savedQuestion = await questionsService.create(question);
          if (savedQuestion) {
            console.log('✅ Question saved to Supabase:', savedQuestion.id);
            // Update with the server-generated ID
            set({
              allQuestions: get().allQuestions.map(q =>
                q.id === question.id ? savedQuestion : q
              ),
            });
          }
        } catch (error) {
          console.error('❌ Failed to save question to Supabase:', error);
        }
      },

      deleteQuestion: async (questionId: string) => {
        // Optimistic update
        set({ allQuestions: get().allQuestions.filter(q => q.id !== questionId) });

        try {
          await questionsService.delete(questionId);
          console.log('✅ Question deleted from Supabase');
        } catch (error) {
          console.error('❌ Failed to delete question from Supabase:', error);
        }
      },

      updateQuestion: async (questionId: string, updates: Partial<Pick<Question, 'timeLimit' | 'points'>>) => {
        // Optimistic update
        set({
          allQuestions: get().allQuestions.map(q =>
            q.id === questionId ? { ...q, ...updates } : q
          ),
        });

        try {
          const updatedQuestion = await questionsService.updatePartial(questionId, updates);
          if (updatedQuestion) {
            console.log('✅ Question updated in Supabase:', questionId);
            set({
              allQuestions: get().allQuestions.map(q =>
                q.id === questionId ? updatedQuestion : q
              ),
            });
          }
        } catch (error) {
          console.error('❌ Failed to update question in Supabase:', error);
        }
      },

      clearLeaderboard: async () => {
        // Optimistic update
        set({ leaderboard: [] });

        try {
          await playersService.clearAll();
          console.log('✅ Leaderboard cleared from Supabase');
        } catch (error) {
          console.error('❌ Failed to clear leaderboard from Supabase:', error);
        }
      },

      refreshLeaderboard: async () => {
        try {
          const players = await playersService.getAll();
          set({ leaderboard: players });
          console.log('✅ Leaderboard refreshed from Supabase');
        } catch (error) {
          console.error('❌ Failed to refresh leaderboard:', error);
        }
      },

      renamePlayer: async (playerId: string, newName: string) => {
        const trimmedName = newName.trim();
        if (!trimmedName) return false;

        const prevLeaderboard = get().leaderboard;
        const prevPlayer = get().player;

        // Optimistic update
        set({
          leaderboard: prevLeaderboard.map((p) =>
            p.id === playerId ? { ...p, name: trimmedName } : p
          ),
          player: prevPlayer?.id === playerId ? { ...prevPlayer, name: trimmedName } : prevPlayer,
        });

        // Only attempt DB update if id looks like a UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(playerId)) {
          return true;
        }

        try {
          const updated = await playersService.updateName(playerId, trimmedName);
          if (!updated) {
            // Re-sync on failure
            await get().refreshLeaderboard();
            return false;
          }

          set({
            leaderboard: get().leaderboard.map((p) =>
              p.id === playerId ? { ...p, name: updated.name } : p
            ),
          });
          return true;
        } catch (error) {
          console.error('❌ Failed to rename player:', error);
          // Revert local changes and re-sync
          set({ leaderboard: prevLeaderboard, player: prevPlayer });
          try {
            await get().refreshLeaderboard();
          } catch {
            // ignore
          }
          return false;
        }
      },

      toggleSound: () => {
        set((state) => ({ isSoundEnabled: !state.isSoundEnabled }));
      },
    }),
    {
      name: 'smart-shoot-game',
      partialize: (state) => ({
        // Only persist game session state locally (as cache)
        rounds: state.rounds,
        allQuestions: state.allQuestions,
        leaderboard: state.leaderboard,
        adminPin: state.adminPin,
        isSoundEnabled: state.isSoundEnabled,
      }),
    }
  )
);

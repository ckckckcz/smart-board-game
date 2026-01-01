import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, Player, Round, Question, QuestionCategory } from '@/types/game';
import { roundsService, questionsService, playersService, adminService } from '@/lib/db-service';

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
  clearLeaderboard: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
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
      gameComplete: false,

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

        // Select questions based on round configuration
        const selectedQuestions: Question[] = [];
        const categories: QuestionCategory[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];

        categories.forEach(category => {
          const count = currentRound.questionCounts[category];
          const categoryQuestions = allQuestions.filter(q => q.category === category);
          const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);
          selectedQuestions.push(...shuffled.slice(0, count));
        });

        // Shuffle all selected questions for random order
        const shuffledQuestions = selectedQuestions.sort(() => Math.random() - 0.5);

        set({
          questions: shuffledQuestions,
          answeredQuestions: {},
          isPlaying: true,
          currentQuestionIndex: 0,
          gameComplete: false,
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

        // Check answer based on question type
        switch (currentQuestion.type) {
          case 'true_false':
            isCorrect = answer === currentQuestion.correctAnswer;
            break;
          case 'multiple_choice':
            isCorrect = answer === currentQuestion.correctAnswer;
            break;
          case 'essay':
            // For essay, compare strings (case insensitive, trimmed)
            isCorrect = String(answer).toLowerCase().trim() ===
              String(currentQuestion.essayAnswer || '').toLowerCase().trim();
            break;
          case 'matching':
            // For matching, compare the answer string
            isCorrect = String(answer).toUpperCase().replace(/\s/g, '') ===
              String(currentQuestion.matchingAnswer || '').toUpperCase().replace(/\s/g, '');
            break;
        }

        const pointsEarned = isCorrect ? currentQuestion.points : 0;

        set({
          showFeedback: true,
          lastAnswerCorrect: isCorrect,
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
          }));
        }
      },

      endGame: async () => {
        const { player, leaderboard } = get();
        if (!player) return;

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

        set({
          gameComplete: true,
          isPlaying: false,
          leaderboard: [...leaderboard, completedPlayer].sort((a, b) => b.score - a.score),
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
    }),
    {
      name: 'smart-shoot-game',
      partialize: (state) => ({
        // Only persist game session state locally (as cache)
        rounds: state.rounds,
        allQuestions: state.allQuestions,
        leaderboard: state.leaderboard,
        adminPin: state.adminPin,
      }),
    }
  )
);

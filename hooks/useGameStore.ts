import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, Player, Round, Question, QuestionCategory } from '@/types/game';
import { mockQuestions, mockRounds, mockPlayers, DEFAULT_ADMIN_PIN } from '@/data/mockData';

interface GameStore extends GameState {
  // Data stores
  rounds: Round[];
  allQuestions: Question[];
  leaderboard: Player[];
  adminPin: string;
  
  // Actions
  setPlayer: (name: string) => void;
  selectRound: (roundId: string) => void;
  startGame: () => void;
  selectQuestion: (questionId: string) => void;
  answerQuestion: (answer: string | boolean) => void;
  skipQuestion: () => void;
  nextQuestion: () => void;
  endGame: () => void;
  resetGame: () => void;
  
  // Admin actions
  verifyAdminPin: (pin: string) => boolean;
  updateAdminPin: (oldPin: string, newPin: string) => boolean;
  addRound: (round: Round) => void;
  deleteRound: (roundId: string) => void;
  addQuestion: (question: Question) => void;
  deleteQuestion: (questionId: string) => void;
  clearLeaderboard: () => void;
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
      rounds: mockRounds,
      allQuestions: mockQuestions,
      leaderboard: mockPlayers,
      adminPin: DEFAULT_ADMIN_PIN,
      
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
        const { player, currentQuestion, answeredQuestions, currentQuestionIndex, questions } = get();
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
        if (currentQuestionIndex >= questions.length - 1) {
          get().endGame();
        }
      },
      
      nextQuestion: () => {
        const { currentQuestionIndex, questions } = get();
        
        if (currentQuestionIndex >= questions.length - 1) {
          get().endGame();
        } else {
          set({
            currentQuestionIndex: currentQuestionIndex + 1,
            currentQuestion: null,
            showFeedback: false,
            lastAnswerCorrect: null,
          });
        }
      },
      
      endGame: () => {
        const { player, leaderboard } = get();
        if (!player) return;
        
        const completedPlayer = {
          ...player,
          completedAt: new Date(),
        };
        
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
      
      verifyAdminPin: (pin: string) => {
        return get().adminPin === pin;
      },
      
      updateAdminPin: (oldPin: string, newPin: string) => {
        if (get().adminPin === oldPin) {
          set({ adminPin: newPin });
          return true;
        }
        return false;
      },
      
      addRound: (round: Round) => {
        set({ rounds: [...get().rounds, round] });
      },
      
      deleteRound: (roundId: string) => {
        set({ rounds: get().rounds.filter(r => r.id !== roundId) });
      },
      
      addQuestion: (question: Question) => {
        set({ allQuestions: [...get().allQuestions, question] });
      },
      
      deleteQuestion: (questionId: string) => {
        set({ allQuestions: get().allQuestions.filter(q => q.id !== questionId) });
      },
      
      clearLeaderboard: () => {
        set({ leaderboard: [] });
      },
    }),
    {
      name: 'smart-shoot-game',
      partialize: (state) => ({
        rounds: state.rounds,
        allQuestions: state.allQuestions,
        leaderboard: state.leaderboard,
        adminPin: state.adminPin,
      }),
    }
  )
);

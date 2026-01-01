export type QuestionCategory = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6';

export type QuestionType = 'multiple_choice' | 'true_false' | 'essay' | 'matching';

export interface MatchingPair {
  left: string;
  right: string;
}

export interface Question {
  id: string;
  category: QuestionCategory;
  type: QuestionType;
  question: string;
  imageUrl?: string; // Optional image for each question
  // For multiple choice
  options?: string[];
  // For true/false
  correctAnswer?: string | boolean;
  // For essay
  essayAnswer?: string;
  // For matching (3 pairs)
  matchingPairs?: MatchingPair[];
  matchingAnswer?: string; // Format: "1A-2B-3C"
  timeLimit: number; // in seconds
  points: number;
}

export interface Round {
  id: string;
  name: string;
  questionCounts: Record<QuestionCategory, number>;
  totalQuestions: number;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  roundId: string;
  completedAt?: Date;
}

export interface GameState {
  player: Player | null;
  currentRound: Round | null;
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  questions: Question[];
  answeredQuestions: Record<string, 'correct' | 'wrong'>; // Track answered questions with result
  isPlaying: boolean;
  showFeedback: boolean;
  lastAnswerCorrect: boolean | null;
  gameComplete: boolean;
}

export interface AdminSettings {
  pin: string;
}

export interface GameStats {
  totalGames: number;
  averageScore: number;
  highestScore: number;
  topPlayer: string;
}

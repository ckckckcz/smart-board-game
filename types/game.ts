export type QuestionCategory = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6';

export type QuestionType = 'multiple_choice' | 'true_false' | 'matching' | 'short_answer' | 'essay';

export type ManualImageAnswerKind = 'short_answer' | 'essay';

export interface MatchingPair {
  left: string;
  right: string;
  leftImage?: string;
}

export interface MatchingLeftItem {
  text: string;
  image?: string;
}

export interface Question {
  id: string;
  category: QuestionCategory;
  type: QuestionType;
  question: string;
  imageUrl?: string; // Optional image for each question
  imageUrls?: string[]; // Multiple images support (up to 3)
  shortAnswerImageMaxCount?: number;
  essayImageMaxCount?: number;
  explanation?: string; // Optional explanation shown in feedback
  // For multiple choice
  options?: string[];
  // For true/false, multiple choice (letter), and short answer (string)
  correctAnswer?: string | boolean;
  // For essay/image submissions, the answer is reviewed manually from uploaded images
  requiresImageAnswer?: boolean;
  // For matching (Flexible: independent left/right counts)
  matchingLeft?: MatchingLeftItem[];
  matchingRight?: string[];
  matchingAnswer?: string; // Format: "1A-2B-3C" or similar depending on UI logic
  matchingExplanation?: string; // Optional explanation shown in popup when answer is wrong
  timeLimit: number; // in seconds
  points: number;
}

export interface Round {
  id: string;
  name: string;
  questionCounts: Record<QuestionCategory, number>;
  totalQuestions: number;
  allowedQuestionTypes?: QuestionType[];
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
  answeredQuestions: Record<string, 'correct' | 'wrong' | 'almost' | 'pending'>; // Track answered questions with result
  isPlaying: boolean;
  showFeedback: boolean;
  lastAnswerCorrect: boolean | null;
  lastAnswerStatus: 'correct' | 'almost' | 'wrong' | 'pending' | null;
  lastAnswerSimilarity: number | null; // 0..1, only used for short_answer
  lastStudentAnswer: string | null;
  gameComplete: boolean;
  isSoundEnabled: boolean;
}

export interface AdminSettings {
  pin: string;
}

export interface ManualImageAnswerSubmission {
  id: string;
  playerId: string;
  playerName: string;
  roundId: string | null;
  roundName?: string;
  questionId: string | null;
  questionType: ManualImageAnswerKind;
  questionText: string;
  imageUrls: string[];
  reviewPoints: number | null;
  scoreApplied: boolean;
  status: 'pending' | 'reviewed' | 'rejected';
  createdAt: Date;
  reviewedAt?: Date;
}

export interface GameStats {
  totalGames: number;
  averageScore: number;
  highestScore: number;
  topPlayer: string;
}

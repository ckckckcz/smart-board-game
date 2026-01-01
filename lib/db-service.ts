import { supabase, DbRound, DbQuestion, DbPlayer, DbAdminSettings } from './supabase';
import { Round, Question, Player, QuestionCategory } from '@/types/game';

// =====================================================
// Helper Functions - Convert between DB and App types
// =====================================================

function dbRoundToRound(dbRound: DbRound): Round {
    return {
        id: dbRound.id,
        name: dbRound.name,
        questionCounts: dbRound.question_counts as Record<QuestionCategory, number>,
        totalQuestions: dbRound.total_questions,
    };
}

// Don't send client-generated ID to Supabase, let it generate UUID
function roundToDbRound(round: Round): Partial<DbRound> {
    return {
        // Don't include 'id' here - Supabase will generate UUID
        name: round.name,
        question_counts: round.questionCounts,
        total_questions: round.totalQuestions,
    };
}

function dbQuestionToQuestion(dbQuestion: DbQuestion): Question {
    const question: Question = {
        id: dbQuestion.id,
        category: dbQuestion.category,
        type: dbQuestion.type,
        question: dbQuestion.question,
        timeLimit: dbQuestion.time_limit,
        points: dbQuestion.points,
    };

    if (dbQuestion.image_url) {
        question.imageUrl = dbQuestion.image_url;
    }

    if (dbQuestion.options) {
        question.options = dbQuestion.options;
    }

    if (dbQuestion.correct_answer !== null) {
        // For true/false, convert string to boolean
        if (dbQuestion.type === 'true_false') {
            question.correctAnswer = dbQuestion.correct_answer === 'true';
        } else {
            question.correctAnswer = dbQuestion.correct_answer;
        }
    }

    if (dbQuestion.essay_answer) {
        question.essayAnswer = dbQuestion.essay_answer;
    }

    if (dbQuestion.matching_pairs) {
        question.matchingPairs = dbQuestion.matching_pairs;
    }

    if (dbQuestion.matching_answer) {
        question.matchingAnswer = dbQuestion.matching_answer;
    }

    return question;
}

function questionToDbQuestion(question: Question): Partial<DbQuestion> {
    const dbQuestion: Partial<DbQuestion> = {
        category: question.category,
        type: question.type,
        question: question.question,
        time_limit: question.timeLimit,
        points: question.points,
    };

    if (question.imageUrl) {
        dbQuestion.image_url = question.imageUrl;
    }

    if (question.options) {
        dbQuestion.options = question.options;
    }

    if (question.correctAnswer !== undefined) {
        dbQuestion.correct_answer = String(question.correctAnswer);
    }

    if (question.essayAnswer) {
        dbQuestion.essay_answer = question.essayAnswer;
    }

    if (question.matchingPairs) {
        dbQuestion.matching_pairs = question.matchingPairs;
    }

    if (question.matchingAnswer) {
        dbQuestion.matching_answer = question.matchingAnswer;
    }

    return dbQuestion;
}

function dbPlayerToPlayer(dbPlayer: DbPlayer): Player {
    return {
        id: dbPlayer.id,
        name: dbPlayer.name,
        score: dbPlayer.score,
        correctAnswers: dbPlayer.correct_answers,
        wrongAnswers: dbPlayer.wrong_answers,
        roundId: dbPlayer.round_id || '',
        completedAt: dbPlayer.completed_at ? new Date(dbPlayer.completed_at) : undefined,
    };
}

// =====================================================
// Rounds Service
// =====================================================

export const roundsService = {
    async getAll(): Promise<Round[]> {
        const { data, error } = await supabase
            .from('rounds')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching rounds:', error);
            return [];
        }

        return (data || []).map(dbRoundToRound);
    },

    async create(round: Round): Promise<Round | null> {
        const dbRound = roundToDbRound(round);

        const { data, error } = await supabase
            .from('rounds')
            .insert(dbRound)
            .select()
            .single();

        if (error) {
            console.error('Error creating round:', error.message, error.details, error.hint);
            return null;
        }

        return dbRoundToRound(data);
    },

    async delete(roundId: string): Promise<boolean> {
        const { error } = await supabase
            .from('rounds')
            .delete()
            .eq('id', roundId);

        if (error) {
            console.error('Error deleting round:', error);
            return false;
        }

        return true;
    },
};

// =====================================================
// Questions Service
// =====================================================

export const questionsService = {
    async getAll(): Promise<Question[]> {
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching questions:', error);
            return [];
        }

        return (data || []).map(dbQuestionToQuestion);
    },

    async getByCategory(category: QuestionCategory): Promise<Question[]> {
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('category', category)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching questions by category:', error);
            return [];
        }

        return (data || []).map(dbQuestionToQuestion);
    },

    async create(question: Question): Promise<Question | null> {
        const dbQuestion = questionToDbQuestion(question);

        const { data, error } = await supabase
            .from('questions')
            .insert(dbQuestion)
            .select()
            .single();

        if (error) {
            console.error('Error creating question:', error);
            return null;
        }

        return dbQuestionToQuestion(data);
    },

    async delete(questionId: string): Promise<boolean> {
        const { error } = await supabase
            .from('questions')
            .delete()
            .eq('id', questionId);

        if (error) {
            console.error('Error deleting question:', error);
            return false;
        }

        return true;
    },

    async uploadImage(file: File): Promise<string | null> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `question-images/${fileName}`;

        const { error } = await supabase.storage
            .from('game-assets')
            .upload(filePath, file);

        if (error) {
            console.error('Error uploading image:', error);
            return null;
        }

        const { data } = supabase.storage
            .from('game-assets')
            .getPublicUrl(filePath);

        return data.publicUrl;
    },
};

// =====================================================
// Players/Leaderboard Service
// =====================================================

export const playersService = {
    async getAll(): Promise<Player[]> {
        const { data, error } = await supabase
            .from('players')
            .select('*')
            .order('score', { ascending: false });

        if (error) {
            console.error('Error fetching players:', error);
            return [];
        }

        return (data || []).map(dbPlayerToPlayer);
    },

    async getByRound(roundId: string): Promise<Player[]> {
        const { data, error } = await supabase
            .from('players')
            .select('*')
            .eq('round_id', roundId)
            .order('score', { ascending: false });

        if (error) {
            console.error('Error fetching players by round:', error);
            return [];
        }

        return (data || []).map(dbPlayerToPlayer);
    },

    async create(player: Player): Promise<Player | null> {
        // Validate round_id - must be a valid UUID or null
        // Client-generated IDs like "round_123456" are not valid UUIDs
        const isValidUUID = (str: string) => {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            return uuidRegex.test(str);
        };

        const roundId = player.roundId && isValidUUID(player.roundId) ? player.roundId : null;

        const dbPlayer = {
            name: player.name,
            score: player.score,
            correct_answers: player.correctAnswers,
            wrong_answers: player.wrongAnswers,
            round_id: roundId,
            completed_at: player.completedAt?.toISOString() || new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('players')
            .insert(dbPlayer)
            .select()
            .single();

        if (error) {
            console.error('Error creating player:', error.message, error.details, error.hint);
            return null;
        }

        return dbPlayerToPlayer(data);
    },

    async clearAll(): Promise<boolean> {
        const { error } = await supabase
            .from('players')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        if (error) {
            console.error('Error clearing leaderboard:', error);
            return false;
        }

        return true;
    },
};

// =====================================================
// Admin Settings Service
// =====================================================

export const adminService = {
    async getPin(): Promise<string> {
        const { data, error } = await supabase
            .from('admin_settings')
            .select('value')
            .eq('key', 'admin_pin')
            .single();

        if (error) {
            console.error('Error fetching admin PIN:', error);
            return '1234'; // Default fallback
        }

        return data?.value || '1234';
    },

    async verifyPin(pin: string): Promise<boolean> {
        const storedPin = await this.getPin();
        return storedPin === pin;
    },

    async updatePin(oldPin: string, newPin: string): Promise<boolean> {
        const isValid = await this.verifyPin(oldPin);
        if (!isValid) return false;

        const { error } = await supabase
            .from('admin_settings')
            .update({ value: newPin })
            .eq('key', 'admin_pin');

        if (error) {
            console.error('Error updating admin PIN:', error);
            return false;
        }

        return true;
    },
};

// =====================================================
// Game Sessions Service (Optional - for tracking)
// =====================================================

export const gameSessionsService = {
    async create(playerId: string, roundId: string): Promise<string | null> {
        const { data, error } = await supabase
            .from('game_sessions')
            .insert({
                player_id: playerId,
                round_id: roundId,
                status: 'in_progress',
            })
            .select('id')
            .single();

        if (error) {
            console.error('Error creating game session:', error);
            return null;
        }

        return data?.id || null;
    },

    async complete(sessionId: string): Promise<boolean> {
        const { error } = await supabase
            .from('game_sessions')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
            })
            .eq('id', sessionId);

        if (error) {
            console.error('Error completing game session:', error);
            return false;
        }

        return true;
    },
};

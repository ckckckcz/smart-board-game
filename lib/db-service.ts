import { supabase, DbRound, DbQuestion, DbPlayer, DbAdminSettings, DbManualImageAnswerSubmission } from './supabase';
import { Round, Question, Player, QuestionCategory, ManualImageAnswerSubmission, ManualImageAnswerKind, QuestionType } from '@/types/game';

// =====================================================
// Helper Functions - Convert between DB and App types
// =====================================================

function dbRoundToRound(dbRound: DbRound): Round {
    return {
        id: dbRound.id,
        name: dbRound.name,
        questionCounts: dbRound.question_counts as Record<QuestionCategory, number>,
        totalQuestions: dbRound.total_questions,
        allowedQuestionTypes: dbRound.allowed_question_types as QuestionType[],
    };
}

// Don't send client-generated ID to Supabase, let it generate UUID
function roundToDbRound(round: Round): Partial<DbRound> {
    return {
        // Don't include 'id' here - Supabase will generate UUID
        name: round.name,
        question_counts: round.questionCounts,
        total_questions: round.totalQuestions,
        allowed_question_types: round.allowedQuestionTypes || ['multiple_choice', 'true_false', 'matching', 'short_answer', 'essay'],
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

    if (dbQuestion.type === 'essay') {
        question.requiresImageAnswer = true;
    }

    if (dbQuestion.essay_answer && dbQuestion.type !== 'essay') {
        question.explanation = dbQuestion.essay_answer;
    }

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

    if (dbQuestion.type === 'matching') {
        if (dbQuestion.matching_pairs) {
            question.matchingLeft = dbQuestion.matching_pairs;
        }
        if (dbQuestion.options) {
            question.matchingRight = dbQuestion.options;
        }
    }

    if (dbQuestion.matching_answer) {
        question.matchingAnswer = dbQuestion.matching_answer;
    }

    if (dbQuestion.matching_explanation) {
        question.matchingExplanation = dbQuestion.matching_explanation;
    }

    if (dbQuestion.image_urls) {
        question.imageUrls = dbQuestion.image_urls;
    }

    if (dbQuestion.essay_image_max_count !== null) {
        question.essayImageMaxCount = dbQuestion.essay_image_max_count;
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

    if (question.explanation && question.explanation.trim()) {
        dbQuestion.essay_answer = question.explanation.trim();
    }

    if (question.type === 'essay' && !dbQuestion.essay_answer) {
        dbQuestion.essay_answer = '';
    }

    if (question.type === 'essay') {
        dbQuestion.essay_image_max_count = question.essayImageMaxCount ?? 3;
    }

    if (question.imageUrl) {
        dbQuestion.image_url = question.imageUrl;
    }

    if (question.options) {
        dbQuestion.options = question.options;
    }

    if (question.correctAnswer !== undefined) {
        dbQuestion.correct_answer = String(question.correctAnswer);
    }

    if (question.type === 'matching') {
        if (question.matchingLeft) {
            dbQuestion.matching_pairs = question.matchingLeft as any[];
        }
        if (question.matchingRight) {
            dbQuestion.options = question.matchingRight;
        }
    }

    if (question.matchingAnswer) {
        dbQuestion.matching_answer = question.matchingAnswer;
    }

    if (question.type === 'matching' && question.matchingExplanation) {
        dbQuestion.matching_explanation = question.matchingExplanation;
    }

    if (question.imageUrls) {
        dbQuestion.image_urls = question.imageUrls;
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
            console.error('Error creating question:', error.message, error.details, error.hint);
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

    async updatePartial(questionId: string, updates: Partial<Pick<Question, 'timeLimit' | 'points' | 'explanation' | 'matchingExplanation'>>): Promise<Question | null> {
        const dbUpdates: Record<string, unknown> = {};

        if (updates.timeLimit !== undefined) {
            dbUpdates.time_limit = updates.timeLimit;
        }
        if (updates.points !== undefined) {
            dbUpdates.points = updates.points;
        }
        if (updates.explanation !== undefined) {
            dbUpdates.essay_answer = updates.explanation || null;
        }
        if (updates.matchingExplanation !== undefined) {
            dbUpdates.matching_explanation = updates.matchingExplanation || null;
        }

        const { data, error } = await supabase
            .from('questions')
            .update(dbUpdates)
            .eq('id', questionId)
            .select()
            .single();

        if (error) {
            console.error('Error updating question:', error);
            return null;
        }

        return dbQuestionToQuestion(data);
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

function dbManualImageAnswerSubmissionToSubmission(
    dbSubmission: DbManualImageAnswerSubmission,
): ManualImageAnswerSubmission {
    return {
        id: dbSubmission.id,
        playerId: dbSubmission.player_id,
        playerName: dbSubmission.player_name,
        roundId: dbSubmission.round_id || null,
        roundName: dbSubmission.round_name || undefined,
        questionId: dbSubmission.question_id || null,
        questionType: dbSubmission.question_type,
        questionText: dbSubmission.question_text,
        imageUrls: dbSubmission.image_urls || [],
        reviewPoints: dbSubmission.review_points,
        scoreApplied: dbSubmission.score_applied,
        status: dbSubmission.status,
        createdAt: new Date(dbSubmission.created_at),
        reviewedAt: dbSubmission.reviewed_at ? new Date(dbSubmission.reviewed_at) : undefined,
    };
}

function manualImageAnswerSubmissionToDbSubmission(
    submission: ManualImageAnswerSubmission,
): Partial<DbManualImageAnswerSubmission> {
    const dbSubmission: Partial<DbManualImageAnswerSubmission> = {
        player_id: submission.playerId,
        player_name: submission.playerName,
        round_id: submission.roundId || null,
        round_name: submission.roundName || null,
        question_id: submission.questionId || null,
        question_type: submission.questionType,
        question_text: submission.questionText,
        image_urls: submission.imageUrls,
        review_points: submission.reviewPoints,
        score_applied: submission.scoreApplied,
        status: submission.status,
        created_at: submission.createdAt.toISOString(),
        reviewed_at: submission.reviewedAt?.toISOString() || null,
    };

    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submission.id)) {
        dbSubmission.id = submission.id;
    }

    return dbSubmission;
}

export const manualImageAnswerService = {
    async getAll(): Promise<ManualImageAnswerSubmission[]> {
        const { data, error } = await supabase
            .from('manual_image_answer_submissions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching manual image answer submissions:', error);
            return [];
        }

        return (data || []).map(dbManualImageAnswerSubmissionToSubmission);
    },

    async create(submission: ManualImageAnswerSubmission): Promise<ManualImageAnswerSubmission | null> {
        const dbSubmission = manualImageAnswerSubmissionToDbSubmission(submission);
        const { data, error } = await supabase
            .from('manual_image_answer_submissions')
            .insert(dbSubmission)
            .select()
            .single();

        if (error) {
            console.error('Error creating manual image answer submission:', error.message, error.details, error.hint);
            return null;
        }

        return dbManualImageAnswerSubmissionToSubmission(data);
    },

    async review(submissionId: string, points: number): Promise<ManualImageAnswerSubmission | null> {
        const { data, error } = await supabase
            .from('manual_image_answer_submissions')
            .update({
                review_points: points,
                score_applied: true,
                status: 'reviewed',
                reviewed_at: new Date().toISOString(),
            })
            .eq('id', submissionId)
            .select()
            .single();

        if (error) {
            console.error('Error reviewing manual image answer submission:', error);
            return null;
        }

        return dbManualImageAnswerSubmissionToSubmission(data);
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

    async updateName(playerId: string, name: string): Promise<Player | null> {
        const trimmed = name.trim();
        if (!trimmed) return null;

        const { data, error } = await supabase
            .from('players')
            .update({ name: trimmed })
            .eq('id', playerId)
            .select('*')
            .single();

        if (error) {
            console.error('Error updating player name:', error);
            return null;
        }

        return dbPlayerToPlayer(data);
    },

    async adjustScoreByRoundAndName(roundId: string, playerName: string, delta: number): Promise<Player | null> {
        if (!Number.isFinite(delta) || delta === 0) return null;

        const { data: existingPlayer, error: fetchError } = await supabase
            .from('players')
            .select('*')
            .eq('round_id', roundId)
            .eq('name', playerName)
            .maybeSingle();

        if (fetchError || !existingPlayer) {
            if (fetchError) {
                console.error('Error fetching player for score adjustment:', fetchError);
            }
            return null;
        }

        const nextScore = Math.max(0, existingPlayer.score + delta);
        const { data, error } = await supabase
            .from('players')
            .update({ score: nextScore })
            .eq('id', existingPlayer.id)
            .select('*')
            .single();

        if (error) {
            console.error('Error adjusting player score:', error);
            return null;
        }

        return dbPlayerToPlayer(data);
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

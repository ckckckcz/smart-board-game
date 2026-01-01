import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials not found. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Database Types
export interface DbRound {
    id: string;
    name: string;
    question_counts: Record<string, number>;
    total_questions: number;
    created_at: string;
    updated_at: string;
}

export interface DbQuestion {
    id: string;
    category: 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6';
    type: 'multiple_choice' | 'true_false' | 'essay' | 'matching';
    question: string;
    image_url: string | null;
    options: string[] | null;
    correct_answer: string | null;
    essay_answer: string | null;
    matching_pairs: { left: string; right: string }[] | null;
    matching_answer: string | null;
    time_limit: number;
    points: number;
    created_at: string;
    updated_at: string;
}

export interface DbPlayer {
    id: string;
    name: string;
    score: number;
    correct_answers: number;
    wrong_answers: number;
    round_id: string | null;
    completed_at: string;
    created_at: string;
}

export interface DbAdminSettings {
    id: string;
    key: string;
    value: string;
    created_at: string;
    updated_at: string;
}

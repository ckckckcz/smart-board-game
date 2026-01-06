import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Vercel Cron Job - Keep Supabase Alive
 * 
 * Endpoint ini akan dipanggil secara otomatis oleh Vercel Cron
 * untuk mencegah Supabase database di-pause karena tidak aktif.
 * 
 * Schedule: Setiap 6 hari (untuk free tier yang pause setelah 7 hari)
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
    const startTime = Date.now();

    try {
        // Verifikasi authorization dari Vercel Cron (opsional tapi recommended)
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        // Jika CRON_SECRET di-set, verifikasi
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Ping database dengan simple query
        const { data: pingResult, error: pingError } = await supabase
            .from('rounds')
            .select('id')
            .limit(1);

        if (pingError) {
            throw new Error(`Database ping failed: ${pingError.message}`);
        }

        const responseTime = Date.now() - startTime;

        // Log ke keep_alive_logs table
        const { error: logError } = await supabase
            .from('keep_alive_logs')
            .insert({
                source: 'vercel-cron',
                status: 'success',
                response_time_ms: responseTime,
                metadata: {
                    timestamp: new Date().toISOString(),
                    ping_result: pingResult ? 'ok' : 'empty',
                    user_agent: request.headers.get('user-agent') || 'unknown'
                }
            });

        if (logError) {
            console.warn('Failed to log keep-alive:', logError.message);
            // Tidak throw error karena ping utama berhasil
        }

        // Cleanup log lama (opsional, jalankan sekali seminggu)
        const now = new Date();
        if (now.getDay() === 0) { // Hanya hari Minggu
            try {
                await supabase.rpc('cleanup_old_keep_alive_logs');
            } catch {
                // Ignore jika function belum ada
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Supabase keep-alive ping successful',
            timestamp: new Date().toISOString(),
            responseTimeMs: responseTime,
            nextPing: 'in 6 days'
        });

    } catch (error) {
        const responseTime = Date.now() - startTime;

        // Log error (wrapped in try-catch to ignore logging failures)
        try {
            await supabase
                .from('keep_alive_logs')
                .insert({
                    source: 'vercel-cron',
                    status: 'error',
                    response_time_ms: responseTime,
                    metadata: {
                        timestamp: new Date().toISOString(),
                        error: error instanceof Error ? error.message : 'Unknown error'
                    }
                });
        } catch {
            // Ignore logging error
        }

        console.error('Keep-alive error:', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}

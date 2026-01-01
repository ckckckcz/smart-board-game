'use client';

import { useEffect } from 'react';
import { useGameStore } from './useGameStore';

/**
 * Hook to initialize game data from Supabase
 * Call this hook at the top level of your app (e.g., in layout or main page)
 */
export function useInitializeGame() {
    const { initializeData, isInitialized, isLoading } = useGameStore();

    useEffect(() => {
        if (!isInitialized && !isLoading) {
            initializeData();
        }
    }, [initializeData, isInitialized, isLoading]);

    return { isInitialized, isLoading };
}

import { NextResponse } from 'next/server';
import { getGameState } from '@/lib/gameStore';

export async function GET() {
    try {
        const state = getGameState();
        if (!state) {
            return NextResponse.json({ error: "No active game" }, { status: 404 });
        }
        return NextResponse.json(state);
    } catch (error) {
        console.error('State API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An error occurred' },
            { status: 500 }
        );
    }
} 
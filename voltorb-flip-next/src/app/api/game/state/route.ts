import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getGameState } from '@/lib/gameStore';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const state = getGameState(cookieStore);
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
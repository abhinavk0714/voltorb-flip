import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { newGame } from '@/lib/gameStore';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        let level: number | undefined = undefined;
        try {
            const body = await request.json();
            if (body && typeof body.level === 'number') {
                level = body.level;
            }
        } catch {}
        const state = await newGame(cookieStore, level);
        // The newGame function already sets the 'gameState' cookie
        return NextResponse.json(state);
    } catch (error) {
        console.error('Error in new game route:', error);
        return NextResponse.json(
            { error: 'Failed to start new game' },
            { status: 500 }
        );
    }
} 
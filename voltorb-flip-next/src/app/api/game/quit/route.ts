import { NextResponse } from 'next/server';
import { quitGame } from '@/lib/gameStore';

export async function POST() {
    try {
        const response = await quitGame();
        return NextResponse.json(response);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An error occurred' },
            { status: 400 }
        );
    }
} 
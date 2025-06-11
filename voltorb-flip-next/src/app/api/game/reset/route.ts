import { NextResponse } from 'next/server';
import { resetGame } from '@/lib/gameStore';

export async function POST() {
    try {
        const response = await resetGame();
        return NextResponse.json(response);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An error occurred' },
            { status: 500 }
        );
    }
} 
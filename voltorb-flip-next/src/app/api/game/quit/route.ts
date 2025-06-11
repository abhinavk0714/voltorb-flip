import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { quitGame } from '@/lib/gameStore';

export async function POST() {
    try {
        const cookieStore = await cookies();
        const response = await quitGame(cookieStore);
        return NextResponse.json(response);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An error occurred' },
            { status: 400 }
        );
    }
} 
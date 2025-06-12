import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { flipTile } from '@/lib/gameStore';

export async function POST(
    request: Request,
    { params }: { params: { row: string; col: string } }
) {
    try {
        const row = parseInt(params.row);
        const col = parseInt(params.col);
        const cookieStore = await cookies();
        const gameStateCookie = await cookieStore.get('gameState');

        if (!gameStateCookie) {
            return NextResponse.json(
                { error: 'No game in progress' },
                { status: 400 }
            );
        }

        let parsedState;
        try {
            parsedState = JSON.parse(gameStateCookie.value);
        } catch (parseErr) {
            return NextResponse.json(
                { error: 'Corrupted game state' },
                { status: 400 }
            );
        }

        const result = await flipTile(row, col, cookieStore);
        
        // Set cookies with optimized options
        await cookieStore.set('gameState', JSON.stringify(result), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 3600 // 1 hour
        });

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to flip tile' },
            { status: 500 }
        );
    }
} 
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { dropLevel } from '@/lib/gameStore';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const { level } = await request.json();
        if (typeof level !== 'number') {
            return NextResponse.json({ error: 'Level must be a number' }, { status: 400 });
        }
        const state = await dropLevel(cookieStore, level);
        return NextResponse.json(state);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to drop level' }, { status: 500 });
    }
} 
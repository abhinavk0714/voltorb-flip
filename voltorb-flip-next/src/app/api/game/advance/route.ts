import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { advanceLevel } from '@/lib/gameStore';

export async function POST() {
    try {
        const cookieStore = await cookies();
        const state = await advanceLevel(cookieStore);
        return NextResponse.json(state);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to advance level' }, { status: 500 });
    }
} 
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { dropLevel } from '@/lib/gameStore';

export async function POST() {
    try {
        const cookieStore = await cookies();
        const state = await dropLevel(cookieStore);
        return NextResponse.json(state);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to drop level' }, { status: 500 });
    }
} 
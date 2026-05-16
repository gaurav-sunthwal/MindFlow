import { db } from '@/db';
import { events, profiles } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await db.select()
      .from(events)
      .where(eq(events.userId, user.id))
      .orderBy(desc(events.createdAt));
      
    return NextResponse.json(data);
  } catch (error) {
    console.error('Event GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, date, time, type } = await request.json();
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    
    // Ensure profile exists (sync)
    const [existingProfile] = await db.select().from(profiles).where(eq(profiles.id, user.id));
    if (!existingProfile) {
      await db.insert(profiles).values({
        id: user.id,
        email: user.email!,
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0],
      });
    }

    const [newEvent] = await db.insert(events).values({ 
      title, 
      userId: user.id,
      date: date || 'Today',
      time: time || '12:00 PM',
      type: type || 'work' 
    }).returning();
    
    return NextResponse.json(newEvent);
  } catch (error) {
    console.error('Event POST error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

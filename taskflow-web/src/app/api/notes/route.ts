import { db } from '@/db';
import { notes, profiles } from '@/db/schema';
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
      .from(notes)
      .where(eq(notes.userId, user.id))
      .orderBy(desc(notes.createdAt));
      
    return NextResponse.json(data);
  } catch (error) {
    console.error('Notes GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, excerpt, date } = await request.json();
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    
    // Ensure profile exists
    const [existingProfile] = await db.select().from(profiles).where(eq(profiles.id, user.id));
    if (!existingProfile) {
      await db.insert(profiles).values({
        id: user.id,
        email: user.email!,
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0],
      });
    }

    const [newNote] = await db.insert(notes).values({ 
      title, 
      content: content || '',
      excerpt: excerpt || '',
      date: date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      userId: user.id,
    }).returning();
    
    return NextResponse.json(newNote);
  } catch (error) {
    console.error('Note POST error:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}

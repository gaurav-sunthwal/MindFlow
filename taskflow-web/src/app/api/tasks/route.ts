import { db } from '@/db';
import { tasks, profiles } from '@/db/schema';
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
      .from(tasks)
      .where(eq(tasks.userId, user.id))
      .orderBy(desc(tasks.createdAt));
      
    return NextResponse.json(data);
  } catch (error) {
    console.error('Task GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, category } = await request.json();
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

    const [newTask] = await db.insert(tasks).values({ 
      title, 
      userId: user.id,
      category: category || 'Quick' 
    }).returning();
    
    return NextResponse.json(newTask);
  } catch (error) {
    console.error('Task POST error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

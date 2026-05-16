import { db } from '@/db';
import { tasks, events, notes, profiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { activities } = await request.json();
    
    if (!Array.isArray(activities)) {
      return NextResponse.json({ error: 'Activities must be an array' }, { status: 400 });
    }

    // Ensure profile exists
    const [existingProfile] = await db.select().from(profiles).where(eq(profiles.id, user.id));
    if (!existingProfile) {
      await db.insert(profiles).values({
        id: user.id,
        email: user.email!,
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0],
      });
    }

    console.log('Processing activities:', JSON.stringify(activities, null, 2));

    const results = {
      tasks: [] as any[],
      events: [] as any[],
      notes: [] as any[],
    };

    for (const activity of activities) {
      try {
        const { type, action, data, id } = activity;
        console.log(`Handling ${type} ${action} (id: ${id})`);

        if (type === 'task') {
          if (action === 'create') {
            const [newTask] = await db.insert(tasks).values({ 
              title: data.title || 'Untitled Task',
              category: data.category || 'Quick',
              userId: user.id,
              completed: false
            }).returning();
            results.tasks.push(newTask);
          } else if (action === 'update' && id) {
            // Security: Only allow specific fields to be updated
            const { title, category, completed } = data;
            const updateData: any = {};
            if (title !== undefined) updateData.title = title;
            if (category !== undefined) updateData.category = category;
            if (completed !== undefined) updateData.completed = completed;

            const [updatedTask] = await db.update(tasks)
              .set(updateData)
              .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
              .returning();
            if (updatedTask) results.tasks.push(updatedTask);
          } else if (action === 'delete' && id) {
            await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, user.id)));
          }
        } else if (type === 'event') {
          if (action === 'create') {
            const [newEvent] = await db.insert(events).values({ 
              title: data.title || 'Untitled Event',
              date: data.date || 'Today',
              time: data.time || '12:00 PM',
              userId: user.id,
              type: data.type || 'work'
            }).returning();
            results.events.push(newEvent);
          } else if (action === 'update' && id) {
            const { title, date, time, type: eventType } = data;
            const updateData: any = {};
            if (title !== undefined) updateData.title = title;
            if (date !== undefined) updateData.date = date;
            if (time !== undefined) updateData.time = time;
            if (eventType !== undefined) updateData.type = eventType;

            const [updatedEvent] = await db.update(events)
              .set(updateData)
              .where(and(eq(events.id, id), eq(events.userId, user.id)))
              .returning();
            if (updatedEvent) results.events.push(updatedEvent);
          } else if (action === 'delete' && id) {
            await db.delete(events).where(and(eq(events.id, id), eq(events.userId, user.id)));
          }
        } else if (type === 'note') {
          if (action === 'create') {
            const [newNote] = await db.insert(notes).values({ 
              title: data.title || 'Untitled Note',
              content: data.content || '',
              excerpt: data.excerpt || '',
              date: data.date || new Date().toLocaleDateString(),
              userId: user.id,
            }).returning();
            results.notes.push(newNote);
          } else if (action === 'update' && id) {
            const { title, content, excerpt, date } = data;
            const updateData: any = {};
            if (title !== undefined) updateData.title = title;
            if (content !== undefined) updateData.content = content;
            if (excerpt !== undefined) updateData.excerpt = excerpt;
            if (date !== undefined) updateData.date = date;

            const [updatedNote] = await db.update(notes)
              .set(updateData)
              .where(and(eq(notes.id, id), eq(notes.userId, user.id)))
              .returning();
            if (updatedNote) results.notes.push(updatedNote);
          } else if (action === 'delete' && id) {
            await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, user.id)));
          }
        }
      } catch (innerError: any) {
        console.error(`Error processing activity:`, innerError);
      }
    }


    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('Activities POST fatal error:', error);
    return NextResponse.json({ 
      error: 'Failed to process activities', 
      details: error.message 
    }, { status: 500 });
  }
}

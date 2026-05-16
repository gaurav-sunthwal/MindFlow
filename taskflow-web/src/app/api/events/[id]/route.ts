import { db } from '@/db';
import { events, profiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, date, time, type } = await request.json();
    const { id } = await params;

    const [updatedEvent] = await db.update(events)
      .set({ title, date, time, type })
      .where(and(eq(events.id, id), eq(events.userId, user.id)))
      .returning();

    if (!updatedEvent) {
      return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Event update error:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await db.delete(events)
      .where(and(eq(events.id, id), eq(events.userId, user.id)));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Event delete error:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}

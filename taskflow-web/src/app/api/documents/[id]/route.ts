import { db } from '@/db';
import { documents } from '@/db/schema';
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

    const { name, type, size, url, date } = await request.json();
    const { id } = await params;

    const [updatedDoc] = await db.update(documents)
      .set({ name, type, size, url, date })
      .where(and(eq(documents.id, id), eq(documents.userId, user.id)))
      .returning();

    if (!updatedDoc) {
      return NextResponse.json({ error: 'Document not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json(updatedDoc);
  } catch (error) {
    console.error('Document update error:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
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
    await db.delete(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, user.id)));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Document delete error:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}

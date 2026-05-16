import { db } from '@/db';
import { documents, profiles } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// For App Router, we don't have a direct equivalent of bodyParser config, 
// but we can increase the limit if needed in middleware or environmental settings.
// Most modern environments handle larger bodies, but we should be aware of this.

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await db.select()
      .from(documents)
      .where(eq(documents.userId, user.id))
      .orderBy(desc(documents.createdAt));
      
    return NextResponse.json(data);
  } catch (error) {
    console.error('Documents GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, type, size, url, date } = await request.json();
    if (!name || !type) return NextResponse.json({ error: 'Name and Type are required' }, { status: 400 });
    
    // Ensure profile exists
    const [existingProfile] = await db.select().from(profiles).where(eq(profiles.id, user.id));
    if (!existingProfile) {
      await db.insert(profiles).values({
        id: user.id,
        email: user.email!,
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0],
      });
    }

    const [newDoc] = await db.insert(documents).values({ 
      name, 
      type,
      size: size || '0 KB',
      url: url || '',
      date: date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      userId: user.id,
    }).returning();
    
    return NextResponse.json(newDoc);
  } catch (error) {
    console.error('Document POST error:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}

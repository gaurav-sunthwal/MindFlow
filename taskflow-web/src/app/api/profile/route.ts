import { db } from '@/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [profile] = await db.select()
      .from(profiles)
      .where(eq(profiles.id, user.id));
      
    return NextResponse.json(profile || {});
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    
    // Ensure profile exists
    const [existingProfile] = await db.select().from(profiles).where(eq(profiles.id, user.id));
    
    if (!existingProfile) {
      const [newProfile] = await db.insert(profiles).values({
        id: user.id,
        email: user.email!,
        fullName: updates.fullName || user.user_metadata?.full_name || user.email?.split('@')[0],
        avatarUrl: updates.avatarUrl || user.user_metadata?.avatar_url,
      }).returning();
      return NextResponse.json(newProfile);
    }

    const [updatedProfile] = await db.update(profiles)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, user.id))
      .returning();
      
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Profile PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

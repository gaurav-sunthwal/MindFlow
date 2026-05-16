import { db } from '@/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if profile exists
    console.log(`Syncing profile for user: ${user.id}`);
    const [existingProfile] = await db.select().from(profiles).where(eq(profiles.id, user.id));
    
    if (!existingProfile) {
      console.log(`Creating new profile for: ${user.email}`);
      await db.insert(profiles).values({
        id: user.id,
        email: user.email!,
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile sync error:', error);
    return NextResponse.json({ error: 'Failed to sync profile' }, { status: 500 });
  }
}

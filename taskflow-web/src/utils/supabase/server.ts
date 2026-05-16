import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  const headerList = await headers()
  const authHeader = headerList.get('authorization')

  // If there's a Bearer token, we can use it for authentication
  // but createServerClient from @supabase/ssr is heavily cookie-oriented.
  // For API routes called from mobile, we might want a simpler client if Bearer is present.
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
      // Pass the global headers so the client can pick up the Authorization header if sent
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    }
  )
}


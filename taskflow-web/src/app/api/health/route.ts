import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  const start = Date.now();
  
  try {
    // Check Database Connection
    await db.execute(sql`SELECT 1`);
    
    const duration = Date.now() - start;
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: 'connected',
        latency: `${duration}ms`
      },
      environment: process.env.NODE_ENV
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Health Check Failure:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: {
        status: 'disconnected',
        error: error.message
      }
    }, { status: 503 });
  }
}

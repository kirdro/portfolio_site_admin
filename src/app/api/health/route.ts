import { NextResponse } from 'next/server';
import { db } from '../../../server/auth';

/**
 * Health Check API endpoint для мониторинга статуса админ-панели
 * Используется в GitHub Actions workflow и PM2 для проверки работоспособности
 */
export async function GET() {
  try {
    // Проверка подключения к базе данных
    await db.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'healthy',
      service: 'admin-kirdro-portfolio',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      env: process.env.NODE_ENV,
      port: process.env.PORT,
      database: 'connected',
      version: process.env.npm_package_version || '0.1.0',
    });
  } catch (error) {
    console.error('Health check database error:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        service: 'admin-kirdro-portfolio',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown database error',
      },
      { status: 503 }
    );
  }
}
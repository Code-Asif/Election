import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus(): { status: string; message: string; timestamp: string } {
    return {
      status: 'ok',
      message: 'Election Management System API is running',
      timestamp: new Date().toISOString(),
    };
  }

  getHealth(): { status: string; uptime: number } {
    return {
      status: 'healthy',
      uptime: process.uptime(),
    };
  }
}

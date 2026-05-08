import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Support both Bearer token (Supabase standard) and Cookie (our old standard)
    let token = request.cookies?.['access_token'];
    
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    
    if (!token) {
      throw new UnauthorizedException('No authentication token found');
    }
    
    try {
      // For Supabase, the payload structure includes 'sub' as the user's ID
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      
      // Map Supabase sub to user id for our internal logic
      (request as any).user = {
        ...payload,
        id: payload.sub,
      };
      
      return true;
    } catch (error) {
      console.error('JWT Verification failed:', error.message);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';
import type { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClasses(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    
    let token = request.cookies?.['access_token'];
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    
    if (!token) {
      throw new UnauthorizedException('No authentication token found');
    }
    
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      
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

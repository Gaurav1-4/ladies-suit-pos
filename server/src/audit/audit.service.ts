import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface AuditParams {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(params: AuditParams) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          userId: params.userId,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          oldValues: params.oldValues || undefined,
          newValues: params.newValues || undefined,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
      });
    } catch (error) {
      console.error('FAILED TO CREATE AUDIT LOG:', error);
      // We don't want to crash the main transaction if logging fails, 
      // but in production we might want to alert.
    }
  }
}

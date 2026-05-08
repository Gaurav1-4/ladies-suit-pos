import { Injectable } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { AuditService } from '../audit/audit.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly auditService: AuditService
  ) {}

  async getAllShops() {
    return this.adminRepository.findAllShopsActive();
  }

  async getAllUsers() {
    return this.adminRepository.findAllUsersActive();
  }

  async createShop(data: { name: string; ownerName: string; ownerEmail: string; ownerPasswordHash: string }, adminId?: string) {
    const passwordHash = await bcrypt.hash(data.ownerPasswordHash, 10);

    const result = await this.adminRepository.createShopWithOwner(
      { name: data.name },
      {
        name: data.ownerName,
        email: data.ownerEmail,
        passwordHash,
      }
    );

    await this.auditService.log({
      userId: adminId,
      action: 'PROVISION_SHOP',
      entityType: 'SHOP',
      entityId: result.shop.id,
      newValues: result,
    });

    return result;
  }

  async getGlobalStats() {
    return this.adminRepository.getGlobalAggregatedStats();
  }
}

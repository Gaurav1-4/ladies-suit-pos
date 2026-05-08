import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { AuditService } from '../audit/audit.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly auditService: AuditService
  ) {}

  async findAllInShop(shopId: string) {
    return this.usersRepository.findAllActiveInShop(shopId);
  }

  async createStaff(shopId: string, data: any, creatorId?: string) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.usersRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: 'STAFF',
      shopId,
    });

    await this.auditService.log({
      userId: creatorId,
      action: 'CREATE_STAFF',
      entityType: 'USER',
      entityId: user.id,
      newValues: { name: user.name, email: user.email, role: user.role },
    });

    return user;
  }

  async remove(shopId: string, id: string, actorId?: string) {
    const user = await this.usersRepository.findById(shopId, id);
    if (!user) throw new NotFoundException('User not found in your shop');
    if (user.role === 'OWNER') throw new ForbiddenException('Cannot remove the shop owner');
    
    await this.usersRepository.softDelete(id);

    await this.auditService.log({
      userId: actorId,
      action: 'DELETE_USER',
      entityType: 'USER',
      entityId: id,
      oldValues: { name: user.name, email: user.email, role: user.role },
    });
  }
}

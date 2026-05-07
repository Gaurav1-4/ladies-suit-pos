import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAllInShop(shopId: string) {
    return this.prisma.user.findMany({
      where: { shopId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createStaff(shopId: string, data: any) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: 'STAFF',
        shopId,
      },
    });
  }

  async remove(shopId: string, id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, shopId } });
    if (!user) throw new NotFoundException('User not found in your shop');
    if (user.role === 'OWNER') throw new ForbiddenException('Cannot remove the shop owner');
    
    return this.prisma.user.delete({ where: { id } });
  }
}

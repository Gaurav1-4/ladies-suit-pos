import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findAllActiveInShop(shopId: string) {
    return this.prisma.user.findMany({
      where: { 
        shopId,
        deletedAt: null 
      },
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

  async findById(shopId: string, id: string) {
    return this.prisma.user.findFirst({
      where: { 
        id, 
        shopId,
        deletedAt: null 
      },
    });
  }

  async create(data: any) {
    return this.prisma.user.create({
      data,
    });
  }

  async softDelete(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

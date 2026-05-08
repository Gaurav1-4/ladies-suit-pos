import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.transaction.create({
      data,
      include: { items: true },
    });
  }

  async findAllActive(shopId: string) {
    return this.prisma.transaction.findMany({
      where: {
        shopId,
        deletedAt: null,
      },
      include: { 
        items: { 
          include: { product: true } 
        },
        customer: true
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(shopId: string, id: string) {
    return this.prisma.transaction.findFirst({
      where: {
        id,
        shopId,
        deletedAt: null,
      },
      include: { 
        items: { 
          include: { product: true } 
        },
        customer: true
      },
    });
  }

  async softDelete(id: string) {
    return this.prisma.transaction.update({
      where: { id },
      data: { 
        deletedAt: new Date(),
        status: 'CANCELLED'
      },
    });
  }

  // Transaction specific helper to handle stock updates atomically
  async executeTransaction(fn: (tx: any) => Promise<any>) {
    return this.prisma.$transaction(fn);
  }
}

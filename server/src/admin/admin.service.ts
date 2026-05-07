import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllShops() {
    return this.prisma.shop.findMany({
      include: {
        _count: {
          select: {
            users: true,
            products: true,
            transactions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      include: {
        shop: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createShop(data: { name: string; ownerName: string; ownerEmail: string; ownerPasswordHash: string }) {
    const passwordHash = await bcrypt.hash(data.ownerPasswordHash, 10);

    return this.prisma.$transaction(async (tx) => {
      const shop = await tx.shop.create({
        data: { name: data.name },
      });

      const owner = await tx.user.create({
        data: {
          name: data.ownerName,
          email: data.ownerEmail,
          passwordHash,
          role: 'OWNER',
          shopId: shop.id,
        },
      });

      return { shop, owner };
    });
  }

  async getGlobalStats() {
    const [shopCount, userCount, productCount, transactionCount, totalSales] = await Promise.all([
      this.prisma.shop.count(),
      this.prisma.user.count(),
      this.prisma.product.count(),
      this.prisma.transaction.count(),
      this.prisma.transaction.aggregate({
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      shopCount,
      userCount,
      productCount,
      transactionCount,
      totalSales: totalSales._sum.totalAmount || 0,
    };
  }
}

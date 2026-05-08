import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminRepository {
  constructor(private prisma: PrismaService) {}

  async findAllShopsActive() {
    return this.prisma.shop.findMany({
      where: { deletedAt: null },
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

  async findAllUsersActive() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      include: {
        shop: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createShopWithOwner(shopData: { name: string }, ownerData: { name: string; email: string; supabaseId?: string; passwordHash?: string }) {
    return this.prisma.$transaction(async (tx) => {
      const shop = await tx.shop.create({
        data: shopData,
      });

      const owner = await tx.user.create({
        data: {
          ...ownerData,
          shopId: shop.id,
          role: 'OWNER',
        },
      });

      return { shop, owner };
    });
  }

  async getGlobalAggregatedStats() {
    const [shopCount, userCount, productCount, transactionCount, totalSales] = await Promise.all([
      this.prisma.shop.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.product.count({ where: { deletedAt: null } }),
      this.prisma.transaction.count({ where: { deletedAt: null } }),
      this.prisma.transaction.aggregate({
        where: { deletedAt: null },
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

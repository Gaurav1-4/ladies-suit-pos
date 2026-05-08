import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardRepository {
  constructor(private prisma: PrismaService) {}

  async getDailySalesStats(shopId: string, fromDate: Date) {
    return this.prisma.transaction.aggregate({
      where: {
        shopId,
        deletedAt: null,
        createdAt: { gte: fromDate },
      },
      _sum: { totalAmount: true },
      _count: true,
    });
  }

  async getAllActiveProducts(shopId: string) {
    return this.prisma.product.findMany({
      where: {
        shopId,
        deletedAt: null,
      },
      include: { category: true },
    });
  }

  async getActiveProductsCount(shopId: string) {
    return this.prisma.product.count({
      where: {
        shopId,
        deletedAt: null,
      },
    });
  }
}

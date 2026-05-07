import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(shopId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [dailySales, allProducts, totalProducts] = await Promise.all([
      // Daily sales total
      this.prisma.transaction.aggregate({
        where: {
          shopId,
          createdAt: { gte: today },
        },
        _sum: { totalAmount: true },
        _count: true,
      }),
      // Fetch products to check for low stock in memory
      this.prisma.product.findMany({
        where: { shopId },
        include: { category: true },
      }),
      // Total product count
      this.prisma.product.count({ where: { shopId } }),
    ]);

    // Filter low stock accurately based on minStock in JS
    const lowStockProducts = allProducts
      .filter(p => p.stockQty <= p.minStock)
      .sort((a, b) => a.stockQty - b.stockQty);

    return {
      dailySalesTotal: dailySales._sum.totalAmount ?? 0,
      dailyTransactionCount: dailySales._count,
      lowStockProducts: lowStockProducts.map(p => ({
        id: p.id,
        name: p.name,
        stock: p.stockQty,
        category: p.category.name
      })),
      lowStockCount: lowStockProducts.length,
      totalProducts,
    };
  }
}

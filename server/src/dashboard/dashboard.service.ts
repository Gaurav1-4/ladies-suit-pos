import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getSummary(shopId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [dailySales, allProducts, totalProducts] = await Promise.all([
      this.dashboardRepository.getDailySalesStats(shopId, today),
      this.dashboardRepository.getAllActiveProducts(shopId),
      this.dashboardRepository.getActiveProductsCount(shopId),
    ]);

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
        category: p.category?.name || 'Uncategorized'
      })),
      lowStockCount: lowStockProducts.length,
      totalProducts,
    };
  }
}

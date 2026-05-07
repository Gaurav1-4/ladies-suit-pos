import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async createTransaction(shopId: string, userId: string, data: any) {
    const { items, discount = 0, paymentMode = 'CASH', customerId } = data;

    if (!items || items.length === 0) {
      throw new BadRequestException('Transaction must contain items');
    }

    return this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      
      // Calculate total amount and verify stock
      for (const item of items) {
        const product = await tx.product.findFirst({ where: { id: item.productId, shopId } });
        if (!product) throw new BadRequestException(`Product ${item.productId} not found`);
        if (product.stockQty < item.quantity) throw new BadRequestException(`Insufficient stock for ${product.name}`);

        totalAmount += product.sellPrice * item.quantity;
      }

      totalAmount = totalAmount - discount;

      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          shopId,
          userId,
          customerId,
          totalAmount,
          discount,
          paymentMode,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: { items: true },
      });

      // Update stock and create stock movements
      for (const item of items) {
        const product = await tx.product.findFirst({ where: { id: item.productId, shopId } });
        if (!product) continue;

        const prevStock = product.stockQty;
        const newStock = prevStock - item.quantity;

        await tx.product.update({
          where: { id: product.id },
          data: { stockQty: newStock },
        });

        await tx.stockMovement.create({
          data: {
            shopId,
            productId: product.id,
            type: 'OUT',
            prevStock,
            newStock,
            quantity: item.quantity,
            relatedId: transaction.id,
            reason: 'SALE',
          },
        });
      }

      return transaction;
    });
  }

  async findAll(shopId: string) {
    return this.prisma.transaction.findMany({
      where: { shopId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}

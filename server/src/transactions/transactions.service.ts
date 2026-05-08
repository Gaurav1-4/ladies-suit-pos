import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { TransactionsRepository } from './transactions.repository';
import { ProductsRepository } from '../products/products.repository';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly auditService: AuditService
  ) {}

  async createTransaction(shopId: string, userId: string, data: any) {
    const { items, discount = 0, paymentMode = 'CASH', customerId } = data;

    if (!items || items.length === 0) {
      throw new BadRequestException('Transaction must contain items');
    }

    const result = await this.transactionsRepository.executeTransaction(async (tx) => {
      let subtotal = 0;
      
      // 1. Validate items and stock
      for (const item of items) {
        const product = await tx.product.findFirst({ 
          where: { id: item.productId, shopId, deletedAt: null } 
        });
        
        if (!product) throw new BadRequestException(`Product ${item.productId} not found`);
        if (product.stockQty < item.quantity) {
          throw new BadRequestException(`Insufficient stock for ${product.name}. Available: ${product.stockQty}`);
        }

        subtotal += product.sellPrice * item.quantity;
      }

      const finalAmount = subtotal - discount;

      // 2. Create the Transaction record
      const transaction = await tx.transaction.create({
        data: {
          shopId,
          customerId,
          totalAmount: subtotal,
          discount,
          finalAmount,
          paymentMode,
          status: 'COMPLETED',
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.unitPrice * item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      // 3. Update stock and record movements
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { decrement: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: -item.quantity,
            type: 'OUT',
            reason: `SALE - INV#${transaction.id.substring(0, 8)}`,
          },
        });
      }

      return transaction;
    });

    // 4. Audit Log
    await this.auditService.log({
      userId,
      action: 'CREATE_TRANSACTION',
      entityType: 'TRANSACTION',
      entityId: result.id,
      newValues: result,
    });

    return result;
  }

  async findAll(shopId: string) {
    return this.transactionsRepository.findAllActive(shopId);
  }

  async findOne(shopId: string, id: string) {
    const transaction = await this.transactionsRepository.findById(shopId, id);
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  async cancelTransaction(shopId: string, id: string, userId: string) {
    const transaction = await this.findOne(shopId, id);
    
    if (transaction.status === 'CANCELLED') {
      throw new BadRequestException('Transaction is already cancelled');
    }

    const cancelled = await this.transactionsRepository.softDelete(id);

    // Audit Log
    await this.auditService.log({
      userId,
      action: 'CANCEL_TRANSACTION',
      entityType: 'TRANSACTION',
      entityId: id,
      oldValues: transaction,
      newValues: cancelled,
    });

    return cancelled;
  }
}

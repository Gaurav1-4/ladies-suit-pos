import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(shopId: string) {
    return this.prisma.product.findMany({ 
      where: { shopId },
      include: { category: true }
    });
  }

  async findOne(shopId: string, id: string) {
    const product = await this.prisma.product.findFirst({ 
      where: { id, shopId },
      include: { category: true }
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(shopId: string, data: any) {
    const sku = data.sku || `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return this.prisma.product.create({
      data: {
        ...data,
        sku,
        shopId,
      },
    });
  }

  async update(shopId: string, id: string, data: any) {
    await this.findOne(shopId, id);
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async remove(shopId: string, id: string) {
    await this.findOne(shopId, id);
    return this.prisma.product.delete({ where: { id } });
  }

  async getCategories(shopId: string) {
    return this.prisma.category.findMany({ where: { shopId } });
  }
}

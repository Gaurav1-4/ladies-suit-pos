import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsRepository {
  constructor(private prisma: PrismaService) {}

  async findAllActive(shopId: string) {
    return this.prisma.product.findMany({
      where: {
        shopId,
        deletedAt: null,
      },
      include: { category: true },
    });
  }

  async findById(shopId: string, id: string) {
    return this.prisma.product.findFirst({
      where: {
        id,
        shopId,
        deletedAt: null,
      },
      include: { category: true },
    });
  }

  async create(data: any) {
    return this.prisma.product.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findAllCategories(shopId: string) {
    return this.prisma.category.findMany({
      where: {
        shopId,
        deletedAt: null,
      },
    });
  }
}

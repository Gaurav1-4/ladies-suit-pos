import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly auditService: AuditService
  ) {}

  async findAll(shopId: string) {
    return this.productsRepository.findAllActive(shopId);
  }

  async findOne(shopId: string, id: string) {
    const product = await this.productsRepository.findById(shopId, id);
    if (!product) throw new NotFoundException('Product not found or has been deleted');
    return product;
  }

  async create(shopId: string, data: any, userId?: string) {
    const sku = data.sku || `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const product = await this.productsRepository.create({
      ...data,
      sku,
      shopId,
    });

    await this.auditService.log({
      userId,
      action: 'CREATE_PRODUCT',
      entityType: 'PRODUCT',
      entityId: product.id,
      newValues: product,
    });

    return product;
  }

  async update(shopId: string, id: string, data: any, userId?: string) {
    const oldProduct = await this.findOne(shopId, id);
    const newProduct = await this.productsRepository.update(id, data);

    await this.auditService.log({
      userId,
      action: 'UPDATE_PRODUCT',
      entityType: 'PRODUCT',
      entityId: id,
      oldValues: oldProduct,
      newValues: newProduct,
    });

    return newProduct;
  }

  async remove(shopId: string, id: string, userId?: string) {
    const product = await this.findOne(shopId, id);
    await this.productsRepository.softDelete(id);

    await this.auditService.log({
      userId,
      action: 'DELETE_PRODUCT',
      entityType: 'PRODUCT',
      entityId: id,
      oldValues: product,
    });
  }

  async getCategories(shopId: string) {
    return this.productsRepository.findAllCategories(shopId);
  }
}

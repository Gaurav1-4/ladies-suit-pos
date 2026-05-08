import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export abstract class BaseRepository<T> {
  constructor(protected prisma: PrismaService) {}

  // Common logic can go here (e.g., standard findMany with soft-delete filter)
}

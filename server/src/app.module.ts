import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { TransactionsModule } from './transactions/transactions.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AdminModule } from './admin/admin.module';

import { AuditModule } from './audit/audit.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, AuditModule, AuthModule, ProductsModule, TransactionsModule, DashboardModule, AdminModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

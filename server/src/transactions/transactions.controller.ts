import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() body: any) {
    return this.transactionsService.createTransaction(user.shopId, user.id, body);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.transactionsService.findAll(user.shopId);
  }
}

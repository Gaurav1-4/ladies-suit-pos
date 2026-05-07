import { Controller, Get, Post, Delete, Body, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('OWNER')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('staff')
  getStaff(@CurrentUser() user: any) {
    return this.usersService.findAllInShop(user.shopId);
  }

  @Post('staff')
  createStaff(@CurrentUser() user: any, @Body() body: any) {
    return this.usersService.createStaff(user.shopId, body);
  }

  @Delete('staff/:id')
  removeStaff(@CurrentUser() user: any, @Param('id') id: string) {
    return this.usersService.remove(user.shopId, id);
  }
}

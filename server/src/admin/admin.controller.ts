import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('shops')
  @Roles('SUPER_ADMIN')
  async getShops() {
    return this.adminService.getAllShops();
  }

  @Get('users')
  @Roles('SUPER_ADMIN')
  getUsers() {
    return this.adminService.getAllUsers();
  }

  @Post('shops')
  @Public() // Allow new owners to register their shop
  async createShop(@Body() body: any) {
    return this.adminService.createShop(body);
  }

  @Get('stats')
  @Roles('SUPER_ADMIN')
  async getStats() {
    return this.adminService.getGlobalStats();
  }
}

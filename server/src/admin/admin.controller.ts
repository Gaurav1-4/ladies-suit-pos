import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('shops')
  async getShops() {
    return this.adminService.getAllShops();
  }

  @Get('users')
  getUsers() {
    return this.adminService.getAllUsers();
  }

  @Post('shops')
  async createShop(@Body() body: any) {
    return this.adminService.createShop(body);
  }

  @Get('stats')
  async getStats() {
    return this.adminService.getGlobalStats();
  }
}

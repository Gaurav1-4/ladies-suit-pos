import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async register(data: any) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new UnauthorizedException('User already exists');

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const shop = await tx.shop.create({
        data: {
          name: data.shopName,
        }
      });

      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash: hashedPassword,
          role: 'OWNER',
          shopId: shop.id
        }
      });

      return { shop, user };
    });

    return result.user;
  }

  async login(data: any) {
    console.log(`Login attempt for: ${data.email}`);
    try {
      const user = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (!user) {
        console.log('User not found');
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log('User found, comparing password...');
      const isMatch = await bcrypt.compare(data.password, user.passwordHash);
      if (!isMatch) {
        console.log('Password mismatch');
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log('Password matched, signing token...');
      const payload = { sub: user.id, email: user.email, shopId: user.shopId, role: user.role };
      const token = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'super-secret',
        expiresIn: '1d'
      });
      
      console.log('Token signed successfully');
      return {
        access_token: token,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          shopId: user.shopId
        }
      };
    } catch (error) {
      console.error('Login error detail:', error);
      throw error;
    }
  }
  async createSuperAdmin(data: any) {
    const adminExists = await this.prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
    if (adminExists) throw new UnauthorizedException('Super Admin already exists');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: hashedPassword,
        role: 'SUPER_ADMIN',
        shopId: null,
      },
    });
  }
}

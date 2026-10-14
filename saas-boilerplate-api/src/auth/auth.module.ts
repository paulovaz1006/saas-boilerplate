import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Plan } from '../plans/plan.entity';
import { Subscription } from '../payments/subscription.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
@Module({ imports: [TypeOrmModule.forFeature([User, Plan, Subscription]), JwtModule.register({ secret: process.env.JWT_ACCESS_SECRET, signOptions: { expiresIn: '15m' } }),], controllers: [AuthController], providers: [AuthService, JwtAuthGuard], exports: [JwtAuthGuard, JwtModule] }) export class AuthModule {}

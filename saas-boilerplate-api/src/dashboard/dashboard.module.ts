import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContactModule } from '../contact/contact.module';
import { Plan } from '../plans/plan.entity';
import { Subscription } from '../payments/subscription.entity';
import { User } from '../users/user.entity';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Subscription, Plan]), AuthModule, ContactModule, JwtModule.register({ secret: process.env.JWT_ACCESS_SECRET })],
  controllers: [DashboardController],
  providers: [JwtAuthGuard],
})
export class DashboardModule {}

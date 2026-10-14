import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../users/user.entity';
import { Plan } from '../plans/plan.entity';
import { Subscription } from './subscription.entity';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Plan, Subscription]), JwtModule.register({ secret: process.env.JWT_ACCESS_SECRET })],
  controllers: [PaymentsController],
  providers: [JwtAuthGuard],
})
export class PaymentsModule {}

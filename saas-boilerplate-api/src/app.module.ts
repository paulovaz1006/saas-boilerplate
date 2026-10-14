import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PlansModule } from './plans/plans.module';
import { PaymentsModule } from './payments/payments.module';
import { FeatureFlagsModule } from './feature-flags/feature-flags.module';
import { ContactModule } from './contact/contact.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ContactMessage } from './contact/contact-message.entity';
import { HealthController } from './health.controller';
import { User } from './users/user.entity';
import { Plan } from './plans/plan.entity';
import { Subscription } from './payments/subscription.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({ pinoHttp: { level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', redact: ['req.headers.authorization', 'req.headers.cookie', 'password', 'refreshToken'], transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined } }),
    TypeOrmModule.forRoot({ type: 'postgres', url: process.env.DATABASE_URL || 'postgres://saas:saas@localhost:5432/saas', entities: [User, Plan, Subscription, ContactMessage], synchronize: process.env.NODE_ENV !== 'production', retryAttempts: 10, retryDelay: 3000 }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/saas'),
    AuthModule, UsersModule, PlansModule, PaymentsModule, FeatureFlagsModule, ContactModule, DashboardModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

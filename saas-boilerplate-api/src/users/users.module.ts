import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from './user.entity';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule, JwtModule.register({ secret: process.env.JWT_ACCESS_SECRET })],
  controllers: [UsersController],
  providers: [JwtAuthGuard],
  exports: [TypeOrmModule],
})
export class UsersModule {}

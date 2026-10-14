import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContactMessage } from './contact-message.entity';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
  imports: [TypeOrmModule.forFeature([ContactMessage]), AuthModule, JwtModule.register({ secret: process.env.JWT_ACCESS_SECRET })],
  controllers: [ContactController],
  providers: [ContactService, JwtAuthGuard],
  exports: [ContactService, TypeOrmModule],
})
export class ContactModule {}

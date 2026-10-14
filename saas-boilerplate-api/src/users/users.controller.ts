import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from './user.entity';

class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  @Get('me')
  async me(@Req() req: Request) {
    const userId = (req as any).user.sub as string;
    const user = await this.users.findOneBy({ id: userId });
    if (!user) return null;
    const { passwordHash, refreshTokenHash, ...safeUser } = user;
    return safeUser;
  }

  @Patch('me')
  async update(@Req() req: Request, @Body() body: UpdateProfileDto) {
    const user = await this.users.findOneByOrFail({ id: (req as any).user.sub });
    if (typeof body.name === 'string') user.name = body.name.trim();
    const saved = await this.users.save(user);
    const { passwordHash, refreshTokenHash, ...safeUser } = saved;
    return safeUser;
  }
}

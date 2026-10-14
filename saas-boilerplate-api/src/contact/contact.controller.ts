import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createPublic(@Body() dto: CreateContactDto) {
    return this.contact.create(dto, 'PUBLIC_SITE');
  }

  @Post('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  createForUser(@Req() req: Request, @Body() dto: CreateContactDto) {
    return this.contact.create(dto, 'DASHBOARD', (req as any).user.sub);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  listMine(@Req() req: Request) {
    return this.contact.listForUser((req as any).user.sub);
  }
}

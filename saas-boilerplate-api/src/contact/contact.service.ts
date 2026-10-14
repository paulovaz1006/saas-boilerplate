import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactMessage, ContactSource } from './contact-message.entity';

@Injectable()
export class ContactService {
  constructor(@InjectRepository(ContactMessage) private readonly messages: Repository<ContactMessage>) {}

  async create(input: CreateContactDto, source: ContactSource, userId: string | null = null) {
    const saved = await this.messages.save(this.messages.create({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      subject: input.subject.trim(),
      message: input.message.trim(),
      source,
      userId,
      status: 'OPEN',
    }));
    return { id: saved.id, status: saved.status, createdAt: saved.createdAt };
  }

  async listForUser(userId: string) {
    return this.messages.find({
      where: { userId },
      select: { id: true, subject: true, message: true, source: true, status: true, createdAt: true, updatedAt: true },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  countForUser(userId: string) {
    return this.messages.count({ where: { userId } });
  }
}

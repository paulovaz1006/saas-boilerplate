import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContactService } from '../contact/contact.service';
import { Plan } from '../plans/plan.entity';
import { Subscription } from '../payments/subscription.entity';
import { User } from '../users/user.entity';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Subscription) private readonly subscriptions: Repository<Subscription>,
    @InjectRepository(Plan) private readonly plans: Repository<Plan>,
    private readonly contact: ContactService,
  ) {}

  @Get()
  async summary(@Req() req: Request) {
    const userId = (req as any).user.sub as string;
    const user = await this.users.findOneByOrFail({ id: userId });
    const subscription = await this.subscriptions.findOne({ where: { userId }, order: { createdAt: 'DESC' } });
    const plan = subscription ? await this.plans.findOneBy({ id: subscription.planId }) : null;
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
      subscription: subscription ? {
        status: subscription.status,
        billingInterval: subscription.billingInterval,
        currentPeriodEnd: subscription.currentPeriodEnd,
        planName: plan?.name ?? 'Plano não identificado',
        planKey: plan?.key ?? null,
      } : null,
      supportMessages: await this.contact.countForUser(userId),
    };
  }
}

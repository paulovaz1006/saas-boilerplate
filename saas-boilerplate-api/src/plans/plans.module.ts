import { Injectable, Module, OnModuleInit } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './plan.entity';
import { PlansController } from './plans.controller';

@Injectable()
class PlanSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(Plan)
    private readonly repo: Repository<Plan>,
  ) {}

  async onModuleInit(): Promise<void> {
    const defaults = [
      { key: 'free', name: 'Gratuito', priceCents: 0 },
      { key: 'starter', name: 'Starter', priceCents: 1490 },
      { key: 'pro', name: 'Pro', priceCents: 2990 },
      { key: 'custom', name: 'Customizado', priceCents: 0 },
    ];

    for (const plan of defaults) {
      const exists = await this.repo.findOneBy({ key: plan.key });
      if (exists) continue;

      await this.repo.save(
        this.repo.create({
          ...plan,
          stripeMonthlyPriceId:
            plan.key === 'starter'
              ? process.env.STRIPE_PRICE_STARTER_MONTHLY
              : plan.key === 'pro'
                ? process.env.STRIPE_PRICE_PRO_MONTHLY
                : undefined,
          stripeYearlyPriceId:
            plan.key === 'starter'
              ? process.env.STRIPE_PRICE_STARTER_YEARLY
              : plan.key === 'pro'
                ? process.env.STRIPE_PRICE_PRO_YEARLY
                : undefined,
          isPublic: true,
        }),
      );
    }
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Plan])],
  controllers: [PlansController],
  providers: [PlanSeeder],
})
export class PlansModule {}

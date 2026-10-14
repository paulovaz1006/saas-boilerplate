import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('plans') export class Plan {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) key: string;
  @Column() name: string;
  @Column({ type: 'integer', default: 0 }) priceCents: number;
  @Column({ default: 'BRL' }) currency: string;
  @Column({ nullable: true }) stripeMonthlyPriceId: string;
  @Column({ nullable: true }) stripeYearlyPriceId: string;
  @Column({ type: 'jsonb', default: () => "'{}'" }) limits: Record<string, any>;
  @Column({ default: true }) isPublic: boolean;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('subscriptions') export class Subscription {
 @PrimaryGeneratedColumn('uuid') id: string;
 @Column() userId: string;
 @Column() planId: string;
 @Column({ default: 'active' }) status: string;
 @Column({ default: 'monthly' }) billingInterval: string;
 @Column({ nullable: true }) stripeCustomerId: string;
 @Column({ nullable: true }) stripeSubscriptionId: string;
 @Column({ type: 'timestamptz', nullable: true }) currentPeriodEnd: Date;
 @CreateDateColumn() createdAt: Date;
 @UpdateDateColumn() updatedAt: Date;
}

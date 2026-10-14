import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type ContactSource = 'PUBLIC_SITE' | 'DASHBOARD';
export type ContactStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';

@Entity('contact_messages')
export class ContactMessage {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid', nullable: true }) userId: string | null;
  @Column({ type: 'varchar', length: 100 }) name: string;
  @Column({ type: 'varchar', length: 254 }) email: string;
  @Column({ type: 'varchar', length: 150 }) subject: string;
  @Column({ type: 'text' }) message: string;
  @Column({ type: 'varchar', length: 30, default: 'PUBLIC_SITE' }) source: ContactSource;
  @Column({ type: 'varchar', length: 30, default: 'OPEN' }) status: ContactStatus;
  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ type: 'timestamptz' }) updatedAt: Date;
}

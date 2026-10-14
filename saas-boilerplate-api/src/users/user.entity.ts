import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', unique: true }) email: string;
  @Column({ type: 'varchar' }) passwordHash: string;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;
  
  @Column({ type: 'boolean', default: true }) isActive: boolean;
  @Column({ type: 'boolean', default: false }) emailVerified: boolean;
  
  @Column({ type: 'varchar', nullable: true })
  refreshTokenHash: string | null;
  
  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ type: 'timestamptz' }) updatedAt: Date;
}

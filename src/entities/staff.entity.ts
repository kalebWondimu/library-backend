import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Staff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column()
  password_hash: string;

  @Column()
  role: string;

  @Column({ default: false })
  is_demo: boolean;

  @CreateDateColumn()
  created_at: Date;
} 
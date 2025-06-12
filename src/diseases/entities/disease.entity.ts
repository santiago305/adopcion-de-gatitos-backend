import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('diseases')
export class Diseases {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'ninguno' })
  name: string;

  @Column({ default: 'ninguna' })
  severity: string;

  @Column({ default: false })
  deleted: boolean;

  @CreateDateColumn()
  createdAt: Date; 

  @UpdateDateColumn()
  updatedAt: Date; 
}
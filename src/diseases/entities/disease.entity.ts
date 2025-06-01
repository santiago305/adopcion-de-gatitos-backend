import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('diseases')
export class Diseases {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'ning' })
  name: string;

  @Column({ nullable: true })
  severity: string;

  @Column({ default: false })
  deleted: boolean;
}
import { Personality } from 'src/personality/entities/personality.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('characteristics')
export class Characteristics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Personality, (personality) => personality.characteristics)
  personality: Personality;

  @Column({ nullable: true })
  color: string;

  @Column({ name: 'size', nullable: true })
  size: string;

  @Column('numeric', { nullable: true })
  weight: number;

  @Column({ nullable: true })
  fur: string;

  @Column({ nullable: true })
  sex: string;

  @Column({ nullable: true })
  age: number;

  @Column({ default: false })
  sterilized: boolean;

  @Column({ default: false })
  deleted: boolean;
}
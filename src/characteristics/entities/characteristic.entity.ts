import { Personality } from 'src/personality/entities/personality.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('characteristics')
export class Characteristics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Personality, (personality) => personality.characteristics)
  @JoinColumn({ name: 'personality_id' })
  personality: Personality;
  
  @Column({ name: 'personality_id' })
  personalityId: string;

  @Column({ nullable: true })
  color: string;

  @Column({ name: 'size', nullable: true })
  size: string;

  @Column({ nullable: true })
  weight: string;

  @Column({ nullable: true })
  fur: string;

  @Column({ nullable: true })
  sex: string;

  @Column({ nullable: true })
  age: string;

  @Column({ default: false })
  sterilized: boolean;

  @Column({ default: false })
  deleted: boolean;
}
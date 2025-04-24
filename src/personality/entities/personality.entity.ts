// personality.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Personality {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // Este campo es el que se usa para el "soft delete"
  @Column({ default: false })
  deleted: boolean;
}

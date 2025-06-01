import { Characteristics } from 'src/characteristics/entities/characteristic.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('personality')
export class Personality {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: false })
  deleted: boolean;

  @OneToMany(() => Characteristics, (char) => char.personality)
  characteristics: Characteristics[];
}
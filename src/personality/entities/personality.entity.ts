import { Characteristics } from 'src/characteristics/entities/characteristic.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('personality')
export class Personality {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: false })
  deleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


  @OneToMany(() => Characteristics, (char) => char.personality)
  characteristics: Characteristics[];
}
import { Breed } from 'src/breed/entities/breed.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';


@Entity('species')
export class Species {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: false })
  deleted: boolean;

  @OneToMany(() => Breed, (breed) => breed.species)
  breeds: Breed[];
}
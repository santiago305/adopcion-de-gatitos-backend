import { Species } from 'src/species/entities/species.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';


@Entity('breed')
export class Breed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Species, (species) => species.breeds)
  species: Species;

  @Column()
  name: string;

  @Column({ default: false })
  deleted: boolean;
}
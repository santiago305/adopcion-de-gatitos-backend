import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Species } from 'src/species/entities/species.entity';

@Entity('breed')
export class Breed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Species, (species) => species.breeds)
  @JoinColumn({ name: 'species_id' })
  species: Species;

  @Column({ name: 'species_id' })
  speciesId: string;

  @Column()
  name: string;

  @Column({ default: false })
  deleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

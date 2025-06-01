import { Breed } from 'src/breed/entities/breed.entity';
import { Characteristics } from 'src/characteristics/entities/characteristic.entity';
import { Diseases } from 'src/diseases/entities/disease.entity';
import { Species } from 'src/species/entities/species.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';


@Entity('animals')
export class Animals {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Species)
  species: Species;

  @ManyToOne(() => Breed)
  breed: Breed;

  @ManyToOne(() => Diseases)
  disease: Diseases;

  @Column({ name: 'health_status', type: 'boolean', nullable: true })
  healthStatus: boolean;

  @Column({ name: 'entry_date', type: 'date', nullable: true })
  entryDate: Date;

  @Column({ default: false })
  adopted: boolean;

  @Column('text', { array: true, nullable: true })
  photos: string[];

  @ManyToOne(() => Characteristics)
  characteristics: Characteristics;

  @Column({ type: 'text', nullable: true })
  information: string;

  @Column({ default: true })
  status: boolean;

  @Column({ default: false })
  deleted: boolean;
}

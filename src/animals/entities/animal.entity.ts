import { Breed } from 'src/breed/entities/breed.entity';
import { Characteristics } from 'src/characteristics/entities/characteristic.entity';
import { Diseases } from 'src/diseases/entities/disease.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('animals')
export class Animals {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Breed)
  breed: Breed;

  @ManyToOne(() => Diseases)
  disease: Diseases;

  @Column({ name: 'health_status', type: 'boolean', nullable: true })
  healthStatus: boolean;

  @Column({ default: false })
  adopted: boolean;

  @Column({ type: 'text', nullable: true })
  photos: string; // Cambiado a un solo string (URL o nombre de la foto)

  @ManyToOne(() => Characteristics)
  characteristics: Characteristics;

  @Column({ type: 'text', nullable: true })
  information: string;

  @Column({ default: true })
  status: boolean;

  @Column({ default: false })
  deleted: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

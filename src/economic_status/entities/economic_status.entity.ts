import { Client } from "src/clients/entities/client.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('economic_status')
export class EconomicStatus {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    level: string;

    @Column({ default: false })
    deleted: boolean;

    @OneToMany(() => Client, (client)=> client.economicStatus)
    clients: Client[];
}

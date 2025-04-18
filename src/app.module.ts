import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { ClientsModule } from './clients/clients.module';
import { SpeciesModule } from './species/species.module';
import { BreedsModule } from './breeds/breeds.module';
import { DiseasesModule } from './diseases/diseases.module';
import { PersonalityModule } from './personality/personality.module';
import { CharacteristicsModule } from './characteristics/characteristics.module';
import { AnimalsModule } from './animals/animals.module';
import { AdoptionsModule } from './adoptions/adoptions.module';

@Module({
  imports: [
    UsersModule, 
    AuthModule, 
    RolesModule, 
    ClientsModule,
    SpeciesModule,
    BreedsModule, 
    DiseasesModule, 
    PersonalityModule, 
    CharacteristicsModule, 
    AnimalsModule, 
    AdoptionsModule
  ],
})
export class AppModule {}

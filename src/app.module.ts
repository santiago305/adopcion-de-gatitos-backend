import { MiddlewareConsumer, 
  Module, 
  RequestMethod 
} from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { AppConfigModule } from './config/config.module';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { PersonalityModule } from './personality/personality.module';
import { CharacteristicsModule } from './characteristics/characteristics.module';
import { DiseasesModule } from './diseases/diseases.module';
import { SpeciesModule } from './species/species.module';
import { BreedModule } from './breed/breed.module';
import { AnimalsModule } from './animals/animals.module';


@Module({
  imports: [
    AppConfigModule,
    CommonModule,
    DatabaseModule,
    AuthModule, 
    RolesModule, 
    UsersModule, 
    ClientsModule, PersonalityModule, CharacteristicsModule, DiseasesModule, SpeciesModule, BreedModule, AnimalsModule
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply()
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
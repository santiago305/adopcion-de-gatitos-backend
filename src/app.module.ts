import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
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
import { AppConfigModule } from './config/config.module';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { TokenMiddleware } from './common/middleware/token.middleware';

@Module({
  imports: [
    AppConfigModule,
    CommonModule,
    DatabaseModule,
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
    AdoptionsModule,
      ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TokenMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

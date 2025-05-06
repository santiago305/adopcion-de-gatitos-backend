import { MiddlewareConsumer, 
  Module, 
  RequestMethod 
} from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { TokenMiddleware } from './common/middleware/token.middleware';
import { ClientsModule } from './clients/clients.module';


@Module({
  imports: [
    AuthModule, 
    RolesModule, 
    UsersModule, ClientsModule
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TokenMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
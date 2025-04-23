import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envs } from './envs';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => envs],
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}

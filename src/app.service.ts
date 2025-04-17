import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Santiago te quiero a 3 metros bajo tierra <3';
  }
}

import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  create(createUserDto: CreateUserDto) {
    return 'vamos a crear un usuario';
  }

  findAll() {
    return `vamos a buscar todos los usuarios`;
  }

  findOne(id: number) {
    return `buscamos un usuario por su #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `modificamos un usuario por su #${id} user`;
  }

  remove(id: number) {
    return `removemos un usuario por su id #${id} user`;
  }
}

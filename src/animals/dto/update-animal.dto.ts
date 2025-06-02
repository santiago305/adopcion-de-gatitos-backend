import { PartialType } from '@nestjs/mapped-types';
import { CreateAnimalsDto } from './create-animal.dto';

export class UpdateAnimalsDto extends PartialType(CreateAnimalsDto) {}

import { PartialType } from '@nestjs/mapped-types';
import { CreateCharacteristicsDto } from './create-characteristic.dto';

export class UpdateCharacteristicDto extends PartialType(CreateCharacteristicsDto) {}

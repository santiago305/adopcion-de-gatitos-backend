import { PartialType } from '@nestjs/mapped-types';
import { CreateEconomicStatusDto } from './create-economic_status.dto';

export class UpdateEconomicStatusDto extends PartialType(CreateEconomicStatusDto) {}

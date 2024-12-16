import { PartialType } from '@nestjs/mapped-types';
import { CreateWholesaleDto } from './create-wholesale.dto';

export class UpdateWholesaleDto extends PartialType(CreateWholesaleDto) {}

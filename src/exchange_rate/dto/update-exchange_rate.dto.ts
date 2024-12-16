import { PartialType } from '@nestjs/mapped-types';
import { CreateExchangeRateDto } from './create-exchange_rate.dto';

export class UpdateExchangeRateDto extends PartialType(CreateExchangeRateDto) {}

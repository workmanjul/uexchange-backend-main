import { PartialType } from '@nestjs/mapped-types';
import { CreateOnholdDto } from './create-onhold.dto';

export class UpdateOnholdDto extends PartialType(CreateOnholdDto) {}

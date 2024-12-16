import { PartialType } from '@nestjs/mapped-types';
import { CreateOfficeLocationDto } from './create-office_location.dto';

export class UpdateOfficeLocationDto extends PartialType(CreateOfficeLocationDto) {}

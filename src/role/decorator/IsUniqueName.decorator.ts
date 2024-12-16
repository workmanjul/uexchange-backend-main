import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@ValidatorConstraint({ async: true })
export class IsUniqueNameConstraint implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments) {
    const [tableName, fieldName] = args.constraints as [string, string];

    const existingName = await prisma[tableName].findUnique({
      where: {
        [fieldName]: value,
      },
    });
    return !existingName; // Return false if the name already exists
  }

  defaultMessage(args: ValidationArguments) {
    const [tableName, fieldName] = args.constraints as [string, string];
    return `${fieldName} should be unique`;
  }
}

export function IsUnique(
  tableName: string,
  fieldName: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNameUnique', // Match the decorator name with the registerDecorator name
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsUniqueNameConstraint,
      async: true,
      constraints: [tableName, fieldName],
    });
  };
}

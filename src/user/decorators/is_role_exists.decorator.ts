import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PrismaClient, Role } from '@prisma/client';
const prisma = new PrismaClient();

@ValidatorConstraint({ async: true })
export class IsRoleExistsConstraint implements ValidatorConstraintInterface {
  async validate(roles: number[]) {
    if (!roles || roles.length === 0) {
      return true; // No roles provided, validation passes
    }
    const existingRoles = await prisma.role.findMany({
      where: {
        id: { in: roles },
      },
    });

    return existingRoles.length === roles.length;
  }

  defaultMessage() {
    return 'some roles are not present in database ';
  }
}

export function IsRoleExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isRoleExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsRoleExistsConstraint,
    });
  };
}

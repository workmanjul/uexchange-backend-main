import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PrismaService } from "src/prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { PaginationService } from "src/pagination/pagination.service";
import { Prisma } from "@prisma/client";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly paginationService: PaginationService<any>,
    private mailerService: MailerService
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const { roles } = createUserDto;

      let user;
      let randomString = this.makeRandomString(10);
      const hashedData = await this.hashData(randomString);

      await this.prisma.$transaction(async (prisma) => {
        user = await prisma.user.create({
          data: {
            email: createUserDto.email,
            password: hashedData,
            name: createUserDto.name,
            officeId: createUserDto.officeId,
          },
        });

        if (roles !== undefined && roles.length > 0) {
          console.log(user.id);
          for (const roleId of roles) {
            await prisma.userRoles.create({
              data: {
                userId: user.id,
                roleId: roleId,
              },
            });
          }
        }
      });

      try {
        var response = await this.mailerService.sendMail({
          to: createUserDto.email,
          from: "order@uexchange.ca",
          subject: "Plain Text Email ✔",
          template: "userregistration",
          context: {
            username: createUserDto.email,
            password: randomString,
          },
        });
      } catch (emailError) {
        if (emailError.code === "EENVELOPE") {
          throw new InternalServerErrorException("Invalid email envelope");
          console.error("Invalid email envelope:", emailError.message);
        } else if (emailError.code === "EAUTH") {
          throw new InternalServerErrorException(
            "Authentication error:Invalid credentials for email"
          );
          console.error("Authentication error:", emailError.message);
        } else {
          throw new InternalServerErrorException("Error sending email");
          console.error("Error sending email:", emailError);
        }
        // Handle email sending error
        console.error("Error sending email:", emailError);

        // Here, we re-throw the error so it propagates up the call stack,
        // and the database transaction gets rolled back as well.
        throw new InternalServerErrorException(emailError.message);
      }

      const { password, ...rest } = user;
      return rest;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(page?: number, pageSize?: number, sort?: any) {
    let skip;
    let take;
    console.log("page", page);
    if (page !== undefined && pageSize !== undefined) {
      skip = (page - 1) * pageSize;
      take = Number(pageSize);
    }
    const users = await this.prisma.user.findMany({
      skip,
      take,
      orderBy: sort ? { [sort.id]: sort.desc === "true" ? "desc" : "asc" } : {},
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        office: true, // Include the office relation
      },
    });

    const formattedData = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      office: user.office ? user.office : null,
      roles: user.roles.map((role) => ({
        userId: role.userId,
        roleId: role.roleId,
        name: role.role.name,
      })),
    }));

    const totalItems = await this.prisma.user.count();
    console.log("total", totalItems);
    if (page !== undefined && pageSize !== undefined) {
      return this.paginationService.getPaginationData(
        page,
        pageSize,
        formattedData,
        totalItems
      );
    } else {
      return {
        items: formattedData,
        totalItems: formattedData.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: {
          id: id,
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          office: true,
        },
      });

      const transferedData = {
        name: user.name,
        email: user.email,
        office: user.office ? user.office : null,
        roles: user.roles.map((role) => ({
          roleId: role.roleId,
          name: role.role.name,
        })),
      };
      return transferedData;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      let inputData: any = {
        name: updateUserDto.name,
        email: updateUserDto.email,
        officeId: updateUserDto.officeId,
      };

      if (updateUserDto.password) {
        const hashedPassword = await this.hashData(updateUserDto.password);
        inputData.password = hashedPassword;
      }
      const updateuser = await this.prisma.$transaction(async (prisma) => {
        const updatedUser = await prisma.user.update({
          where: { id: id },
          data: inputData,
        });

        // Delete existing PermissionRoles for the role
        await prisma.userRoles.deleteMany({
          where: { userId: id },
        });
        await prisma.userPermissions.deleteMany({
          where: { userId: id },
        });

        // Create new PermissionRoles for the role
        const userRolePromises = updateUserDto.roles.map((roleId) => {
          return prisma.userRoles.create({
            data: {
              userId: id,
              roleId,
            },
          });
        });

        const rolePermissions = updateUserDto.roles.map(async (roleId) => {
          const role = await this.prisma.role.findUnique({
            where: { id: roleId },
          });
          if (role) {
            return await this.prisma.permissionRoles.findMany({
              where: { roleId: role.id },
            });
          }
        });

        const permissions = await Promise.all(rolePermissions);

        //saving all permissions in single array
        const flattenedPermissions = permissions.flat();
        const permissionIds = flattenedPermissions.map(
          (permission) => permission.permissionId
        );
        //finding unique permissions
        const uniquePermissionIds = Array.from(new Set(permissionIds));

        const uniquePermissions = uniquePermissionIds.map((permissionId) => {
          return {
            userId: updatedUser.id,
            permissionId: permissionId,
          };
        });

        await Promise.all(
          uniquePermissions.map(async (unique) => {
            await prisma.userPermissions.create({
              data: unique,
            });
          })
        );

        await Promise.all(userRolePromises);
        const { password, ...rest } = updatedUser;
        return rest;
      });

      return updateuser;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(id: number) {
    try {
      const response = await this.prisma.deleteOrThrow("user", id);

      return { message: "user deleted successfully" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      } else if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(
        "An error occurred while deleting the user."
      );
    }
  }
  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  makeRandomString(length) {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }
}

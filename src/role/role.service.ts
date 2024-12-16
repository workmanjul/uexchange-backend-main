import { Injectable } from "@nestjs/common";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma, Role, PermissionRoles } from "@prisma/client";
import { PaginationService } from "src/pagination/pagination.service";

type RolesResponse = {
  id: number;
  name: string;
  permissions: {
    roleId: number;
    permissionId: number;
    permissionName: string;
  }[];
};

@Injectable()
export class RoleService {
  constructor(
    private prisma: PrismaService,
    private readonly paginationService: PaginationService<RolesResponse>
  ) {}
  async create(createRoleDto: CreateRoleDto) {
    const { name, permission } = createRoleDto;
    console.log(name);
    const role = await this.prisma.role.create({ data: { name } });

    for (const permissionId of permission) {
      console.log(permission);
      await this.prisma.permissionRoles.create({
        data: {
          roleId: role.id,
          permissionId: +permissionId,
        },
      });
    }
    return role;
  }

  async findAll(page?: number, pageSize?: number) {
    let skip;
    let take;

    if (page !== undefined && pageSize !== undefined) {
      skip = (page - 1) * pageSize;
      take = Number(pageSize);
    }

    const roles = await this.prisma.role.findMany({
      skip,
      take,
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    const rolesWithPermissions = roles.map((role) => {
      const roleWithPermissions = {
        id: role.id,
        name: role.name,
        isMain: role.isMain,
        permissions: role.permissions.map((permission) => ({
          roleId: permission.roleId,
          permissionId: permission.permissionId,
          permissionName: permission.permission.name,
        })),
      };
      return roleWithPermissions;
    });

    const totalItems = await this.prisma.role.count();

    if (page !== undefined && pageSize !== undefined) {
      return this.paginationService.getPaginationData(
        page,
        pageSize,
        rolesWithPermissions,
        totalItems
      );
    } else {
      return {
        items: rolesWithPermissions,
        totalItems: rolesWithPermissions.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };
    }
  }

  async findOne(id: number) {
    const data = await this.prisma.role.findUnique({
      where: { id: id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    const transformedData = {
      id: data.id,
      name: data.name,
      permissions: data.permissions.map((permission) => ({
        roleId: data.id,
        permissionId: permission.permissionId,
        permissionName: permission.permission.name,
      })),
    };
    return transformedData;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const { name, permission } = updateRoleDto;
    const updatedRole = await this.prisma.$transaction(async (prisma) => {
      const updatedRole = await prisma.role.update({
        where: { id: id },
        data: { name },
      });

      // Delete existing PermissionRoles for the role
      await prisma.permissionRoles.deleteMany({
        where: { roleId: id },
      });

      // Create new PermissionRoles for the role
      const permissionRolePromises = permission.map((permissionId) => {
        return prisma.permissionRoles.create({
          data: {
            roleId: id,
            permissionId,
          },
        });
      });

      // Execute all the permissionRolePromises in parallel
      await Promise.all(permissionRolePromises);
      return updatedRole;
    });

    return updatedRole;
  }

  async remove(id: number) {
    await this.prisma.$transaction(async (prisma) => {
      await prisma.role.delete({
        where: {
          id: id,
        },
      });
    });
    return { message: "role deleted successfully" };
  }
}

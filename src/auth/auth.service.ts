import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as bcrypt from "bcrypt";
import { Tokens } from "./types";
import { JwtService } from "@nestjs/jwt";
import { ReqUser } from "./types/reqUser";
import { Response } from "express";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}
  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }
  //
  async getTokens(
    userId: number,
    email: string,
    officeId?: number,
    isDefault?: boolean,
    permissions?: string[]
  ): Promise<Tokens> {
    const [at] = await Promise.all([
      this.jwtService.signAsync({
        sub: userId,
        email,
        officeId,
        permissions: permissions,
        isDefault: isDefault,
      }),
    ]);
    return { access_token: at };
  }
  async signupLocal(dto: AuthDto): Promise<Tokens> {
    const hashedData = await this.hashData(dto.password);
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedData,
      },
    });

    const tokens = await this.getTokens(newUser.id, newUser.email);
    return tokens;
  }

  async signinLocal(dto: AuthDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
      include: {
        office: true,
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) throw new ForbiddenException("User not found");
    const userDataTransformed = {
      name: user.name,
      permissions: user.roles.flatMap((role) =>
        role.role.permissions.map((permission) => permission.permission.name)
      ),
    };

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches)
      throw new ForbiddenException("Password does not match");

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.office ? user.office.id : null,
      user.isDefault,
      userDataTransformed.permissions
    );
    return tokens;
  }

  async logout(res: Response): Promise<void> {
    try {
      res.clearCookie("token");
    } catch (error) {
      throw new HttpException(
        {
          message: "Somthing is Wrong",
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async loadUser(user: any): Promise<ReqUser> {
    const response: any = await this.prisma.findOrFail("user", user.sub);
    const transformedData = {
      name: response.name,
      email: response.email,
      isDefault:response.isDefault,
      permissions: user.permissions,
    };
    return transformedData;
  }
}

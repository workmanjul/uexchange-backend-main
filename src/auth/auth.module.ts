import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AtStrategy, RtStrategy } from "./strategies";
import { JwtModule } from "@nestjs/jwt";
import { JWT_SECRET_TOKEN } from "../config";
const DAY_IN_SECOND = 86400;

@Module({
  imports: [
    JwtModule.register({
      secret: JWT_SECRET_TOKEN,
      signOptions: {
        expiresIn: DAY_IN_SECOND,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy],
})
export class AuthModule {}

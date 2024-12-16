import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";

import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";
import { Tokens } from "./types";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import { ReqUser } from "./types/reqUser";
import { COOKIE_DOMAIN } from "../config";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("local/signup")
  @HttpCode(HttpStatus.CREATED)
  signupLocal(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signupLocal(dto);
  }
  //
  @Post("local/signin")
  @HttpCode(HttpStatus.OK)
  signinLocal(@Body() dto: AuthDto, @Res() res: Response): any {
    return this.authService.signinLocal(dto).then((response) => {
      const days_90 = 90 * 24 * 60 * 60 * 1000;
      res
        .status(200)
        .cookie("token", response.access_token, {
          expires: new Date(Date.now() + days_90),
          httpOnly: true,
          secure: true,
          domain: COOKIE_DOMAIN,
        })
        .json({
          success: true,
          message: "Login Successfully",
        });
    });
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("logout")
  async logout(@Res() res: Response) {
    await this.authService.logout(res);
    return res.status(HttpStatus.OK).json({
      success: true,
      message: "LogOut Successfully",
    });
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("load-user")
  @HttpCode(HttpStatus.OK)
  async loadUser(@Req() req): Promise<ReqUser> {
    const response = await this.authService.loadUser(req.user);
    return response;
  }
}

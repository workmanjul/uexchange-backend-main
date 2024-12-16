import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { JWT_SECRET_TOKEN } from "src/config";
@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor() {
    super({
      jwtFromRequest: AtStrategy.cookieExtractor,
      secretOrKey: JWT_SECRET_TOKEN,
    });
  }

  validate(payload: any) {
    return payload;
  }
  private static cookieExtractor(req: Request): string | null {
    if (
      req &&
      req.cookies &&
      "token" in req.cookies &&
      req.cookies.token.length > 0
    ) {
      return req.cookies.token;
    }
    return null;
  }
}

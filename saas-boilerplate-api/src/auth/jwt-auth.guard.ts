import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest(); const token = req.cookies?.access_token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : undefined);
    if (!token) throw new UnauthorizedException();
    try { req.user = await this.jwt.verifyAsync(token, { secret: process.env.JWT_ACCESS_SECRET }); return true; }
    catch { throw new UnauthorizedException(); }
  }
}

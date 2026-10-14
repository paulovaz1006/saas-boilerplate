import { Body, Controller, Post, Res, Req, UnauthorizedException, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
class RegisterDto { @IsEmail() email: string; @IsString() @MinLength(12) @MaxLength(128) password: string; @IsOptional() @IsString() @MaxLength(100) name?: string; }
class LoginDto { @IsEmail() email: string; @IsString() password: string; }
const cookieOptions = () => ({ httpOnly: true, secure: process.env.COOKIE_SECURE === 'true', sameSite: 'lax' as const, path: '/', });
@ApiTags('auth') @Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}
  private setCookies(res: Response, tokens: {accessToken:string;refreshToken:string}) { res.cookie('access_token', tokens.accessToken, { ...cookieOptions(), maxAge: 15 * 60 * 1000 }); res.cookie('refresh_token', tokens.refreshToken, { ...cookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/auth/refresh' }); }
  @Post('register') async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) { const result = await this.auth.register(dto); this.setCookies(res, result); return { user: result.user }; }
  @Post('login') @HttpCode(200) async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) { const result = await this.auth.login(dto.email, dto.password); this.setCookies(res, result); return { user: result.user }; }
  @Post('refresh') @HttpCode(200) async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) { const token = req.cookies?.refresh_token; if (!token) throw new UnauthorizedException(); const result = await this.auth.refresh(token); this.setCookies(res, result); return { user: result.user }; }
  @Post('logout') @HttpCode(200) async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) { const token = req.cookies?.access_token; let userId: string | undefined; if (token) { try { const p: any = await (this.auth as any).jwt.verifyAsync(token, { secret: process.env.JWT_ACCESS_SECRET }); userId = p.sub; } catch {} } await this.auth.logout(userId); res.clearCookie('access_token', cookieOptions()); res.clearCookie('refresh_token', { ...cookieOptions(), path: '/api/auth/refresh' }); return { ok: true }; }
  @Post('forgot-password') @HttpCode(200) forgot() { return { message: 'Se o e-mail estiver cadastrado, você receberá instruções de recuperação. Configure um provedor SMTP para habilitar o envio.' }; }
  @Post('reset-password') @HttpCode(501) reset() { return { message: 'Fluxo de reset pendente de integração com token de uso único e provedor de e-mail.' }; }
}

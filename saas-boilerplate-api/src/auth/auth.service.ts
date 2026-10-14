import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { User } from '../users/user.entity';
import { Plan } from '../plans/plan.entity';
import { Subscription } from '../payments/subscription.entity';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private users: Repository<User>, @InjectRepository(Plan) private plans: Repository<Plan>, @InjectRepository(Subscription) private subs: Repository<Subscription>, private jwt: JwtService) {}
  private async tokens(user: User) {
    const accessSecret = process.env.JWT_ACCESS_SECRET; const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!accessSecret || !refreshSecret) throw new Error('JWT secrets are required');
    const accessToken = await this.jwt.signAsync({ sub: user.id, email: user.email }, { secret: accessSecret, expiresIn: '15m' });
    const refreshToken = await this.jwt.signAsync({ sub: user.id, typ: 'refresh' }, { secret: refreshSecret, expiresIn: '7d' });
    user.refreshTokenHash = await argon2.hash(refreshToken); await this.users.save(user);
    return { accessToken, refreshToken };
  }
  async register(input: { email: string; password: string; name?: string }) {
    const email = input.email.toLowerCase().trim();
    if (input.password.length < 12) throw new BadRequestException('A senha deve ter pelo menos 12 caracteres');
    if (await this.users.findOneBy({ email })) throw new ConflictException('E-mail já cadastrado');
    const free = await this.plans.findOneBy({ key: 'free' });
    if (!free) throw new BadRequestException('Plano gratuito não configurado');
    const user = await this.users.save(this.users.create({ email, name: input.name || '', passwordHash: await argon2.hash(input.password), isActive: true }));
    await this.subs.save(this.subs.create({ userId: user.id, planId: free.id, status: 'active', billingInterval: 'monthly' }));
    return { user: { id: user.id, email: user.email, name: user.name }, ...(await this.tokens(user)) };
  }
  async login(emailInput: string, password: string) {
    const user = await this.users.findOneBy({ email: emailInput.toLowerCase().trim() });
    if (!user || !user.isActive || !(await argon2.verify(user.passwordHash, password))) throw new UnauthorizedException('Credenciais inválidas');
    return { user: { id: user.id, email: user.email, name: user.name }, ...(await this.tokens(user)) };
  }
  async refresh(token: string) {
    try {
      const payload = await this.jwt.verifyAsync(token, { secret: process.env.JWT_REFRESH_SECRET });
      if (payload.typ !== 'refresh') throw new Error('wrong token type');
      const user = await this.users.findOneBy({ id: payload.sub });
      if (!user?.refreshTokenHash || !(await argon2.verify(user.refreshTokenHash, token))) throw new Error('token revoked');
      return { user: { id: user.id, email: user.email, name: user.name }, ...(await this.tokens(user)) };
    } catch { throw new UnauthorizedException('Refresh token inválido ou expirado'); }
  }
  async logout(userId?: string) { if (userId) await this.users.update({ id: userId }, { refreshTokenHash: null }); return { ok: true }; }
}

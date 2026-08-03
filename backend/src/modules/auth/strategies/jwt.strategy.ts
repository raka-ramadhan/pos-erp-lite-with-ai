import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig } from '../../../config/jwt.config';
import { User } from '../entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: {
    id: string;
    name: string;
    permissions: string[];
  } | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig().secret,
    });
  }

  async validate(payload: JwtPayload): Promise<CurrentUser> {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub, isActive: true },
      relations: { role: { permissions: true } },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Extract permission codes from role
    const permissions = user.role?.permissions?.map((p) => p.code) || [];

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
        ? {
            id: user.role.id,
            name: user.role.name,
            permissions,
          }
        : null,
    };
  }
}

import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { LoginDto, RegisterDto } from './dto';
import { JwtPayload } from './strategies/jwt.strategy';

export interface RoleInfo {
  id: string;
  name: string;
  permissions: string[];
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    role: RoleInfo | null;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const user = this.userRepository.create({
      name: registerDto.name,
      email: registerDto.email,
      password: registerDto.password,
    });
    await this.userRepository.save(user);

    return this.generateToken(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email, isActive: true },
      relations: { role: { permissions: true } },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        phone: true,
        avatar: true,
        isActive: true,
        roleId: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  async validateUser(payload: JwtPayload): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: payload.sub, isActive: true },
    });
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { role: { permissions: true } },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  private generateToken(user: User): AuthResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    // Extract role info with permissions
    const roleInfo: RoleInfo | null = user.role
      ? {
          id: user.role.id,
          name: user.role.name,
          permissions: user.role.permissions?.map((p) => p.code) || [],
        }
      : null;

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || undefined,
        avatar: user.avatar || undefined,
        role: roleInfo,
      },
    };
  }
}

import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto';
import { Tokens } from './types/tokens.type';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  /**
   * Registers a new user with the given email and password.
   * @param dto User information.
   * @returns User tokens.
   */
  async registerLocal(dto: RegisterDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (user) {
      throw new ForbiddenException('User already exists');
    }
    const hash = await this.hashData(dto.password);
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        hash,
        name: dto.name,
        country: dto.country,
      },
    });
    const tokens = await this.getTokens(newUser.id, newUser.email);
    this.updateRtHash(newUser.id, tokens.refresh_token);
    return tokens;
  }

  /**
   * Logins a user with the given email and password.
   * @param dto User information.
   * @returns User tokens.
   */
  async loginLocal(dto: LoginDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.hash);
    if (!passwordMatches) {
      throw new ForbiddenException('Invalid credentials');
    }

    const tokens = await this.getTokens(user.id, user.email);
    this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  /**
   * Logs out a user with the given ID.
   * @param userId User ID.
   */
  async logout(userId: number) {
    console.log('userId', userId);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: { hashedRt: null },
    });
  }

  /**
   * Refreshes the tokens of a user with the given refresh token and ID.
   * @param userId User ID.
   * @param rt Refresh token.
   * @returns User tokens.
   */
  async refresh(userId: number, rt: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || !user.hashedRt)
      throw new ForbiddenException('Invalid credentials');
    const rtMatches = await bcrypt.compare(rt, user.hashedRt);

    if (!rtMatches) {
      throw new ForbiddenException('Invalid credentials');
    }

    const tokens = await this.getTokens(user.id, user.email);
    this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  /**
   * Returns the user information with a given ID.
   * @param userId User ID.
   * @returns User information.
   */
  async me(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    delete user.hash;
    delete user.hashedRt;
    delete user.createdAt;
    delete user.updatedAt;
    delete user.id;
    return user;
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      // Access Token
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: process.env.ACCESS_TOKEN_SECRET,
          expiresIn: 60 * 15,
        },
      ),
      // Refresh Token
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: process.env.REFRESH_TOKEN_SECRET,
          expiresIn: 60 * 60 * 24 * 7,
        },
      ),
    ]);
    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async updateRtHash(userId: number, rt: string) {
    const hash = await this.hashData(rt);
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRt: hash },
    });
  }

  hashData(hash: string) {
    return bcrypt.hash(hash, 10);
  }
}

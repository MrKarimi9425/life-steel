import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

type AccessTokenClaims = {
  adminId: string;
  sessionId: string;
};

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async issue(adminId: string, sessionId: string): Promise<string> {
    return this.jwtService.signAsync({ sub: adminId, sid: sessionId });
  }

  async verify(token: string): Promise<AccessTokenClaims> {
    const payload =
      await this.jwtService.verifyAsync<Record<string, unknown>>(token);

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.sid !== 'string' ||
      !payload.sub ||
      !payload.sid
    ) {
      throw new Error('Invalid access token claims');
    }

    return { adminId: payload.sub, sessionId: payload.sid };
  }
}

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { AccessTokenGuard } from './guards/access-token.guard';
import { OwnerGuard } from './guards/owner.guard';
import { AuthService } from './services/auth.service';
import { AuthSessionService } from './services/auth-session.service';
import { PasswordHasher } from './services/password-hasher';
import { TokenService } from './services/token.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.getOrThrow<string>(
            'JWT_ACCESS_EXPIRES_IN',
          ) as never,
          issuer: config.getOrThrow<string>('JWT_ISSUER'),
          audience: config.getOrThrow<string>('JWT_AUDIENCE'),
        },
        verifyOptions: {
          issuer: config.getOrThrow<string>('JWT_ISSUER'),
          audience: config.getOrThrow<string>('JWT_AUDIENCE'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthSessionService,
    PasswordHasher,
    TokenService,
    AccessTokenGuard,
    OwnerGuard,
  ],
  exports: [
    AccessTokenGuard,
    OwnerGuard,
    PasswordHasher,
    AuthSessionService,
    TokenService,
  ],
})
export class AuthModule {}

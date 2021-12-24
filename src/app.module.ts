import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { AccessTokenGuard } from './auth/common/guards';
import { PrismaModule } from './prisma/prisma.module';
import { UniversitiesModule } from './universities/universities.module';
import { CareersModule } from './careers/careers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    AuthModule,
    PrismaModule,
    UniversitiesModule,
    CareersModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: AccessTokenGuard }],
})
export class AppModule {}

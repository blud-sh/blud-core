import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { AblyModule } from './ably/ably.module';

@Module({
  imports: [ChatModule, AuthModule, PrismaModule, AblyModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}

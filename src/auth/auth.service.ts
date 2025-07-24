import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async userLookup(email: string) {
    const user = await this.prisma.users.findUnique({
      where: { email: email },
    });

    if (!user) {
      throw new NotFoundException('User not Found');
    }

    return user;
  }
}

import { Body, Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('user-lookup')
  async userLookup(@Body() email: string) {
    return this.authService.userLookup(email);
  }
}

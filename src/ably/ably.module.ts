import { Module } from '@nestjs/common';
import { AblyService } from './ably.service';


@Module({
  providers: [AblyService]
})
export class AblyModule {}

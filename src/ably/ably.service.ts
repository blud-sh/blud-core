import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as Ably from 'ably';
import {
  ChatClient,
  Room,
  MessageEvent,
  ConnectionStatusChange,
  RoomStatusChange,
} from '@ably/chat';


@Injectable()
export class AblyService implements OnModuleInit , OnModuleDestroy {
  private ablyReal: Ably.Realtime;
  private chatClient: ChatClient;

  private readonly logger = new Logger(AblyService.name);

  async onModuleInit() {
    this.ablyReal = new Ably.Realtime({
      key: process.env.ABLY_API_KEY,
      clientId: "blud-chat",
    });

    this.chatClient = new ChatClient(this.ablyReal);

    this.chatClient.connection.onStatusChange((status: ConnectionStatusChange) => {
      this.logger.log(`Connection status: ${status.current}`);
    });
  }
  
  async onModuleDestroy() {
    
  }
}

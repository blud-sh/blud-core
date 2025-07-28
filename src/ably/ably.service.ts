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

     const { off: unsubscribeConnectionStatus } =
    this.chatClient.connection.onStatusChange((change: ConnectionStatusChange) => {
      console.log("Connection state changed to", change.current);
    });

  }
  
  
  async onModuleDestroy() {
    await this.ablyReal.close()
    this.logger.log('Ably connection closed');
  }
}

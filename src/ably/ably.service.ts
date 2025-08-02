import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as Ably from 'ably';
import {
  ChatClient,
  Room,
  ConnectionStatusChange,
  RoomStatusChange,
  ChatMessageEvent,
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

    this.chatClient.connection.onStatusChange((change: ConnectionStatusChange) => {
      this.logger.log(`Connection status changed to: ${change.current}`);
    });

    this.logger.log("Ably Chat Client initialized!")
  }
  
  async onModuleDestroy() {
  
    await this.ablyReal.close()
    this.logger.log('Ably connection closed');
  }

  async createRoom(roomName: string): Promise<Room>{
    const room = await this.chatClient.rooms.get(`${roomName}`);

    await room.attach();

    this.logger.log(`Room: ${roomName} attached`);
    return room;

  }
}

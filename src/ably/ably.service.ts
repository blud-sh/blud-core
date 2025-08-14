import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as Ably from 'ably';
import {
  ChatClient,
  Room,
  ConnectionStatusChange,
  RoomStatusChange,
  ChatMessageEvent,
  Message,
} from '@ably/chat';

@Injectable()
export class AblyService implements OnModuleInit, OnModuleDestroy {
  private ablyReal: Ably.Realtime;
  private chatClient: ChatClient;

  private readonly logger = new Logger(AblyService.name);

  async onModuleInit() {
    this.ablyReal = new Ably.Realtime({
      key: process.env.ABLY_API_KEY,
      clientId: 'blud-chat',
    });

    this.chatClient = new ChatClient(this.ablyReal);

    this.chatClient.connection.onStatusChange(
      (change: ConnectionStatusChange) => {
        this.logger.log(`Connection status changed to: ${change.current}`);
      },
    );

    this.logger.log('Ably Chat Client initialized!');
  }

  async onModuleDestroy() {
    this.ablyReal.close();
    this.logger.log('Ably connection closed');
  }

  async createRoom(roomName: string): Promise<Room> {
    const room = await this.chatClient.rooms.get(`${roomName}`);

    await room.attach();

    this.logger.log(`Room: ${roomName} attached`);
    return room;
  }

  async sendMessage(
    roomName: string,
    message: string,
  ): Promise<{ message: string }> {
    try {
      const room = await this.chatClient.rooms.get(`${roomName}`);
      if (!room) {
        throw new NotFoundException("Room not Found")
      }

      await room.messages.send({ text: `${message}` });

      return { message: 'Message sent successfully`' };
    } catch (error) {
      throw new InternalServerErrorException(`message: ${message} was not send successfully : error : ${error}`)
    }
  }

  async updateMessage(message: Message,roomName: string, updatedMessage: string): Promise<{message: string>{
    try {
      const room = await this.chatClient.rooms.get(`${roomName}`)
      if (!room) {
        throw new NotFoundException("Room not Found");
      }
      const updated = message.copy({ text: `${updatedMessage}` });
      await room.messages.update(updated.serial, updated, {description: "Message updated by the user!"})
      return {message: "Message updated successfully"}
    } catch(error){
      throw new InternalServerErrorException("Message didn't update successfully!")
    }
  }

    async deleteMessage(message: Message, roomName: string): Promise<{message: string}> {
      try {
        const room = await this.chatClient.rooms.get(`${roomName}`)
        if(!room){
          throw new NotFoundException("Room not Found")
        }
      }
    }



  }


}

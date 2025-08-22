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
  OrderBy,
} from '@ably/chat';

@Injectable()
export class ChatService implements OnModuleInit, OnModuleDestroy {
  private ablyReal: Ably.Realtime;
  private chatClient: ChatClient;
  private subscriptions: Map<string, () => void> = new Map();

  private readonly logger = new Logger(ChatService.name);

  async onModuleInit() {
    this.ablyReal = new Ably.Realtime({
      key: process.env.ABLY_API_KEY,
      clientId: 'blud-chat',
      autoConnect: true,
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

  //create room
  async createRoom(roomName: string): Promise<{ message: string }> {
    const room = await this.chatClient.rooms.get(`${roomName}`);
    if (room.status === 'failed') {
      this.logger.error(`Failed to attach to ${roomName}`);
      throw new InternalServerErrorException(
        `Room ${roomName} went into failed state`,
      );
    }
    if (room.status !== 'attached') {
      await room.attach();
      this.logger.log(`Room: ${roomName} attached`);
    } else {
      this.logger.log('Room: ${roomName} already attached');
    }
    return { message: `room: ${roomName} created!` };
  }

  //send message in room
  async sendMessage(
    roomName: string,
    message: string,
  ): Promise<{ message: string }> {
    try {
      const room = await this.chatClient.rooms.get(`${roomName}`);
      if (room.status === 'failed' || room.status === 'detached') {
        throw new NotFoundException('Room not Found');
      }

      await room.messages.send({ text: `${message}` });

      return { message: 'Message sent successfully`' };
    } catch (error) {
      throw new InternalServerErrorException(
        `message: ${message} was not send successfully : error : ${error}`,
      );
    }
  }

  //update message in room
  async updateMessage(
    message: Message,
    roomName: string,
    updatedMessage: string,
  ): Promise<{ message: string }> {
    try {
      const room = await this.chatClient.rooms.get(`${roomName}`);
      if (room.status === 'failed' || room.status === 'detached') {
        throw new NotFoundException('Room not Found');
      }
      const updated = message.copy({ text: `${updatedMessage}` });
      await room.messages.update(updated.serial, updated, {
        description: 'Message updated by the user!',
      });
      return { message: 'Message updated successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        "Message didn't update successfully!",
      );
    }
  }

  //delete message in room
  async deleteMessage(
    message: Message,
    roomName: string,
  ): Promise<{ message: string }> {
    try {
      const room = await this.chatClient.rooms.get(`${roomName}`);
      if (room.status === 'failed' || room.status === 'detached') {
        throw new NotFoundException('Room not Found');
      }

      await room.messages.delete(message.serial);
    } catch (error) {
      throw new InternalServerErrorException(
        "Message didn't delete successfully",
      );
    }
    return { message: 'Message Deleted Successfully' };
  }
  //subscribe to rooms
  async subscribeToRoom(
    userId: string,
    roomName: string,
    onMessage: (msg: ChatMessageEvent) => void,
  ) {
    const room = await this.chatClient.rooms.get(roomName);

    if (room.status == 'attached') {
      room.attach();
    }
    const { unsubscribe } = room.messages.subscribe((msg: ChatMessageEvent) => {
      this.logger.log(`New message in ${roomName}: ${msg.message.text}`);
      onMessage(msg);
    });

    this.subscriptions.set(`${userId}:${roomName}`, unsubscribe);

    this.logger.log(`User: ${userId} is subscribed to room: ${roomName}`);
  }

  //unsubscribe but not detach
  async unsubscribeToRoom(userId: string, roomName: string) {
    const data = `${userId}:${roomName}`;
    const unsubscribe = this.subscriptions.get(data);

    try {
      if (unsubscribe) {
        unsubscribe();
        this.subscriptions.delete(data);
        this.logger.log(`${userId} unsubscribed Room: ${roomName}`);
      } else {
        this.logger.warn(`${userId} is not subcribed to Room: ${roomName}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to unsubscribe ${userId} to room ${roomName} error: ${error.message}`,
      );
    }
  }
  //getting history
  async getMessages(roomName: string): Promise<Message[]> {
    const room = await this.chatClient.rooms.get(roomName);

    if (room.status === 'failed' || room.status === 'detached') {
      throw new NotFoundException(`Room ${roomName} is not available`);
    }
    const history = await room.messages.history({
      orderBy: OrderBy.NewestFirst,
      limit: 50,
    });
    const messages = history.items;
    if (history.hasNext()) {
      this.logger.log(`More messages available in ${roomName}`);
    } else {
      this.logger.log(`End of messages in ${roomName}`);
    }
    return messages;
  }
}

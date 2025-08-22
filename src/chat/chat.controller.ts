import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);
  constructor(private readonly chatservice: ChatService) {}

  @Post('rooms/:roomName')
  async createRoom(@Param('roomName') roomName: string) {
    return this.chatservice.createRoom(roomName);
  }
  @Post(':room/subscribe')
  async subscribeToRoom(
    @Param('room') roomName: string,
    @Body() body: { userId: string },
  ) {
    return this.chatservice.subscribeToRoom(body.userId, roomName, (msg) => {
      this.logger.log(`New message in ${roomName}: ${msg.message.text}`);
    });
  }

  @Post(':room/sendMessage')
  async sendMessage(
    @Param('room') roomName: string,
    @Body() body: { message: string },
  ) {
    return this.chatservice.sendMessage(roomName, body.message);
  }

  @Get(':room/getMessage')
  async GetMessage(@Param('room') roomName: string) {
    return this.chatservice.getMessages(roomName);
  }

  @Post(':room/unsubscribe')
  async unsubscribeToRoom(
    @Param('room') roomName: string,
    @Body() body: { userId: string },
  ) {
    return this.chatservice.subscribeToRoom(body.userId, roomName, (msg) => {
      this.logger.log(`New message in ${roomName}: ${msg.message.text}`);
    });
  }
}

import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class OrderStatusGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private server: Server;

  afterInit(server: Server) {
    this.server = server;
    console.log('Socket server initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinOrderRoom')
  handleJoinRoom(@MessageBody() data: { orderId: string }, @ConnectedSocket() client: Socket) {
    client.join(data.orderId);
    console.log(`Client joined room: ${data.orderId}`);
  }

  @SubscribeMessage('leaveOrderRoom')
  handleLeaveRoom(@MessageBody() data: { orderId: string }, @ConnectedSocket() client: Socket) {
    client.leave(data.orderId);
    console.log(`Client left room: ${data.orderId}`);
  }

  emitOrderStatusUpdate(orderId: string, status: string) {
    this.server.to(orderId).emit('orderStatusUpdate', {
      orderId,
      status,
    });
  }
}

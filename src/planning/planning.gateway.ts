import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection, 
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { AuthService } from 'src/auth/auth.service';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: true, namespace: '/planning' })
export class PlanningGateway implements OnGatewayConnection, OnGatewayDisconnect {

  // socket initialization
  @WebSocketServer() server: any;

  constructor(private readonly authService: AuthService) {}

  /**
   * Socket connected
   * 
   * @param client 
   * @param args 
   */
  handleConnection(client: any, ...args: any[]) {
    
  }


  /**
   * socket disconnected
   */
  handleDisconnect(client: any) {
    throw new Error('Method not implemented.');
  }

  @SubscribeMessage('onRoomCreate')
  onRoomCreate(client: Socket, data: any) {
    client.emit('ROOM_CREATE_REQUEST_ACCEPTED', {
      room: { id: 'roomId', name: 'roomName' },
    });
  }
}

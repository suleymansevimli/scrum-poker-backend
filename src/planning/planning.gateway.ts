import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  WsResponse,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthGateway } from 'src/auth/auth.gateway';

@WebSocketGateway({ cors: true, namespace: '/planning' })
export class PlanningGateway implements OnGatewayConnection, OnGatewayDisconnect {

  // logger for cli / debug
  private logger: Logger = new Logger('PlanningGateway');

  // socket initialization
  @WebSocketServer() server: any;

  constructor(private readonly authGateway?: AuthGateway) { }

  /**
   * Kullanıcının socket bağlantısı sağlandı.
   * 
   * @author [suleymansevimli](https://github.com/suleymansevimli)
   * 
   * @param client 
   * @param args
   */
  handleConnection(client: Socket, args: any) {
    this.logger.error(`Client connected: ${client.id}`);
    this.server.emit("getAllTasks", {id: 1, name: "test", users: this.authGateway.users});
  }

  /**
   * Kullanıcının socket bağlantısı kesildi.
   * @param client 
   */
  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // @SubscribeMessage('getAllTasks')
  // handleEvent(@MessageBody() data: unknown): WsResponse<unknown> {
  //   const event = 'getAllTasks';
  //   this.server.emit(event, { "emitter": "planning" });
  //   return { event, data: {test: "test"} };
  // }

}
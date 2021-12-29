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
import { UserInterface } from 'src/auth/interfaces/user.interfaces';
import { PLANNING_EVENT_TYPES } from './enums/event-enums';
import { Task } from './interfaces/planning.interfaces';

@WebSocketGateway({ cors: true, namespace: '/planning' })
export class PlanningGateway{

  // logger for cli / debug
  private logger: Logger = new Logger('PlanningGateway');

  // mock data 
  tasks: Task[] = [];
  currentTask: Task;
  users: UserInterface[] = [];

  // socket initialization
  @WebSocketServer() server: any;

  constructor(private readonly authGateway: AuthGateway) {}

  /**
   * Kullanıcının socket bağlantısı sağlandı.
   * 
   * @param client 
   * @param args
   * 
   * @author [suleymansevimli](https://github.com/suleymansevimli)
   */
  handleConnection(client: Socket, args: any) {
    client.emit(PLANNING_EVENT_TYPES.GET_ALL_TASKS, { tasks: this.tasks });
    
    this.logger.error(`Planning - Client connected: ${client.id} `);
    this.logger.error('all-users',JSON.stringify(this.authGateway.users));
  }

  /**
   * Kullanıcının socket bağlantısı kesildi.
   * 
   * @param client 
   * 
   * @author [suleymansevimli](https://github.com/suleymansevimli)
   */
  handleDisconnect(client: any) {
    this.logger.log(`Planning - Client disconnected: ${client.id}`);
  }

  // @SubscribeMessage('getAllTasks')
  // handleEvent(@MessageBody() data: unknown): WsResponse<unknown> {
  //   const event = 'getAllTasks';
  //   this.server.emit(event, { "emitter": "planning" });
  //   return { event, data: {test: "test"} };
  // }

  @SubscribeMessage('createTask')
  createTask(client: Socket, args: any): any  {
    this.logger.log(`Planning - Client createTask: ${client.id}`);
    client.emit('craete-task-request-accepted', {task: args});
  }
}
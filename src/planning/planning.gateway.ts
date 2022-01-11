import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { randomUUID } from 'crypto';
import { Socket } from 'socket.io';
import { AuthGateway } from 'src/auth/auth.gateway';
import { UserInterface } from 'src/auth/interfaces/user.interfaces';
import { PLANNING_EVENT_TYPES } from './enums/event-enums';
import { TASK_WITH_STATUS } from './enums/type-enums';
import { Task } from './interfaces/planning.interfaces';

@WebSocketGateway({ cors: true, namespace: '/planning' })
export class PlanningGateway {

  // logger for cli / debug
  private logger: Logger = new Logger('PlanningGateway');

  // mock data 
  tasks: Task[] = [];
  currentTask: Task;
  users: UserInterface[] = [];

  // socket initialization
  @WebSocketServer() server: any;

  /**
   * Constructor Method
   * 
   * @param {AuthGateway} authGateway 
   */
  constructor(private readonly authGateway: AuthGateway) {
    this.users = this.authGateway.users;
  }

  /**
   * Kullanıcının socket bağlantısı sağlandı.
   * 
   * @param client 
   * @param args
   * 
   * @author [suleymansevimli](https://github.com/suleymansevimli)
   */
  handleConnection(client: Socket, args: any) {
    this.logger.error(`Planning - Client connected: ${client.id} `);
    this.logger.error('all-users', JSON.stringify(this.users));
    client.emit(PLANNING_EVENT_TYPES.GET_ALL_TASKS, { tasks: this.tasksWithStatus() })
  }

  /**
   * Kullanıcının socket bağlantısı kesildi.
   * 
   * @param client 
   * 
   * @author [suleymansevimli](https://github.com/suleymansevimli)
   */
  handleDisconnect(client: Socket) {
    this.logger.error(`Planning - Client disconnected: ${client.id}`);
  }

  /**
   * Taskları status durumuna göre döner.
   * 
   * @returns {TASK_WITH_STATUS} 
   */
  tasksWithStatus(): TASK_WITH_STATUS {
    const getAllTasksWithStatus: TASK_WITH_STATUS = {
      OPEN: this.tasks.filter(task => task.status === 'OPEN'),
      IN_PROGRESS: this.tasks.filter(task => task.status === 'IN_PROGRESS'),
      DONE: this.tasks.filter(task => task.status === 'DONE')
    }

    return getAllTasksWithStatus;
  }

  /**
   * Oda sahibi task oluşturmak istediğinde bu fonksiyon çağrılır.
   * 
   * @param client Socket client
   * @param {name: string, description: string} {name, description} Socket arguments
   */
  @SubscribeMessage(PLANNING_EVENT_TYPES.CREATE_TASK_REQUESTED)
  createTask(client: Socket, args: { name: string, description: string }): any {
    this.logger.log(`Planning - Client createTask: ${client.id}`);

    const { name, description } = args;

    const task: Task = {
      id: randomUUID(),
      description,
      name,
      status: 'OPEN',
      storyPoint: null,
      usersRating: []
    }

    // push to tasks array
    this.tasks.push(task);

    this.server.emit(PLANNING_EVENT_TYPES.CREATE_TASK_REQUEST_ACCEPTED, { task });
    this.server.emit(PLANNING_EVENT_TYPES.GET_ALL_TASKS, { tasks: this.tasksWithStatus() })
  }
}
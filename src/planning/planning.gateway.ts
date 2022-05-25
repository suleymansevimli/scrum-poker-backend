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
import { User } from 'src/auth/models/User';
import { PLANNING_EVENT_TYPES } from './enums/event-enums';
import { TASK_STATUS_ENUMS, TASK_WITH_STATUS, USER_RATING_STORY_POINTS } from './enums/type-enums';
import { Task } from './models/Task';

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

    // Connection sağlandığında kullanıcıya tüm taskları gönder.
    client.emit(PLANNING_EVENT_TYPES.GET_ALL_TASKS, { tasks: this.tasksWithStatus() });
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
   * 
   * @author [suleymansevimli](https://github.com/suleymansevimli)
   */
  tasksWithStatus() {
    const getAllTasksWithStatus = {
      OPEN: this.tasks.filter(task => task.getStatus() === TASK_STATUS_ENUMS.OPEN),
      IN_PROGRESS: this.tasks.filter(task => task.getStatus() === TASK_STATUS_ENUMS.IN_PROGRESS),
      DONE: this.tasks.filter(task => task.getStatus() === TASK_STATUS_ENUMS.DONE)
    }

    return getAllTasksWithStatus;
  }

  /**
   * Oda sahibi task oluşturmak istediğinde bu fonksiyon çağrılır.
   * 
   * @param client Socket client
   * @param {name: string, description: string} {name, description} Socket arguments
   * 
   * @author [suleymansevimli](https://github.com/suleymansevimli)
   */
  @SubscribeMessage(PLANNING_EVENT_TYPES.CREATE_TASK_REQUESTED)
  createTask(client: Socket, args: { name: string, description: string }): any {
    this.logger.log(`Planning - Client createTask: ${client.id}`);

    // gelen parametreleri al.
    const { name, description } = args;

    // Yeni task oluştur.
    const task = new Task(name, description);

    // Oluşturulan task'ı tasks içerisine ekle
    this.tasks.push(task);

    // Kullanıcıları bilgilendir.
    this.server.emit(PLANNING_EVENT_TYPES.CREATE_TASK_REQUEST_ACCEPTED, { task });
    this.server.emit(PLANNING_EVENT_TYPES.GET_ALL_TASKS, { tasks: this.tasksWithStatus() });
  }

  /**
   * 
   * Oylama başlatılmak istendiğinde bu fonksiyon çağrılır.
   * 
   * @param client 
   * @param args 
   * 
   * @author [suleymansevimli](https://github.com/suleymansevimli)
   */
  @SubscribeMessage(PLANNING_EVENT_TYPES.START_VOTING_REQUESTED)
  startVoting(client: Socket, args: { taskId: String }): any {

    // Hangi task için oylama başlatıldı ?
    const currentTask = this.tasks.find(task => task.getTaskId() === args.taskId);

    // Task status'unu güncelle
    currentTask.setStatus(TASK_STATUS_ENUMS.IN_PROGRESS);

    // Current task'ı belirle
    this.currentTask = currentTask;

    // Diğer kullanıcıları bilgilendir.
    this.server.emit(PLANNING_EVENT_TYPES.START_VOTING_REQUEST_ACCEPTED, { task: this.currentTask });
  }

  /**
   * 
   * Oylamayı bitirmek istediğinde bu fonksiyon çağrılır.
   * 
   * @param client 
   * @param args 
   * 
   * @author [suleymansevimli](https://github.com/suleymansevimli)
   */
  @SubscribeMessage(PLANNING_EVENT_TYPES.STOP_VOTING_REQUESTED)
  stopVoting(client: Socket, args: { id: String }): any {

    // this.currentTask.usersRating = this.currentTask.usersRating.map(userRating => {
    //   userRating.rating = '-'
    //   return userRating;
    // });

    // // Task durumunu DONE olarak setle
    // this.currentTask.setStatus(TASK_STATUS_ENUMS.DONE);

    // const doneTask = this.currentTask;

    // this.tasks.push(this.currentTask);

    // this.currentTask = {
    //   id: '',
    //   description: '',
    //   name: '',
    //   storyPoint: null,
    //   usersRating: [],
    //   status: 'OPEN',
    // };

    // this.server.emit(PLANNING_EVENT_TYPES.STOP_VOTING_REQUEST_ACCEPTED, { task: doneTask });
  }

  /**
   * Vote Task
   * 
   * @description Task oylamak istendiğinde bu fonksiyon çağrılır.
   * 
   * @param client 
   * @param args 
   */
  @SubscribeMessage(PLANNING_EVENT_TYPES.VOTE_REQUESTED)
  vote(client: Socket, args: { user: UserInterface, vote: USER_RATING_STORY_POINTS }): any {

    // Gelen değerleri al
    const { user, vote } = args;

    // Task'ın userVoteList'ini güncelle
    this.currentTask.setUserVoteList({ user, vote });

    // Güncellenen userVoteList'i tekrar gönder
    this.server.emit(PLANNING_EVENT_TYPES.CURRENT_USER_VOTE_LIST_UPDATED, { userVoteList: this.currentTask.getuserVoteList() });

    // Kullanıcıyı bilgilendir.
    client.emit(PLANNING_EVENT_TYPES.VOTE_REQUEST_ACCEPTED, { task: null, })

  }
}
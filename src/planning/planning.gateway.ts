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
import { TASK_WITH_STATUS, USER_RATING_STORY_POINTS } from './enums/type-enums';
import { Task } from './interfaces/planning.interfaces';

@WebSocketGateway({ cors: true, namespace: '/planning' })
export class PlanningGateway {

  // logger for cli / debug
  private logger: Logger = new Logger('PlanningGateway');

  // mock data 
  tasks: Task[] = [];
  currentTask: Task;
  users: UserInterface[] = [];
  userRatingList: { user: UserInterface, rating: String }[] = [];

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
    client.emit(PLANNING_EVENT_TYPES.GET_ALL_USER_RATING_LIST, { userRatingList: this.userRatingList })
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
   * 
   * @author [suleymansevimli](https://github.com/suleymansevimli)
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
  startVoting(client: Socket, args: { id: String }): any {

    const currentTask = this.tasks.find(task => task.id === args.id);
    currentTask.status = 'IN_PROGRESS';

    this.currentTask = currentTask;

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
    
    this.currentTask.usersRating = this.currentTask.usersRating.map(userRating => {
      userRating.rating = '-'
      return userRating;
    });

    this.currentTask.status = 'DONE';

    const doneTask = this.currentTask;

    this.tasks.push(this.currentTask);

    this.currentTask = {
      id: '',
      description: '',
      name: '',
      storyPoint: null,
      usersRating: [],
      status: 'OPEN',
    };

    this.server.emit(PLANNING_EVENT_TYPES.STOP_VOTING_REQUEST_ACCEPTED, { task: doneTask });
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
  vote(client: Socket, args: { user: UserInterface, rate: USER_RATING_STORY_POINTS, votingTask: Task, roomId: String }): any {

    const { user, rate, votingTask, roomId } = args;
    const isUserAlreadyVoted = this.currentTask.usersRating.find(userRating => userRating.user.uniqueId === user.uniqueId);

    if (isUserAlreadyVoted) {
      this.tasks.find(task => task.id === votingTask.id).usersRating.find(userRating => userRating.user.uniqueId === user.uniqueId).rating = rate;
    } else {
      this.currentTask.usersRating.push({ user, rating: rate });
    }

    // user rating list
    const ratedUsers = this.currentTask.usersRating.map(userRating => {
      return {
        user: { uniqueId: userRating.user.uniqueId, name: userRating.user.userName },
        rating: userRating.rating
      }
    });
    

    // ! Joined Room
    const joinedRoom = this.authGateway.rooms.find(room => room.id === roomId);
    const roomUsers = joinedRoom.users;

    const userRatingList = roomUsers.map(user => {
      const userRating = ratedUsers.find(userRating => userRating.user.uniqueId === user.uniqueId);
      return {
        user,
        rating: userRating ? userRating.rating : "-"
      }
    });

    this.logger.error(JSON.stringify(userRatingList, undefined, 4));

    // save 
    this.userRatingList = userRatingList;
    this.server.emit(PLANNING_EVENT_TYPES.VOTE_REQUEST_ACCEPTED, { task: this.currentTask, userRatingList });

  }
}
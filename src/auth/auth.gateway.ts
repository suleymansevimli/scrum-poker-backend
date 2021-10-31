import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsResponse
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AUTH_EVENT_ENUMS } from './enums/event-enums';
import { v4 as uuid } from 'uuid';

@WebSocketGateway({ cors: true })
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {

  // logger for cli / debug
  private logger: Logger = new Logger('AuthGateway');

  // socket initialization
  @WebSocketServer() server;

  // Mock data
  users: User[] = []

  /**
   * Kullanıcının socket bağlantısı sağlandı.
   * 
   * @param client 
   * @param args
   * 
   * @author suleymansevimli
   */
  async handleConnection(client: Socket, args: any) {
    this.server.emit(AUTH_EVENT_ENUMS.GET_ALL_USERS, this.users)
    this.logger.error("User connected", client.id);
  }

  /**
   * Kullanıcının socket bağlantısı kesildi.
   * 
   * @author suleymansevimli
   */
  async handleDisconnect(client: Socket) {
    this.logger.error("User disconnected", client.id);
    this.server.emit(AUTH_EVENT_ENUMS.GET_ALL_USERS, this.users);
  }

  /**
   * Username setleme işlevi bu method üzerinden ele alınır.
   * @param client 
   * @param args 
   * 
   * @author suleymansevimli
   */
  @SubscribeMessage('SetUserNameRequest')
  onUserNameSetted(client: Socket, args: User) {
    const { userName } = args;

    // kullanıcı daha önce eklenmiş mi ?
    const findUser = this.users.find(user => user.userName === userName);
    if (findUser) {
      client.emit(AUTH_EVENT_ENUMS.USER_ALREADY_EXISTS, findUser);
      return;
    }

    // Var olmayan bir kullanıcı ise listeye yeni gelen kişiyi ekle
    const newUser: User = { userName, id: client.id, uniqueId: uuid() }

    this.users.push(newUser);

    this.server.emit(AUTH_EVENT_ENUMS.NEW_USER_JOINED, newUser);
    this.server.emit(AUTH_EVENT_ENUMS.GET_ALL_USERS, this.users);

    this.logger.error("New User joined", { userName, id: client.id });
  }

  /**
   * Kullanıcı sayfayı yeniledi ya da başka bir nedenle bağlantısı koparsa bu fonksiyon devreye girer.
   * 
   * @author suleymansevimli
   * 
   * @param client 
   * @param args 
   */
  @SubscribeMessage("reJoinAllreadyLoginedUser")
  reJoinAllreadyLoginedUser(client: Socket, args: User) {
    const { userName } = args;

    const reConnectedUser = { id: client.id, userName };

    let foundedUser = this.users.find(user => user.userName === userName);

    if (foundedUser) {
      this.logger.error("user re joined -- founded", userName);
      foundedUser = reConnectedUser;
      this.server.emit(AUTH_EVENT_ENUMS.GET_ALL_USERS, this.users);
      this.server.to(AUTH_EVENT_ENUMS.USER_RE_JOINED, reConnectedUser);
    }

    this.logger.error("user re joined", userName);
  }

  /**
   * Yeni bir oda kurmak istenildiğinde bu fonksiyon tetiklenir.
   * 
   * @author suleymansevimli
   * 
   * @param {Socket} client 
   * @param {any} data 
   * @returns 
   */
  @SubscribeMessage('newRoomCreateRequest')
  createRoom(client: Socket, data: any): WsResponse<unknown> {
    client.join(data.roomName)
    client.to(data.roomName).emit('newRoomCreated', { roomName: data.roomName });
    this.logger.log('Room members', client)
    debugger

    return {
      event: "newRoomCreated", data: { room: data.roomName }
    }
  }

  @SubscribeMessage("leaveRoom")
  leaveRoom(client: Socket, data: any) {

  }
}
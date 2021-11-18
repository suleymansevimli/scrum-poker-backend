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

@WebSocketGateway({ cors: true, namespace: '/auth' })
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {

  // logger for cli / debug
  private logger: Logger = new Logger('AuthGateway');

  // socket initialization
  @WebSocketServer() server: any;

  // Mock data
  users: User[] = []

  /**
   * Kullanıcının socket bağlantısı sağlandı.
   * 
   * @author suleymansevimli
   * 
   * @param client 
   * @param args
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
   * @author suleymansevimli
   * 
   * @param client 
   * @param args 
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

    // tüm kullanıcılara gönderilen eventler
    this.server.emit(AUTH_EVENT_ENUMS.NEW_USER_JOINED, newUser);
    this.server.emit(AUTH_EVENT_ENUMS.GET_ALL_USERS, this.users);

    // ilgili kullanıcıya kabul edildiğine dair gönderilen event.
    client.emit(AUTH_EVENT_ENUMS.LOGIN_REQUEST_ACCEPTED, newUser);

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
   * 
   * Logout işlemi bu fonksiyon üzerinden tetiklenir.
   * 
   * @param client 
   * @param data 
   */
  @SubscribeMessage("userLogoutRequest")
  onUserLoggedOut(client: Socket, data: any) {
    const loggedOutUser = this.users.find(user => user.id === client.id);
    if (loggedOutUser) {
      this.users = this.users.filter(user => user.id !== client.id);
      this.server.emit(AUTH_EVENT_ENUMS.GET_ALL_USERS, this.users);
      this.server.emit(AUTH_EVENT_ENUMS.USER_LOGGED_OUT, loggedOutUser);
      client.emit(AUTH_EVENT_ENUMS.LOGOUT_REQUEST_ACCEPTED, loggedOutUser);
    }
    this.logger.error("User logged out", loggedOutUser);
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

    return {
      event: "newRoomCreated", data: { room: data.roomName }
    }
  }

  /**
   * 
   * İlgili kullanıcı odadan atılmak istendiğinde bu fonksiyon tetiklenir.
   * 
   * @author [sulaimansevimli](https://github.com/suleymansevimli)
   * 
   * @param client Bağlı olan kullanıcı
   * @param data: { roomName: string } değerini barındırır
   */
  @SubscribeMessage("leaveRoom")
  leaveRoom(client: Socket, data: any) {
      client.leave(data.roomName)
  }
}
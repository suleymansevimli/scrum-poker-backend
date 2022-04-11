import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AUTH_EVENT_ENUMS } from './enums/event-enums';
import { v4 as uuid } from 'uuid';
import { UserInterface, RoomInterface, ErrorInterface } from './interfaces/user.interfaces';
import { LIVELINESS_STATUS_ENUMS } from './enums/liveliness-status.enums';

@WebSocketGateway({ cors: true, namespace: '/auth' })
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {

  // logger for cli / debug
  private logger: Logger = new Logger('AuthGateway');

  // socket initialization
  @WebSocketServer() server: any;

  // Mock data
  users: UserInterface[] = [];
  rooms: RoomInterface[] = [];

  /**
   * Kullanıcının socket bağlantısı sağlandı.
   * 
   * @author [suleymansevimli](https://github.com/suleymansevimli)
   * 
   * @param client 
   * @param args
   */
  handleConnection(client: Socket, args: any) {

    this.server.emit(AUTH_EVENT_ENUMS.GET_ALL_USERS, this.users)
    client.emit(AUTH_EVENT_ENUMS.USER_CONNECTED, { id: client.id });
    this.server.emit(AUTH_EVENT_ENUMS.GET_ALL_ROOMS, this.rooms);
  }

  /**
   * Kullanıcının socket bağlantısı kesildi.
   * 
   * @author [suleymansevimli](https://github.com/suleymansevimli)
   */
  handleDisconnect(client: Socket) {
    const foundedUser = this.users.find(user => user.id === client.id);
    if (foundedUser) {
      foundedUser.livelinessStatus = LIVELINESS_STATUS_ENUMS.OFFLINE;
      this.users.find(user => user.id === client.id).livelinessStatus = LIVELINESS_STATUS_ENUMS.OFFLINE;
      this.server.emit(AUTH_EVENT_ENUMS.GET_ALL_USERS, this.users);
      this.server.emit(AUTH_EVENT_ENUMS.USER_DISCONNECTED, foundedUser);
    }
  }

  /**
   * Username setleme işlevi bu method üzerinden ele alınır.
   * 
   * @author [suleymansevimli](https://github.com/suleymansevimli)
   * 
   * @param client 
   * @param args 
   */
  @SubscribeMessage(AUTH_EVENT_ENUMS.SET_USER_NAME_REQUEST)
  onUserNameSetted(client: Socket, args: UserInterface) {
    const { userName } = args;

    // kullanıcı daha önce eklenmiş mi ?
    const findUser = this.users.find(user => user.userName === userName);
    if (findUser) {
      client.emit(AUTH_EVENT_ENUMS.USER_ALREADY_EXISTS, findUser);
      return;
    }

    // Var olmayan bir kullanıcı ise listeye yeni gelen kişiyi ekle
    const newUser: UserInterface = {
      userName,
      id: client.id,
      uniqueId: uuid(),
      livelinessStatus: LIVELINESS_STATUS_ENUMS.ONLINE
    };

    this.users.push(newUser);

    // tüm kullanıcılara gönderilen eventler
    // this.server.emit(AUTH_EVENT_ENUMS.NEW_USER_JOINED, newUser);
    this.server.emit(AUTH_EVENT_ENUMS.GET_ALL_USERS, this.users);

    // ilgili kullanıcıya kabul edildiğine dair gönderilen event.
    client.emit(AUTH_EVENT_ENUMS.LOGIN_REQUEST_ACCEPTED, newUser);
  }

  /**
   * Tekrar giriş yapan kullanıcının bilgilerini almak için bu fonksiyon çağrılır.
   * 
   * @author [suleymansevimli](https://github.com/suleymansevimli)
   * 
   * @param client Socket client
   * @param data Gelen data
   * @returns {void}
   */
  @SubscribeMessage(AUTH_EVENT_ENUMS.GET_RE_JOIN_ALREADY_LOGINED_USER)
  getReJoinAlreadyLoginedUser(client: Socket, data: any) {
    const { uniqueId } = data;
    const findUser: UserInterface = this.users.find(user => user.uniqueId === uniqueId);
    if (findUser) {
      findUser.id = client.id;
      findUser.livelinessStatus = LIVELINESS_STATUS_ENUMS.ONLINE;
      client.emit(AUTH_EVENT_ENUMS.RE_JOIN_ALREADY_LOGINED_USER, findUser);

      this.users.find(user => user.uniqueId === uniqueId).id = client.id;
      this.server.emit(AUTH_EVENT_ENUMS.GET_ALL_USERS, this.users);

      // this.server.sockets.adapter.rooms[data.roomName];

      // User's joined rooms
      const userJoinedRoom = this.rooms.reverse().find(room => room.users.find(user => user.uniqueId === findUser.uniqueId));
      if (userJoinedRoom) {
        client.emit(AUTH_EVENT_ENUMS.NEW_ROOM_CREATE_ACCEPTED, userJoinedRoom ?? {});
        this.server.emit(AUTH_EVENT_ENUMS.NEW_USER_JOINED, findUser);
      }

    } else {
      this.onUserLoggedOut(client, null);
    }
  }

  /**
   * Kullanıcı sayfayı yeniledi ya da başka bir nedenle bağlantısı koparsa bu fonksiyon devreye girer.
   * 
   * @author [suleymansevimli](https://github.com/suleymansevimli)
   * 
   * @param client 
   * @param args 
   */
  @SubscribeMessage(AUTH_EVENT_ENUMS.RE_JOIN_ALREADY_LOGINED_USER)
  reJoinAllreadyLoginedUser(client: Socket, args: UserInterface) {
    const { userName } = args;
    const reConnectedUser = { id: client.id, userName };

    let foundedUser = this.users.find(user => user.userName === userName);

    if (foundedUser) {
      foundedUser = reConnectedUser;
      this.server.emit(AUTH_EVENT_ENUMS.GET_ALL_USERS, this.users);
      this.server.to(AUTH_EVENT_ENUMS.USER_RE_JOINED, reConnectedUser);

      // ! Kullanıcı tekrar room'a join olacak.
    }
  }

  /**
   * 
   * Logout işlemi bu fonksiyon üzerinden tetiklenir.
   * 
   * @author [suleymansevimli](https://github.com/suleymansevimli)
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

      // ! user should be removed from joined rooms
    }
  }

  /**
   * Yeni bir oda kurmak istenildiğinde bu fonksiyon tetiklenir.
   * 
   * @author [suleymansevimli](https://github.com/suleymansevimli)
   * 
   * @param {Socket} client 
   * @param {any} data 
   * @returns 
   */
  @SubscribeMessage(AUTH_EVENT_ENUMS.NEW_ROOM_CREATE_REQUEST)
  createRoom(client: Socket, data: any) {
    // check if room already exists
    const roomExists = this.rooms.find(room => room.roomName === data.roomName);
    if (roomExists) {
      // return room already exists
      client.emit(AUTH_EVENT_ENUMS.NEW_ROOM_CREATE_REJECTED, { reason: "ALREADY_EXISTS", message: "Oda zaten mevcut" });
      return;
    }

    // create a new room
    client.join(data.roomName);

    // creator user
    let whichUserCreatedRoom: UserInterface = this.users.find(user => user.id === client.id);

    // new room's informations
    const roomData: RoomInterface = {
      roomName: data.roomName,
      users: [whichUserCreatedRoom],
      id: uuid(),
      slug: data.roomName.trim(" ").replace(/\s/g, '-').toLowerCase(), // create slug
      roomOwner: whichUserCreatedRoom
    }

    // add room to room list
    this.rooms.push({ ...roomData });

    // update room list
    this.server.emit(AUTH_EVENT_ENUMS.UPDATED_ALL_ROOMS, this.rooms);

    // accept message to client
    client.emit(AUTH_EVENT_ENUMS.NEW_ROOM_CREATE_ACCEPTED, { ...roomData });

  }

  /**
   * 
   * İlgili kullanıcı odadan atılmak istendiğinde bu fonksiyon tetiklenir.
   * 
   * @author [suleymansevimli](https://github.com/suleymansevimli)
   * 
   * @param client Bağlı olan kullanıcı
   * @param data: { roomName: string } değerini barındırır
   */
  @SubscribeMessage("leaveRoom")
  leaveRoom(client: Socket, data: any) {
    client.leave(data.roomName)
  }

  /**
   * Room Join Request
   * 
   * When user want join a room, this function will be called.
   * 
   * @param client Socket client
   * @param data arguments from client
   */
  @SubscribeMessage(AUTH_EVENT_ENUMS.ROOM_JOIN_REQUEST)
  roomJoinRequest(client: Socket, data: any) {
    const { slug } = data;
    const room = this.rooms.find(room => room.slug === slug);

    if (room) {
      client.join(slug);
      const isUserExist = room.users.find(user => user.id === client.id);
      if (!isUserExist) {
        const user = this.users.find(user => user.id === client.id);
        if (user) {
          room.users.push(user);
        }
      }
      this.server.emit(AUTH_EVENT_ENUMS.ROOM_JOIN_ACCEPTED, room);
    } else {
      client.emit(AUTH_EVENT_ENUMS.ROOM_JOIN_REJECTED, this.createError("NOT_FOUND", "Oda bulunamadı"));
    }
  }

  /**
   * Create error object
   * 
   * @param {String} message error message 
   * @param {String} reason  error reason
   * @returns 
   */
  createError(reason: String, message: String,): ErrorInterface {
    return {
      message,
      reason
    }
  }
}
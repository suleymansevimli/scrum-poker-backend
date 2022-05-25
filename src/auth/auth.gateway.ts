import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsResponse,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AUTH_EVENT_ENUMS } from './enums/event-enums';
import { v4 as uuid } from 'uuid';
import { UserInterface, RoomInterface, ErrorInterface } from './interfaces/user.interfaces';
import { LIVELINESS_STATUS_ENUMS } from './enums/liveliness-status.enums';
import { User } from './models/User';
import { USER_TYPE_ENUMS } from './enums/enums';
import { Room } from './models/Room';

@WebSocketGateway({ cors: true, namespace: '/auth' })
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {

  // logger for cli / debug
  private logger: Logger = new Logger('AuthGateway');

  // socket initialization
  @WebSocketServer() server: any;

  // Mock data
  users: User[] = [];
  room: Room;

  /**
   * Kullanıcının socket bağlantısı sağlandı.
   * 
   * @author [suleymansevimli](https://github.com/suleymansevimli)
   * 
   * @param client 
   * @param args
   */
  handleConnection(client: Socket, args: any) {
    // Kullanıcı socket id değerini bilsin.
    client.emit(AUTH_EVENT_ENUMS.USER_CONNECTED, { id: client.id });
  }

  /**
   * Kullanıcının socket bağlantısı kesildi.
   * 
   * @author [suleymansevimli](https://github.com/suleymansevimli)
   */
  handleDisconnect(client: Socket) {

    // Hangi kullanıcı disconnected oldu ?
    const findUser: User = this.users.find(user => user.socketId === client.id);

    // Kullanıcı bulunamadı ise bir şey yapma.
    if (!findUser) {
      return
    }

    // Kullanıcının liveliness statusu offline yapılır.
    findUser.setLivelinessStatus(LIVELINESS_STATUS_ENUMS.OFFLINE);

    // Diğer kullanıcılar bilgilendirilir.
    this.server.emit(AUTH_EVENT_ENUMS.GET_ALL_USERS, this.users);

    // // Eğer kullanıcı admin type'ında ise ADMIN statusu olarak bir sonraki kullanıcıya atanır.
    // if (findUser.userType === USER_TYPE_ENUMS.ADMIN) {
    // TODO : Başka bir kullanıcı admin status'une geçecek.
    // TODO : UserTypeChanged event'i gönderilecek.
    // }


    // // Kullanıcının bulunduğu odalardan leave yapılır
    //  TODO : Room class'ı oluşturulduktan sonra bu alan doldurulacak.
    //  TODO: room içerisinde bulunan users alanından silinecek
    //  TODO: Room owner ise kullanıcılardan bir tanesi room owner olarak setlenecek.

    // // Kullanıcı listesi güncellenir.
    // this.users = this.users.filter(user => user.socketId !== client.id);

    // // Diğer kullanıcılar bilgilendirilir.
    // this.server.emit(AUTH_EVENT_ENUMS.GET_ALL_USERS, this.users);

    // // kullanıcıya logout accepted mesajı gönderilir.
    // client.emit(AUTH_EVENT_ENUMS.LOGOUT_REQUEST_ACCEPTED, {});
  }

  /**
   * Username setleme işlevi bu method üzerinden ele alınır.
   * 
   * @author [suleymansevimli](https://github.com/suleymansevimli)
   * 
   * @param client 
   * @param args 
   */
  @SubscribeMessage(AUTH_EVENT_ENUMS.LOGIN_REQUEST)
  loginRequest(client: Socket, args: UserInterface) {
    const { userName } = args;

    // Kullanıcı daha önce eklenmiş mi ?
    const findUser = this.users.find(user => user.userName === userName);

    // Kullanıcı daha önce eklenmişse kullanıcıya hata mesajı gönderilir.
    if (findUser) {
      client.emit(AUTH_EVENT_ENUMS.USER_ALREADY_EXISTS, this.createError('UserNameAlreadyExisted', 'UserNameAlreadyExisted'));

      return;
    }

    // Listede yok ise yeni kullanıcı eklenir.
    const user = new User(userName, client.id);

    // Kullanıcı listesine eklenir.
    this.users.push(user);

    // Kullanıcının login işleminin başarılı olduğu bilgisi gönderilir.
    client.emit(AUTH_EVENT_ENUMS.LOGIN_REQUEST_ACCEPTED, user);

    // Diğer kullanıcılar bilgilendirilir.
    this.server.emit(AUTH_EVENT_ENUMS.GET_ALL_USERS, this.users);

  }

  /**
   * Tekrar giriş yapan kullanıcının bilgilerini almak için bu fonksiyon çağrılır.
   * 
   * @author [suleymansevimli](https://github.com/suleymansevimli)
   * 
   * @param {Socket} client Socket client
   * @param {any} data Gelen data
   * @returns {void}
   */
  @SubscribeMessage(AUTH_EVENT_ENUMS.GET_RE_JOIN_ALREADY_LOGINED_USER)
  getReJoinAlreadyLoginedUser(client: Socket, data: any) {

    // uniqueId parametresi gelen data içerisinde bulunmalıdır. 
    const { uniqueId } = data;

    // Kullanıcı users içerisinde bulunuyor mu ?
    const findUser: User = this.users.find(user => user.uniqueId === uniqueId);

    // Kullanıcı login olmuş ise 
    if (findUser) {

      // Kullanıcının socketId değeri güncellenir ve liveliness statusu online yapılır.
      findUser.setSocketId(client.id);
      findUser.setLivelinessStatus(LIVELINESS_STATUS_ENUMS.ONLINE);

      // Kullanıcı bilgilendirilir.
      client.emit(AUTH_EVENT_ENUMS.RE_JOIN_ALREADY_LOGINED_USER, findUser);

      // Diğer kullanıcılar bilgilendirilir.
      this.server.emit(AUTH_EVENT_ENUMS.GET_ALL_USERS, this.users);

      // TODO: Room içerisindeki userların içerisinde bulunuyorsa kullanıcı bilgileri güncellenir.
      // TODO: ROOM_JOIN_ACCEPTED event'i gönderilir.

    } else {
      this.onUserLoggedOut(client, null);
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

    // Hangi kullanıcı logout isteğinde bulundu ?
    const loggedOutUser = this.users.find(user => user.socketId === client.id);

    // Kullanıcı var ise 
    if (loggedOutUser) {
      this.users = this.users.filter(user => user.socketId !== client.id);
      this.server.emit(AUTH_EVENT_ENUMS.GET_ALL_USERS, this.users);
      client.emit(AUTH_EVENT_ENUMS.LOGOUT_REQUEST_ACCEPTED, loggedOutUser);

      // TODO: Kullanıcı eğer adminse oluşturduğu odadan çıkış yapması ve odanın silinmesi gerekir.
      // TODO: Room içerisindeki roomOwner parametresi yeni admin olan admin olan kullanıcının bilgisi ile güncellenmeli.
      // TODO: Eğer kullanıcı ADMİN değilse giriş yaptığı room'daki users listesinden kaldırılması gerekiyor.

      return;
    }

    // Kullanıcı yok ise hata mesajı gönderilir.
    // client.emit(AUTH_EVENT_ENUMS.LOGOUT_REQUEST_REJECTED, this.createError('UserNotFound', 'UserNotFound'));
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

    // Odayı hangi kullanıcı oluşturuyor ? 
    const roomCreator = this.users.find(user => user.socketId === client.id);

    // Odayı oluştur.
    const newRoom = new Room(data.roomName, roomCreator);
    this.room = newRoom;

    // Kullanıcı odaya join olsun.
    client.join(this.room.getSlug());

    // Kullanıcının user type'ı admin olsun
    roomCreator.setUserType(USER_TYPE_ENUMS.ADMIN);

    // Kullanıcıya admin olduğu ile ilgili bigilendirme yapılır.
    client.emit(AUTH_EVENT_ENUMS.USER_TYPE_CHANGED, { userType: roomCreator.getUserType() })

    // Kullanıcı listesini güncelle
    this.server.emit(AUTH_EVENT_ENUMS.GET_ALL_USERS, this.users);

    // Oda oluşturuldu bilgisini ilet.
    this.server.emit(AUTH_EVENT_ENUMS.NEW_ROOM_CREATE_ACCEPTED, this.room);

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

    // Socket üzerindeki odadan kullanıcıyı çıkar.
    client.leave(this.room.getSlug())

  }

  /**
   * Room Join Request
   * 
   * When user want join the room, this function will be called.
   * 
   * @param client Socket client
   * @param data arguments from client
   */
  @SubscribeMessage(AUTH_EVENT_ENUMS.ROOM_JOIN_REQUEST)
  roomJoinRequest(client: Socket, data: any) {

    const { slug } = data;

    // Oda oluşturulmuş ise ve gelen slug bilgisi ile uyuşuyorsa... 
    if (this.room && (this.room.getSlug() === slug)) {

      // Kullanıcıyı tüm userlar içerisinden bul
      const user = this.users.find(user => user.socketId === client.id);

      // user var ise 
      if (user) {

        // Kullanıcıyı socket üzerindeki room'a ekle
        client.join(this.room.getSlug());

        // Kullanıcıyı bilgilendir.
        this.server.emit(AUTH_EVENT_ENUMS.ROOM_JOIN_ACCEPTED, this.room.users);
      }
    } else {
      // Oda oluşturulmamış ise hata mesajı gönder.
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
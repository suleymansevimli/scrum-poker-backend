import { USER_TYPE_ENUMS } from "../enums/enums";
import { LIVELINESS_STATUS_ENUMS } from "../enums/liveliness-status.enums";
import { RoomInterface, UserInterface } from "../interfaces/user.interfaces";
import { v4 as uuid } from 'uuid';

export class User {

    public uniqueId: string;
    public socketId: string;
    public userName: string;
    public livelinessStatus: LIVELINESS_STATUS_ENUMS;
    public userType: USER_TYPE_ENUMS;

    /**
     * User Constructor Method
     * 
     * @param userName Kullanıcı username
     * @param socketId Kullanıcı socket id değeri
     */
    constructor(userName: string,  socketId: string) {
        this.userName = userName;
        this.uniqueId = uuid();
        this.socketId = socketId;
        this.livelinessStatus = LIVELINESS_STATUS_ENUMS.ONLINE;
        this.userType = USER_TYPE_ENUMS.DEVELOPER;
    }

    /**
     * Tüm kullanıcı bilgilerini döndürür
     * 
     * @returns UserInterface
     */
    public getUser(): UserInterface {
        return {
            uniqueId: this.uniqueId,
            socketId: this.socketId,
            userName: this.userName,
            livelinessStatus: this.livelinessStatus,
            userType: this.userType,
        }
    }

    public getLivelinessStatus(): LIVELINESS_STATUS_ENUMS {
        return this.livelinessStatus;
    }

    public setLivelinessStatus(livelinessStatus: LIVELINESS_STATUS_ENUMS) {
        this.livelinessStatus = livelinessStatus;
        return this;
    }

    public getUniqueId(): string {
        return this.uniqueId;
    }

    public getSocketId(): string {
        return this.socketId;
    }

    public setSocketId(socketId: string): void {
        this.socketId = socketId;
    }

    public getUserName(): string {
        return this.userName;
    }

    public setUserName(userName: string): void {
        this.userName = userName;
    }

    public getUserType(): USER_TYPE_ENUMS {
        return this.userType;
    }

    public setUserType(userType: USER_TYPE_ENUMS): void {
        this.userType = userType;
    }


}
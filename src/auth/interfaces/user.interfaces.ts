import { USER_TYPE_ENUMS } from "../enums/enums";
import { LIVELINESS_STATUS_ENUMS } from "../enums/liveliness-status.enums";
import { User } from "../models/User";
export interface UserInterface {
    uniqueId?: string,
    socketId?: string,
    userName: string,
    livelinessStatus?: LIVELINESS_STATUS_ENUMS.ONLINE | LIVELINESS_STATUS_ENUMS.OFFLINE,
    userType?: USER_TYPE_ENUMS
}

export interface RoomInterface {
    id: String,
    roomName: String,
    slug: String,
    users: UserInterface[],
    roomOwner: User
}

export interface ErrorInterface {
    message: String,
    reason: String
}
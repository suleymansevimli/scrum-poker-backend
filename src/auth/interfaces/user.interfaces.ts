import { LIVELINESS_STATUS_ENUMS } from "../enums/liveliness-status.enums";
export interface UserInterface {
    uniqueId?: String,
    id?: String,
    userName: String,
    livelinessStatus?: LIVELINESS_STATUS_ENUMS.ONLINE | LIVELINESS_STATUS_ENUMS.OFFLINE,
}

export interface RoomInterface {
    id: String,
    roomName: String,
    slug: String,
    users: UserInterface[],
    roomOwner: UserInterface
}

export interface ErrorInterface {
    message: String,
    reason: String
}
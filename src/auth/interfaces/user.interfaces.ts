export interface UserInterface {
    uniqueId?: String,
    id?: String,
    userName: String
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
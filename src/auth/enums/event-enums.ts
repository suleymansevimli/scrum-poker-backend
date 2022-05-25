export enum AUTH_EVENT_ENUMS {
    USER_CONNECTED = "userConnected",
    USER_DISCONNECTED = "userDisconnected",
    GET_ALL_USERS = "getAllUsers",
    USER_ALREADY_EXISTS = "userAlreadyExists",
    GET_RE_JOIN_ALREADY_LOGINED_USER = "getReJoinAlreadyLoginedUser",
    RE_JOIN_ALREADY_LOGINED_USER = "reJoinAllreadyLoginedUser",
    LOGIN_REQUEST = "setUserNameRequest",
    LOGIN_REQUEST_ACCEPTED = "loginRequestAccepted",
    LOGOUT_REQUEST_ACCEPTED = "logoutRequestAccepted",
    LOGOUT_REQUEST_REJECTED = "logoutRequestRejected",
    USER_TYPE_CHANGED = 'userTypeChanged',

    // room
    GET_ROOM = "getRoom",
    NEW_ROOM_CREATE_REQUEST = "newRoomCreateRequest",
    NEW_ROOM_CREATE_ACCEPTED = "newRoomCreateAccepted",
    NEW_ROOM_CREATE_REJECTED = "newRoomCreateRejected",
    ROOM_JOIN_REQUEST = "roomJoinRequest",
    ROOM_JOIN_ACCEPTED = "roomJoinAccepted",
    ROOM_JOIN_REJECTED = "roomJoinRejected",
}
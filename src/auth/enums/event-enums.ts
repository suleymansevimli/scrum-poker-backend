export enum AUTH_EVENT_ENUMS {
    USER_CONNECTED = "userConnected",
    USER_DISCONNECTED = "userDisconnected",
    GET_ALL_USERS = "getAllUsers",
    NEW_USER_JOINED = "newUserJoined",
    SET_USER_NAME_REQUEST = "setUserNameRequest",
    USER_ALREADY_EXISTS = "userAlreadyExists",
    GET_RE_JOIN_ALREADY_LOGINED_USER = "getReJoinAlreadyLoginedUser",
    RE_JOIN_ALREADY_LOGINED_USER = "reJoinAllreadyLoginedUser",
    USER_RE_JOINED = "userReJoined",
    LOGIN_REQUEST_ACCEPTED = "loginRequestAccepted",
    LOGOUT_REQUEST_ACCEPTED = "logoutRequestAccepted",
    USER_LOGGED_OUT = "userLoggedOut",

    // room
    GET_ALL_ROOMS = "getAllRooms",
    UPDATED_ALL_ROOMS = "updatedAllRooms",
    NEW_ROOM_CREATE_REQUEST = "newRoomCreateRequest",
    NEW_ROOM_CREATE_ACCEPTED = "newRoomCreateAccepted",
    NEW_ROOM_CREATE_REJECTED = "newRoomCreateRejected",
    ROOM_JOIN_REQUEST = "roomJoinRequest",
    ROOM_JOIN_ACCEPTED = "roomJoinAccepted",
    ROOM_JOIN_REJECTED = "roomJoinRejected",
}
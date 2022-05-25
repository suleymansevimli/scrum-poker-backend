import { User } from "./User";
import { v4 as uuid } from 'uuid';

export class Room {
    private id: string;
    private slug: string;
    public roomName: string;
    public roomOwner: User;
    public users: User[];

    constructor(roomName: string, roomOwner: User) {
        this.roomName = roomName;
        this.roomOwner = roomOwner;
        this.id = uuid();
        this.slug = roomName.trim().replace(/\s/g, '-').toLocaleLowerCase('tr-TR');
    }

    public setRoomOwner(roomOwner: User) {
        this.roomOwner = roomOwner;

        return this;
    }

    public getRoomOwner(): User {
        return this.roomOwner;
    }

    public getRoomName(): string {
        return this.roomName;
    }

    public getRoomId(): string {
        return this.id;
    }

    public getSlug(): string {
        return this.slug;
    }
    
}
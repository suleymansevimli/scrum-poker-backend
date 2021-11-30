import { Get, Injectable } from '@nestjs/common';
import { AuthGateway } from './auth.gateway';
import { UserInterface } from './interfaces/user.interfaces';

@Injectable()
export class AuthService {

    constructor(private readonly authGateway: AuthGateway){}

    @Get("/get-all-users")
    getUsers(): UserInterface[] | null {
        return this.authGateway.users;
    }
}

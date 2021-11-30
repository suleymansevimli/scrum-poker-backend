import { Module } from '@nestjs/common';
import { AuthGateway } from './auth.gateway';
import { AuthService } from './auth.service';
@Module({
    providers: [AuthGateway, AuthService],
    controllers: [],
    imports: []
})
export class AuthModule {}

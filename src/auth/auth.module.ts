import { Module } from '@nestjs/common';
import { AuthGateway } from './auth.gateway';
@Module({
    providers: [AuthGateway],
    controllers: [],
    imports: []
})
export class AuthModule {}

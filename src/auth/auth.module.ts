import { Module } from '@nestjs/common';
import { AuthGateway } from './auth.gateway';

@Module({
    providers: [AuthGateway],
})
export class AuthModule {}

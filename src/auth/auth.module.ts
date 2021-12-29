import { Module } from '@nestjs/common';
import { AuthGateway } from './auth.gateway';
@Module({
    providers: [AuthGateway],
    controllers: [],
    imports: [],
    exports: [AuthGateway]
})
export class AuthModule { }

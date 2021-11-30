import { Module } from '@nestjs/common';
import { PlanningGateway } from 'src/planning/planning.gateway';
import { AuthGateway } from './auth.gateway';
import { AuthService } from './auth.service';

@Module({
    providers: [AuthGateway],
    controllers: [AuthService],
    imports: [PlanningGateway]
})
export class AuthModule {}

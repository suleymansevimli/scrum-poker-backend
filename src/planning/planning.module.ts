import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { PlanningGateway } from './planning.gateway';

@Module({
  providers: [PlanningGateway],
  imports: [AuthModule],
  controllers: [AuthService]
})
export class PlanningModule {}

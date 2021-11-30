import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PlanningGateway } from './planning.gateway';

@Module({
  providers: [PlanningGateway],
  imports: [AuthModule],
  controllers: []
})
export class PlanningModule {}

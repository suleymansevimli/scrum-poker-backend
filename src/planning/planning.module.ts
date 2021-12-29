import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PlanningGateway } from './planning.gateway';

@Module({
  providers: [PlanningGateway],
  controllers: [],
  imports: [AuthModule],
})
export class PlanningModule { }

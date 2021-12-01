import { Module } from '@nestjs/common';
import { AuthGateway } from 'src/auth/auth.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { PlanningGateway } from './planning.gateway';

@Module({
  providers: [AuthModule,PlanningGateway, AuthGateway],
  imports: [],
  controllers: []
})
export class PlanningModule {}

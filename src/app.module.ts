import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PlanningModule } from './planning/planning.module';
@Module({
  imports: [AuthModule,PlanningModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

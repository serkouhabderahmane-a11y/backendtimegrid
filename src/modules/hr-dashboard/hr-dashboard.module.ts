import { Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { HrDashboardService } from './hr-dashboard.service';
import { HrDashboardController } from './hr-dashboard.controller';

@Module({
  imports: [ConfigModule],
  controllers: [HrDashboardController],
  providers: [HrDashboardService],
  exports: [HrDashboardService],
})
export class HrDashboardModule {}

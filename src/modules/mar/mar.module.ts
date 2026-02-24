import { Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { MarService } from './mar.service';
import { MarController } from './mar.controller';

@Module({
  imports: [ConfigModule],
  controllers: [MarController],
  providers: [MarService],
  exports: [MarService],
})
export class MarModule {}

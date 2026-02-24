import { Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { DailyNotesService } from './daily-notes.service';
import { DailyNotesController } from './daily-notes.controller';

@Module({
  imports: [ConfigModule],
  controllers: [DailyNotesController],
  providers: [DailyNotesService],
  exports: [DailyNotesService],
})
export class DailyNotesModule {}

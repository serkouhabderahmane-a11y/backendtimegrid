import { Module } from '@nestjs/common';
import { SocialFeedController } from './social-feed.controller';
import { SocialFeedService } from './social-feed.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [SocialFeedController],
  providers: [SocialFeedService, PrismaService],
  exports: [SocialFeedService],
})
export class SocialFeedModule {}

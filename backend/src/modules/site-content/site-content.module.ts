import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MediaModule } from '../media/media.module';
import { SiteContentController } from './controllers/site-content.controller';
import { PublicSiteContentController } from './controllers/public-site-content.controller';
import { SiteContentRepository } from './repositories/site-content.repository';
import { SiteContentService } from './services/site-content.service';
@Module({
  imports: [AuthModule, MediaModule],
  controllers: [SiteContentController, PublicSiteContentController],
  providers: [SiteContentRepository, SiteContentService],
})
export class SiteContentModule {}

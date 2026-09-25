import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MediaModule } from '../media/media.module';
import { CatalogController } from './controllers/catalog.controller';
import { PublicCatalogController } from './controllers/public-catalog.controller';
import { CatalogService } from './services/catalog.service';

@Module({
  imports: [AuthModule, MediaModule],
  controllers: [CatalogController, PublicCatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}

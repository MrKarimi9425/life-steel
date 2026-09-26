import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MediaModule } from '../media/media.module';
import { CatalogController } from './controllers/catalog.controller';
import { PublicCatalogController } from './controllers/public-catalog.controller';
import { CatalogService } from './services/catalog.service';
import { ProductPricingService } from './services/product-pricing.service';
import { ProductPricingRepository } from './repositories/product-pricing.repository';

@Module({
  imports: [AuthModule, MediaModule],
  controllers: [CatalogController, PublicCatalogController],
  providers: [CatalogService, ProductPricingService, ProductPricingRepository],
})
export class CatalogModule {}

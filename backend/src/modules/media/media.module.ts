import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MediaController } from './controllers/media.controller';
import { ImageProcessorService } from './services/image-processor.service';
import { MediaService } from './services/media.service';

@Module({
  imports: [AuthModule],
  controllers: [MediaController],
  providers: [ImageProcessorService, MediaService],
  exports: [MediaService],
})
export class MediaModule {}

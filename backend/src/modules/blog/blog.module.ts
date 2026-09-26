import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MediaModule } from '../media/media.module';
import { BlogController } from './controllers/blog.controller';
import { PublicBlogController } from './controllers/public-blog.controller';
import { BlogRepository } from './repositories/blog.repository';
import { BlogService } from './services/blog.service';

@Module({
  imports: [AuthModule, MediaModule],
  controllers: [BlogController, PublicBlogController],
  providers: [BlogRepository, BlogService],
})
export class BlogModule {}

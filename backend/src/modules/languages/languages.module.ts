import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LanguagesController } from './controllers/languages.controller';
import { PublicLanguagesController } from './controllers/public-languages.controller';
import { LanguagesService } from './services/languages.service';

@Module({
  imports: [AuthModule],
  controllers: [LanguagesController, PublicLanguagesController],
  providers: [LanguagesService],
  exports: [LanguagesService],
})
export class LanguagesModule {}

import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminsController } from './controllers/admins.controller';
import { AdminsService } from './services/admins.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminsController],
  providers: [AdminsService],
})
export class AdminsModule {}
